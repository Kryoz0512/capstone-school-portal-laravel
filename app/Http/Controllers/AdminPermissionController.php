<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminPermissionController extends Controller
{
    public function index()
    {
        $admins = Admin::with('user')
            ->where('role', '!=', 'Super Admin')
            ->get()
            ->map(function ($admin) {
                return [
                    'id' => $admin->id,
                    'user_id' => $admin->user_id,
                    'name' => $admin->user->name,
                    'email' => $admin->user->email,
                    'role' => $admin->role,
                    'position' => $admin->position,
                    'can_add_teacher' => $admin->can_add_teacher,
                ];
            });

        $currentAdmin = Admin::where('user_id', \Illuminate\Support\Facades\Auth::id())->first();

        return Inertia::render('admin/maintenance/admin-permissions/page', [
            'admins' => $admins,
        ]);
    }

    public function togglePermission(Request $request, $id)
    {
        $admin = Admin::findOrFail($id);
        
        // Prevent Super Admin from being modified
        if ($admin->role === 'Super Admin') {
            return back()->with('error', 'Cannot modify Super Admin permissions');
        }

        $admin->can_add_teacher = !$admin->can_add_teacher;
        $admin->save();

        return back()->with('success', 'Permission updated successfully');
    }
}
