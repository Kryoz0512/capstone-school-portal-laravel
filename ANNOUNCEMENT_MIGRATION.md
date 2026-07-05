# Announcement Feature Migration

## Overview
Moved announcements from Admin Portal to Teacher Portal with section/subject targeting and removed approval workflow.

## Changes Summary

### Database Structure
**Table: `announcements`**

**Added Columns:**
- `section_id` (bigint unsigned, nullable, foreign key to `tbl_class_sections`)
- `subject_id` (bigint unsigned, nullable, foreign key to `tbl_subjects`)
- `teacher_id` (bigint unsigned, not null, foreign key to `tbl_teachers`)

**Removed Columns:**
- `created_by` (replaced with `teacher_id`)
- `status` (enum: pending/approved/rejected)
- `approved_by` (foreign key to users)
- `approved_at` (timestamp)
- `rejection_reason` (text)

**Retained Columns:**
- `id`, `title`, `content`, `is_active`, `created_at`, `updated_at`

### Model Changes
**File:** `app/Models/Announcement.php`

**New Relationships:**
- `teacher()` - BelongsTo Teacher
- `section()` - BelongsTo ClassSection
- `subject()` - BelongsTo Subject

**Removed Relationships:**
- `creator()` - BelongsTo User
- `approver()` - BelongsTo User

**New Scopes:**
- `active()` - Returns only active announcements

**Removed Scopes:**
- `approved()` - No longer needed (no approval system)
- `pending()` - No longer needed

### Controller Changes
**File:** `app/Http/Controllers/AnnouncementController.php`

**Functionality:**
1. **index()** - Shows teacher's announcements with their sections/subjects
2. **store()** - Creates announcement with section/subject targeting
3. **update()** - Updates announcement (only by creator teacher)
4. **destroy()** - Deletes announcement (only by creator teacher)
5. **toggleActive()** - Activates/deactivates announcement
6. **getApproved()** - API endpoint for dashboard (filters by student section)

**Removed Methods:**
- `approve()` - No approval system
- `reject()` - No approval system

**Smart Notification System:**
- If section is selected: notifies students in that section
- If no section: notifies all students
- Subject is used for context/filtering (optional)

### Routes
**File:** `routes/web.php`

**Added Teacher Routes:**
```php
Route::get('teacher/announcements', [AnnouncementController::class, 'index'])
Route::post('teacher/announcements', [AnnouncementController::class, 'store'])
Route::put('teacher/announcements/{announcement}', [AnnouncementController::class, 'update'])
Route::delete('teacher/announcements/{announcement}', [AnnouncementController::class, 'destroy'])
Route::post('teacher/announcements/{announcement}/toggle', [AnnouncementController::class, 'toggleActive'])
```

**Removed Admin Routes:**
- All `/admin/maintenance/announcements/*` routes
- Approval and rejection routes

**Retained API Route:**
```php
Route::get('api/announcements/approved', [AnnouncementController::class, 'getApproved'])
```
Note: Now returns `active` announcements instead of `approved` (filtered by student section)

### Frontend Changes

#### New Pages
**File:** `resources/js/pages/teacher/announcements/page.tsx`
- Teacher announcements management interface
- Section and subject selection dropdowns
- Create, edit, delete, and toggle active functionality
- Displays section and subject badges for each announcement

#### Sidebar Updates
**File:** `resources/js/components/teacher-sidebar.tsx`
- Added "Announcements" menu item with Megaphone icon
- Positioned after "Class List" and before "Grade Management"

**File:** `resources/js/components/admin-sidebar.tsx`
- Removed "Announcements" from Maintenance section
- Maintenance now only contains "Login Slides"

### Migration Files
1. **2026_07_06_005733_add_section_subject_to_announcements_table.php** (deleted after partial migration)
2. **2026_07_06_010210_cleanup_announcements_table_remove_approval_fields.php** ✅ (completed)

## How It Works

### For Teachers
1. Navigate to **Teacher Portal > Announcements**
2. Click "New Announcement"
3. Fill in title and content
4. **Optional:** Select a section to target specific students
5. **Optional:** Select a subject for context
6. Click "Create Announcement" - **published immediately**
7. Toggle active/inactive status anytime
8. Edit or delete own announcements

### For Students
1. View announcements on dashboard
2. Only see announcements that are:
   - Active
   - Targeted to their section OR targeted to all sections
3. Receive notifications when new announcements are posted

### Targeting Logic
- **No section selected:** All students receive the announcement
- **Section selected:** Only students in that section receive it
- **Subject specified:** Provides context but doesn't change targeting

## Benefits
✅ Teachers have immediate control over announcements
✅ No admin bottleneck for approval
✅ Targeted communication to specific classes
✅ Reduced notification noise for students
✅ Subject context helps students identify relevant content
✅ Simpler, more efficient workflow

## Testing Checklist
- [ ] Teacher can create announcement
- [ ] Teacher can select section from dropdown
- [ ] Teacher can select subject from dropdown
- [ ] Teacher can edit own announcement
- [ ] Teacher can delete own announcement
- [ ] Teacher can toggle active/inactive
- [ ] Student sees announcements for their section
- [ ] Student receives notification when announcement is created
- [ ] Dashboard API filters announcements correctly
- [ ] Admin sidebar no longer shows announcements
- [ ] Teacher sidebar shows announcements menu item

## Notes
- Old admin announcement page at `/admin/maintenance/announcements` should return 404
- Any existing announcements in database will need manual data migration if they have old `created_by` references
- The `teacher_id` column should be populated for existing announcements before using in production
