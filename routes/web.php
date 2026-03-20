<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\TeacherController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // Student routes
    Route::get('student/dashboard', [StudentController::class, 'dashboard'])->name('student.dashboard');

    // Teacher routes
    Route::get('teacher/dashboard', [TeacherController::class, 'dashboard'])->name('teacher.dashboard');

    // Admin routes
    Route::get('admin/dashboard', [AdminController::class, 'dashboard'])->name('admin.dashboard');
});

require __DIR__.'/settings.php';
