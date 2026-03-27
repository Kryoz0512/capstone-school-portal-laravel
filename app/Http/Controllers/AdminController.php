<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function dashboard()
    {
        return Inertia::render('admin/dashboard/page', [
            'auth' => [
                'user' => Auth::user()
            ]
        ]);
    }

    public function index()
    {
        $admins = Admin::with(['user', 'updatedBy'])
            ->get()
            ->map(function ($admin) {
                return [
                    'id' => $admin->id,
                    'user_id' => $admin->user_id,
                    'first_name' => $admin->first_name,
                    'last_name' => $admin->last_name,
                    'name' => $admin->first_name . ' ' . $admin->last_name,
                    'email' => $admin->user->email,
                    'position' => $admin->position,
                    'role' => $admin->role,
                    'updated_by' => $admin->updatedBy ? $admin->updatedBy->name : null,
                    'updated_at' => $admin->updated_at ? $admin->updated_at->timezone('Asia/Manila')->format('M d, Y h:i A') : null,
                ];
            });

        return Inertia::render('admin/user-management/admin/page', [
            'admins' => $admins,
            'auth' => [
                'user' => Auth::user()
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255', 'regex:/^[a-zA-Z\s]+$/'],
            'last_name' => ['required', 'string', 'max:255', 'regex:/^[a-zA-Z\s]+$/'],
            'position' => ['required', 'string', 'max:255'],
            'password' => ['required', 'string', 'min:8'],
        ]);

        // Generate email in format: SNHS-LASTNAME-FIRSTNAME
        $firstName = strtoupper(str_replace(' ', '', $validated['first_name']));
        $lastName = strtoupper(str_replace(' ', '', $validated['last_name']));
        $email = 'SNHS-' . $lastName . '-' . $firstName;

        if (User::where('email', $email)->exists()) {
            return back()->withErrors(['email' => 'An admin with this name already exists.']);
        }

        DB::beginTransaction();
        try {
            $user = User::create([
                'name' => $validated['first_name'] . ' ' . $validated['last_name'],
                'email' => $email,
                'password' => Hash::make($validated['password']),
                'role' => 'admin',
            ]);

            Admin::create([
                'user_id' => $user->id,
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'role' => 'Admin',
                'position' => $validated['position'],
                'updated_by' => Auth::id(),
            ]);

            // Log activity
            ActivityLog::create([
                'user_id' => Auth::id(),
                'action' => 'created',
                'description' => 'Created admin: ' . $validated['first_name'] . ' ' . $validated['last_name'],
            ]);

            DB::commit();

            return redirect()->route('admin.user-management.admin')->with('success', 'Admin created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to create admin. Please try again.']);
        }
    }

    public function update(Request $request, Admin $admin)
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255', 'regex:/^[a-zA-Z\s]+$/'],
            'last_name' => ['required', 'string', 'max:255', 'regex:/^[a-zA-Z\s]+$/'],
            'position' => ['required', 'string', 'max:255'],
            'password' => ['nullable', 'string', 'min:8'],
        ]);

        // Generate email in format: SNHS-LASTNAME-FIRSTNAME
        $firstName = strtoupper(str_replace(' ', '', $validated['first_name']));
        $lastName = strtoupper(str_replace(' ', '', $validated['last_name']));
        $email = 'SNHS-' . $lastName . '-' . $firstName;

        if (User::where('email', $email)->where('id', '!=', $admin->user_id)->exists()) {
            return back()->withErrors(['email' => 'An admin with this name already exists.']);
        }

        DB::beginTransaction();
        try {
            $userData = [
                'name' => $validated['first_name'] . ' ' . $validated['last_name'],
                'email' => $email,
            ];

            // Only update password if provided
            if (!empty($validated['password'])) {
                $userData['password'] = Hash::make($validated['password']);
            }

            $admin->user->update($userData);

            $admin->update([
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'position' => $validated['position'],
                'updated_by' => Auth::id(),
            ]);

            // Log activity
            ActivityLog::create([
                'user_id' => Auth::id(),
                'action' => 'updated',
                'description' => 'Updated admin: ' . $validated['first_name'] . ' ' . $validated['last_name'],
            ]);

            DB::commit();

            return redirect()->route('admin.user-management.admin')->with('success', 'Admin updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to update admin. Please try again.']);
        }
    }

    public function destroy(Admin $admin)
    {
        DB::beginTransaction();
        try {
            $admin->user->delete();

            DB::commit();

            return redirect()->route('admin.user-management.admin')->with('success', 'Admin deleted and archived successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to delete admin. Please try again.']);
        }
    }


}
