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
        $students = Student::with(['gradeLevel', 'section', 'profilePicture'])
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get()
            ->map(fn ($student) => [
                'id' => $student->id,
                'name' => trim($student->first_name . ' ' . $student->last_name),
                'identifier' => $student->lrn,
                'type' => 'student',
                'profile_picture' => $student->profilePicture?->file_path
                    ? asset('storage/' . $student->profilePicture->file_path)
                    : null,
                'grade_level' => $student->gradeLevel?->name,
                'section' => $student->section?->section_name,
            ]);

        $teachers = Teacher::with('profilePicture')
            ->orderBy('name')
            ->get()
            ->map(fn ($teacher) => [
                'id' => $teacher->id,
                'name' => $teacher->name,
                'identifier' => $teacher->employee_number,
                'type' => 'teacher',
                'profile_picture' => $teacher->profilePicture?->file_path
                    ? asset('storage/' . $teacher->profilePicture->file_path)
                    : null,
            ]);

        $staffAdmins = Admin::with('profilePicture')
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get()
            ->map(fn ($admin) => [
                'id' => $admin->id,
                'name' => trim(($admin->first_name ?? '') . ' ' . ($admin->last_name ?? '')),
                'identifier' => $admin->employee_number,
                'type' => 'staff_admin',
                'profile_picture' => $admin->profilePicture?->file_path
                    ? asset('storage/' . $admin->profilePicture->file_path)
                    : null,
            ]);

        return Inertia::render('admin/admission/upload-delete-picture/page', [
            'students' => $students,
            'teachers' => $teachers,
            'staffAdmins' => $staffAdmins,
        ]);
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