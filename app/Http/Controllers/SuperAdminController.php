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

class SuperAdminController extends Controller
{
    /**
     * Display a listing of admins.
     * Only accessible by super admins.
     */
    public function index()
    {
        // Get the admin record for the current user
        $currentAdmin = Admin::where('user_id', Auth::id())->first();
        
        // Only super admins can access admin management
        if (!$currentAdmin || $currentAdmin->role !== 'Super Admin') {
            abort(403, 'Unauthorized. Only super admins can manage admin accounts.');
        }

        $admins = Admin::with(['user', 'updatedBy'])
            ->get()
            ->map(function ($admin) {
                return [
                    'id' => $admin->id,
                    'user_id' => $admin->user_id,
                    'employee_number' => $admin->employee_number,
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
                'user' => Auth::user(),
                'admin' => [
                    'role' => $currentAdmin->role,
                    'position' => $currentAdmin->position,
                ],
            ]
        ]);
    }

    /**
     * Store a newly created admin.
     * Only accessible by super admins.
     */
    public function store(Request $request)
    {
        // Get the admin record for the current user
        $currentAdmin = Admin::where('user_id', Auth::id())->first();
        
        // Only super admins can create admins
        if (!$currentAdmin || $currentAdmin->role !== 'Super Admin') {
            abort(403, 'Unauthorized. Only super admins can create admin accounts.');
        }

        $validated = $request->validate([
            'employee_number' => ['required', 'string', 'size:7', 'regex:/^[0-9]{7}$/', 'unique:tbl_admins,employee_number'],
            'first_name' => ['required', 'string', 'max:255', 'regex:/^[a-zA-Z\s]+$/'],
            'last_name' => ['required', 'string', 'max:255', 'regex:/^[a-zA-Z\s]+$/'],
            'position' => ['required', 'string', 'max:255'],
            'password' => ['required', 'string', 'min:8'],
        ]);
        
        // Check if this employee number belongs to a teacher who is already an admin
        $teacher = DB::table('tbl_teachers')
            ->where('employee_number', $validated['employee_number'])
            ->first();
        
        if ($teacher) {
            $isAlreadyAdmin = DB::table('tbl_admins')
                ->where('user_id', $teacher->user_id)
                ->exists();
            
            if ($isAlreadyAdmin) {
                return back()->withErrors(['employee_number' => 'This teacher is already an admin.']);
            }
        }

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
                'password_changed' => true, // Admins don't need to change password
            ]);

            Admin::create([
                'user_id' => $user->id,
                'employee_number' => $validated['employee_number'],
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
                'description' => 'Created admin: ' . $validated['first_name'] . ' ' . $validated['last_name'] . ' (Employee #' . $validated['employee_number'] . ')',
            ]);

            DB::commit();

            return redirect()->route('superadmin.admins.index')->with('success', 'Admin created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to create admin. Please try again.']);
        }
    }

    /**
     * Update the specified admin.
     * Only accessible by super admins.
     */
    public function update(Request $request, Admin $admin)
    {
        // Get the admin record for the current user
        $currentAdmin = Admin::where('user_id', Auth::id())->first();
        
        // Only super admins can update admins
        if (!$currentAdmin || $currentAdmin->role !== 'Super Admin') {
            abort(403, 'Unauthorized. Only super admins can update admin accounts.');
        }

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

            return redirect()->route('superadmin.admins.index')->with('success', 'Admin updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to update admin. Please try again.']);
        }
    }

    /**
     * Remove the specified admin.
     * Only accessible by super admins.
     */
    public function destroy(Admin $admin)
    {
        // Get the admin record for the current user
        $currentAdmin = Admin::where('user_id', Auth::id())->first();
        
        // Only super admins can delete admins
        if (!$currentAdmin || $currentAdmin->role !== 'Super Admin') {
            abort(403, 'Unauthorized. Only super admins can delete admin accounts.');
        }

        DB::beginTransaction();
        try {
            $adminName = $admin->first_name . ' ' . $admin->last_name;
            
            // Delete the user (will cascade delete admin record)
            $admin->user->delete();

            // Log activity
            ActivityLog::create([
                'user_id' => Auth::id(),
                'action' => 'deleted',
                'description' => 'Deleted admin: ' . $adminName,
            ]);

            DB::commit();

            return redirect()->route('superadmin.admins.index')->with('success', 'Admin deleted successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to delete admin. Please try again.']);
        }
    }
}
