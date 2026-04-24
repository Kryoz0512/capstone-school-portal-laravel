<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use App\Models\ProfilePicture;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class AdminProfileController extends Controller
{
    public function show()
    {
        $user = Auth::user();
        
        // Fetch admin data with user relationship
        $admin = Admin::where('user_id', $user->id)->with('profilePicture')->first();
        
        if (!$admin) {
            return redirect()->route('admin.dashboard')->withErrors(['error' => 'Admin profile not found.']);
        }

        $profilePictureUrl = $admin->profilePicture && $admin->profilePicture->file_path 
            ? asset('storage/' . $admin->profilePicture->file_path) 
            : null;

        $profileData = [
            'id' => $admin->id,
            'first_name' => $admin->first_name,
            'last_name' => $admin->last_name,
            'full_name' => $admin->first_name . ' ' . $admin->last_name,
            'email' => $user->email,
            'position' => $admin->position,
            'role' => $admin->role,
            'initials' => strtoupper(substr($admin->first_name, 0, 1) . substr($admin->last_name, 0, 1)),
            'profile_picture' => $profilePictureUrl,
        ];

        return Inertia::render('admin/profile/page', [
            'profile' => $profileData,
        ]);
    }

    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with('success', 'Password updated successfully.');
    }

    public function uploadProfilePicture(Request $request)
    {
        $request->validate([
            'profile_picture' => ['required', 'image', 'mimes:jpeg,jpg,png', 'max:2048'], // 2MB max
        ]);

        $user = Auth::user();
        $admin = Admin::where('user_id', $user->id)->first();

        if (!$admin) {
            return back()->withErrors(['error' => 'Admin profile not found.']);
        }

        // Get existing profile picture
        $existingPicture = $admin->profilePicture;

        // Delete old file if exists
        if ($existingPicture && Storage::disk('public')->exists($existingPicture->file_path)) {
            Storage::disk('public')->delete($existingPicture->file_path);
        }

        // Store new profile picture
        $file = $request->file('profile_picture');
        $fileName = time() . '_' . $file->getClientOriginalName();
        $filePath = $file->storeAs('profile-pictures', $fileName, 'public');

        // Update or create profile picture record
        if ($existingPicture) {
            // Update existing record
            $existingPicture->update([
                'file_path' => $filePath,
                'file_name' => $fileName,
                'mime_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
            ]);
        } else {
            // Create new record - Laravel will automatically set profileable_type
            $admin->profilePicture()->create([
                'file_path' => $filePath,
                'file_name' => $fileName,
                'mime_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
            ]);
        }

        return back()->with('success', 'Profile picture updated successfully.');
    }

    public function deleteProfilePicture()
    {
        $user = Auth::user();
        $admin = Admin::where('user_id', $user->id)->first();

        if (!$admin) {
            return back()->withErrors(['error' => 'Admin profile not found.']);
        }

        $profilePicture = $admin->profilePicture;
        
        if ($profilePicture) {
            Storage::disk('public')->delete($profilePicture->file_path);
            $profilePicture->delete();
        }

        return back()->with('success', 'Profile picture deleted successfully.');
    }
}
