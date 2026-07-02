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
    public function index(Request $request)
    {
        try {
            $currentYear = date('Y');
            $schoolYear = $currentYear . '-' . ($currentYear + 1);

            $search = $request->input('search', '');
            $gradeLevelFilter = $request->input('grade_level', 'all');
            $perPage = (int) $request->input('per_page', 10);

            $sectionsQuery = ClassSection::with([
                'gradeLevel',
                'adviserSections' => function ($query) use ($schoolYear) {
                    $query->where('school_year', $schoolYear)->with('teacher');
                }
            ]);

            if ($gradeLevelFilter !== 'all') {
                $sectionsQuery->where('grade_level_id', $gradeLevelFilter);
            }

            if ($search) {
                $sectionsQuery->where(function ($q) use ($search, $schoolYear) {
                    $q->where('section_name', 'like', "%{$search}%")
                        ->orWhereHas('adviserSections', function ($q2) use ($search, $schoolYear) {
                            $q2->where('school_year', $schoolYear)
                                ->whereHas('teacher', function ($q3) use ($search) {
                                    $q3->where('name', 'like', "%{$search}%");
                                });
                        });
                });
            }

            $sections = $sectionsQuery->orderBy('section_name')
                ->paginate($perPage)
                ->withQueryString()
                ->through(function ($section) {
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

            $gradeLevels = \App\Models\GradeLevel::all()->map(fn($g) => ['id' => $g->id, 'name' => $g->name]);

            return Inertia::render('admin/enrollment/adviser-management/page', [
                'sections' => $sections,
                'teachers' => $teachers,
                'gradeLevels' => $gradeLevels,
                'schoolYear' => $schoolYear,
                'filters' => ['search' => $search, 'grade_level' => $gradeLevelFilter],
            ]);
        } catch (\Exception $e) {
            Log::error('Adviser Management Error: ' . $e->getMessage());

            return Inertia::render('admin/enrollment/adviser-management/page', [
                'sections' => ['data' => [], 'current_page' => 1, 'last_page' => 1, 'per_page' => 10, 'total' => 0, 'links' => []],
                'teachers' => [],
                'gradeLevels' => [],
                'schoolYear' => date('Y') . '-' . (date('Y') + 1),
                'filters' => ['search' => '', 'grade_level' => 'all'],
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
