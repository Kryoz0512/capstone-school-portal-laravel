<?php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Models\ClassSection;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\GradeLevel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class RoomController extends Controller
{
    public function index(Request $request, $room = null)
    {
        $search = $request->input('search', '');
        $capacity = $request->input('capacity');
        $status = $request->input('status', 'All');
        $perPage = (int) $request->input('per_page', 10);

        $rooms = Room::withCount([
            'sections as students_count' => function ($query) {
                $query->join('tbl_students', 'tbl_class_sections.id', '=', 'tbl_students.current_section_id');
            },
            'schedules as schedules_count',
        ])
            ->when($search, fn($q) => $q->where('room_name', 'like', "%{$search}%"))
            ->when($capacity, fn($q) => $q->where('capacity', $capacity))
            ->when($status && $status !== 'All', fn($q) => $q->where('status', $status))
            ->orderBy('room_name')
            ->paginate($perPage)
            ->withQueryString()
            ->through(function ($room) {
                // Get the section assigned to this room
                $section = \App\Models\ClassSection::with('gradeLevel')->where('room_id', $room->id)->first();
                
                return [
                    'id' => $room->id,
                    'room_name' => $room->room_name,
                    'capacity' => $room->capacity,
                    'status' => $room->status,
                    'students_count' => $room->students_count,
                    'schedules_count' => $room->schedules_count,
                    'section_id' => $section ? $section->id : null,
                    'section_name' => $section ? $section->section_name : null,
                    'grade_level' => $section && $section->gradeLevel ? $section->gradeLevel->name : null,
                ];
            });

        // Get all sections with their grade levels for the Add Room modal
        $classSections = \App\Models\ClassSection::with('gradeLevel')
            ->orderBy('section_name')
            ->get()
            ->map(fn($s) => [
                'id' => $s->id,
                'section_name' => $s->section_name,
                'grade_level' => $s->gradeLevel->name ?? 'N/A',
                'grade_level_id' => $s->grade_level_id,
            ]);

        return Inertia::render('admin/enrollment/schedule-management/page', [
            'rooms' => $rooms,
            'classSections' => $classSections,
            'filters' => [
                'search' => $search,
                'capacity' => $capacity,
                'status' => $status,
            ],
            'activeRoom' => $room ? $this->buildRoomScheduleData($room) : null,
        ]);
    }

    private function buildRoomScheduleData($id): array
    {
        $room = Room::findOrFail($id);

        $schedules = $room->schedules()
            ->with(['classSection.gradeLevel', 'subject', 'teacher'])
            ->get()
            ->map(function ($schedule) {
                return [
                    'id' => $schedule->id,
                    'subject_id' => $schedule->subject_id,
                    'subject' => $schedule->subject->name ?? 'N/A',
                    'teacher_id' => $schedule->teacher_id,
                    'teacher' => $schedule->teacher->name ?? 'N/A',
                    'class_section_id' => $schedule->class_section_id,
                    'grade_level_id' => $schedule->classSection->grade_level_id ?? null,
                    'day' => $schedule->day_of_week,
                    'start_time' => $schedule->start_time ? Carbon::parse($schedule->start_time)->format('H:i') : '',
                    'end_time' => $schedule->end_time ? Carbon::parse($schedule->end_time)->format('H:i') : '',
                    'time' => Carbon::parse($schedule->start_time)->format('g:i A') . ' - ' . Carbon::parse($schedule->end_time)->format('g:i A'),
                    'section' => $schedule->classSection->section_name ?? 'N/A',
                    'gradeLevel' => $schedule->classSection->gradeLevel->name ?? 'N/A',
                ];
            });

        $gradeLevels = GradeLevel::all()->map(fn($g) => ['id' => $g->id, 'name' => $g->name]);

        $classSections = ClassSection::with('gradeLevel')->get()->map(fn($s) => [
            'id' => $s->id,
            'name' => $s->section_name,
            'grade_level_id' => $s->grade_level_id,
        ]);

        $subjects = Subject::all()->map(fn($s) => [
            'id' => $s->id,
            'name' => $s->name,
            'grade_level_id' => $s->grade_level_id,
        ]);

        $teachers = Teacher::all()->map(fn($t) => ['id' => $t->id, 'name' => $t->name]);

        $teacherSubjects = DB::table('tbl_teacher_subjects')
            ->join('tbl_subjects', 'tbl_teacher_subjects.subject_id', '=', 'tbl_subjects.id')
            ->select('tbl_teacher_subjects.teacher_id', 'tbl_subjects.id as subject_id', 'tbl_subjects.name as subject_name', 'tbl_subjects.grade_level_id')
            ->get()
            ->groupBy('teacher_id')
            ->map(fn($rows) => [
                'subjects' => $rows->map(fn($r) => [
                    'subject_id' => $r->subject_id,
                    'subject_name' => $r->subject_name,
                    'grade_level_id' => $r->grade_level_id,
                ])->values(),
            ]);

        return [
            'room' => ['id' => $room->id, 'room_name' => $room->room_name, 'capacity' => $room->capacity],
            'schedules' => $schedules,
            'gradeLevels' => $gradeLevels,
            'classSections' => $classSections,
            'subjects' => $subjects,
            'teachers' => $teachers,
            'teacherSubjects' => $teacherSubjects,
        ];
    }


    /**
     * Returns a single room's schedule plus the lookup data needed to
     * add/edit schedules for this room, all as JSON for the inline
     * schedule view on the schedule-management page.
     */
    public function schedule($id)
    {
        $room = Room::findOrFail($id);

        $schedules = $room->schedules()
            ->with(['classSection.gradeLevel', 'subject', 'teacher'])
            ->get()
            ->map(function ($schedule) {
                return [
                    'id' => $schedule->id,
                    'subject_id' => $schedule->subject_id,
                    'subject' => $schedule->subject->name ?? 'N/A',
                    'teacher_id' => $schedule->teacher_id,
                    'teacher' => $schedule->teacher->name ?? 'N/A',
                    'class_section_id' => $schedule->class_section_id,
                    'grade_level_id' => $schedule->classSection->grade_level_id ?? null,
                    'day' => $schedule->day_of_week,
                    'start_time' => $schedule->start_time ? Carbon::parse($schedule->start_time)->format('H:i') : '',
                    'end_time' => $schedule->end_time ? Carbon::parse($schedule->end_time)->format('H:i') : '',
                    'time' => Carbon::parse($schedule->start_time)->format('g:i A') . ' - ' . Carbon::parse($schedule->end_time)->format('g:i A'),
                    'section' => $schedule->classSection->section_name ?? 'N/A',
                    'gradeLevel' => $schedule->classSection->gradeLevel->name ?? 'N/A',
                ];
            });

        $gradeLevels = GradeLevel::all()->map(fn($g) => ['id' => $g->id, 'name' => $g->name]);

        $classSections = ClassSection::with('gradeLevel')->get()->map(function ($section) {
            return [
                'id' => $section->id,
                'name' => $section->section_name,
                'grade_level_id' => $section->grade_level_id,
            ];
        });

        $subjects = Subject::all()->map(function ($subject) {
            return [
                'id' => $subject->id,
                'name' => $subject->name,
                'grade_level_id' => $subject->grade_level_id,
            ];
        });

        $teachers = Teacher::all()->map(fn($t) => ['id' => $t->id, 'name' => $t->name]);

        $teacherSubjects = DB::table('tbl_teacher_subjects')
            ->join('tbl_subjects', 'tbl_teacher_subjects.subject_id', '=', 'tbl_subjects.id')
            ->select('tbl_teacher_subjects.teacher_id', 'tbl_subjects.id as subject_id', 'tbl_subjects.name as subject_name', 'tbl_subjects.grade_level_id')
            ->get()
            ->groupBy('teacher_id')
            ->map(function ($rows) {
                return [
                    'subjects' => $rows->map(fn($r) => [
                        'subject_id' => $r->subject_id,
                        'subject_name' => $r->subject_name,
                        'grade_level_id' => $r->grade_level_id,
                    ])->values(),
                ];
            });

        // return response()->json([
        //     'room' => [
        //         'id' => $room->id,
        //         'room_name' => $room->room_name,
        //         'capacity' => $room->capacity,
        //     ],
        //     'schedules' => $schedules,
        //     'gradeLevels' => $gradeLevels,
        //     'classSections' => $classSections,
        //     'subjects' => $subjects,
        //     'teachers' => $teachers,
        //     'teacherSubjects' => $teacherSubjects,
        // ]);
        return response()->json($this->buildRoomScheduleData($id));
    }

    public function checkRoomNumber(Request $request)
    {
        $roomNumber = $request->input('room_name');
        $roomId = $request->input('room_id');

        $query = Room::where('room_name', $roomNumber);

        if ($roomId) {
            $query->where('id', '!=', $roomId);
        }

        $exists = $query->exists();

        return response()->json([
            'available' => !$exists,
            'message' => $exists ? 'This room number is already taken.' : 'Room number is available.'
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'room_name' => 'required|string|unique:tbl_room,room_name',
            'capacity' => 'required|integer|min:1',
            'status' => 'required|in:Available,Vacant,Occupied',
            'section_id' => 'nullable|exists:tbl_class_sections,id',
        ]);

        $room = Room::create([
            'room_name' => $validated['room_name'],
            'capacity' => $validated['capacity'],
            'status' => $validated['status'],
        ]);

        // If a section is provided, assign this room to the section
        if (!empty($validated['section_id'])) {
            \App\Models\ClassSection::where('id', $validated['section_id'])->update(['room_id' => $room->id]);
        }

        return redirect()->route('admin.enrollment.schedule-management')->with('success', 'Room created successfully');
    }

    public function update(Request $request, $id)
    {
        $room = Room::findOrFail($id);

        $validated = $request->validate([
            'room_name' => 'required|string|unique:tbl_room,room_name,' . $id,
            'capacity' => 'required|integer|min:1',
            'status' => 'required|in:Available,Vacant,Occupied',
            'section_id' => 'nullable|exists:tbl_class_sections,id',
        ]);

        $room->update([
            'room_name' => $validated['room_name'],
            'capacity' => $validated['capacity'],
            'status' => $validated['status'],
        ]);

        // Handle section assignment
        // First, unassign this room from any section that currently has it
        \App\Models\ClassSection::where('room_id', $room->id)->update(['room_id' => null]);

        // Then, if a section is provided, assign this room to that section
        if (!empty($validated['section_id'])) {
            \App\Models\ClassSection::where('id', $validated['section_id'])->update(['room_id' => $room->id]);
        }

        return redirect()->route('admin.enrollment.schedule-management')->with('success', 'Room updated successfully');
    }

    public function destroy($id)
    {
        $room = Room::findOrFail($id);
        $room->archiveWithMetadata('Room deleted');

        return redirect()->back()->with('success', 'Room archived successfully');
    }
}