# ⚡ Quick Performance Optimization Reference Card

Print this and keep it near your desk!

---

## 🚫 DON'T DO THIS

```php
// ❌ NEVER use ::all() without caching
$teachers = Teacher::all();

// ❌ NEVER load relationships in loop
foreach ($students as $student) {
    $grade = $student->gradeLevel;  // N+1 query!
}

// ❌ NEVER do multiple counts separately
$total = Student::count();
$male = Student::where('gender', 'male')->count();
$female = Student::where('gender', 'female')->count();

// ❌ NEVER fetch all columns
Student::where('id', 1)->first();  // Gets ALL columns

// ❌ NEVER do heavy operations in controllers
foreach ($students as $student) {
    $this->generatePDF($student);  // Blocks request!
}
```

---

## ✅ DO THIS INSTEAD

```php
// ✅ Cache reference data
$teachers = Cache::remember('teachers_list', 3600, function () {
    return Teacher::select('id', 'name')->get();
});

// ✅ Eager load relationships
$students = Student::with('gradeLevel')->get();
foreach ($students as $student) {
    $grade = $student->gradeLevel;  // No extra query!
}

// ✅ Single query for multiple counts
$stats = Student::selectRaw('
    COUNT(*) as total,
    SUM(CASE WHEN gender = "male" THEN 1 ELSE 0 END) as male,
    SUM(CASE WHEN gender = "female" THEN 1 ELSE 0 END) as female
')->first();

// ✅ Only select needed columns
Student::select('id', 'name', 'lrn')->where('id', 1)->first();

// ✅ Queue heavy operations
dispatch(new GenerateStudentPDF($student->id));
```

---

## 🔍 QUERY OPTIMIZATION PATTERNS

### Pattern 1: Eager Loading
```php
// Before (N+1)
$students = Student::all();
foreach ($students as $student) {
    echo $student->section->name;  // Query per student!
}

// After
$students = Student::with('section')->get();
foreach ($students as $student) {
    echo $student->section->name;  // No extra queries!
}
```

### Pattern 2: Conditional Eager Loading
```php
Student::with([
    'section' => function ($query) {
        $query->select('id', 'section_name');
    },
    'gradeLevel:id,name'  // Shorthand syntax
])->get();
```

### Pattern 3: Counting Relationships
```php
// Before
$students = Student::all();
foreach ($students as $student) {
    $count = $student->grades->count();  // N+1!
}

// After
$students = Student::withCount('grades')->get();
foreach ($students as $student) {
    $count = $student->grades_count;  // Single query!
}
```

### Pattern 4: Aggregate Functions
```php
// Multiple aggregates in one query
$stats = Student::selectRaw('
    COUNT(*) as total,
    AVG(age) as avg_age,
    MAX(age) as max_age,
    MIN(age) as min_age
')->first();
```

---

## 💾 CACHING CHEAT SHEET

```php
// Store in cache for 1 hour
Cache::remember('key', 3600, function () {
    return ExpensiveQuery::all();
});

// Store forever (until manually cleared)
Cache::rememberForever('key', function () {
    return RarelyChangingData::all();
});

// Clear specific cache
Cache::forget('key');

// Clear all cache
Cache::flush();

// Check if exists
if (Cache::has('key')) {
    $value = Cache::get('key');
}

// Cache with tags (Redis only)
Cache::tags(['students', 'grades'])->remember('key', 3600, fn() => ...);
Cache::tags(['students'])->flush();  // Clear all student-related caches
```

---

## 📊 INDEX CHECKLIST

Add indexes for:
- ✅ Foreign keys
- ✅ WHERE clause columns
- ✅ ORDER BY columns
- ✅ JOIN columns
- ✅ Search columns
- ✅ Status/enum columns
- ✅ Date columns used in filtering

```php
// In migration
Schema::table('tbl_students', function (Blueprint $table) {
    $table->index('current_section_id');
    $table->index('school_year');
    $table->index(['current_section_id', 'school_year']);  // Composite
});
```

---

## 🚀 COMMON OPTIMIZATIONS

### Dashboard Stats
```php
// Before: 5 separate queries
$total = Student::count();
$enrolled = Student::whereNotNull('section_id')->count();
$notEnrolled = Student::whereNull('section_id')->count();
$male = Student::where('gender', 'male')->count();
$female = Student::where('gender', 'female')->count();

// After: 1 query
$stats = Student::selectRaw('
    COUNT(*) as total,
    SUM(CASE WHEN section_id IS NOT NULL THEN 1 ELSE 0 END) as enrolled,
    SUM(CASE WHEN section_id IS NULL THEN 1 ELSE 0 END) as not_enrolled,
    SUM(CASE WHEN gender = "male" THEN 1 ELSE 0 END) as male,
    SUM(CASE WHEN gender = "female" THEN 1 ELSE 0 END) as female
')->first();
```

### Pagination
```php
// Always paginate large datasets
$students = Student::select('id', 'name', 'lrn')
    ->orderBy('name')
    ->paginate(50);  // Never load all at once!
```

### Chunking for Large Operations
```php
// Process 1000 records at a time
Student::chunkById(1000, function ($students) {
    foreach ($students as $student) {
        // Process each student
    }
});
```

---

## 🎯 PERFORMANCE TARGETS

| Operation | Target Time | Max Queries |
|-----------|------------|-------------|
| Dashboard Load | < 200ms | < 10 |
| List Page | < 150ms | < 5 |
| Detail Page | < 100ms | < 5 |
| Search | < 200ms | < 3 |
| Update | < 100ms | < 5 |

---

## 🔧 DEBUGGING QUERIES

### Enable Query Log
```php
DB::enableQueryLog();

// Your code here

dd(DB::getQueryLog());  // See all queries
```

### Count Queries
```php
$queryCount = 0;
DB::listen(function ($query) use (&$queryCount) {
    $queryCount++;
});

// Your code here

echo "Total queries: $queryCount";
```

### Slow Query Alert
```php
DB::listen(function ($query) {
    if ($query->time > 100) {  // More than 100ms
        Log::warning('Slow query detected', [
            'sql' => $query->sql,
            'time' => $query->time,
            'bindings' => $query->bindings
        ]);
    }
});
```

---

## 🚨 RED FLAGS IN CODE REVIEWS

Watch for these anti-patterns:

1. `Model::all()` without caching or pagination
2. Queries inside loops
3. No `select()` specified (fetching all columns)
4. No eager loading when accessing relationships
5. Multiple `count()` calls that could be combined
6. Heavy operations in HTTP request (not queued)
7. No indexes on frequently filtered columns
8. Loading relationships not used in the view

---

## ✨ OPTIMIZATION WORKFLOW

1. **Identify bottleneck** - Use Telescope/Debugbar
2. **Measure current state** - Count queries, time response
3. **Optimize** - Apply patterns from this guide
4. **Measure again** - Verify improvement
5. **Document** - Add comments explaining optimization
6. **Monitor** - Watch for regressions

---

## 📚 QUICK LINKS

- Full Audit: `PERFORMANCE_OPTIMIZATION_AUDIT.md`
- Summary: `PERFORMANCE_AUDIT_SUMMARY.md`
- Implementation: `IMPLEMENTATION_GUIDE.md`
- Migration: `database/migrations/2026_07_08_000001_add_performance_indexes.php`

---

**Remember:** Premature optimization is bad, but lazy queries are worse!

**Rule of Thumb:** If a page loads slower than you can count to 1, optimize it!
