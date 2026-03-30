# Spatie SimpleExcel Setup for Student Import/Export

## Installation

Run the following command to install the required package:

```bash
composer require spatie/simple-excel
```

## What Has Been Implemented

### 1. Export Functionality
- Exports all students with their complete information to Excel
- File naming: `students_YYYY-MM-DD_HHMMSS.xlsx`
- Includes all student fields: LRN, names, email, contact info, etc.

### 2. Import Functionality
- Imports students from Excel files (.xlsx, .xls, .csv)
- Validates data before importing
- Skips duplicate LRNs and emails
- Creates user accounts automatically with default password: `password123`
- Shows success message with count of imported students
- Reports errors for skipped rows

### 3. Template Download
- Provides a pre-formatted Excel template
- Includes sample data row
- Shows exact column names required

### 4. Controller Methods
Added to `app/Http/Controllers/StudentController.php`:
- `export()` - Downloads all students as Excel file
- `import()` - Imports students from uploaded Excel file
- `downloadTemplate()` - Downloads template Excel file with sample data

### 5. Routes
Added to `routes/web.php`:
- `GET /admin/admission/registration/export` - Export students
- `POST /admin/admission/registration/import` - Import students
- `GET /admin/admission/registration/template` - Download template

### 6. Frontend UI
Updated `resources/js/pages/admin/admission/registration/page.tsx`:
- Added "Download Template" button with FileSpreadsheet icon
- Added "Import Students" button with Upload icon
- Added "Export Students" button with Download icon
- File upload handling with hidden input

## How to Use

### Export Students
1. Go to Student Registration page
2. Click "Export Students" button (green button)
3. Excel file will be downloaded with all student data

### Import Students
1. Click "Download Template" to get the Excel template
2. Fill in student data following the template format
3. Click "Import Students" and select your filled Excel file
4. Students will be imported automatically
5. Success message shows how many students were imported
6. Any errors or skipped rows will be displayed

### Template Format
The Excel template includes these columns (exact names required):
- **LRN** - Learner Reference Number (required, must be unique, 12 digits)
- **First Name** - Student's first name (required)
- **Middle Name** - Student's middle name (optional)
- **Last Name** - Student's last name (required)
- **Date of Birth** - Format: YYYY-MM-DD (e.g., 2010-01-15)
- **Gender** - male or female (lowercase, required)
- **Student Status** - Either "new" or "transferee" (lowercase, required)
- **Grade Level** - Must match existing grade level (e.g., "Grade 7", "Grade 8")
- **School Year** - Format: "SY YYYY-YYYY" (e.g., "SY 2025-2026")

**Note:** Email is automatically generated as `SNHS-{LRN}` and does not need to be included in the import file.

## Important Notes

1. **Auto-Generated Email**: Email is automatically generated as `SNHS-{LRN}` (e.g., SNHS-123456789001)
2. **Default Password**: All imported students get their LRN as the default password
3. **Validation**: Import validates LRN uniqueness (email is auto-generated so no conflicts)
4. **Error Handling**: Rows with errors are skipped, valid rows are imported
5. **Grade Level**: Must match existing grade level names exactly (case-sensitive)
6. **Date Format**: Use YYYY-MM-DD format for dates (e.g., 2010-01-15)
7. **Column Names**: Excel column headers must match exactly (case-sensitive)
8. **Not Enrolled**: Imported students are registered but not enrolled (no section assigned)
9. **Next Phase**: Imported students appear in "Students Not Enrolled" for enrollment phase
10. **Student Profile**: A basic profile is automatically created with default address (Bongabon, Nueva Ecija) using polymorphic relationship

## Features

- ✅ Simple and lightweight (no complex dependencies)
- ✅ Streams large files efficiently
- ✅ Validates data before import
- ✅ Skips invalid rows and continues
- ✅ Reports detailed error messages
- ✅ Creates user accounts automatically
- ✅ Checks for duplicate LRNs and emails
- ✅ Template with sample data

## Testing

After installation, test the features:
1. Download the template
2. Add sample student data (or use the provided sample row)
3. Import the file
4. Check if students are created in the database
5. Export to verify all data is correct

## Troubleshooting

If you encounter errors:
- Make sure the package is installed: `composer require spatie/simple-excel`
- Clear cache: `php artisan config:clear`
- Check file permissions for uploads
- Verify Excel file format (.xlsx, .xls, or .csv)
- Ensure column names match exactly
- Check that grade levels exist in database
- Verify date format is YYYY-MM-DD

## Error Messages

Common error messages and solutions:
- "LRN already exists" - Student with this LRN is already registered
- "Email already exists" - User with this email already exists
- "Grade level not found" - Grade level name doesn't match database
- "Missing required fields" - Required columns are empty
- "Row skipped" - Row had validation errors, check the error message

## Advantages of Spatie SimpleExcel

- Lightweight and fast
- No complex configuration needed
- Memory efficient for large files
- Easy to use API
- Supports streaming for large datasets
- Works with Excel and CSV files
