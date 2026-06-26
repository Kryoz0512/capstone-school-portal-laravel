<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AdminProfileController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\TeacherSubjectController;
use App\Http\Controllers\ClassSectionController;
use App\Http\Controllers\AdviserSectionController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\AccreditationController;
use App\Http\Controllers\ProfilePictureController;
use App\Http\Controllers\GradeController;
use App\Http\Controllers\PasswordChangeController;
use App\Http\Controllers\AnnouncementController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Laravel\Fortify\Features;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\DocumentController;

Route::get('/', function () {
    $slides = \App\Models\LoginSlide::where('is_active', true)
        ->orderBy('order')
        ->get()
        ->map(function ($slide) {
            return \Illuminate\Support\Facades\Storage::url($slide->image_path);
        })
        ->toArray();

    return \Inertia\Inertia::render('portal', [
        'slides' => $slides
    ]);
})->name('home');

Route::get('/login/student', function () {
    $slides = \App\Models\LoginSlide::where('is_active', true)
        ->orderBy('order')
        ->get()
        ->map(function ($slide) {
            return \Illuminate\Support\Facades\Storage::url($slide->image_path);
        })
        ->toArray();

    return \Inertia\Inertia::render('auth/login', [
        'slides' => $slides,
        'role' => 'student'
    ]);
})->name('login.student');

Route::get('/login/teacher', function () {
    $slides = \App\Models\LoginSlide::where('is_active', true)
        ->orderBy('order')
        ->get()
        ->map(function ($slide) {
            return \Illuminate\Support\Facades\Storage::url($slide->image_path);
        })
        ->toArray();

    return \Inertia\Inertia::render('auth/login', [
        'slides' => $slides,
        'role' => 'teacher'
    ]);
})->name('login.teacher');

// Admin login with hashed URL for security
Route::get('/admin-access-' . md5('snhs-admin-portal-2026'), function () {
    return \Inertia\Inertia::render('auth/admin-login');
})->name('login.admin');

// Password change route (must be before CheckPasswordChanged middleware)
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('change-password', [PasswordChangeController::class, 'show'])->name('change-password');
    Route::post('change-password', [PasswordChangeController::class, 'update']);
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // Student routes
    Route::get('student/dashboard', [StudentController::class, 'dashboard'])->name('student.dashboard');

    Route::get('student/clearance', [StudentController::class, 'clearance'])->name('student.clearance');

    Route::get('student/enrolled-subjects', [StudentController::class, 'enrolledSubjects'])->name('student.enrolled-subjects');

    Route::get('student/schedule', [StudentController::class, 'schedule'])->name('student.schedule');

    Route::get('student/report-card', [StudentController::class, 'reportCard'])->name('student.report-card');

    Route::get('student/profile-settings', [StudentController::class, 'profileSettings'])->name('student.profile-settings');
    Route::put('student/profile-settings', [StudentController::class, 'updateProfileSettings'])->name('student.profile-settings.update');
    Route::put('student/profile-settings/password', [StudentController::class, 'updateStudentPassword'])->name('student.profile-settings.password');
    Route::post('student/profile-settings/picture', [StudentController::class, 'uploadProfilePicture'])->name('student.profile-settings.picture.upload');
    Route::delete('student/profile-settings/picture', [StudentController::class, 'deleteProfilePicture'])->name('student.profile-settings.picture.delete');
    Route::post('student/profile-picture/upload', [StudentController::class, 'uploadProfilePicture'])->name('student.profile-picture.upload');
    Route::delete('student/profile-picture/delete', [StudentController::class, 'deleteProfilePicture'])->name('student.profile-picture.delete');

    // Teacher routes
    Route::get('teacher/dashboard', [TeacherController::class, 'dashboard'])->name('teacher.dashboard');

    Route::get('teacher/grade-sheets', [App\Http\Controllers\GradeController::class, 'index'])->name('teacher.grade-sheets');
    Route::post('teacher/grade-sheets', [App\Http\Controllers\GradeController::class, 'store'])->name('teacher.grade-sheets.store');
    Route::put('teacher/grade-sheets/{gradeSheet}', [App\Http\Controllers\GradeController::class, 'update'])->name('teacher.grade-sheets.update');

    Route::get('teacher/class-list', [TeacherController::class, 'classList'])->name('teacher.class-list');

    Route::get('teacher/final-report', [TeacherController::class, 'finalReport'])->name('teacher.final-report');
    Route::put('teacher/students/{student}/graduation-readiness', [TeacherController::class, 'updateGraduationReadiness'])->name('teacher.students.graduation-readiness');

    Route::get('teacher/transcript-of-records', function () {
        return \Inertia\Inertia::render('teacher/transcript-of-records/page');
    })->name('teacher.transcript-of-records');

    Route::get('teacher/schedule', [TeacherController::class, 'schedule'])->name('teacher.schedule');

    Route::get('teacher/documents', [DocumentController::class, 'teacherIndex'])->name('teacher.documents');
    Route::get('teacher/documents/{document}/download', [DocumentController::class, 'download'])->name('teacher.documents.download');

    Route::get('teacher/profile', [TeacherController::class, 'profile'])->name('teacher.profile');

    Route::get('teacher/profile-settings', [TeacherController::class, 'profileSettings'])->name('teacher.profile-settings');
    Route::put('teacher/profile-settings', [TeacherController::class, 'updateProfile'])->name('teacher.profile-settings.update');
    Route::put('teacher/profile-settings/password', [TeacherController::class, 'updatePassword'])->name('teacher.profile-settings.password');
    Route::post('teacher/profile-settings/picture', [TeacherController::class, 'uploadProfilePicture'])->name('teacher.profile-settings.picture.upload');
    Route::delete('teacher/profile-settings/picture', [TeacherController::class, 'deleteProfilePicture'])->name('teacher.profile-settings.picture.delete');

    Route::get('teacher/student-clearance', [TeacherController::class, 'studentClearance'])->name('teacher.student-clearance');


    Route::post('teacher/student-clearance/toggle', [\App\Http\Controllers\ClearanceController::class, 'toggle'])->name('teacher.student-clearance.toggle');








    // Admin routes
    Route::get('admin/dashboard', [AdminController::class, 'dashboard'])->name('admin.dashboard');

    // Admin Enrollment routes
    Route::get('admin/enrollment/room-listings', [RoomController::class, 'index'])->name('admin.enrollment.room-listings');
    Route::post('admin/enrollment/rooms', [RoomController::class, 'store'])->name('admin.enrollment.rooms.store');
    Route::put('admin/enrollment/rooms/{id}', [RoomController::class, 'update'])->name('admin.enrollment.rooms.update');
    Route::delete('admin/enrollment/rooms/{id}', [RoomController::class, 'destroy'])->name('admin.enrollment.rooms.destroy');
    Route::post('admin/enrollment/rooms/check-room-number', [RoomController::class, 'checkRoomNumber'])->name('admin.enrollment.rooms.check-room-number');

    Route::get('admin/enrollment/room-schedule', [App\Http\Controllers\ScheduleController::class, 'roomSchedule'])->name('admin.enrollment.room-schedule');
    Route::get('admin/enrollment/room-schedule/{room}', [App\Http\Controllers\ScheduleController::class, 'showRoomSchedule'])->name('admin.enrollment.room-schedule.show');

    Route::get('admin/enrollment/class-sections', [ClassSectionController::class, 'index'])->name('admin.enrollment.class-sections');
    Route::post('admin/enrollment/class-sections', [ClassSectionController::class, 'store'])->name('admin.enrollment.class-sections.store');
    Route::put('admin/enrollment/class-sections/{classSection}', [ClassSectionController::class, 'update'])->name('admin.enrollment.class-sections.update');
    Route::delete('admin/enrollment/class-sections/{classSection}', [ClassSectionController::class, 'destroy'])->name('admin.enrollment.class-sections.destroy');
    Route::post('admin/enrollment/class-sections/check-section-name', [ClassSectionController::class, 'checkSectionName'])->name('admin.enrollment.class-sections.check-section-name');
    Route::post('admin/enrollment/class-sections/check-room', [ClassSectionController::class, 'checkRoom'])->name('admin.enrollment.class-sections.check-room');

    Route::get('admin/enrollment/faculty-subjects', [TeacherSubjectController::class, 'index'])->name('admin.enrollment.faculty-subjects');
    Route::get('admin/enrollment/teacher-subjects/{teacherId}', [TeacherSubjectController::class, 'getTeacherSubjects'])->name('admin.enrollment.teacher-subjects.get');
    Route::post('admin/enrollment/teacher-subjects', [TeacherSubjectController::class, 'store'])->name('admin.enrollment.teacher-subjects.store');
    Route::put('admin/enrollment/teacher-subjects/{id}', [TeacherSubjectController::class, 'update'])->name('admin.enrollment.teacher-subjects.update');
    Route::delete('admin/enrollment/teacher-subjects/{id}', [TeacherSubjectController::class, 'destroy'])->name('admin.enrollment.teacher-subjects.destroy');

    Route::get('admin/enrollment/load-scheduling', [ScheduleController::class, 'index'])->name('admin.enrollment.load-scheduling');
    Route::get('admin/enrollment/load-scheduling/{teacher}', [ScheduleController::class, 'show'])->name('admin.enrollment.load-scheduling.show');
    Route::get('admin/enrollment/load-scheduling/{teacher}/create', [ScheduleController::class, 'create'])->name('admin.enrollment.load-scheduling.create');
    Route::get('admin/enrollment/schedules/{schedule}/edit', [ScheduleController::class, 'edit'])->name('admin.enrollment.schedules.edit');
    Route::post('admin/enrollment/schedules', [ScheduleController::class, 'store'])->name('admin.enrollment.schedules.store');
    Route::put('admin/enrollment/schedules/{schedule}', [ScheduleController::class, 'update'])->name('admin.enrollment.schedules.update');
    Route::delete('admin/enrollment/schedules/{schedule}', [ScheduleController::class, 'destroy'])->name('admin.enrollment.schedules.destroy');

    Route::get('admin/enrollment/adviser-management', [AdviserSectionController::class, 'index'])->name('admin.enrollment.adviser-management');
    Route::post('admin/enrollment/adviser-sections', [AdviserSectionController::class, 'store'])->name('admin.enrollment.adviser-sections.store');
    Route::put('admin/enrollment/adviser-sections/{adviserSection}', [AdviserSectionController::class, 'update'])->name('admin.enrollment.adviser-sections.update');
    Route::delete('admin/enrollment/adviser-sections/{adviserSection}', [AdviserSectionController::class, 'destroy'])->name('admin.enrollment.adviser-sections.destroy');

    Route::get('admin/enrollment/student-not-enrolled', [StudentController::class, 'notEnrolled'])->name('admin.enrollment.student-not-enrolled');
    Route::put('admin/enrollment/students/{student}/assign-section', [StudentController::class, 'assignSection'])->name('admin.enrollment.students.assign-section');

    Route::get('admin/enrollment/enrollment-list', [StudentController::class, 'enrollmentList'])->name('admin.enrollment.enrollment-list');

    Route::get('admin/enrollment/student-schedule', [StudentController::class, 'scheduleIndex'])->name('admin.enrollment.student-schedule');
    Route::get('admin/enrollment/student-schedule/{student}', [StudentController::class, 'scheduleShow'])->name('admin.enrollment.student-schedule.show');

    // Admin Admission routes
    Route::get('admin/admission/registration', function () {
        $gradeLevels = \App\Models\GradeLevel::all();
        $admin = \App\Models\Admin::where('user_id', \Illuminate\Support\Facades\Auth::id())->first();

        return \Inertia\Inertia::render('admin/admission/registration/page', [
            'gradeLevels' => $gradeLevels,
        ]);
    })->name('admin.admission.registration');

    Route::post('admin/admission/registration', [App\Http\Controllers\StudentController::class, 'store'])->name('admin.admission.registration.store');
    Route::get('admin/admission/registration/export', [App\Http\Controllers\StudentController::class, 'export'])->name('admin.admission.registration.export');
    Route::post('admin/admission/registration/import', [App\Http\Controllers\StudentController::class, 'import'])->name('admin.admission.registration.import');
    Route::get('admin/admission/registration/import-status/{importJobId}', [App\Http\Controllers\StudentController::class, 'checkImportStatus'])->name('admin.admission.registration.import-status');
    Route::get('admin/admission/registration/template', [App\Http\Controllers\StudentController::class, 'downloadTemplate'])->name('admin.admission.registration.template');
    Route::get('admin/admission/registration/search-returning', [App\Http\Controllers\StudentController::class, 'searchReturningStudents'])->name('admin.admission.registration.search-returning');

    // Registrar routes
    Route::get('admin/registrar/student-checklist', [App\Http\Controllers\StudentController::class, 'checklist'])->name('admin.registrar.student-checklist');

    Route::get('admin/admission/accreditation', [AccreditationController::class, 'index'])->name('admin.admission.accreditation');
    Route::post('admin/admission/accreditations', [AccreditationController::class, 'store'])->name('admin.admission.accreditations.store');
    Route::put('admin/admission/accreditations/{accreditation}', [AccreditationController::class, 'update'])->name('admin.admission.accreditations.update');
    Route::delete('admin/admission/accreditations/{accreditation}', [AccreditationController::class, 'destroy'])->name('admin.admission.accreditations.destroy');

    Route::get('admin/admission/upload-delete-picture', [ProfilePictureController::class, 'index'])->name('admin.admission.upload-delete-picture');
    // Route::post('admin/admission/profile-picture/verify', [ProfilePictureController::class, 'verify'])->name('admin.admission.profile-picture.verify');
    Route::post('admin/admission/profile-picture/upload', [ProfilePictureController::class, 'upload'])->name('admin.admission.profile-picture.upload');
    Route::delete('admin/admission/profile-picture/delete', [ProfilePictureController::class, 'delete'])->name('admin.admission.profile-picture.delete');

    Route::get('admin/admission/view-edit-student', [StudentController::class, 'viewEdit'])->name('admin.admission.view-edit-student');

    Route::get('admin/admission/view-edit-student/{id}/edit', [StudentController::class, 'edit'])->name('admin.admission.view-edit-student.edit');
    Route::put('admin/admission/view-edit-student/{id}', [StudentController::class, 'updateProfile'])->name('admin.admission.view-edit-student.update');
    Route::put('admin/students/{student}/graduation-readiness', [StudentController::class, 'updateGraduationReadiness'])->name('admin.students.graduation-readiness');

    // Admin Registrar routes
    Route::get('admin/registrar/subject-listings', [SubjectController::class, 'index'])->name('admin.registrar.subject-listings');
    Route::post('admin/registrar/subjects', [SubjectController::class, 'store'])->name('admin.registrar.subjects.store');
    Route::put('admin/registrar/subjects/{subject}', [SubjectController::class, 'update'])->name('admin.registrar.subjects.update');
    Route::delete('admin/registrar/subjects/{subject}', [SubjectController::class, 'destroy'])->name('admin.registrar.subjects.destroy');

    // Admin Records routes
    Route::get('admin/records/final-reports', [GradeController::class, 'adminFinalReports'])->name('admin.records.final-reports');
    Route::get('admin/records/student-academic-record/{student}', [GradeController::class, 'getStudentAcademicRecord'])->name('admin.records.student-academic-record');
    Route::post('admin/records/student-academic-record/{student}/promote', [GradeController::class, 'promoteStudent'])->name('admin.records.student-academic-record.promote');

    Route::get('admin/records/transcript-of-records', function () {
        $admin = \App\Models\Admin::where('user_id', \Illuminate\Support\Facades\Auth::id())->first();

        return \Inertia\Inertia::render('admin/records/transcript-of-records/page', [
        ]);
    })->name('admin.records.transcript-of-records');

    // Super Admin routes (Principal only - Admin Management)
    Route::get('admin/user-management/admin', [App\Http\Controllers\SuperAdminController::class, 'index'])->name('superadmin.admins.index');
    Route::post('admin/user-management/admin', [App\Http\Controllers\SuperAdminController::class, 'store'])->name('superadmin.admins.store');
    Route::put('admin/user-management/admin/{admin}', [App\Http\Controllers\SuperAdminController::class, 'update'])->name('superadmin.admins.update');
    Route::delete('admin/user-management/admin/{admin}', [App\Http\Controllers\SuperAdminController::class, 'destroy'])->name('superadmin.admins.destroy');

    // Teacher Management routes
    Route::get('admin/user-management/teacher', [TeacherController::class, 'index'])->name('admin.user-management.teacher');
    Route::post('admin/user-management/teachers', [TeacherController::class, 'store'])->name('admin.user-management.teachers.store');
    Route::put('admin/user-management/teachers/{teacher}', [TeacherController::class, 'update'])->name('admin.user-management.teachers.update');
    Route::delete('admin/user-management/teachers/{teacher}', [TeacherController::class, 'destroy'])->name('admin.user-management.teachers.destroy');
    Route::post('admin/user-management/teachers/check-employee-number', [TeacherController::class, 'checkEmployeeNumber'])->name('admin.user-management.teachers.check-employee-number');

    // Student Account Management routes
    Route::get('admin/user-management/student', [StudentController::class, 'userManagement'])->name('admin.user-management.student');
    Route::put('admin/user-management/students/{student}/reset-password', [StudentController::class, 'resetPassword'])->name('admin.user-management.students.reset-password');

    // Admin Archive routes
    Route::get('admin/archive', [App\Http\Controllers\ArchiveController::class, 'index'])->name('admin.archive');
    Route::post('admin/archive/{id}/restore', [App\Http\Controllers\ArchiveController::class, 'restore'])->name('admin.archive.restore');
    Route::delete('admin/archive/{id}', [App\Http\Controllers\ArchiveController::class, 'destroy'])->name('admin.archive.destroy');

    // Admin Documents route
    Route::get('admin/documents', [DocumentController::class, 'index'])->name('admin.documents');
    Route::post('admin/documents', [DocumentController::class, 'store'])->name('admin.documents.store');
    Route::delete('admin/documents/{document}', [DocumentController::class, 'destroy'])->name('admin.documents.destroy');
    Route::get('admin/documents/{document}/download', [DocumentController::class, 'download'])->name('admin.documents.download');

    // Admin Maintenance routes
    Route::get('admin/maintenance/login-slides', [App\Http\Controllers\LoginSlideController::class, 'index'])->name('admin.maintenance.login-slides');
    Route::post('admin/maintenance/login-slides', [App\Http\Controllers\LoginSlideController::class, 'store'])->name('admin.maintenance.login-slides.store');
    Route::delete('admin/maintenance/login-slides/{slide}', [App\Http\Controllers\LoginSlideController::class, 'destroy'])->name('admin.maintenance.login-slides.destroy');
    Route::post('admin/maintenance/login-slides/order', [App\Http\Controllers\LoginSlideController::class, 'updateOrder'])->name('admin.maintenance.login-slides.order');
    Route::post('admin/maintenance/login-slides/{slide}/toggle', [App\Http\Controllers\LoginSlideController::class, 'toggleActive'])->name('admin.maintenance.login-slides.toggle');

    // Announcements routes
    Route::get('admin/maintenance/announcements', [AnnouncementController::class, 'index'])->name('admin.maintenance.announcements');
    Route::post('admin/maintenance/announcements', [AnnouncementController::class, 'store'])->name('admin.maintenance.announcements.store');
    Route::put('admin/maintenance/announcements/{announcement}', [AnnouncementController::class, 'update'])->name('admin.maintenance.announcements.update');
    Route::delete('admin/maintenance/announcements/{announcement}', [AnnouncementController::class, 'destroy'])->name('admin.maintenance.announcements.destroy');
    Route::post('admin/maintenance/announcements/{announcement}/approve', [AnnouncementController::class, 'approve'])->name('admin.maintenance.announcements.approve');
    Route::post('admin/maintenance/announcements/{announcement}/reject', [AnnouncementController::class, 'reject'])->name('admin.maintenance.announcements.reject');
    Route::post('admin/maintenance/announcements/{announcement}/toggle', [AnnouncementController::class, 'toggleActive'])->name('admin.maintenance.announcements.toggle');

    // API route for getting approved announcements
    Route::get('api/announcements/approved', [AnnouncementController::class, 'getApproved'])->name('api.announcements.approved');

    // Admin Profile route
    Route::get('admin/profile', [AdminProfileController::class, 'show'])->name('admin.profile');
    Route::put('admin/profile/password', [AdminProfileController::class, 'updatePassword'])->name('admin.profile.password.update');
    Route::post('admin/profile/picture', [AdminProfileController::class, 'uploadProfilePicture'])->name('admin.profile.picture.upload');
    Route::delete('admin/profile/picture', [AdminProfileController::class, 'deleteProfilePicture'])->name('admin.profile.picture.delete');
});

// API route for login slides
Route::get('api/login-slides', [App\Http\Controllers\LoginSlideController::class, 'getActiveSlides']);

// Notification routes
Route::middleware(['auth'])->group(function () {
    Route::get('api/notifications', [App\Http\Controllers\NotificationController::class, 'index']);
    Route::get('api/notifications/unread-count', [App\Http\Controllers\NotificationController::class, 'getUnreadCount']);
    Route::post('api/notifications/{id}/read', [App\Http\Controllers\NotificationController::class, 'markAsRead']);
    Route::post('api/notifications/mark-all-read', [App\Http\Controllers\NotificationController::class, 'markAllAsRead']);
    Route::delete('api/notifications/{id}', [App\Http\Controllers\NotificationController::class, 'destroy']);
});

// API endpoint to check if email is locked (higher rate limit for polling)
Route::post('api/check-lock-status', [App\Http\Controllers\Auth\LoginController::class, 'checkLockStatus'])
    ->middleware('throttle:60,1'); // 60 requests per minute

require __DIR__ . '/settings.php';

// API endpoint to search teachers by employee number
Route::get('/api/search-teachers', function (Request $request) {
    $employeeNumber = $request->input('employee_number', '');

    if (strlen($employeeNumber) < 3) {
        return response()->json(['teachers' => []]);
    }

    $teachers = DB::table('tbl_teachers')
        ->join('users', 'tbl_teachers.user_id', '=', 'users.id')
        ->where('tbl_teachers.employee_number', 'like', $employeeNumber . '%')
        ->whereNotExists(function ($query) {
            $query->select(DB::raw(1))
                ->from('tbl_admins')
                ->whereColumn('tbl_admins.user_id', 'tbl_teachers.user_id');
        })
        ->select('tbl_teachers.employee_number', 'tbl_teachers.name', 'tbl_teachers.position', 'users.email')
        ->limit(10)
        ->get()
        ->map(function ($teacher) {
            // Split name into first and last name
            $nameParts = explode(' ', $teacher->name, 2);
            return [
                'employee_number' => $teacher->employee_number,
                'first_name' => $nameParts[0] ?? '',
                'last_name' => $nameParts[1] ?? '',
                'position' => $teacher->position,
                'email' => $teacher->email,
            ];
        });

    return response()->json(['teachers' => $teachers]);
})->middleware('auth');

// API endpoint to check employee number and get teacher data
Route::get('/api/check-employee-number/{employeeNumber}', function ($employeeNumber) {
    $teacher = DB::table('tbl_teachers')
        ->join('users', 'tbl_teachers.user_id', '=', 'users.id')
        ->where('tbl_teachers.employee_number', $employeeNumber)
        ->select('tbl_teachers.*', 'users.email')
        ->first();

    if ($teacher) {
        // Check if this teacher is already an admin
        $isAlreadyAdmin = DB::table('tbl_admins')
            ->where('user_id', $teacher->user_id)
            ->exists();

        if ($isAlreadyAdmin) {
            return response()->json([
                'exists' => true,
                'is_teacher' => false,
                'message' => 'This teacher is already an admin.'
            ]);
        }

        // Split name into first and last name
        $nameParts = explode(' ', $teacher->name, 2);
        return response()->json([
            'exists' => true,
            'is_teacher' => true,
            'data' => [
                'employee_number' => $teacher->employee_number,
                'first_name' => $nameParts[0] ?? '',
                'last_name' => $nameParts[1] ?? '',
                'email' => $teacher->email,
                'position' => $teacher->position,
            ]
        ]);
    }

    // Check if employee number already exists in admins
    $admin = DB::table('tbl_admins')
        ->where('employee_number', $employeeNumber)
        ->first();

    if ($admin) {
        return response()->json([
            'exists' => true,
            'is_teacher' => false,
            'message' => 'This employee number is already assigned to an admin.'
        ]);
    }

    return response()->json([
        'exists' => false,
        'is_teacher' => false,
        'message' => 'Employee number is available.'
    ]);
})->middleware('auth');
