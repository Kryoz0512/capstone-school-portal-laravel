<?php

namespace App\Http\Controllers;

use App\Models\ClassSection;
use App\Models\GradeLevel;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClassSectionController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search', '');
        $gradeLevelFilter = $request->input('grade_level', 'all');
        $perPage = (int) $request->input('per_page', 10);

        $sections = ClassSection::with(['gradeLevel', 'room', 'teacher'])
            ->when($search, fn($q) => $q->where('section_name', 'like', "%{$search}%")
                ->orWhereHas('teacher', fn($tq) => $tq->where('name', 'like', "%{$search}%")))
            ->when($gradeLevelFilter !== 'all', fn($q) => $q->where('grade_level_id', $gradeLevelFilter))
            ->orderBy('section_name')
            ->paginate($perPage)
            ->withQueryString()
            ->through(function ($section) {
                return [
                    'id' => $section->id,
                    'section_name' => $section->section_name,
                    'grade_level_id' => $section->grade_level_id,
                    'grade_level' => $section->gradeLevel ? $section->gradeLevel->name : null,
                    'room_id' => $section->room_id,
                    'room' => $section->room ? $section->room->room_name : null,
                    'teacher_id' => $section->teacher_id,
                    'teacher_name' => $section->teacher ? $section->teacher->name : 'Not Assigned',
                ];
            });

        $gradeLevels = GradeLevel::all()->map(function ($level) {
            return ['id' => $level->id, 'name' => $level->name];
        });

        $rooms = \App\Models\Room::where('status', 'Available')->get()->map(function ($room) {
            return ['id' => $room->id, 'room_name' => $room->room_name, 'capacity' => $room->capacity];
        });

        $teachers = \App\Models\Teacher::all()->map(function ($teacher) {
            return ['id' => $teacher->id, 'name' => $teacher->name];
        });

        return Inertia::render('admin/enrollment/class-sections/page', [
            'sections' => $sections,
            'gradeLevels' => $gradeLevels,
            'rooms' => $rooms,
            'teachers' => $teachers,
            'filters' => ['search' => $search, 'grade_level' => $gradeLevelFilter],
        ]);
    }
    public function checkSectionName(Request $request)
    {
        $sectionName = $request->input('section_name');
        $sectionId = $request->input('section_id'); // For edit mode

        $query = ClassSection::whereRaw('LOWER(section_name) = ?', [strtolower($sectionName)]);

        // Exclude current section when editing
        if ($sectionId) {
            $query->where('id', '!=', $sectionId);
        }

        $exists = $query->exists();

        return response()->json([
            'available' => !$exists,
            'message' => $exists ? 'This section name already exists.' : 'Section name is available.'
        ]);
    }

    public function checkRoom(Request $request)
    {
        $roomId = $request->input('room_id');
        $sectionId = $request->input('section_id'); // For edit mode

        $query = ClassSection::where('room_id', $roomId);

        // Exclude current section when editing
        if ($sectionId) {
            $query->where('id', '!=', $sectionId);
        }

        $exists = $query->exists();

        return response()->json([
            'available' => !$exists,
            'message' => $exists ? 'This room is already assigned to another section.' : 'Room is available.'
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'section_name' => 'required|string|max:255',
            'grade_level_id' => 'required|exists:tbl_grade_levels,id',
            'teacher_id' => 'nullable|exists:tbl_teachers,id',
        ]);

        // Check for case-insensitive duplicate across all grade levels
        $exists = ClassSection::whereRaw('LOWER(section_name) = ?', [strtolower($request->section_name)])
            ->exists();

        if ($exists) {
            return back()->withErrors(['section_name' => 'This section name already exists.']);
        }

        // Check if teacher is already assigned to another section
        if ($request->teacher_id) {
            $teacherAssigned = ClassSection::where('teacher_id', $request->teacher_id)
                ->exists();

            if ($teacherAssigned) {
                return back()->withErrors(['teacher_id' => 'This teacher is already assigned to another section.']);
            }
        }

        $section = ClassSection::create([
            'section_name' => $request->section_name,
            'grade_level_id' => $request->grade_level_id,
            'teacher_id' => $request->teacher_id,
        ]);

        // Also create AdviserSection entry for current school year if teacher is assigned
        if ($request->teacher_id) {
            $currentYear = date('Y');
            $schoolYear = $currentYear . '-' . ($currentYear + 1);

            \App\Models\AdviserSection::create([
                'teacher_id' => $request->teacher_id,
                'class_section_id' => $section->id,
                'school_year' => $schoolYear,
            ]);
        }

        return redirect()->back()->with('success', 'Section created successfully');
    }

    public function update(Request $request, ClassSection $classSection)
    {
        $request->validate([
            'section_name' => 'required|string|max:255',
            'grade_level_id' => 'required|exists:tbl_grade_levels,id',
            'teacher_id' => 'nullable|exists:tbl_teachers,id',
        ]);

        // Check for case-insensitive duplicate across all grade levels (excluding current section)
        $exists = ClassSection::whereRaw('LOWER(section_name) = ?', [strtolower($request->section_name)])
            ->where('id', '!=', $classSection->id)
            ->exists();

        if ($exists) {
            return back()->withErrors(['section_name' => 'This section name already exists.']);
        }

        // Check if teacher is already assigned to another section
        if ($request->teacher_id) {
            $teacherAssigned = ClassSection::where('teacher_id', $request->teacher_id)
                ->where('id', '!=', $classSection->id)
                ->exists();

            if ($teacherAssigned) {
                return back()->withErrors(['teacher_id' => 'This teacher is already assigned to another section.']);
            }
        }

        $oldTeacherId = $classSection->teacher_id;

        $classSection->update([
            'section_name' => $request->section_name,
            'grade_level_id' => $request->grade_level_id,
            'teacher_id' => $request->teacher_id,
        ]);

        // Sync AdviserSection for current school year
        $currentYear = date('Y');
        $schoolYear = $currentYear . '-' . ($currentYear + 1);

        // Remove old adviser assignment if teacher changed
        if ($oldTeacherId && $oldTeacherId !== $request->teacher_id) {
            \App\Models\AdviserSection::where('class_section_id', $classSection->id)
                ->where('school_year', $schoolYear)
                ->delete();
        }

        // Create or update new adviser assignment
        if ($request->teacher_id) {
            \App\Models\AdviserSection::updateOrCreate(
                [
                    'class_section_id' => $classSection->id,
                    'school_year' => $schoolYear,
                ],
                [
                    'teacher_id' => $request->teacher_id,
                ]
            );
        } else {
            // Remove adviser assignment if no teacher selected
            \App\Models\AdviserSection::where('class_section_id', $classSection->id)
                ->where('school_year', $schoolYear)
                ->delete();
        }

        return redirect()->back()->with('success', 'Section updated successfully');
    }

    public function destroy(ClassSection $classSection)
    {
        // Check if section has students
        $studentCount = $classSection->students()->count();
        if ($studentCount > 0) {
            return back()->withErrors(['error' => "Cannot delete this section. It has {$studentCount} student(s) enrolled."]);
        }

        // Check if section has schedules
        $scheduleCount = $classSection->schedules()->count();
        if ($scheduleCount > 0) {
            return back()->withErrors(['error' => "Cannot delete this section. It has {$scheduleCount} schedule(s). Please remove schedules first."]);
        }

        // Check if section has adviser assigned
        if ($classSection->teacher_id) {
            return back()->withErrors(['error' => "Cannot delete this section. It has an adviser assigned. Please remove the adviser first."]);
        }

        // Delete the section
        $classSection->delete();

        return redirect()->back()->with('success', 'Section deleted successfully');
    }

    public function checkDeletable(ClassSection $classSection)
    {
        $checks = [
            'students' => [
                'count' => $classSection->students()->count(),
                'label' => 'Students enrolled',
            ],
            'schedules' => [
                'count' => $classSection->schedules()->count(),
                'label' => 'Schedules assigned',
            ],
            'adviser' => [
                'count' => $classSection->teacher_id ? 1 : 0,
                'label' => 'Adviser assigned',
            ],
        ];

        $canDelete = true;
        foreach ($checks as $check) {
            if ($check['count'] > 0) {
                $canDelete = false;
                break;
            }
        }

        return response()->json([
            'can_delete' => $canDelete,
            'checks' => $checks,
        ]);
    }
}
