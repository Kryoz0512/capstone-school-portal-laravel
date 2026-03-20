<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TeacherController extends Controller
{
    public function dashboard()
    {
        return Inertia::render('teacher/dashboard/page', [
            'auth' => [
                'user' => Auth::user()
            ]
        ]);
    }
}
