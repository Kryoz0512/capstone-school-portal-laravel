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
    public function index(Request $request)
    {
        $search = $request->input('search', '');
        $specialization = $request->input('specialization', 'all');
        $position = $request->input('position', 'all');
        $perPage = (int) $request->input('per_page', 10);

        $teachers = Teacher::withCount('subjects as assigned_subjects_count')
            ->when($search, function ($q) use ($search) {
                $q->where(function ($qq) use ($search) {
                    $qq->where('name', 'like', "%{$search}%")
                       ->orWhere('employee_number', 'like', "%{$search}%");
                });
            })
            ->when($specialization !== 'all', fn($q) => $q->where('subject', $specialization))
            ->when($position !== 'all', fn($q) => $q->where('position', $position))
            ->orderBy('name')
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn($teacher) => [
                'id' => $teacher->id,
                'name' => $teacher->name,
                'employee_number' => $teacher->employee_number,
                'subject' => $teacher->subject,
                'position' => $teacher->position,
                'assigned_subjects_count' => $teacher->assigned_subjects_count,
            ]);

        // Grade levels and subjects are needed in full (not paginated) for the
        // "Assign Subject" modal's dropdowns.
        $gradeLevels = GradeLevel::select('id', 'name')->get();

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

        // Filter option lists — pulled unfiltered since the teacher list itself
        // is now only a partial page and can't be used to derive these client-side.
        $specializations = Teacher::select('subject')->distinct()->orderBy('subject')->pluck('subject');
        $positions = Teacher::select('position')->distinct()->orderBy('position')->pluck('position');

        return Inertia::render('admin/enrollment/faculty-subjects/page', [
            'teachers' => $teachers,
            'gradeLevels' => $gradeLevels,
            'subjects' => $subjects,
            'specializations' => $specializations,
            'positions' => $positions,
            'filters' => [
                'search' => $search,
                'specialization' => $specialization,
                'position' => $position,
            ],
        ]);
    }

    public function getTeacherSubjects(Request $request, $teacherId)
    {
        $perPage = (int) $request->input('per_page', 10);

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
            ->orderBy('tbl_subjects.name')
            ->paginate($perPage);

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