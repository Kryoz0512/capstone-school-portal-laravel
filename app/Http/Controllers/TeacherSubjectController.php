<?php

namespace App\Http\Controllers;

use App\Models\GradeLevel;
use App\Models\Teacher;
use App\Models\Subject;
use App\Models\TeacherSubject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TeacherSubjectController extends Controller
{

public function index()
{
    // 1. Use withCount to solve the N+1 problem. 
    // This gets the count in a single SQL query using a subquery.
    $teachers = Teacher::withCount('subjects as assigned_subjects_count')
        ->get()
        ->map(fn($teacher) => [
            'id' => $teacher->id,
            'name' => $teacher->name,
            'employee_number' => $teacher->employee_number,
            'subject' => $teacher->subject, // This looks like a string field in your table
            'position' => $teacher->position,
            'assigned_subjects_count' => $teacher->assigned_subjects_count,
        ]);

    // 2. Select only the columns you need for GradeLevels
    $gradeLevels = GradeLevel::select('id', 'name')->get();

    // 3. Eager load gradeLevel and map subjects efficiently
    $subjects = Subject::with('gradeLevel:id,name')
        ->get()
        ->map(fn($subject) => [
            'id' => $subject->id,
            'code' => $subject->code,
            'name' => $subject->name,
            'description' => $subject->description,
            'grade_level_id' => $subject->grade_level_id,
            'grade_level' => $subject->gradeLevel->name ?? null,
        ]);

    $admin = \App\Models\Admin::where('user_id', \Illuminate\Support\Facades\Auth::id())->first();

    return Inertia::render('admin/enrollment/faculty-subjects/page', [
        'teachers' => $teachers,
        'gradeLevels' => $gradeLevels,
        'subjects' => $subjects,
        'auth' => [
            'user' => \Illuminate\Support\Facades\Auth::user(),
            'admin' => $admin,
        ],
    ]);
}

    public function getTeacherSubjects($teacherId)
    {
        $assignments = DB::table('tbl_teacher_subjects')
            ->join('tbl_subjects', 'tbl_teacher_subjects.subject_id', '=', 'tbl_subjects.id')
            ->leftJoin('tbl_grade_levels', 'tbl_subjects.grade_level_id', '=', 'tbl_grade_levels.id')
            ->where('tbl_teacher_subjects.teacher_id', $teacherId)
            ->select(
                'tbl_teacher_subjects.id',
                'tbl_subjects.code as subject_code',
                'tbl_subjects.name as subject_name',
                'tbl_subjects.description',
                'tbl_grade_levels.name as grade_level',
                'tbl_teacher_subjects.subject_id'
            )
            ->get();

        return response()->json($assignments);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'teacher_id' => 'required|exists:tbl_teachers,id',
            'subject_id' => 'required|exists:tbl_subjects,id',
        ]);

        // Check if assignment already exists
        $exists = DB::table('tbl_teacher_subjects')
            ->where('teacher_id', $validated['teacher_id'])
            ->where('subject_id', $validated['subject_id'])
            ->exists();

        if ($exists) {
            return back()->withErrors(['error' => 'This teacher is already assigned to this subject.']);
        }

        DB::table('tbl_teacher_subjects')->insert([
            'teacher_id' => $validated['teacher_id'],
            'subject_id' => $validated['subject_id'],
        ]);

        return redirect()->back()->with('success', 'Subject assigned successfully');
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'teacher_id' => 'required|exists:tbl_teachers,id',
            'subject_id' => 'required|exists:tbl_subjects,id',
        ]);

        // Check if assignment already exists (excluding current record)
        $exists = DB::table('tbl_teacher_subjects')
            ->where('teacher_id', $validated['teacher_id'])
            ->where('subject_id', $validated['subject_id'])
            ->where('id', '!=', $id)
            ->exists();

        if ($exists) {
            return back()->withErrors(['error' => 'This teacher is already assigned to this subject.']);
        }

        DB::table('tbl_teacher_subjects')
            ->where('id', $id)
            ->update([
                'teacher_id' => $validated['teacher_id'],
                'subject_id' => $validated['subject_id'],
            ]);

        return redirect()->back()->with('success', 'Assignment updated successfully');
    }

    public function destroy($id)
    {
        try {
            DB::table('tbl_teacher_subjects')->where('id', $id)->delete();
            
            return response()->json(['message' => 'Assignment removed successfully']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error removing assignment'], 500);
        }
    }
}
