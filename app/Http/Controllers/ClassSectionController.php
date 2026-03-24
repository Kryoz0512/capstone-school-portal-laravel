<?php

namespace App\Http\Controllers;

use App\Models\ClassSection;
use App\Models\GradeLevel;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClassSectionController extends Controller
{
    public function index()
    {
        $sections = ClassSection::with('gradeLevel')->get()->map(function ($section) {
            return [
                'id' => $section->id,
                'section_name' => $section->section_name,
                'grade_level_id' => $section->grade_level_id,
                'grade_level' => $section->gradeLevel ? $section->gradeLevel->name : null,
            ];
        });

        $gradeLevels = GradeLevel::all()->map(function ($level) {
            return [
                'id' => $level->id,
                'name' => $level->name,
            ];
        });

        return Inertia::render('admin/enrollment/class-sections/page', [
            'sections' => $sections,
            'gradeLevels' => $gradeLevels,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'section_name' => 'required|string|max:255',
            'grade_level_id' => 'required|exists:tbl_grade_levels,id',
        ]);

        ClassSection::create($validated);

        return redirect()->back()->with('success', 'Section created successfully');
    }

    public function update(Request $request, ClassSection $classSection)
    {
        $validated = $request->validate([
            'section_name' => 'required|string|max:255',
            'grade_level_id' => 'required|exists:tbl_grade_levels,id',
        ]);

        $classSection->update($validated);

        return redirect()->back()->with('success', 'Section updated successfully');
    }

    public function destroy(ClassSection $classSection)
    {
        $classSection->delete();

        return redirect()->back()->with('success', 'Section deleted successfully');
    }
}
