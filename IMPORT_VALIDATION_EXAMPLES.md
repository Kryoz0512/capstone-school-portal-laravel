# Student Import Validation Examples

## Test Scenarios

### Scenario 1: Valid Student
**CSV Data:**
```
LRN,First Name,Last Name,Grade Level,Section
123456789012,Juan,Dela Cruz,Grade 7,Rizal
```

**System State:**
- Grade 7 exists
- Section "Rizal" exists in Grade 7

**Result:** ✅ **VALID**
- `is_valid` = true
- `invalid_reason` = null
- Student imported successfully

---

### Scenario 2: Invalid - Wrong Grade Level for Section
**CSV Data:**
```
LRN,First Name,Last Name,Grade Level,Section
123456789013,Maria,Santos,Grade 9,Rizal
```

**System State:**
- Grade 9 exists
- Section "Rizal" exists in **Grade 7** (not Grade 9)

**Result:** ❌ **INVALID**
- `is_valid` = false
- `invalid_reason` = "Section 'Rizal' exists in Grade 7, not in Grade 9"
- Student imported but marked as invalid
- Error message: "Row 2: Section 'Rizal' exists in Grade 7, not in Grade 9. Student will be marked as invalid."

---

### Scenario 3: Invalid - Section Doesn't Exist
**CSV Data:**
```
LRN,First Name,Last Name,Grade Level,Section
123456789014,Pedro,Reyes,Grade 8,Mabini
```

**System State:**
- Grade 8 exists
- Section "Mabini" doesn't exist anywhere in the system

**Result:** ❌ **INVALID**
- `is_valid` = false
- `invalid_reason` = "Section 'Mabini' does not exist in the system"
- Student imported but marked as invalid
- Error message: "Row 3: Section 'Mabini' does not exist in the system. Student will be marked as invalid."

---

### Scenario 4: Invalid - Duplicate LRN
**CSV Data:**
```
LRN,First Name,Last Name,Grade Level,Section
123456789012,Jose,Garcia,Grade 7,Rizal
```

**System State:**
- LRN "123456789012" already exists in the system for school year 2023-2024
- Importing for school year 2023-2024

**Result:** ❌ **INVALID**
- `is_valid` = false
- `invalid_reason` = "Duplicate LRN for school year 2023-2024"
- Student imported but marked as invalid
- Error message: "Row 4: LRN '123456789012' already exists in the system for this school year. Student will be marked as invalid."

---

### Scenario 5: Valid - No Section (Unassigned)
**CSV Data:**
```
LRN,First Name,Last Name,Grade Level,Section
123456789015,Ana,Lopez,Grade 7,
```

**System State:**
- Grade 7 exists
- No section specified

**Result:** ✅ **VALID** (but unassigned)
- `is_valid` = true
- `invalid_reason` = null
- `current_section_id` = null
- Student imported successfully without section assignment

---

## How to Query Invalid Students

### Get all invalid students:
```php
$invalidStudents = Student::where('is_valid', false)
    ->with(['gradeLevel', 'section'])
    ->get();
```

### Get students with section issues:
```php
$sectionIssues = Student::where('is_valid', false)
    ->where('invalid_reason', 'LIKE', '%Section%')
    ->get();
```

### Get students with duplicate LRN:
```php
$duplicateLRN = Student::where('is_valid', false)
    ->where('invalid_reason', 'LIKE', '%Duplicate LRN%')
    ->get();
```

### Get students by specific invalid reason:
```php
$wrongGradeLevel = Student::where('is_valid', false)
    ->where('invalid_reason', 'LIKE', "%exists in Grade%")
    ->get();
```

---

## How to Fix Invalid Students

### Fix section assignment:
```php
// Find the correct section
$correctSection = ClassSection::where('section_name', 'Rizal')
    ->where('grade_level_id', $student->current_grade_level_id)
    ->first();

// Update the student
$student->update([
    'current_section_id' => $correctSection->id,
    'is_valid' => true,
    'invalid_reason' => null
]);
```

### Fix duplicate LRN (update to new school year):
```php
$student->update([
    'school_year' => '2024-2025',
    'is_valid' => true,
    'invalid_reason' => null
]);
```
