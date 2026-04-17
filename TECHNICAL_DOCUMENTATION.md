# SNHS Portal - Technical Documentation

**Last Updated:** April 17, 2026  
**Version:** 1.0  
**System:** School Portal Management System for Senior National High School

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Database Schema](#database-schema)
5. [User Roles & Permissions](#user-roles--permissions)
6. [Core Modules](#core-modules)
7. [Business Logic & Validation Rules](#business-logic--validation-rules)
8. [API Endpoints](#api-endpoints)
9. [Frontend Components](#frontend-components)
10. [Data Import/Export](#data-importexport)
11. [Security Features](#security-features)
12. [Deployment & Configuration](#deployment--configuration)
13. [Change Log](#change-log)

---

## System Overview

The SNHS Portal is a comprehensive school management system designed for Senior National High School. It manages student registration, enrollment, grading, scheduling, and administrative tasks for Grades 7-10.

### Key Features
- Multi-role authentication (Admin, Teacher, Student)
- Student registration with document tracking
- Class section and room management
- Grade management and reporting
- Schedule management
- Student archiving system
- Excel/CSV import/export functionality

---

## Technology Stack

### Backend
- **Framework:** Laravel 11.x
- **Language:** PHP 8.2+
- **Database:** MySQL 8.0
- **Authentication:** Laravel Fortify (with 2FA support)

### Frontend
- **Framework:** React 18.x with TypeScript
- **UI Library:** Radix UI + Tailwind CSS
- **State Management:** Inertia.js
- **Build Tool:** Vite

### Additional Libraries
- **Excel Processing:** Spatie Simple Excel
- **Icons:** Lucide React
- **Date Handling:** Carbon (PHP), date-fns (JS)

---

## Architecture

### MVC Pattern
The system follows Laravel's MVC architecture:
- **Models:** Located in `app/Models/`
- **Controllers:** Located in `app/Http/Controllers/`
- **Views:** React components in `resources/js/`

### Inertia.js Integration
- Server-side routing with client-side rendering
- No API layer needed for most operations
- Shared data passed via Inertia middleware

### Database Structure
- Prefix: `tbl_` for all tables
- Polymorphic relationships for student profiles
- Soft deletes not used; archiving system instead

---

## Database Schema

### Core Tables

#### `users`
Primary authentication table for all system users.
```sql
- id (PK)
- name
- email (unique)
- password
- role (enum: admin, teacher, student)
- two_factor_secret (nullable)
- two_factor_recovery_codes (nullable)
- two_factor_confirmed_at (nullable)
- timestamps
```

#### `tbl_students`
Student information and registration data.
```sql
- id (PK)
- user_id (FK -> users.id)
- student_status (enum: new, transferee, returning)
- lrn (12-digit, indexed)
- school_year (format: YYYY-YYYY)
- last_name
- first_name
- middle_name (nullable)
- suffix (nullable) [Added: 2026-04-17]
- gender (enum: male, female)
- birth_date
- current_grade_level_id (FK -> tbl_grade_levels.id, nullable)
- current_section_id (FK -> tbl_class_sections.id, nullable)
- has_psa_birth_certificate (boolean, default: false)
- has_sf9 (boolean, default: false)
- has_report_card (boolean, default: false)
- has_good_moral (boolean, default: false)
- timestamps
```

#### `tbl_grade_levels`
Grade level definitions (Grade 7-10).
```sql
- id (PK)
- name (unique, e.g., "Grade 7")
- timestamps
```

#### `tbl_class_sections`
Class sections for each grade level.
```sql
- id (PK)
- section_name (unique) [Constraint added: 2026-04-01]
- grade_level_id (FK -> tbl_grade_levels.id)
- school_year
- timestamps
```

#### `tbl_teachers`
Teacher information.
```sql
- id (PK)
- user_id (FK -> users.id)
- name
- gender
- timestamps
```

#### `tbl_admins`
Administrator information.
```sql
- id (PK)
- user_id (FK -> users.id, unique)
- first_name
- last_name
- role (enum: 'Admin', 'Staff', 'Super Admin') [Updated: 2026-04-17]
- position (e.g., 'School Principal', 'Registrar', etc.)
- updated_by (FK -> users.id, nullable)
- timestamps
```

**Note:** The `role` field indicates the admin type (Super Admin, Admin, or Staff), while the `position` field indicates their actual job title (e.g., Principal, Registrar).

#### `tbl_subjects`
Subject definitions.
```sql
- id (PK)
- subject_name
- grade_level_id (FK -> tbl_grade_levels.id)
- timestamps
```

#### `tbl_schedules`
Class schedules.
```sql
- id (PK)
- section_id (FK -> tbl_class_sections.id)
- subject_id (FK -> tbl_subjects.id)
- teacher_id (FK -> tbl_teachers.id)
- room_id (FK -> tbl_room.id)
- day_of_week
- start_time
- end_time
- timestamps
```

#### `tbl_enrollments`
Student enrollment records.
```sql
- id (PK)
- student_id (FK -> tbl_students.id)
- section_id (FK -> tbl_class_sections.id)
- school_year
- timestamps
```

#### `tbl_grades`
Student grades per subject.
```sql
- id (PK)
- student_id (FK -> tbl_students.id)
- subject_id (FK -> tbl_subjects.id)
- teacher_id (FK -> tbl_teachers.id)
- grade (decimal, range: 75-100)
- quarter (enum: 1st, 2nd, 3rd, 4th)
- school_year
- timestamps
```

#### `tbl_room`
Classroom/room definitions.
```sql
- id (PK)
- room_number (unique)
- timestamps
```

#### `tbl_adviser_section`
Adviser-section assignments.
```sql
- id (PK)
- teacher_id (FK -> tbl_teachers.id)
- section_id (FK -> tbl_class_sections.id)
- school_year
- timestamps
```

#### `archives`
Archived student records.
```sql
- id (PK)
- data (JSON - contains full student record)
- school_year
- archived_at
- timestamps
```

---

## User Roles & Permissions

### Principal (Super Admin)
**Access:** Full system access with elevated privileges
- All admin capabilities PLUS:
- Create and manage admin accounts
- Access admin management page
- Highest level of system control
- **Note:** Only principals can create other admins

### Admin
**Access:** Full system access (except admin management)
- Manage students (register, enroll, archive)
- Manage teachers
- Manage sections, rooms, subjects
- Manage schedules
- View all reports
- System maintenance (login slides, accreditation)
- **Cannot:** Create or manage admin accounts

### Teacher
**Access:** Limited to assigned classes
- View assigned sections and students
- Manage grades for assigned subjects
- View class schedules
- Generate reports (grade sheets, transcripts)
- Update profile

### Student
**Access:** Personal data only
- View own grades
- View class schedule
- View enrolled subjects
- Update profile

---

## Core Modules

### 1. Authentication Module
**Location:** `app/Providers/FortifyServiceProvider.php`

**Features:**
- Email/password authentication
- Two-factor authentication (2FA)
- Role-based redirection after login
- Password reset functionality

**Login Flow:**
1. User enters credentials
2. Fortify validates credentials
3. If 2FA enabled, prompt for code
4. Redirect based on role:
   - Admin → `/admin/dashboard`
   - Teacher → `/teacher/dashboard`
   - Student → `/student/dashboard`

---

### 2. Student Registration Module
**Location:** `app/Http/Controllers/StudentController.php`

**Features:**
- Three registration types: New, Old (Returning), Transferee
- Document requirement tracking
- LRN validation (12 digits, numeric only)
- School year format: YYYY-YYYY
- Suffix support (Jr., Sr., II, III, IV, V)

**Registration Types:**

#### New Student
- Automatically assigned to Grade 7
- First-time enrollees
- Required documents: PSA Birth Certificate, SF9 OR Report Card

#### Old Student (Returning)
- Search existing students by name/LRN
- Automatic grade progression validation
- Must advance exactly one grade level
- Cannot re-enroll if already in same school year
- Cannot re-enroll after Grade 10 (graduated)

#### Transferee
- Coming from another school
- Manual grade level selection
- Required documents: PSA Birth Certificate, SF9 OR Report Card, Good Moral Certificate

**Validation Rules:**
```php
// LRN: 12 digits, numeric only
'lrn' => 'required|numeric|size:12'

// Birth date: Must be at least 10 years old
'birth_date' => 'required|date|before_or_equal:-10 years'

// Grade validation: 75-100 range
'grade' => 'required|numeric|min:75|max:100'

// Section names: Must be unique across all grade levels
'section_name' => 'required|string|unique:tbl_class_sections,section_name'

// Room numbers: Must be unique
'room_number' => 'required|string|unique:tbl_room,room_number'
```

**Grade Progression Logic:**
```php
// For returning students
$currentGrade = 7; // Current grade level
$nextGrade = $currentGrade + 1; // Must be exactly +1

// Validation
if ($newGrade !== $currentGrade + 1) {
    // Reject: Can only advance to next grade
}

if ($currentGrade >= 10) {
    // Reject: Already graduated
}
```

---

### 3. Enrollment Module
**Location:** `app/Http/Controllers/StudentController.php` (enrollment methods)

**Features:**
- Assign students to sections
- Track enrollment by school year
- View enrolled and unenrolled students
- Bulk enrollment support

**Enrollment Process:**
1. Student must be registered first
2. Admin selects student from "Not Enrolled" list
3. Assigns to appropriate section
4. Enrollment record created with school year

---

### 4. Grade Management Module
**Location:** `app/Http/Controllers/GradeController.php`

**Features:**
- Quarter-based grading (1st, 2nd, 3rd, 4th)
- Grade range: 75-100 (passing grade is 75)
- Teacher can only grade assigned subjects
- Grade editing and deletion

**Grading Rules:**
- Minimum grade: 75
- Maximum grade: 100
- Grades stored as decimal for precision
- Each grade linked to: student, subject, teacher, quarter, school year

---

### 5. Schedule Management Module
**Location:** `app/Http/Controllers/ScheduleController.php`

**Features:**
- Create class schedules
- Assign teachers to subjects
- Assign rooms to classes
- Time conflict detection
- Day-based scheduling (Monday-Friday)

---

### 6. Archive Module
**Location:** `app/Http/Controllers/ArchiveController.php`

**Features:**
- Archive students by school year
- Store complete student data as JSON
- View archived students grouped by school year
- Grade-level breakdown in archives

**Archive Process:**
1. Select students to archive
2. System creates JSON snapshot of student data
3. Original student record can be deleted or kept
4. Archived data includes: personal info, grades, enrollment history

---

### 7. Student Checklist Module
**Location:** `resources/js/pages/admin/registrar/student-checklist/page.tsx`

**Features:**
- View all current students by grade level (7-10)
- Track document submission status
- View past students grouped by school year
- Search functionality across all tabs
- Pagination (10 items per page)

**Document Status Tracking:**
- PSA Birth Certificate (required for all)
- SF9 OR Report Card (at least one required)
- Good Moral (required for transferees only)

**Status Indicators:**
- Complete: All required documents submitted
- Incomplete: Some documents missing
- No Documents: No documents submitted

---

## Business Logic & Validation Rules

### Student Registration Validations

#### 1. Duplicate Prevention
```php
// Check if student already exists with same LRN
$existingStudent = Student::where('lrn', $lrn)->first();

if ($existingStudent && $existingStudent->school_year === $newSchoolYear) {
    // Reject: Already registered for this school year
}
```

#### 2. Grade Progression (Returning Students)
```php
// Extract grade numbers
$currentGrade = (int) filter_var($currentGradeLevel->name, FILTER_SANITIZE_NUMBER_INT);
$newGrade = (int) filter_var($newGradeLevel->name, FILTER_SANITIZE_NUMBER_INT);

// Validate progression
if ($newGrade !== $currentGrade + 1) {
    // Error: Must advance exactly one grade level
}

if ($currentGrade >= 10) {
    // Error: Already graduated, cannot re-enroll
}
```

#### 3. Document Requirements
```php
// All students
- has_psa_birth_certificate: required
- has_sf9 OR has_report_card: at least one required

// Transferees only
- has_good_moral: required
```

### Section and Room Validations

#### Unique Constraints
```sql
-- Section names must be unique across all grade levels
ALTER TABLE tbl_class_sections 
ADD UNIQUE KEY unique_section_name (section_name);

-- Room numbers must be unique
ALTER TABLE tbl_room 
ADD UNIQUE KEY unique_room_number (room_number);
```

### Grade Validations
```php
// Grade range
'grade' => 'required|numeric|min:75|max:100'

// Passing grade
$passingGrade = 75;
$isPassing = $grade >= $passingGrade;
```

---

## API Endpoints

### Student Routes
```php
// Registration
POST /admin/admission/registration/store

// Search returning students
GET /admin/admission/registration/search-returning?search={query}

// Export students
GET /admin/admission/registration/export?format={csv|xlsx}

// Import students
POST /admin/admission/registration/import

// Download template
GET /admin/admission/registration/template

// Student checklist
GET /admin/registrar/student-checklist
```

### Grade Routes
```php
// Store grade
POST /teacher/grades/store

// Update grade
PUT /teacher/grades/{id}/update

// Delete grade
DELETE /teacher/grades/{id}/delete
```

### Section Routes
```php
// List sections
GET /admin/maintenance/sections

// Store section
POST /admin/maintenance/sections/store

// Update section
PUT /admin/maintenance/sections/{id}/update

// Delete section
DELETE /admin/maintenance/sections/{id}/delete
```

### Room Routes
```php
// List rooms
GET /admin/maintenance/rooms

// Store room
POST /admin/maintenance/rooms/store

// Update room
PUT /admin/maintenance/rooms/{id}/update

// Delete room
DELETE /admin/maintenance/rooms/{id}/delete
```

---

## Frontend Components

### UI Component Library
**Location:** `resources/js/components/ui/`

**Components:**
- `button.tsx` - Button component with variants
- `input.tsx` - Form input component
- `select.tsx` - Dropdown select (Radix UI)
- `tabs.tsx` - Tab navigation component
- `card.tsx` - Card container component
- `dialog.tsx` - Modal dialog component

### Layout Components
**Location:** `resources/js/layouts/`

- `admin-layout.tsx` - Admin dashboard layout
- `teacher-layout.tsx` - Teacher dashboard layout
- `student-layout.tsx` - Student dashboard layout

### Navigation Components
**Location:** `resources/js/components/`

- `admin-sidebar.tsx` - Admin navigation sidebar
- `teacher-sidebar.tsx` - Teacher navigation sidebar
- `student-sidebar.tsx` - Student navigation sidebar
- `admin-header.tsx` - Admin header with user menu
- `teacher-header.tsx` - Teacher header with user menu
- `student-header.tsx` - Student header with user menu

### Color Scheme
```typescript
// Role-based colors
Admin: Green (#16a34a)
Teacher: Blue (#2563eb)
Student: Purple (#9333ea)
```

---

## Data Import/Export

### Export Functionality
**Format:** CSV or XLSX
**Location:** `StudentController::export()`

**Exported Columns:**
1. LRN (formatted as text with leading apostrophe)
2. First Name
3. Middle Name
4. Last Name
5. Suffix
6. Date of Birth
7. Gender
8. Student Status
9. Grade Level
10. School Year
11. PSA Birth Certificate (Yes/No)
12. SF9 (Yes/No)
13. Report Card (Yes/No)
14. Good Moral (Yes/No)

### Import Functionality
**Supported Formats:** CSV, XLSX, XLS
**Location:** `StudentController::import()`

**Import Process:**
1. Validate file format
2. Read rows using Spatie Simple Excel
3. Validate each row:
   - Check required fields (LRN, First Name, Last Name)
   - Validate LRN uniqueness
   - Validate grade level exists
   - Check email uniqueness
4. Create user account (email: SNHS-{LRN})
5. Create student record
6. Create student profile
7. Return success/error summary

**Error Handling:**
- Duplicate LRN: Skip row with error message
- Invalid grade level: Skip row with error message
- Missing required fields: Skip row with error message
- Successful imports shown in modal with student list

### Template Download
**Location:** `StudentController::downloadTemplate()`

Provides a CSV template with:
- Header row with all required columns
- Two sample rows with example data
- Proper formatting for dates, booleans, etc.

---

## Security Features

### Authentication
- Password hashing using bcrypt
- Two-factor authentication (2FA) support
- Session-based authentication
- CSRF protection on all forms

### Authorization
- Role-based access control (RBAC)
- Middleware protection on routes
- Teacher can only access assigned classes
- Student can only access own data

### Data Validation
- Server-side validation on all inputs
- Client-side validation for UX
- SQL injection prevention (Eloquent ORM)
- XSS protection (React escaping)

### Password Policy
- Default password: Student LRN
- Users should change on first login
- Password reset via email

---

## Deployment & Configuration

### Environment Variables
```env
APP_NAME="SNHS Portal"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=snhs_db
DB_USERNAME=your_username
DB_PASSWORD=your_password

MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
```

### Installation Steps
```bash
# 1. Clone repository
git clone <repository-url>

# 2. Install PHP dependencies
composer install

# 3. Install Node dependencies
npm install

# 4. Copy environment file
cp .env.example .env

# 5. Generate application key
php artisan key:generate

# 6. Run migrations
php artisan migrate

# 7. Seed database (optional)
php artisan db:seed

# 8. Build frontend assets
npm run build

# 9. Start server
php artisan serve
```

### Production Deployment
```bash
# Optimize for production
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Build frontend
npm run build

# Set permissions
chmod -R 775 storage bootstrap/cache
```

---

## Change Log

### Version 1.0 - April 17, 2026

#### Added Features

1. **Principal (Super Admin) Role** (2026-04-17)
   - Added "principal" role with elevated privileges
   - Only principals can create and manage admin accounts
   - Admin management page hidden from regular admins
   - Created PrincipalSeeder for initial setup
   - Authorization checks in AdminController
   - Conditional UI rendering in admin sidebar
   - Updated tbl_admins role enum to 'Super Admin' (role) with 'School Principal' (position)
   - Email format: SNHS-ADMIN-PRINCIPAL (follows SNHS-LASTNAME-FIRSTNAME pattern)
   - **Login:** SNHS-ADMIN-PRINCIPAL / principal123

2. **Suffix Field in Student Registration** (2026-04-17)
   - Added `suffix` column to `tbl_students` table
   - Dropdown options: Jr., Sr., II, III, IV, V
   - Updated import/export to include suffix
   - Updated template with suffix column

2. **Student Registration Validations** (2026-04-17)
   - Duplicate registration prevention for same school year
   - Grade progression validation for returning students
   - Graduation check (Grade 10 students cannot re-enroll)
   - Automatic update of existing student records for new school year

3. **Student Checklist Page** (2026-04-17)
   - View students by grade level (7-10)
   - Document status tracking with visual indicators
   - Past students view grouped by school year
   - Search functionality across all tabs
   - Pagination (10 items per page)

4. **Unique Constraints** (2026-04-01)
   - Section names must be unique across all grade levels
   - Room numbers must be unique

5. **Color Scheme Standardization**
   - Admin: Green
   - Teacher: Blue
   - Student: Purple
   - Applied consistently across all components

6. **Grade Validation Update**
   - Changed grade range from 0-100 to 75-100
   - Passing grade is 75

7. **Tabbed Registration Interface**
   - New Student tab (auto-assigns Grade 7)
   - Old Student tab (returning students with search)
   - Transferee tab (manual grade selection)

8. **Document Requirements Tracking**
   - PSA Birth Certificate (required for all)
   - SF9 OR Report Card (at least one required)
   - Good Moral (required for transferees only)
   - Visual checkbox cards with status badges

9. **School Year Input Enhancement**
   - Two separate 4-digit year inputs
   - Auto-concatenates to YYYY-YYYY format
   - Numeric input only
   - Starts from 2019 (school founding year)

10. **LRN Input Validation**
    - Numeric input only (no text allowed)
    - 12-digit limit
    - Real-time validation

#### Database Changes
- Migration: `2026_04_17_174336_add_principal_role_to_users_table.php`
- Migration: `2026_04_17_175039_update_role_enum_in_admins_table.php` (Added Principal to enum)
- Migration: `2026_04_17_175343_change_principal_to_super_admin_in_admins_table.php` (Changed to Super Admin)
- Migration: `2026_04_17_150054_add_suffix_to_students_table.php`

#### Code Refactoring
- Created `SuperAdminController` for admin management (principal-only operations)
- Refactored `AdminController` to only handle dashboard
- Updated routes to use `SuperAdminController` for admin management
- Separated concerns: regular admin operations vs super admin operations
- Migration: `2026_04_17_141138_add_document_requirements_to_students_table.php`
- Migration: `2026_04_17_142520_add_good_moral_to_students_table.php`
- Migration: `2026_04_01_000001_add_unique_constraint_to_section_name.php`

#### Bug Fixes
- Fixed Radix UI Select error with empty string values
- Fixed duplicate renderStudentTable function in student checklist
- Fixed archive query to properly extract JSON data
- Fixed multiple JSX closing tag errors in registration page

---

## Maintenance Notes

### When Adding New Features
1. Update this documentation with:
   - Feature description
   - Database changes (if any)
   - Validation rules
   - API endpoints
   - Frontend components
2. Add entry to Change Log with date
3. Update version number if major change

### When Modifying Existing Features
1. Update relevant sections in documentation
2. Add entry to Change Log
3. Note any breaking changes

### Database Migrations
- Always create new migration files
- Never modify existing migrations in production
- Document migration purpose in Change Log

### Code Standards
- Follow Laravel best practices
- Use TypeScript for React components
- Maintain consistent naming conventions
- Add comments for complex logic

---

## Support & Contact

For technical support or questions about this system:
- **Developer:** [Your Name/Team]
- **Email:** [support@email.com]
- **Documentation:** This file (TECHNICAL_DOCUMENTATION.md)

---

**End of Documentation**


---

## Super Admin (Principal) Role Implementation

**Last Updated:** April 17, 2026

### Overview
The system implements a Super Admin role with elevated privileges. Only Super Admins can create and manage admin accounts.

### Role Structure

#### User Roles (tbl_users)
- `role = 'admin'` - All admin users (including Super Admin)
- `role = 'teacher'` - Teacher accounts
- `role = 'student'` - Student accounts

#### Admin Roles (tbl_admins)
- `role = 'Super Admin'` - Highest access level, can manage admins
- `role = 'Admin'` - Standard admin access
- `role = 'Staff'` - Limited staff access

#### Position Field (tbl_admins)
- `position = 'School Principal'` - Job title for principal
- `position = 'Registrar'` - Job title for registrar
- `position = 'Admin Staff'` - Job title for admin staff

### Key Distinction
- **Role** = Access level in the system (Super Admin, Admin, Staff)
- **Position** = Job title/designation (School Principal, Registrar, etc.)

### Super Admin Privileges
- Full system access including all admin features
- **Exclusive access to Admin Management**:
  - Create new admin accounts
  - Edit existing admin accounts
  - Delete admin accounts
  - View all admin accounts

### Regular Admin Privileges
- Full system access EXCEPT:
  - Cannot access Admin Management page
  - Cannot create/edit/delete admin accounts

### Implementation Details

#### Database Migrations
1. `2026_04_17_174336_add_principal_role_to_users_table.php` - Added principal role support
2. `2026_04_17_175039_update_role_enum_in_admins_table.php` - Updated role enum
3. `2026_04_17_175343_change_principal_to_super_admin_in_admins_table.php` - Changed to 'Super Admin'

#### Seeder
Super Admin account is created in `DatabaseSeeder.php`:
- Email: `SNHS-BAYUDANG-MICAH`
- Password: `micah123`
- User role: `admin`
- Admin role: `Super Admin`
- Position: `School Principal`

#### Backend Authorization
**File:** `app/Http/Controllers/SuperAdminController.php`
- Dedicated controller for admin management
- All methods check: `Admin::where('user_id', Auth::id())->first()->role === 'Super Admin'`
- Methods: `index()`, `store()`, `update()`, `destroy()`

**File:** `app/Http/Controllers/AdminController.php`
- Refactored to only contain `dashboard()` method
- Admin management methods moved to SuperAdminController

#### Frontend Authorization
**File:** `resources/js/components/admin-sidebar.tsx`
- Conditional rendering: `{admin?.role === 'Super Admin' && <Link to admin management>}`

**File:** `resources/js/components/admin-header.tsx`
- Displays admin role from Admin table (not User table)

#### Routes
```php
Route::get('admin/user-management/admin', [SuperAdminController::class, 'index'])->name('superadmin.admins.index');
Route::post('admin/user-management/admin', [SuperAdminController::class, 'store'])->name('superadmin.admins.store');
Route::put('admin/user-management/admin/{admin}', [SuperAdminController::class, 'update'])->name('superadmin.admins.update');
Route::delete('admin/user-management/admin/{admin}', [SuperAdminController::class, 'destroy'])->name('superadmin.admins.destroy');
```

### Email Format
All admin accounts use the format: `SNHS-LASTNAME-FIRSTNAME`
- Example: `SNHS-BAYUDANG-MICAH`
- Example: `SNHS-GARCIA-MARIA`

---

## Excel Import/Export Setup

### Installation
```bash
composer require spatie/simple-excel
```

### Features
- **Export:** Downloads all students as Excel file
- **Import:** Uploads Excel file to create multiple students
- **Template:** Provides pre-formatted template with sample data

### Template Format
Required columns (exact names):
- **LRN** - 12 digits, unique (required)
- **First Name** - Student's first name (required)
- **Middle Name** - Optional
- **Last Name** - Student's last name (required)
- **Suffix** - Jr., Sr., II, III, IV, V (optional)
- **Date of Birth** - Format: YYYY-MM-DD (required)
- **Gender** - male or female (required)
- **Student Status** - new, old, or transferee (required)
- **Grade Level** - Must match existing grade level (required)
- **School Year** - Format: SY YYYY-YYYY (required)

### Important Notes
1. **Auto-Generated Email:** Email is automatically generated as `SNHS-{LRN}`
2. **Default Password:** All imported students get their LRN as password
3. **Validation:** Import validates LRN uniqueness
4. **Error Handling:** Invalid rows are skipped, valid rows are imported
5. **Not Enrolled:** Imported students need to be enrolled separately

### LRN Formatting in Excel
**Problem:** Excel displays LRN as scientific notation (1.23457E+11)

**Solutions:**
1. Format column as Text before entering data
2. Add single quote prefix: `'123456789001`
3. Use CSV format instead of XLSX
4. Pre-format column: Select → Format Cells → Text

### Routes
- `GET /admin/admission/registration/export` - Export students
- `POST /admin/admission/registration/import` - Import students
- `GET /admin/admission/registration/template` - Download template

---

## Setup & Installation Notes

### PHP Zip Extension
Required for Excel file processing.

**Windows (XAMPP/WAMP):**
1. Open `php.ini` (usually `C:\xampp\php\php.ini`)
2. Find `;extension=zip`
3. Remove semicolon: `extension=zip`
4. Restart Apache

**Verify Installation:**
```bash
php -m | grep zip
```

**Alternative:** Use CSV format if zip extension cannot be installed.

### Restart Apache
After enabling extensions:
1. Open XAMPP Control Panel
2. Stop Apache
3. Start Apache

Or use command line:
```bash
net stop Apache2.4
net start Apache2.4
```

---

## Change Log

### April 17, 2026
- Implemented Super Admin (Principal) role with elevated privileges
- Refactored admin management into dedicated SuperAdminController
- Updated frontend to check Admin.role instead of User.role
- Added suffix field to student registration
- Implemented grade progression validation for returning students
- Created comprehensive technical documentation
- Moved Super Admin seeding to DatabaseSeeder
- Updated Super Admin credentials to Micah Bayudang

### April 1, 2026
- Added unique constraint to section names across all grade levels
- Implemented section name validation

### March 20, 2026
- Initial database schema setup
- Created core models and migrations
- Implemented basic CRUD operations

---

**End of Documentation**
