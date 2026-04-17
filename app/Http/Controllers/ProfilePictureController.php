<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\Teacher;
use App\Models\Admin;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProfilePictureController extends Controller
{
    public function index()
    {
        $admin = \App\Models\Admin::where('user_id', \Illuminate\Support\Facades\Auth::id())->first();

        return Inertia::render('admin/admission/upload-delete-picture/page', [
            'auth' => [
                'user' => \Illuminate\Support\Facades\Auth::user(),
                'admin' => $admin,
            ],
        ]);
    }

    public function verify(Request $request)
    {
        $validated = $request->validate([
            'user_type' => 'required|in:student,teacher,staff_admin',
            'identifier' => 'required|string',
        ]);

        $userType = $validated['user_type'];
        $identifier = $validated['identifier'];
        $user = null;
        $userData = null;

        try {
            switch ($userType) {
                case 'student':
                    $user = Student::where('lrn', $identifier)->first();
                    if (!$user) {
                        return response()->json([
                            'success' => false,
                            'message' => "No student found with LRN: {$identifier}"
                        ], 404);
                    }
                    $userData = [
                        'id' => $user->id,
                        'name' => trim($user->first_name . ' ' . $user->last_name),
                        'identifier' => $user->lrn,
                        'type' => 'student',
                        'profile_picture' => $user->profile_picture ?? null,
                    ];
                    break;

                case 'teacher':
                    $user = Teacher::where('employee_no', $identifier)->first();
                    if (!$user) {
                        return response()->json([
                            'success' => false,
                            'message' => "No teacher found with Employee Number: {$identifier}"
                        ], 404);
                    }
                    $userData = [
                        'id' => $user->id,
                        'name' => $user->name,
                        'identifier' => $user->employee_no,
                        'type' => 'teacher',
                        'profile_picture' => $user->profile_picture ?? null,
                    ];
                    break;

                case 'staff_admin':
                    $user = Admin::where('employee_no', $identifier)->first();
                    if (!$user) {
                        return response()->json([
                            'success' => false,
                            'message' => "No staff/admin found with Employee Number: {$identifier}"
                        ], 404);
                    }
                    $userData = [
                        'id' => $user->id,
                        'name' => $user->name,
                        'identifier' => $user->employee_no,
                        'type' => 'staff_admin',
                        'profile_picture' => $user->profile_picture ?? null,
                    ];
                    break;
            }

            return response()->json([
                'success' => true,
                'message' => 'User found successfully',
                'user' => $userData
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while verifying the user'
            ], 500);
        }
    }

    public function upload(Request $request)
    {
        // TODO: Implement upload logic
        return response()->json([
            'success' => true,
            'message' => 'Picture uploaded successfully'
        ]);
    }

    public function delete(Request $request)
    {
        // TODO: Implement delete logic
        return response()->json([
            'success' => true,
            'message' => 'Picture deleted successfully'
        ]);
    }
}
