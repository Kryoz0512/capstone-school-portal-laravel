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
    public function index()
    {
        $subjects = Subject::with('gradeLevel')->get()->map(function ($subject) {
            return [
                'id' => $subject->id,
                'code' => $subject->code,
                'name' => $subject->name,
                'description' => $subject->description,
                'grade_level' => $subject->gradeLevel ? $subject->gradeLevel->name : null,
                'grade_level_id' => $subject->grade_level_id,
            ];
        });

        $gradeLevels = GradeLevel::all()->map(function ($level) {
            return [
                'id' => $level->id,
                'name' => $level->name,
            ];
        });

        $admin = \App\Models\Admin::where('user_id', Auth::id())->first();

        return Inertia::render('admin/registrar/subject-listings/page', [
            'subjects' => $subjects,
            'gradeLevels' => $gradeLevels,
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
