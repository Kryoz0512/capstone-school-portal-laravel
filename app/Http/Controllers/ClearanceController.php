<?php
// app/Http/Controllers/ClearanceController.php

namespace App\Http\Controllers;

use App\Models\Clearance;
use App\Models\Teacher;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ClearanceController extends Controller
{
    /**
     * Toggle clearance status for a student in a subject (teacher side).
     */
    public function toggle(Request $request)
    {
        $validated = $request->validate([
            'student_id'       => 'required|exists:tbl_students,id',
            'subject_id'       => 'required|exists:tbl_subjects,id',
            'class_section_id' => 'required|exists:tbl_class_sections,id',
            'school_year'      => 'required|string',
            'cleared'          => 'required|boolean',
        ]);

        $teacher = Teacher::where('user_id', Auth::id())->firstOrFail();

        $clearance = Clearance::updateOrCreate(
            [
                'student_id'       => $validated['student_id'],
                'subject_id'       => $validated['subject_id'],
                'class_section_id' => $validated['class_section_id'],
                'school_year'      => $validated['school_year'],
            ],
            [
                'teacher_id' => $teacher->id,
                'status'     => $validated['cleared'] ? 'cleared' : 'pending',
            ]
        );

        return back()->with('success', 'Clearance updated.');
    }
}