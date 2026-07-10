<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $userTypeData = null;

        if ($user) {
            switch ($user->role) {
                case 'admin':
                case 'super_admin':
                    $admin = \App\Models\Admin::select('id', 'user_id', 'role', 'position')
                        ->where('user_id', $user->id)
                        ->with(['profilePicture:id,profileable_id,profileable_type,file_path'])
                        ->first();

                    if ($admin) {
                        $userTypeData = [
                            'role' => $admin->role,
                            'position' => $admin->position,
                            'profile_picture' => $admin->profilePicture?->file_path
                                ? asset('storage/' . $admin->profilePicture->file_path)
                                : null,
                        ];
                    }
                    break;

                case 'teacher':
                    $teacher = \App\Models\Teacher::select('id', 'user_id')
                        ->where('user_id', $user->id)
                        ->with(['profilePicture:id,profileable_id,profileable_type,file_path'])
                        ->first();

                    if ($teacher) {
                        $profilePicture = $teacher->profilePicture?->file_path
                            ? asset('storage/' . $teacher->profilePicture->file_path)
                            : null;

                        // Cache school year per-request to avoid duplicate queries in controllers
                        $schoolYear = \App\Services\SchoolYearService::current();

                        $advisoryAssignment = \App\Models\AdviserSection::select('id', 'teacher_id', 'class_section_id', 'school_year')
                            ->where('teacher_id', $teacher->id)
                            ->where('school_year', $schoolYear)
                            ->with(['classSection:id,section_name,grade_level_id', 'classSection.gradeLevel:id,name'])
                            ->first();

                        $userTypeData = [
                            'profile_picture' => $profilePicture,
                            'is_adviser' => (bool) $advisoryAssignment,
                            'advisory_section' => $advisoryAssignment ? [
                                'id' => $advisoryAssignment->class_section_id,
                                'name' => $advisoryAssignment->classSection?->section_name,
                                'grade_level' => $advisoryAssignment->classSection?->gradeLevel?->name,
                                'school_year' => $advisoryAssignment->school_year,
                            ] : null,
                        ];
                    }
                    break;

                case 'student':
                    $student = \App\Models\Student::select('id', 'user_id')
                        ->where('user_id', $user->id)
                        ->with(['profilePicture:id,profileable_id,profileable_type,file_path'])
                        ->first();

                    if ($student) {
                        $userTypeData = [
                            'profile_picture' => $student->profilePicture?->file_path
                                ? asset('storage/' . $student->profilePicture->file_path)
                                : null,
                        ];
                    }
                    break;
            }
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user,
                'admin' => $user && in_array($user->role, ['admin', 'super_admin']) ? $userTypeData : null,
                'teacher' => $user && $user->role === 'teacher' ? $userTypeData : null,
                'student' => $user && $user->role === 'student' ? $userTypeData : null,
            ],
            'sidebarOpen' => !$request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
                'imported_students' => session('imported_students'),
                'duplicate_students' => session('duplicate_students'),
                'imported_count' => session('imported_count'),
                'duplicate_count' => session('duplicate_count'),
                'error_count' => session('error_count'),
                'import_row_errors' => session('import_row_errors'), // renamed
            ],
        ];
    }
}
