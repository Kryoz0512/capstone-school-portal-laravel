<?php

namespace App\Http\Controllers;

use App\Models\AdviserSection;
use App\Models\ClassSection;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AdviserSectionController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 10);

        $assignments = AdviserSection::with([
            'teacher:id,name',
            'section.gradeLevel:id,name',
            'section.room:id,room_name'
        ])
            ->select('id', 'teacher_id', 'class_section_id', 'school_year')
            ->orderBy('id', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        // Get assigned teacher IDs from current page
        $assignedTeacherIds = $assignments->pluck('teacher_id')->unique()->toArray();

        // Cache reference data
        $teachers = Cache::remember('teachers_for_adviser_assignment', 3600, function () {
            return Teacher::select('id', 'name')
                ->orderBy('name')
                ->get();
        });

        $teachers = $teachers->map(function ($teacher) use ($assignedTeacherIds) {
            return [
                'id' => $teacher->id,
                'name' => $teacher->name,
                'is_assigned' => in_array($teacher->id, $assignedTeacherIds),
            ];
        });

        $gradeLevels = Cache::remember('grade_levels_list', 3600, function () {
            return \App\Models\GradeLevel::select('id', 'name')
                ->orderByRaw("FIELD(name, 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10')")
                ->get()
                ->map(fn($g) => ['id' => $g->id, 'name' => $g->name]);
        });

        return Inertia::render('admin/enrollment/adviser-management/page', [
            'assignments' => $assignments,
            'teachers' => $teachers,
            'gradeLevels' => $gradeLevels,
        ]);
    }
    
    public function store(Request $request)
    {
        $validated = $request->validate([
            'teacher_id' => 'required|exists:tbl_teachers,id',
            'class_section_id' => 'required|exists:tbl_class_sections,id',
            'school_year' => 'required|string',
        ]);

        $exists = AdviserSection::where('teacher_id', $validated['teacher_id'])
            ->where('class_section_id', $validated['class_section_id'])
            ->where('school_year', $validated['school_year'])
            ->exists();

        if ($exists) {
            return back()->withErrors(['error' => 'This teacher is already assigned to this section for the selected school year.']);
        }

        $teacherHasSection = AdviserSection::where('teacher_id', $validated['teacher_id'])
            ->where('school_year', $validated['school_year'])
            ->exists();

        if ($teacherHasSection) {
            return back()->withErrors(['error' => 'This teacher is already advising another section for the selected school year.']);
        }

        AdviserSection::create($validated);

        return redirect()->back()->with('success', 'Adviser assigned successfully');
    }

    public function update(Request $request, AdviserSection $adviserSection)
    {
        $validated = $request->validate([
            'teacher_id' => 'required|exists:tbl_teachers,id',
        ]);

        $teacherHasSection = AdviserSection::where('teacher_id', $validated['teacher_id'])
            ->where('school_year', $adviserSection->school_year)
            ->where('id', '!=', $adviserSection->id)
            ->exists();

        if ($teacherHasSection) {
            return back()->withErrors(['error' => 'This teacher is already advising another section for the selected school year.']);
        }

        $adviserSection->update($validated);

        return redirect()->back()->with('success', 'Adviser updated successfully');
    }

    public function destroy(AdviserSection $adviserSection)
    {
        $adviserSection->delete();

        return redirect()->back()->with('success', 'Adviser assignment removed successfully');
    }
}
