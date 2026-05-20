# Gradesheet Quarter Issue - Fix Documentation

## Problem Description
When a teacher graded a student in the 1st quarter and then changed to another quarter (2nd, 3rd, or 4th), the "Passed" status would incorrectly appear even though no grade was saved for those quarters.

## Root Cause
The issue was in the `GradeController.php` `index()` method. When displaying students and their grades:
1. The code correctly fetched the grade for the specific quarter (e.g., `quarter_1`, `quarter_2`, etc.)
2. **BUT** it was returning the `remarks` field from the entire grade record, not just for the current quarter
3. The `remarks` field stores the overall status based on ALL quarters that have grades
4. This caused "Passed" to show for quarters that had no grade, as long as ANY other quarter had a passing grade

**Example of the bug:**
- Teacher enters grade 85 in Quarter 1 → remarks = "Passed" (correct)
- Teacher switches to Quarter 2 (no grade entered yet)
- The system showed "Passed" because it was reading the remarks from the grade record (which was set based on Quarter 1)

## Changes Made

### 1. Fixed Remarks Display Logic (GradeController.php - lines 167-171)
**Before:**
```php
'remarks' => $gradeRecord ? $gradeRecord->remarks : null,
```

**After:**
```php
// Only show remarks if this specific quarter has a grade
$remarks = null;
if ($grade !== null) {
    $remarks = $formattedGrade >= 75 ? 'Passed' : 'Failed';
}
```

Now the remarks are calculated based on the **current quarter's grade only**, not the stored remarks field.

### 2. Database Migration (2026_05_15_000001_add_unique_constraint_to_grades_table.php)
- Added a unique composite index on `tbl_grades` table
- Constraint fields: `student_id`, `class_section_id`, `subject_id`, `school_year`, `teacher_id`
- Prevents duplicate grade records at the database level
- Migration automatically detects and removes any existing duplicate records

### 3. Improved GradeController.php Store Method
- Changed from `firstOrNew()` to `firstOrCreate()` for better race condition handling
- Added duplicate detection logging in the `index()` method

## Testing the Fix
1. Grade a student in Quarter 1 with a passing grade (e.g., 85)
2. Switch to Quarter 2 - it should show:
   - Grade: `-` (empty)
   - Remarks: `-` (empty, not "Passed")
3. Grade the student in Quarter 2 with a different grade (e.g., 78)
4. Switch back to Quarter 1 - should still show grade 85 with "Passed"
5. Switch to Quarter 3 - should show empty grade and empty remarks

## Technical Details
- **Main Fix**: `app/Http/Controllers/GradeController.php` (index method, lines 167-171)
- **Database Constraint**: `unique_grade_record` on `tbl_grades` table
- **Migration File**: `database/migrations/2026_05_15_000001_add_unique_constraint_to_grades_table.php`

## Why This Happened
The `remarks` field in the database is designed to store the overall status across all quarters (used for final reports). However, when viewing individual quarters in the gradesheet, we need to calculate remarks based on that specific quarter's grade only.

## Rollback Instructions
If needed, you can rollback the database migration using:
```bash
php artisan migrate:rollback --step=1
```

However, the main fix is in the controller logic, which doesn't require a rollback.
