<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use App\Models\User;
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
        $admins = Admin::with('user')
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

        // Generate email in format: SNHS-lastname.firstname@snhs.edu.ph
        $firstName = strtolower(str_replace(' ', '', $validated['first_name']));
        $lastName = strtolower(str_replace(' ', '', $validated['last_name']));
        $email = 'snhs-' . $lastName . '.' . $firstName . '@snhs.edu.ph';

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
        ]);

        // Generate email in format: SNHS-lastname.firstname@snhs.edu.ph
        $firstName = strtolower(str_replace(' ', '', $validated['first_name']));
        $lastName = strtolower(str_replace(' ', '', $validated['last_name']));
        $email = 'snhs-' . $lastName . '.' . $firstName . '@snhs.edu.ph';

        if (User::where('email', $email)->where('id', '!=', $admin->user_id)->exists()) {
            return back()->withErrors(['email' => 'An admin with this name already exists.']);
        }

        DB::beginTransaction();
        try {
            $admin->user->update([
                'name' => $validated['first_name'] . ' ' . $validated['last_name'],
                'email' => $email,
            ]);

            $admin->update([
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'position' => $validated['position'],
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
