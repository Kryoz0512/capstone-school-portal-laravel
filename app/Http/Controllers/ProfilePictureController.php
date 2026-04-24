<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\Teacher;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProfilePictureController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/admission/upload-delete-picture/page', [
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
                    $user = Student::with(['gradeLevel', 'section', 'profilePicture'])->where('lrn', $identifier)->first();
                    if (!$user) {
                        return response()->json([
                            'success' => false,
                            'message' => "No student found with LRN: {$identifier}"
                        ], 404);
                    }
                    $profilePictureUrl = $user->profilePicture?->file_path ? asset('storage/' . $user->profilePicture->file_path) : null;
                    $userData = [
                        'id' => $user->id,
                        'name' => trim($user->first_name . ' ' . $user->last_name),
                        'identifier' => $user->lrn,
                        'type' => 'student',
                        'profile_picture' => $profilePictureUrl,
                        'grade_level' => $user->gradeLevel ? $user->gradeLevel->name : null,
                        'section' => $user->section ? $user->section->section_name : null,
                    ];
                    break;

                case 'teacher':
                    $user = Teacher::with('profilePicture')->where('employee_number', $identifier)->first();
                    if (!$user) {
                        return response()->json([
                            'success' => false,
                            'message' => "No teacher found with Employee Number: {$identifier}"
                        ], 404);
                    }
                    $profilePictureUrl = $user->profilePicture?->file_path ? asset('storage/' . $user->profilePicture->file_path) : null;
                    $userData = [
                        'id' => $user->id,
                        'name' => $user->name,
                        'identifier' => $user->employee_number,
                        'type' => 'teacher',
                        'profile_picture' => $profilePictureUrl,
                    ];
                    break;

                case 'staff_admin':
                    $user = Admin::with('profilePicture')->where('employee_number', $identifier)->first();
                    if (!$user) {
                        return response()->json([
                            'success' => false,
                            'message' => "No staff/admin found with Employee Number: {$identifier}"
                        ], 404);
                    }
                    $profilePictureUrl = $user->profilePicture?->file_path ? asset('storage/' . $user->profilePicture->file_path) : null;
                    $userData = [
                        'id' => $user->id,
                        'name' => trim(($user->first_name ?? '') . ' ' . ($user->last_name ?? '')),
                        'identifier' => $user->employee_number,
                        'type' => 'staff_admin',
                        'profile_picture' => $profilePictureUrl,
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
        $validated = $request->validate([
            'user_id' => 'required|integer',
            'user_type' => 'required|in:student,teacher,staff_admin',
            'picture' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        try {
            $userId = $validated['user_id'];
            $userType = $validated['user_type'];
            $picture = $request->file('picture');

            // Get the user model
            $user = null;
            switch ($userType) {
                case 'student':
                    $user = Student::findOrFail($userId);
                    break;
                case 'teacher':
                    $user = Teacher::findOrFail($userId);
                    break;
                case 'staff_admin':
                    $user = Admin::findOrFail($userId);
                    break;
            }

            // Get existing profile picture
            $existingPicture = $user->profilePicture;

            // Delete old file if exists
            if ($existingPicture && Storage::disk('public')->exists($existingPicture->file_path)) {
                Storage::disk('public')->delete($existingPicture->file_path);
            }

            // Store new profile picture
            $fileName = time() . '_' . $picture->getClientOriginalName();
            $filePath = $picture->storeAs('profile-pictures', $fileName, 'public');

            // Update or create profile picture record
            if ($existingPicture) {
                // Update existing record
                $existingPicture->update([
                    'file_path' => $filePath,
                    'file_name' => $fileName,
                    'mime_type' => $picture->getMimeType(),
                    'file_size' => $picture->getSize(),
                ]);
            } else {
                // Create new record - Laravel will automatically set profileable_type
                $user->profilePicture()->create([
                    'file_path' => $filePath,
                    'file_name' => $fileName,
                    'mime_type' => $picture->getMimeType(),
                    'file_size' => $picture->getSize(),
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Profile picture uploaded successfully',
                'profile_picture' => asset('storage/' . $filePath)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while uploading the picture: ' . $e->getMessage()
            ], 500);
        }
    }

    public function delete(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|integer',
            'user_type' => 'required|in:student,teacher,staff_admin',
        ]);

        try {
            $userId = $validated['user_id'];
            $userType = $validated['user_type'];

            // Get the user model
            $user = null;
            switch ($userType) {
                case 'student':
                    $user = Student::findOrFail($userId);
                    break;
                case 'teacher':
                    $user = Teacher::findOrFail($userId);
                    break;
                case 'staff_admin':
                    $user = Admin::findOrFail($userId);
                    break;
            }

            // Delete profile picture
            $profilePicture = $user->profilePicture;
            
            if ($profilePicture) {
                Storage::disk('public')->delete($profilePicture->file_path);
                $profilePicture->delete();
            }

            return response()->json([
                'success' => true,
                'message' => 'Profile picture deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while deleting the picture: ' . $e->getMessage()
            ], 500);
        }
    }
}
