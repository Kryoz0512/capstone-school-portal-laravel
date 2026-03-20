<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
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
}
