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
        $profilePicture = null;
        $userTypeData = null;

        if ($user) {
            // Get profile picture based on user role
            switch ($user->role) {
                case 'admin':
                case 'super_admin':
                    $admin = \App\Models\Admin::where('user_id', $user->id)->with('profilePicture')->first();
                    if ($admin) {
                        $profilePicture = $admin->profilePicture?->file_path
                            ? asset('storage/' . $admin->profilePicture->file_path)
                            : null;

                        $userTypeData = [
                            'role' => $admin->role,
                            'position' => $admin->position,
                            'profile_picture' => $profilePicture,
                        ];
                    }
                    break;

                case 'teacher':
                    $teacher = \App\Models\Teacher::where('user_id', $user->id)->with('profilePicture')->first();
                    if ($teacher) {
                        $profilePicture = $teacher->profilePicture?->file_path
                            ? asset('storage/' . $teacher->profilePicture->file_path)
                            : null;
                        $userTypeData = [
                            'profile_picture' => $profilePicture,
                        ];
                    }
                    break;

                case 'student':
                    $student = \App\Models\Student::where('user_id', $user->id)->with('profilePicture')->first();
                    if ($student) {
                        $profilePicture = $student->profilePicture?->file_path
                            ? asset('storage/' . $student->profilePicture->file_path)
                            : null;
                        $userTypeData = [
                            'profile_picture' => $profilePicture,
                        ];
                    }
                    break;
            }
        }

        $sharedData = [
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

        return $sharedData;
    }
}
