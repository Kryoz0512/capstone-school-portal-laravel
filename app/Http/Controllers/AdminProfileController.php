<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class AdminProfileController extends Controller
{
    public function show()
    {
        $user = Auth::user();
        
        // Fetch admin data with user relationship
        $admin = Admin::where('user_id', $user->id)->first();
        
        if (!$admin) {
            return redirect()->route('admin.dashboard')->withErrors(['error' => 'Admin profile not found.']);
        }

        $profileData = [
            'id' => $admin->id,
            'first_name' => $admin->first_name,
            'last_name' => $admin->last_name,
            'full_name' => $admin->first_name . ' ' . $admin->last_name,
            'email' => $user->email,
            'position' => $admin->position,
            'role' => $admin->role,
            'initials' => strtoupper(substr($admin->first_name, 0, 1) . substr($admin->last_name, 0, 1)),
        ];

        return Inertia::render('admin/profile/page', [
            'profile' => $profileData,
            'auth' => [
                'user' => $user,
                'admin' => $admin,
            ],
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
}
