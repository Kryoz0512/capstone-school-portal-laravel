<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\RoomController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // Student routes
    Route::get('student/dashboard', [StudentController::class, 'dashboard'])->name('student.dashboard');
    
    Route::get('student/clearance', function () {
        return \Inertia\Inertia::render('student/clearance/page');
    })->name('student.clearance');
    
    Route::get('student/enrolled-subjects', function () {
        return \Inertia\Inertia::render('student/enrolled-subjects/page');
    })->name('student.enrolled-subjects');
    
    Route::get('student/schedule', function () {
        return \Inertia\Inertia::render('student/schedule/page');
    })->name('student.schedule');
    
    Route::get('student/report-card', function () {
        return \Inertia\Inertia::render('student/report-card/page');
    })->name('student.report-card');
    
    Route::get('student/profile-settings', function () {
        return \Inertia\Inertia::render('student/profile-settings/page');
    })->name('student.profile-settings');

    // Teacher routes
    Route::get('teacher/dashboard', [TeacherController::class, 'dashboard'])->name('teacher.dashboard');
    
    Route::get('teacher/grade-sheets', function () {
        return \Inertia\Inertia::render('teacher/grade-sheets/page');
    })->name('teacher.grade-sheets');
    
    Route::get('teacher/class-list', function () {
        return \Inertia\Inertia::render('teacher/class-list/page');
    })->name('teacher.class-list');
    
    Route::get('teacher/final-report', function () {
        return \Inertia\Inertia::render('teacher/final-report/page');
    })->name('teacher.final-report');
    
    Route::get('teacher/transcript-of-records', function () {
        return \Inertia\Inertia::render('teacher/transcript-of-records/page');
    })->name('teacher.transcript-of-records');
    
    Route::get('teacher/schedule', function () {
        return \Inertia\Inertia::render('teacher/schedule/page');
    })->name('teacher.schedule');
    
    Route::get('teacher/documents', function () {
        return \Inertia\Inertia::render('teacher/documents/page');
    })->name('teacher.documents');
    
    Route::get('teacher/profile', function () {
        return \Inertia\Inertia::render('teacher/profile/page');
    })->name('teacher.profile');
    
    Route::get('teacher/profile-settings', function () {
        return \Inertia\Inertia::render('teacher/profile-settings/page');
    })->name('teacher.profile-settings');

    // Admin routes
    Route::get('admin/dashboard', [AdminController::class, 'dashboard'])->name('admin.dashboard');
    
    // Admin Enrollment routes
    Route::get('admin/enrollment/room-listings', [RoomController::class, 'index'])->name('admin.enrollment.room-listings');
    Route::post('admin/enrollment/rooms', [RoomController::class, 'store'])->name('admin.enrollment.rooms.store');
    Route::put('admin/enrollment/rooms/{id}', [RoomController::class, 'update'])->name('admin.enrollment.rooms.update');
    Route::delete('admin/enrollment/rooms/{id}', [RoomController::class, 'destroy'])->name('admin.enrollment.rooms.destroy');
    
    Route::get('admin/enrollment/room-schedule', function () {
        return \Inertia\Inertia::render('admin/enrollment/room-schedule/page');
    })->name('admin.enrollment.room-schedule');
    
    Route::get('admin/enrollment/class-sections', function () {
        return \Inertia\Inertia::render('admin/enrollment/class-sections/page');
    })->name('admin.enrollment.class-sections');
    
    Route::get('admin/enrollment/faculty-subjects', function () {
        return \Inertia\Inertia::render('admin/enrollment/faculty-subjects/page');
    })->name('admin.enrollment.faculty-subjects');
    
    Route::get('admin/enrollment/load-scheduling', function () {
        return \Inertia\Inertia::render('admin/enrollment/load-scheduling/page');
    })->name('admin.enrollment.load-scheduling');
    
    Route::get('admin/enrollment/adviser-management', function () {
        return \Inertia\Inertia::render('admin/enrollment/adviser-management/page');
    })->name('admin.enrollment.adviser-management');
    
    Route::get('admin/enrollment/student-not-enrolled', function () {
        return \Inertia\Inertia::render('admin/enrollment/student-not-enrolled/page');
    })->name('admin.enrollment.student-not-enrolled');
    
    Route::get('admin/enrollment/enrollment-list', function () {
        return \Inertia\Inertia::render('admin/enrollment/enrollment-list/page');
    })->name('admin.enrollment.enrollment-list');
    
    Route::get('admin/enrollment/student-schedule', function () {
        return \Inertia\Inertia::render('admin/enrollment/student-schedule/page');
    })->name('admin.enrollment.student-schedule');
    
    // Admin Admission routes
    Route::get('admin/admission/registration', function () {
        return \Inertia\Inertia::render('admin/admission/registration/page');
    })->name('admin.admission.registration');
    
    Route::get('admin/admission/accreditation', function () {
        return \Inertia\Inertia::render('admin/admission/accreditation/page');
    })->name('admin.admission.accreditation');
    
    Route::get('admin/admission/upload-delete-picture', function () {
        return \Inertia\Inertia::render('admin/admission/upload-delete-picture/page');
    })->name('admin.admission.upload-delete-picture');
    
    Route::get('admin/admission/view-edit-student', function () {
        return \Inertia\Inertia::render('admin/admission/view-edit-student/page');
    })->name('admin.admission.view-edit-student');
    
    // Admin Registrar routes
    Route::get('admin/registrar/subject-listings', function () {
        return \Inertia\Inertia::render('admin/registrar/subject-listings/page');
    })->name('admin.registrar.subject-listings');
    
    // Admin Records routes
    Route::get('admin/records/final-reports', function () {
        return \Inertia\Inertia::render('admin/records/final-reports/page');
    })->name('admin.records.final-reports');
    
    Route::get('admin/records/transcript-of-records', function () {
        return \Inertia\Inertia::render('admin/records/transcript-of-records/page');
    })->name('admin.records.transcript-of-records');
    
    // Admin User Management routes
    Route::get('admin/user-management/admin', function () {
        return \Inertia\Inertia::render('admin/user-management/admin/page');
    })->name('admin.user-management.admin');
    
    Route::get('admin/user-management/teacher', function () {
        return \Inertia\Inertia::render('admin/user-management/teacher/page');
    })->name('admin.user-management.teacher');
    
    // Admin Documents route
    Route::get('admin/documents', function () {
        return \Inertia\Inertia::render('admin/documents/page');
    })->name('admin.documents');
    
    // Admin Profile route
    Route::get('admin/profile', function () {
        return \Inertia\Inertia::render('admin/profile/page');
    })->name('admin.profile');
});

require __DIR__.'/settings.php';
