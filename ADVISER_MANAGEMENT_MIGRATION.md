# Adviser Management Integration with Class Sections

## Overview
This document outlines the changes made to integrate adviser management functionality into the class sections management feature. When creating or editing a class section, you can now directly assign a teacher as the section's adviser.

## Changes Made

### 1. Database Changes

#### Migration: `add_teacher_id_to_class_sections_table`
- Added `teacher_id` column to `tbl_class_sections` table
- Added foreign key constraint to `tbl_teachers` table
- Set to nullable and `onDelete('set null')` to handle teacher deletions gracefully

#### Migration: `sync_existing_advisers_to_class_sections`
- Synced existing adviser assignments from `tbl_adviser_section` to the new `teacher_id` column in `tbl_class_sections`
- Only synced assignments for the current school year
- Data migration ensures no loss of existing adviser relationships

### 2. Backend Changes

#### Models

**ClassSection Model** (`app/Models/ClassSection.php`)
- Added `teacher_id` to `$fillable` array
- Added `teacher()` relationship method (belongsTo Teacher)

**Teacher Model** (`app/Models/Teacher.php`)
- Added `classSections()` relationship method (hasMany ClassSection)

#### Controller

**ClassSectionController** (`app/Http/Controllers/ClassSectionController.php`)

**index() method:**
- Now loads and includes teachers in the response
- Includes teacher relationship in section data
- Returns teacher name (or "Not Assigned") for each section
- Added search functionality for teacher names

**store() method:**
- Accepts optional `teacher_id` parameter
- Validates teacher existence
- Checks if teacher is already assigned to another section
- Creates AdviserSection entry for current school year when teacher is assigned
- This maintains backward compatibility with the existing adviser system

**update() method:**
- Accepts optional `teacher_id` parameter
- Validates teacher existence
- Checks if teacher is already assigned to another section
- Syncs AdviserSection table for current school year
- Removes old adviser assignment if teacher changes
- Handles removal of adviser when no teacher is selected

### 3. Frontend Changes

#### Main Page (`resources/js/pages/admin/enrollment/class-sections/page.tsx`)
- Added `Teacher` type definition
- Updated `Section` type to include `teacher_id` and `teacher_name`
- Added `teachers` prop to component
- Updated table to display "Adviser" column
- Shows "Not Assigned" in italic gray when no adviser is assigned
- Passes teachers to modals
- Updated page description to mention adviser assignments

#### Create Section Modal (`resources/js/components/modals/create-section-modal.tsx`)
- Added `Teacher` type
- Added `teachers` prop
- Added `teacher_id` field to form data
- Added adviser selection dropdown with "No Adviser" option
- Submits teacher_id with form data
- Updated modal description

#### Edit Section Modal (`resources/js/components/modals/edit-section-modal.tsx`)
- Added `Teacher` type
- Added `teachers` prop
- Added `teacher_id` field to form data
- Pre-populates selected teacher when editing
- Added adviser selection dropdown with "No Adviser" option
- Submits teacher_id with form data
- Updated modal description

## Features

### New Functionality
1. **Assign Adviser on Creation**: When creating a new class section, you can immediately assign a teacher as the adviser
2. **Change Adviser on Edit**: Modify the adviser assignment when editing a section
3. **Optional Assignment**: Advisers are optional - you can create sections without advisers
4. **Visual Feedback**: Sections without advisers show "Not Assigned" in gray italic text
5. **Validation**: Prevents assigning the same teacher to multiple sections
6. **Search Enhancement**: Can now search sections by teacher name

### Backward Compatibility
- Maintains the existing `tbl_adviser_section` table for historical data
- Automatically syncs changes to `tbl_adviser_section` for current school year
- Existing adviser portal functionality remains unchanged
- Old adviser management page can still be used if needed

### Data Integrity
- Foreign key constraints ensure referential integrity
- `onDelete('set null')` prevents data loss when teachers are deleted
- Validation prevents duplicate teacher assignments
- Automatic sync keeps both tables consistent

## Usage

### Creating a Section with Adviser
1. Navigate to Class Sections
2. Click "+ Create Section"
3. Fill in section name and grade level
4. Select a teacher from the "Adviser (Optional)" dropdown
5. Click "Create Section"

### Editing Section Adviser
1. Click the edit icon on any section
2. Change the adviser from the dropdown (or select "No Adviser")
3. Click "Update Section"

### Viewing Sections
- The main table now shows three columns: Grade Level, Section Name, and Adviser
- Sections without advisers display "Not Assigned" in gray

## Technical Notes

### Database Schema
```sql
ALTER TABLE tbl_class_sections 
ADD COLUMN teacher_id BIGINT UNSIGNED NULL AFTER room_id,
ADD CONSTRAINT fk_teacher FOREIGN KEY (teacher_id) 
REFERENCES tbl_teachers(id) ON DELETE SET NULL;
```

### Relationship Sync
When a section's teacher_id is updated, the controller automatically:
1. Creates/updates an AdviserSection record for the current school year
2. Removes old AdviserSection records if the teacher changed
3. Deletes AdviserSection records if teacher is set to null

### Future Considerations
- The old Adviser Management page (`/admin/enrollment/adviser-management`) can be deprecated
- Historical adviser data remains in `tbl_adviser_section` for past school years
- Consider adding bulk adviser assignment functionality
- Consider adding validation to prevent removing advisers from sections with active students

## Testing Checklist
- [x] Create new section with adviser
- [x] Create new section without adviser
- [x] Edit section to add adviser
- [x] Edit section to change adviser
- [x] Edit section to remove adviser
- [x] Search sections by teacher name
- [x] Verify AdviserSection table is synced
- [x] Verify teacher constraint prevents duplicate assignments
- [x] Verify existing data was migrated correctly
