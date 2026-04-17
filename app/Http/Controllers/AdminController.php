<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AdminController extends Controller
{
    /**
     * Display the admin dashboard.
     */
    public function dashboard()
    {
        // Get the admin record for the current user
        $admin = Admin::where('user_id', Auth::id())->first();
        
        return Inertia::render('admin/dashboard/page', [
            'auth' => [
                'user' => Auth::user(),
                'admin' => $admin ? [
                    'role' => $admin->role,
                    'position' => $admin->position,
                ] : null,
            ]
        ]);
    }
}
