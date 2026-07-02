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

        $sections = ClassSection::with(['gradeLevel', 'room'])
            ->when($search, fn($q) => $q->where('section_name', 'like', "%{$search}%"))
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
                ];
            });

        $gradeLevels = GradeLevel::all()->map(function ($level) {
            return ['id' => $level->id, 'name' => $level->name];
        });

        $rooms = \App\Models\Room::where('status', 'Available')->get()->map(function ($room) {
            return ['id' => $room->id, 'room_name' => $room->room_name, 'capacity' => $room->capacity];
        });

        return Inertia::render('admin/enrollment/class-sections/page', [
            'sections' => $sections,
            'gradeLevels' => $gradeLevels,
            'rooms' => $rooms,
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
            'room_id' => 'required|exists:tbl_room,id',
        ]);

        // Check for case-insensitive duplicate across all grade levels
        $exists = ClassSection::whereRaw('LOWER(section_name) = ?', [strtolower($request->section_name)])
            ->exists();

        if ($exists) {
            return back()->withErrors(['section_name' => 'This section name already exists.']);
        }

        // Check if room is already assigned to another section
        if ($request->room_id) {
            $roomTaken = ClassSection::where('room_id', $request->room_id)->exists();
            if ($roomTaken) {
                return back()->withErrors(['room_id' => 'This room is already assigned to another section.']);
            }
        }

        ClassSection::create([
            'section_name' => $request->section_name,
            'grade_level_id' => $request->grade_level_id,
            'room_id' => $request->room_id,
        ]);

        return redirect()->back()->with('success', 'Section created successfully');
    }

    public function update(Request $request, ClassSection $classSection)
    {
        $request->validate([
            'section_name' => 'required|string|max:255',
            'grade_level_id' => 'required|exists:tbl_grade_levels,id',
            'room_id' => 'required|exists:tbl_room,id',
        ]);

        // Check for case-insensitive duplicate across all grade levels (excluding current section)
        $exists = ClassSection::whereRaw('LOWER(section_name) = ?', [strtolower($request->section_name)])
            ->where('id', '!=', $classSection->id)
            ->exists();

        if ($exists) {
            return back()->withErrors(['section_name' => 'This section name already exists.']);
        }

        // Check if room is already assigned to another section (excluding current section)
        if ($request->room_id) {
            $roomTaken = ClassSection::where('room_id', $request->room_id)
                ->where('id', '!=', $classSection->id)
                ->exists();
            if ($roomTaken) {
                return back()->withErrors(['room_id' => 'This room is already assigned to another section.']);
            }
        }

        $classSection->update([
            'section_name' => $request->section_name,
            'grade_level_id' => $request->grade_level_id,
            'room_id' => $request->room_id,
        ]);

        return redirect()->back()->with('success', 'Section updated successfully');
    }

    public function destroy(ClassSection $classSection)
    {
        $classSection->delete();

        return redirect()->back()->with('success', 'Section deleted successfully');
    }
}
