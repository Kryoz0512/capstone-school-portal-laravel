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
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

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

Route::get('/login/staff', function () {
    $slides = \App\Models\LoginSlide::where('is_active', true)
        ->orderBy('order')
        ->get()
        ->map(function ($slide) {
            return \Illuminate\Support\Facades\Storage::url($slide->image_path);
        })
        ->toArray();
    
    return \Inertia\Inertia::render('auth/login', [
        'slides' => $slides,
        'role' => 'staff'
    ]);
})->name('login.staff');

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

    // Teacher routes
    Route::get('teacher/dashboard', [TeacherController::class, 'dashboard'])->name('teacher.dashboard');
    
    Route::get('teacher/grade-sheets', [App\Http\Controllers\GradeController::class, 'index'])->name('teacher.grade-sheets');
    Route::post('teacher/grade-sheets', [App\Http\Controllers\GradeController::class, 'store'])->name('teacher.grade-sheets.store');
    Route::put('teacher/grade-sheets/{gradeSheet}', [App\Http\Controllers\GradeController::class, 'update'])->name('teacher.grade-sheets.update');
    
    Route::get('teacher/class-list', [TeacherController::class, 'classList'])->name('teacher.class-list');
    
    Route::get('teacher/final-report', [TeacherController::class, 'finalReport'])->name('teacher.final-report');
    
    Route::get('teacher/transcript-of-records', function () {
        return \Inertia\Inertia::render('teacher/transcript-of-records/page');
    })->name('teacher.transcript-of-records');
    
    Route::get('teacher/schedule', [TeacherController::class, 'schedule'])->name('teacher.schedule');
    
    Route::get('teacher/documents', function () {
        return \Inertia\Inertia::render('teacher/documents/page');
    })->name('teacher.documents');
    
    Route::get('teacher/profile', [TeacherController::class, 'profile'])->name('teacher.profile');
    
    Route::get('teacher/profile-settings', [TeacherController::class, 'profileSettings'])->name('teacher.profile-settings');
    Route::put('teacher/profile-settings', [TeacherController::class, 'updateProfile'])->name('teacher.profile-settings.update');
    Route::put('teacher/profile-settings/password', [TeacherController::class, 'updatePassword'])->name('teacher.profile-settings.password');

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
        return \Inertia\Inertia::render('admin/admission/registration/page', [
            'gradeLevels' => $gradeLevels
        ]);
    })->name('admin.admission.registration');
    
    Route::post('admin/admission/registration', [App\Http\Controllers\StudentController::class, 'store'])->name('admin.admission.registration.store');
    Route::get('admin/admission/registration/export', [App\Http\Controllers\StudentController::class, 'export'])->name('admin.admission.registration.export');
    Route::post('admin/admission/registration/import', [App\Http\Controllers\StudentController::class, 'import'])->name('admin.admission.registration.import');
    Route::get('admin/admission/registration/template', [App\Http\Controllers\StudentController::class, 'downloadTemplate'])->name('admin.admission.registration.template');
    Route::get('admin/admission/registration/search-returning', [App\Http\Controllers\StudentController::class, 'searchReturningStudents'])->name('admin.admission.registration.search-returning');
    
    // Registrar routes
    Route::get('admin/registrar/student-checklist', [App\Http\Controllers\StudentController::class, 'checklist'])->name('admin.registrar.student-checklist');
    
    Route::get('admin/admission/accreditation', [AccreditationController::class, 'index'])->name('admin.admission.accreditation');
    Route::post('admin/admission/accreditations', [AccreditationController::class, 'store'])->name('admin.admission.accreditations.store');
    Route::put('admin/admission/accreditations/{accreditation}', [AccreditationController::class, 'update'])->name('admin.admission.accreditations.update');
    Route::delete('admin/admission/accreditations/{accreditation}', [AccreditationController::class, 'destroy'])->name('admin.admission.accreditations.destroy');
    
    Route::get('admin/admission/upload-delete-picture', [ProfilePictureController::class, 'index'])->name('admin.admission.upload-delete-picture');
    Route::post('admin/admission/profile-picture/verify', [ProfilePictureController::class, 'verify'])->name('admin.admission.profile-picture.verify');
    Route::post('admin/admission/profile-picture/upload', [ProfilePictureController::class, 'upload'])->name('admin.admission.profile-picture.upload');
    Route::delete('admin/admission/profile-picture/delete', [ProfilePictureController::class, 'delete'])->name('admin.admission.profile-picture.delete');
    
    Route::get('admin/admission/view-edit-student', [StudentController::class, 'viewEdit'])->name('admin.admission.view-edit-student');
    
    Route::get('admin/admission/view-edit-student/{id}/edit', [StudentController::class, 'edit'])->name('admin.admission.view-edit-student.edit');
    Route::put('admin/admission/view-edit-student/{id}', [StudentController::class, 'updateProfile'])->name('admin.admission.view-edit-student.update');
    
    // Admin Registrar routes
    Route::get('admin/registrar/subject-listings', [SubjectController::class, 'index'])->name('admin.registrar.subject-listings');
    Route::post('admin/registrar/subjects', [SubjectController::class, 'store'])->name('admin.registrar.subjects.store');
    Route::put('admin/registrar/subjects/{subject}', [SubjectController::class, 'update'])->name('admin.registrar.subjects.update');
    Route::delete('admin/registrar/subjects/{subject}', [SubjectController::class, 'destroy'])->name('admin.registrar.subjects.destroy');
    
    // Admin Records routes
    Route::get('admin/records/final-reports', [GradeController::class, 'adminFinalReports'])->name('admin.records.final-reports');
    
    Route::get('admin/records/transcript-of-records', function () {
        return \Inertia\Inertia::render('admin/records/transcript-of-records/page');
    })->name('admin.records.transcript-of-records');
    
    // Admin User Management routes
    Route::get('admin/user-management/admin', [AdminController::class, 'index'])->name('admin.user-management.admin');
    Route::post('admin/user-management/admin', [AdminController::class, 'store'])->name('admin.store');
    Route::put('admin/user-management/admin/{admin}', [AdminController::class, 'update'])->name('admin.update');
    Route::delete('admin/user-management/admin/{admin}', [AdminController::class, 'destroy'])->name('admin.destroy');
    
    Route::get('admin/user-management/teacher', [TeacherController::class, 'index'])->name('admin.user-management.teacher');
    Route::post('admin/user-management/teachers', [TeacherController::class, 'store'])->name('admin.user-management.teachers.store');
    Route::put('admin/user-management/teachers/{teacher}', [TeacherController::class, 'update'])->name('admin.user-management.teachers.update');
    Route::delete('admin/user-management/teachers/{teacher}', [TeacherController::class, 'destroy'])->name('admin.user-management.teachers.destroy');
    Route::post('admin/user-management/teachers/check-employee-number', [TeacherController::class, 'checkEmployeeNumber'])->name('admin.user-management.teachers.check-employee-number');
    
    // Admin Archive routes
    Route::get('admin/archive', [App\Http\Controllers\ArchiveController::class, 'index'])->name('admin.archive');
    Route::post('admin/archive/{id}/restore', [App\Http\Controllers\ArchiveController::class, 'restore'])->name('admin.archive.restore');
    Route::delete('admin/archive/{id}', [App\Http\Controllers\ArchiveController::class, 'destroy'])->name('admin.archive.destroy');
    
    // Admin Documents route
    Route::get('admin/documents', function () {
        return \Inertia\Inertia::render('admin/documents/page');
    })->name('admin.documents');
    
    // Admin Maintenance routes
    Route::get('admin/maintenance/login-slides', [App\Http\Controllers\LoginSlideController::class, 'index'])->name('admin.maintenance.login-slides');
    Route::post('admin/maintenance/login-slides', [App\Http\Controllers\LoginSlideController::class, 'store'])->name('admin.maintenance.login-slides.store');
    Route::delete('admin/maintenance/login-slides/{slide}', [App\Http\Controllers\LoginSlideController::class, 'destroy'])->name('admin.maintenance.login-slides.destroy');
    Route::post('admin/maintenance/login-slides/order', [App\Http\Controllers\LoginSlideController::class, 'updateOrder'])->name('admin.maintenance.login-slides.order');
    Route::post('admin/maintenance/login-slides/{slide}/toggle', [App\Http\Controllers\LoginSlideController::class, 'toggleActive'])->name('admin.maintenance.login-slides.toggle');
    
    // Admin Profile route
    Route::get('admin/profile', [AdminProfileController::class, 'show'])->name('admin.profile');
    Route::put('admin/profile/password', [AdminProfileController::class, 'updatePassword'])->name('admin.profile.password.update');
});

// Public API for login slides
Route::get('api/login-slides', [App\Http\Controllers\LoginSlideController::class, 'getActiveSlides']);

require __DIR__.'/settings.php';
