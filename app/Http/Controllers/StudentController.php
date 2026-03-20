<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StudentController extends Controller
{
    public function dashboard()
    {
        return Inertia::render('student/dashboard/page', [
            'auth' => [
                'user' => Auth::user()
            ]
        ]);
    }
}
