<?php

namespace App\Http\Controllers;

use App\Models\Subject;
use App\Models\GradeLevel;
use App\Models\Archive;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SubjectController extends Controller
{
    public function index(Request $request)
    {
        $gradeLevelFilter = $request->input('grade_level', 'all');
        $subjectNameFilter = $request->input('subject_name', 'all');
        $perPage = (int) $request->input('per_page', 10);

        $subjects = Subject::with('gradeLevel')
            ->when($gradeLevelFilter !== 'all', function ($q) use ($gradeLevelFilter) {
                $q->whereHas('gradeLevel', fn($q2) => $q2->where('name', $gradeLevelFilter));
            })
            ->when($subjectNameFilter !== 'all', fn($q) => $q->where('name', $subjectNameFilter))
            ->orderBy('name')
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn($subject) => [
                'id' => $subject->id,
                'code' => $subject->code,
                'name' => $subject->name,
                'description' => $subject->description,
                'grade_level' => $subject->gradeLevel ? $subject->gradeLevel->name : null,
                'grade_level_id' => $subject->grade_level_id,
            ]);

        // Full (unfiltered) lists for the filter dropdowns — the paginated
        // $subjects above only contains the current page, so it can't be used
        // to derive these client-side anymore.
        $gradeLevels = GradeLevel::all()->map(function ($level) {
            return [
                'id' => $level->id,
                'name' => $level->name,
            ];
        });

        $uniqueGradeLevels = GradeLevel::orderBy('name')->pluck('name');
        $uniqueSubjectNames = Subject::select('name')->distinct()->orderBy('name')->pluck('name');

        return Inertia::render('admin/registrar/subject-listings/page', [
            'subjects' => $subjects,
            'gradeLevels' => $gradeLevels,
            'uniqueGradeLevels' => $uniqueGradeLevels,
            'uniqueSubjectNames' => $uniqueSubjectNames,
            'filters' => [
                'grade_level' => $gradeLevelFilter,
                'subject_name' => $subjectNameFilter,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:tbl_subjects,code',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'grade_level_id' => 'required|exists:tbl_grade_levels,id',
        ]);

        Subject::create($validated);

        return redirect()->back()->with('success', 'Subject created successfully');
    }

    public function update(Request $request, Subject $subject)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:tbl_subjects,code,' . $subject->id,
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'grade_level_id' => 'required|exists:tbl_grade_levels,id',
        ]);

        $subject->update($validated);

        return redirect()->back()->with('success', 'Subject updated successfully');
    }

    public function destroy(Subject $subject)
    {
        // Archive the subject before deletion
        Archive::create([
            'archivable_type' => Subject::class,
            'archivable_id' => $subject->id,
            'data' => [
                'code' => $subject->code,
                'name' => $subject->name,
                'description' => $subject->description,
                'grade_level_id' => $subject->grade_level_id,
                'grade_level' => $subject->gradeLevel ? $subject->gradeLevel->name : null,
            ],
            'archived_by' => Auth::id(),
            'reason' => 'Subject deleted',
        ]);

        $subject->delete();

        return redirect()->back()->with('success', 'Subject deleted successfully');
    }
}