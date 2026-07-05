# Section Schedule Changes

## Overview
Modified the admin "Student Schedule" feature to be section-based instead of student-based. Users now view a list of sections and can click on a section to see its schedule, rather than searching for individual students.

## Changes Made

### 1. Backend Changes

#### StudentController (`app/Http/Controllers/StudentController.php`)

**scheduleIndex() method:**
- **Before**: Listed all students with their sections
- **After**: Lists all class sections with student count
- Now fetches sections using `ClassSection` model with relationships
- Includes search functionality for section name, grade level, and adviser name
- Returns section data with:
  - Section name
  - Grade level
  - Adviser name
  - Student count per section

**scheduleShow() method:**
- **Before**: Accepted `Student $student` parameter (route model binding)
- **After**: Accepts `$sectionId` parameter
- Fetches section by ID using `ClassSection::findOrFail()`
- Returns section information instead of student information
- Fetches schedules for the entire section (not individual student)

### 2. Routes Changes (`routes/web.php`)

**Before:**
```php
Route::get('admin/enrollment/student-schedule/{student}', ...);
```

**After:**
```php
Route::get('admin/enrollment/student-schedule/{section}', ...);
```

Changed parameter from `{student}` to `{section}` to accept section IDs instead of student IDs.

### 3. Frontend Changes

#### Main Page (`resources/js/pages/admin/enrollment/student-schedule/page.tsx`)

**Complete rewrite to show sections:**

**Data Types:**
- Changed from `Student` type to `Section` type
- Section includes: id, section_name, gradeLevel, adviser, student_count

**UI Changes:**
- **Title**: "Student Schedule" → "Section Schedules"
- **Subtitle**: "View student schedules" → "View schedules by section"
- **Search Label**: "Student Name or LRN" → "Section Name or Adviser"
- **Search Placeholder**: "Search student..." → "Search section or adviser..."

**Table Columns:**
- **Before**: LRN, Student Name, Grade Level, Section
- **After**: Grade Level, Section Name, Adviser, Students (with icon)

**Features:**
- Click on any section row to view its schedule
- Filter by grade level
- Search by section name, grade level name, or adviser name
- Shows student count with Users icon for each section
- Displays "Not Assigned" in italic gray for sections without advisers

#### Detail Page (`resources/js/pages/admin/enrollment/student-schedule/show.tsx`)

**Complete rewrite to show section schedule:**

**Data Types:**
- Changed from `Student` to `Section` type
- Section includes: id, section_name, gradeLevel, adviser, student_count

**UI Changes:**
- **Page Title**: "Schedule - {studentName}" → "Schedule - {sectionName}"
- **Header**: "Student Schedule" → "Section Schedule"
- **Back Button**: "Back to Students" → "Back to Sections"
- **Info Section Title**: "Student Information" → "Section Information"

**Information Display:**
- **Before**: Student Name, LRN, Grade Level, Section
- **After**: Section Name, Grade Level, Adviser, Total Students (with icon)

**Schedule Display:**
- Remains the same weekly grid format
- Shows all schedules for the section
- Empty state message updated: "No schedule found for this student's section" → "No schedule found for this section"
- Direction updated: "Load Scheduling" → "Schedule Management"

### 4. Navigation Changes

#### Admin Sidebar (`resources/js/components/admin-sidebar.tsx`)

**Menu Label:**
- **Before**: "Student Schedule"
- **After**: "Section Schedules"

This better reflects that users are viewing schedules by section, not by individual students.

## Benefits of This Approach

### 1. **More Efficient Workflow**
- Admins typically need to view schedules by section, not by individual student
- All students in a section have the same schedule
- Reduces redundant clicks (no need to look up each student individually)

### 2. **Better Organization**
- Sections are the primary organizational unit for schedules
- Schedules are created per section, not per student
- UI now matches the data model structure

### 3. **Improved User Experience**
- Faster access to schedule information
- Clear section-based navigation
- Shows relevant information (student count, adviser) at a glance
- Search by section or adviser makes finding specific classes easier

### 4. **Consistency**
- Aligns with how schedules are managed (Schedule Management is section-based)
- Matches the mental model of educational administration
- Consistent with how other features work (grades, clearances are section-based)

## Usage

### Viewing Section Schedules

1. Navigate to **Enrollment** → **Section Schedules** in admin portal
2. Browse the list of sections showing:
   - Grade level
   - Section name
   - Adviser (if assigned)
   - Number of students
3. Use filters to:
   - Search by section name or adviser
   - Filter by grade level
4. Click on any section to view its weekly schedule

### Schedule Display

The schedule shows:
- Section information (name, grade level, adviser, student count)
- Weekly timetable grid with:
  - Time slots (rows)
  - Days of the week (columns)
  - Subject, teacher, and room for each period
- Empty periods shown with "-"
- Empty state if no schedule exists for the section

## Technical Notes

### Controller Logic
```php
// Fetch sections with relationships and counts
$sections = ClassSection::with(['gradeLevel', 'teacher'])
    ->withCount('students')
    ->when($search, function ($query, $search) {
        // Search by section name, grade level, or adviser
    })
    ->paginate($perPage);
```

### Route Parameter
The route now expects a section ID:
```
/admin/enrollment/student-schedule/{sectionId}
```

### Data Flow
1. Main page lists all sections
2. Click section → Navigate to `/admin/enrollment/student-schedule/{sectionId}`
3. Controller fetches section and its schedules
4. Display weekly timetable for that section

## Backward Compatibility

**Breaking Changes:**
- URL structure changed from `/student-schedule/{studentId}` to `/student-schedule/{sectionId}`
- Any bookmarks to specific student schedules will no longer work
- Frontend props changed from `students` to `sections`

**Note**: The student portal schedule view (`/student/schedule`) remains unchanged and continues to work as before. Only the admin portal view was modified.

## Testing Checklist

- [x] View list of sections
- [x] Search sections by name
- [x] Search sections by adviser name
- [x] Filter sections by grade level
- [x] Click section to view schedule
- [x] View section schedule with all details
- [x] Navigate back from schedule view
- [x] Handle sections with no schedules
- [x] Handle sections with no adviser
- [x] Verify pagination works
- [x] Verify per-page selection works

## Future Enhancements

Consider adding:
1. **Print functionality** - Print section schedules for distribution
2. **Export to PDF** - Download section schedules
3. **Quick actions** - Edit schedule directly from this view
4. **Schedule conflicts indicator** - Show if section has schedule conflicts
5. **Room availability** - Show if any periods lack room assignments
6. **Subject coverage** - Show which subjects are/aren't scheduled
