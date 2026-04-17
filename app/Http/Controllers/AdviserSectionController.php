<?php

namespace App\Http\Controllers;

use App\Models\AdviserSection;
use App\Models\ClassSection;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AdviserSectionController extends Controller
{
    public function index()
    {
        try {
            $currentYear = date('Y');
            $schoolYear = $currentYear . '-' . ($currentYear + 1);

            $sections = ClassSection::with([
                'gradeLevel',
                'adviserSections' => function ($query) use ($schoolYear) {
                    // We filter the relationship right in the query
                    $query->where('school_year', $schoolYear)->with('teacher');
                }
            ])->get()->map(function ($section) {
                // Get the first adviser record from the pre-loaded collection
                $adviserSection = $section->adviserSections->first();

                return [
                    'id' => $section->id,
                    'section_name' => $section->section_name ?? 'Unknown',
                    'grade_level' => $section->gradeLevel ? $section->gradeLevel->name : 'N/A',
                    'grade_level_id' => $section->grade_level_id,
                    'current_adviser' => $adviserSection && $adviserSection->teacher ? $adviserSection->teacher->name : 'Not Assigned',
                    'adviser_id' => $adviserSection ? $adviserSection->teacher_id : null,
                    'adviser_section_id' => $adviserSection ? $adviserSection->id : null,
                ];
            });

            $assignedTeacherIds = AdviserSection::where('school_year', $schoolYear)
                ->pluck('teacher_id')
                ->toArray();

            $teachers = Teacher::all()->map(function ($teacher) use ($assignedTeacherIds) {
                return [
                    'id' => $teacher->id,
                    'name' => $teacher->name ?? 'Unknown',
                    'is_assigned' => in_array($teacher->id, $assignedTeacherIds),
                ];
            });

            $admin = \App\Models\Admin::where('user_id', \Illuminate\Support\Facades\Auth::id())->first();

            return Inertia::render('admin/enrollment/adviser-management/page', [
                'sections' => $sections,
                'teachers' => $teachers,
                'schoolYear' => $schoolYear,
                'auth' => [
                    'user' => \Illuminate\Support\Facades\Auth::user(),
                    'admin' => $admin,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Adviser Management Error: ' . $e->getMessage());

            $admin = \App\Models\Admin::where('user_id', \Illuminate\Support\Facades\Auth::id())->first();

            return Inertia::render('admin/enrollment/adviser-management/page', [
                'sections' => [],
                'teachers' => [],
                'schoolYear' => date('Y') . '-' . (date('Y') + 1),
                'auth' => [
                    'user' => \Illuminate\Support\Facades\Auth::user(),
                    'admin' => $admin,
                ],
            ]);
        }
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
