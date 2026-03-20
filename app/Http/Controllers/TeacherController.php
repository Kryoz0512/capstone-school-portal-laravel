<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class TeacherController extends Controller
{
    public function dashboard()
    {
        return Inertia::render('teacher/dashboard/page');
    }
}
