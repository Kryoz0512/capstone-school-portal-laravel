<?php

namespace App\Http\Controllers;

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
        // Get all teachers with their assigned subjects count
        $teachers = Teacher::all()->map(function ($teacher) {
            $assignedSubjectsCount = DB::table('tbl_teacher_subjects')
                ->where('teacher_id', $teacher->id)
                ->count();
            
            return [
                'id' => $teacher->id,
                'name' => $teacher->name,
                'employee_number' => $teacher->employee_number,
                'subject' => $teacher->subject,
                'position' => $teacher->position,
                'assigned_subjects_count' => $assignedSubjectsCount,
            ];
        });

        $gradeLevels = \App\Models\GradeLevel::all()->map(function ($gradeLevel) {
            return [
                'id' => $gradeLevel->id,
                'name' => $gradeLevel->name,
            ];
        });

        $subjects = Subject::with('gradeLevel')->get()->map(function ($subject) {
            return [
                'id' => $subject->id,
                'code' => $subject->code,
                'name' => $subject->name,
                'description' => $subject->description,
                'grade_level_id' => $subject->grade_level_id,
                'grade_level' => $subject->gradeLevel ? $subject->gradeLevel->name : null,
            ];
        });

        return Inertia::render('admin/enrollment/faculty-subjects/page', [
            'teachers' => $teachers,
            'gradeLevels' => $gradeLevels,
            'subjects' => $subjects,
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
