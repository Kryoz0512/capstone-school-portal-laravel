# 🚀 Performance Optimization Implementation Guide

This guide will walk you through implementing all performance optimizations.

---

## 📋 PRE-IMPLEMENTATION CHECKLIST

- [ ] Backup your database
- [ ] Commit all current changes to git
- [ ] Test on development environment first
- [ ] Have Laravel Telescope or Debugbar installed for monitoring

---

## STEP 1: Run Database Migrations (CRITICAL - Do First)

### 1.1 Add Performance Indexes

```bash
php artisan migrate
```

This will run the migration file: `2026_07_08_000001_add_performance_indexes.php`

**Expected Result:** All foreign keys and search columns now have indexes.

**Verify:**
```bash
php artisan tinker
Schema::getConnection()->getDoctrineSchemaManager()->listTableIndexes('tbl_students');
```

---

## STEP 2: Register Cache Invalidation Observer

### 2.1 Update AppServiceProvider

**File:** `app/Providers/AppServiceProvider.php`

Add to the `boot()` method:

```php
<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Observers\CacheInvalidationObserver;

class AppServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        // Register cache invalidation observers
        \App\Models\GradeLevel::observe(CacheInvalidationObserver::class);
        \App\Models\Teacher::observe(CacheInvalidationObserver::class);
        \App\Models\Subject::observe(CacheInvalidationObserver::class);
        \App\Models\ClassSection::observe(CacheInvalidationObserver::class);
        \App\Models\TeacherSubject::observe(CacheInvalidationObserver::class);
        \App\Models\Room::observe(CacheInvalidationObserver::class);
        \App\Models\Student::observe(CacheInvalidationObserver::class);
    }
}
```

---

## STEP 3: Configure Redis Cache (Recommended)

### 3.1 Install Redis (if not already installed)

**Windows:**
Download from: https://github.com/microsoftarchive/redis/releases

**Or use WSL:**
```bash
sudo apt-get install redis-server
sudo service redis-server start
```

### 3.2 Update .env

```env
CACHE_DRIVER=redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

### 3.3 Install PHP Redis Extension

```bash
composer require predis/predis
```

### 3.4 Test Redis Connection

```bash
php artisan tinker
Cache::put('test', 'working', 60);
Cache::get('test');  // Should return 'working'
```

---

## STEP 4: Update AnnouncementController (CRITICAL)

### 4.1 Modify the store() method

**File:** `app/Http/Controllers/AnnouncementController.php`

Find the section around line 306 and replace:

```php
// OLD CODE - DELETE THIS
if (!$announcement->section_id && count($notifications) === 0) {
    $allStudents = Student::all();
    foreach ($allStudents as $student) {
        if ($student->user_id) {
            $notifications[] = [
                'user_id' => $student->user_id,
                'announcement_id' => $announcement->id,
                'is_read' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
    }
    if (!empty($notifications)) {
        DB::table('tbl_notifications')->insert($notifications);
    }
}
```

Replace with:

```php
// NEW CODE - ADD THIS
use App\Jobs\SendAnnouncementNotifications;

// After creating the announcement:
if (!$announcement->section_id) {
    // Dispatch to background queue
    dispatch(new SendAnnouncementNotifications($announcement->id, null));
} elseif ($announcement->section_id && count($notifications) === 0) {
    // For section-specific announcements
    dispatch(new SendAnnouncementNotifications($announcement->id, $announcement->section_id));
}
```

**Test:**
```bash
php artisan queue:work --tries=3
```

Create an announcement and verify notifications are sent in background.

---

## STEP 5: Optimize AdviserSectionController

**File:** `app/Http/Controllers/AdviserSectionController.php`

Replace the `index()` method:

```php
<?php

use Illuminate\Support\Facades\Cache;

public function index(Request $request)
{
    $perPage = (int) $request->input('per_page', 10);

    $assignments = AdviserSection::with([
            'teacher:id,name',
            'section.gradeLevel:id,name',
            'section.room:id,room_name'
        ])
        ->select('id', 'teacher_id', 'class_section_id', 'school_year')
        ->orderBy('id', 'desc')
        ->paginate($perPage)
        ->withQueryString();

    // Get assigned teacher IDs from current page
    $assignedTeacherIds = $assignments->pluck('teacher_id')->unique()->toArray();

    // Cache reference data
    $teachers = Cache::remember('teachers_for_adviser_assignment', 3600, function () {
        return Teacher::select('id', 'name')
            ->orderBy('name')
            ->get();
    });

    $teachers = $teachers->map(function ($teacher) use ($assignedTeacherIds) {
        return [
            'id' => $teacher->id,
            'name' => $teacher->name,
            'is_assigned' => in_array($teacher->id, $assignedTeacherIds),
        ];
    });

    $gradeLevels = Cache::remember('grade_levels_list', 3600, function () {
        return \App\Models\GradeLevel::select('id', 'name')
            ->orderByRaw("FIELD(name, 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10')")
            ->get()
            ->map(fn($g) => ['id' => $g->id, 'name' => $g->name]);
    });

    return Inertia::render('admin/enrollment/adviser-management/page', [
        'assignments' => $assignments,
        'teachers' => $teachers,
        'gradeLevels' => $gradeLevels,
    ]);
}
```

---

## STEP 6: Optimize StudentController->notEnrolled()

**File:** `app/Http/Controllers/StudentController.php`

Find the `notEnrolled()` method and replace with:

```php
public function notEnrolled(Request $request)
{
    $search = $request->input('search');
    $gradeLevelFilter = $request->input('grade_level');
    $genderFilter = $request->input('gender');
    $ageFilter = $request->input('age');
    $perPage = (int) $request->input('per_page', 10);

    // Single optimized stats query
    $statsQuery = Student::selectRaw('
            COUNT(*) as total,
            SUM(CASE WHEN current_grade_level_id IS NOT NULL THEN 1 ELSE 0 END) as with_grade_level
        ')
        ->whereNull('current_section_id')
        ->first();

    $stats = [
        'total' => $statsQuery->total,
        'assigned' => $statsQuery->with_grade_level,
        'pendingAssignment' => $statsQuery->total - $statsQuery->with_grade_level,
    ];

    // Main query with select optimization
    $query = Student::with('gradeLevel:id,name')
        ->select('id', 'first_name', 'last_name', 'lrn', 'gender', 'birth_date', 
                 'current_grade_level_id', 'student_status')
        ->whereNull('current_section_id');

    if ($search) {
        $query->where(function ($q) use ($search) {
            $q->where('lrn', 'like', "%{$search}%")
                ->orWhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ["%{$search}%"]);
        });
    }

    if ($gradeLevelFilter && $gradeLevelFilter !== 'all') {
        $query->where('current_grade_level_id', $gradeLevelFilter);
    }

    if ($genderFilter && $genderFilter !== 'all') {
        $query->where('gender', strtolower($genderFilter));
    }

    if ($ageFilter && $ageFilter !== 'all') {
        $query->whereRaw("FLOOR(DATEDIFF(CURDATE(), birth_date) / 365.25) = ?", [$ageFilter]);
    }

    $students = $query->orderBy('last_name')->orderBy('first_name')
        ->paginate($perPage)
        ->withQueryString()
        ->through(fn($student) => [
            'id' => $student->id,
            'studentName' => trim("{$student->first_name} {$student->last_name}"),
            'lrn' => $student->lrn,
            'gender' => ucfirst($student->gender),
            'age' => $student->birth_date ? Carbon::parse($student->birth_date)->age : null,
            'gradeLevel' => $student->gradeLevel->name ?? '',
            'gradeLevelId' => $student->current_grade_level_id,
            'section' => '',
            'studentStatus' => $student->student_status,
        ]);

    // Cache reference data
    $gradeLevels = Cache::remember('grade_levels_list', 3600, function () {
        return GradeLevel::select('id', 'name')->get();
    });

    $sections = Cache::remember('sections_with_capacity', 900, function () {
        return ClassSection::with([
                'gradeLevel:id,name',
                'room:id,room_name,capacity'
            ])
            ->select('id', 'section_name', 'grade_level_id', 'room_id')
            ->withCount('students')
            ->get()
            ->map(function ($section) {
                $capacity = $section->room->capacity ?? 0;
                $currentStudents = $section->students_count;
                $availableSlots = max(0, $capacity - $currentStudents);

                return [
                    'id' => $section->id,
                    'name' => $section->section_name,
                    'grade_level_id' => $section->grade_level_id,
                    'room_name' => $section->room->room_name ?? 'No Room',
                    'capacity' => $capacity,
                    'current_students' => $currentStudents,
                    'available_slots' => $availableSlots,
                    'is_full' => $availableSlots <= 0,
                ];
            });
    });

    return Inertia::render('admin/enrollment/student-not-enrolled/page', [
        'students' => $students,
        'gradeLevels' => $gradeLevels,
        'sections' => $sections,
        'stats' => $stats,
        'filters' => $request->only(['search', 'grade_level', 'gender', 'age']),
    ]);
}
```

---

## STEP 7: Setup Queue Worker for Production

### 7.1 Configure Queue Driver

**File:** `.env`

```env
QUEUE_CONNECTION=database
# or
QUEUE_CONNECTION=redis  # Recommended for production
```

### 7.2 Run Queue Worker

**Development:**
```bash
php artisan queue:work --tries=3 --timeout=90
```

**Production (Supervisor recommended):**

Create file: `/etc/supervisor/conf.d/laravel-worker.conf`

```ini
[program:laravel-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/path/to/storage/logs/worker.log
stopwaitsecs=3600
```

Then:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start laravel-worker:*
```

---

## STEP 8: Clear and Warm Up Cache

```bash
# Clear all caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Optimize for production
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## STEP 9: Monitor Performance

### 9.1 Install Laravel Telescope (Development)

```bash
composer require laravel/telescope --dev
php artisan telescope:install
php artisan migrate
```

### 9.2 Check Query Count

Add to any controller method temporarily:

```php
use Illuminate\Support\Facades\DB;

DB::listen(function($query) {
    logger()->info('Query: ' . $query->sql);
    logger()->info('Bindings: ' . json_encode($query->bindings));
    logger()->info('Time: ' . $query->time);
});
```

### 9.3 Monitor Cache Hit Rate

```bash
php artisan tinker
Cache::get('grade_levels_list');  // Should be instant after first load
```

---

## STEP 10: Performance Testing

### 10.1 Test with Real Data

```bash
# Create test data if needed
php artisan db:seed --class=StudentSeeder
```

### 10.2 Benchmark Before/After

Use browser DevTools Network tab:
- Before optimizations: Note response times
- After optimizations: Compare response times

Expected improvements:
- Dashboard: 500ms → 50-100ms
- Student lists: 800ms → 100-150ms
- Grade management: 1000ms → 150-200ms

---

## 🐛 TROUBLESHOOTING

### Cache Not Working
```bash
php artisan cache:clear
# Check Redis connection
redis-cli ping  # Should return PONG
```

### Queue Jobs Not Running
```bash
php artisan queue:work --tries=3 --verbose
# Check failed jobs
php artisan queue:failed
```

### Index Creation Failed
```bash
# Check if indexes already exist
php artisan tinker
Schema::getConnection()->getDoctrineSchemaManager()->listTableIndexes('tbl_students');
```

### Performance Not Improved
1. Check if indexes were created: `SHOW INDEX FROM tbl_students;`
2. Verify cache is enabled: `Cache::get('grade_levels_list')`
3. Check query count with Telescope
4. Ensure Redis is running: `redis-cli ping`

---

## 📊 EXPECTED RESULTS

After implementing all optimizations:

| Metric | Before | After | Status |
|--------|--------|-------|---------|
| Queries/Request | 50-200 | 5-15 | ✅ Should see |
| Response Time | 500-2000ms | 50-200ms | ✅ Should see |
| Memory Usage | 50-500MB | 5-20MB | ✅ Should see |
| Cache Hit Rate | 0% | 95%+ | ✅ Target |

---

## ✅ COMPLETION CHECKLIST

- [ ] Migrations run successfully
- [ ] Indexes created (verify in database)
- [ ] Cache observer registered
- [ ] Redis configured and running
- [ ] AnnouncementController updated
- [ ] Queue job created and tested
- [ ] Controllers optimized with caching
- [ ] Queue worker running
- [ ] Performance tested and verified
- [ ] Telescope installed for monitoring
- [ ] Backup created before deployment

---

## 🚀 NEXT PHASE OPTIMIZATIONS

After completing this guide, consider:

1. **Database Query Optimization Review** - Analyze remaining slow queries
2. **Frontend Optimization** - React component memoization
3. **CDN Setup** - For static assets
4. **Database Read Replicas** - For scaling reads
5. **Full-Page Caching** - For public pages

**Questions?** Review `PERFORMANCE_AUDIT_SUMMARY.md` for detailed analysis.
