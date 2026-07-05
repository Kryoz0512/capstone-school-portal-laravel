<?php

namespace App\Http\Controllers;

use App\Models\Schedule;
use App\Models\ClassSection;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Carbon;

class ScheduleController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search', '');
        $specialization = $request->input('specialization', 'all');
        $position = $request->input('position', 'all');
        $perPage = (int) $request->input('per_page', 10);

        $teachers = Teacher::withCount('schedules')
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
                'schedules_count' => $teacher->schedules_count,
            ]);

        $specializations = Teacher::select('subject')->distinct()->orderBy('subject')->pluck('subject');
        $positions = Teacher::select('position')->distinct()->orderBy('position')->pluck('position');

        return Inertia::render('admin/enrollment/load-scheduling/page', [
            'teachers' => $teachers,
            'specializations' => $specializations,
            'positions' => $positions,
            'filters' => [
                'search' => $search,
                'specialization' => $specialization,
                'position' => $position,
            ],
        ]);
    }

    public function show($id)
    {
        $teacher = Teacher::findOrFail($id);

        // Get teacher's schedules
        $schedules = Schedule::where('teacher_id', $id)
            ->with(['classSection.gradeLevel', 'subject', 'room'])
            ->get()
            ->map(function ($schedule) use ($teacher) {
                return [
                    'id' => $schedule->id,
                    'grade' => $schedule->classSection->gradeLevel->name ?? 'N/A',
                    'section' => $schedule->classSection->section_name ?? 'N/A',
                    'day' => $schedule->day_of_week,
                    'start_time' => Carbon::parse($schedule->start_time)->format('g:i A'),
                    'end_time' => Carbon::parse($schedule->end_time)->format('g:i A'),
                    'room' => $schedule->room ? $schedule->room->room_name : 'N/A',
                    'room_id' => $schedule->room_id,
                    'subject' => $schedule->subject->name ?? 'N/A',
                    'subject_id' => $schedule->subject_id,
                    'class_section_id' => $schedule->class_section_id,
                    'teacher' => $teacher->name,
                ];
            });

        // Get data for adding new schedules
        $classSections = ClassSection::with('gradeLevel')->get()->map(function ($section) {
            return [
                'id' => $section->id,
                'name' => $section->section_name,
                'grade_level' => $section->gradeLevel->name ?? 'N/A',
                'grade_level_id' => $section->grade_level_id,
                'room_id' => $section->room_id,
            ];
        });

        $gradeLevels = \App\Models\GradeLevel::get()->map(function ($gradeLevel) {
            return [
                'id' => $gradeLevel->id,
                'name' => $gradeLevel->name,
            ];
        });

        $subjects = Subject::with('gradeLevel')->get()->map(function ($subject) {
            return [
                'id' => $subject->id,
                'name' => $subject->name,
                'grade_level_id' => $subject->grade_level_id,
            ];
        });

        $rooms = Room::all()->map(function ($room) {
            return [
                'id' => $room->id,
                'name' => $room->room_name,
            ];
        });

        $admin = \App\Models\Admin::where('user_id', \Illuminate\Support\Facades\Auth::id())->first();

        return Inertia::render('admin/enrollment/load-scheduling/show', [
            'teacher' => [
                'id' => $teacher->id,
                'name' => $teacher->name,
                'employee_number' => $teacher->employee_number,
                'subject' => $teacher->subject,
                'position' => $teacher->position,
            ],
            'schedules' => $schedules,
            'classSections' => $classSections,
            'gradeLevels' => $gradeLevels,
            'subjects' => $subjects,
            'rooms' => $rooms,
        ]);
    }

    public function create($teacherId)
    {
        $teacher = Teacher::findOrFail($teacherId);

        $classSections = ClassSection::with('gradeLevel')->get()->map(function ($section) {
            return [
                'id' => $section->id,
                'name' => $section->section_name,
                'grade_level' => $section->gradeLevel->name ?? 'N/A',
                'grade_level_id' => $section->grade_level_id,
                'room_id' => $section->room_id,
            ];
        });

        $gradeLevels = \App\Models\GradeLevel::get()->map(function ($gradeLevel) {
            return [
                'id' => $gradeLevel->id,
                'name' => $gradeLevel->name,
            ];
        });

        $subjects = Subject::with('gradeLevel')->get()->map(function ($subject) {
            return [
                'id' => $subject->id,
                'name' => $subject->name,
                'code' => $subject->code,
                'grade_level_id' => $subject->grade_level_id,
            ];
        });

        $rooms = Room::all()->map(function ($room) {
            return [
                'id' => $room->id,
                'name' => $room->room_name,
            ];
        });

        $admin = \App\Models\Admin::where('user_id', \Illuminate\Support\Facades\Auth::id())->first();

        return Inertia::render('admin/enrollment/load-scheduling/create', [
            'teacher' => [
                'id' => $teacher->id,
                'name' => $teacher->name,
            ],
            'classSections' => $classSections,
            'gradeLevels' => $gradeLevels,
            'subjects' => $subjects,
            'rooms' => $rooms,
        ]);
    }

    public function edit($scheduleId)
    {
        $schedule = Schedule::with(['teacher', 'classSection.gradeLevel', 'subject', 'room'])->findOrFail($scheduleId);

        $classSections = ClassSection::with('gradeLevel')->get()->map(function ($section) {
            return [
                'id' => $section->id,
                'name' => $section->section_name,
                'grade_level' => $section->gradeLevel->name ?? 'N/A',
                'grade_level_id' => $section->grade_level_id,
            ];
        });

        $gradeLevels = \App\Models\GradeLevel::get()->map(function ($gradeLevel) {
            return [
                'id' => $gradeLevel->id,
                'name' => $gradeLevel->name,
            ];
        });

        $subjects = Subject::with('gradeLevel')->get()->map(function ($subject) {
            return [
                'id' => $subject->id,
                'name' => $subject->name,
                'grade_level_id' => $subject->grade_level_id,
            ];
        });

        $rooms = Room::all()->map(function ($room) {
            return [
                'id' => $room->id,
                'name' => $room->room_name,
            ];
        });

        $admin = \App\Models\Admin::where('user_id', \Illuminate\Support\Facades\Auth::id())->first();

        return Inertia::render('admin/enrollment/load-scheduling/edit', [
            'schedule' => [
                'id' => $schedule->id,
                'class_section_id' => $schedule->class_section_id,
                'class_section_name' => $schedule->classSection->section_name ?? '',
                'subject_id' => $schedule->subject_id,
                'subject_name' => $schedule->subject->name ?? '',
                'teacher_id' => $schedule->teacher_id,
                'room_id' => $schedule->room_id,
                'room_name' => $schedule->room ? $schedule->room->room_name : '',
                'grade_level_id' => $schedule->classSection->grade_level_id ?? null,
                'day' => $schedule->day_of_week,
                'start_time' => $schedule->start_time ? Carbon::parse($schedule->start_time)->format('H:i') : '',
                'end_time' => $schedule->end_time ? Carbon::parse($schedule->end_time)->format('H:i') : '',
            ],
            'teacher' => [
                'id' => $schedule->teacher->id,
                'name' => $schedule->teacher->name,
            ],
            'classSections' => $classSections,
            'gradeLevels' => $gradeLevels,
            'subjects' => $subjects,
            'rooms' => $rooms,
        ]);
    }

    public function store(Request $request)
    {
        $isApi = !$request->header('X-Inertia');

        $validated = $request->validate([
            'class_section_id' => 'required|exists:tbl_class_sections,id',
            'subject_id' => 'required|exists:tbl_subjects,id',
            'teacher_id' => 'required|exists:tbl_teachers,id',
            'room_id' => 'nullable|exists:tbl_room,id',
            'day' => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'start_time' => 'required',
            'end_time' => 'required',
        ]);

        $validated['day_of_week'] = $validated['day'];
        unset($validated['day']);

        if (!str_contains($validated['start_time'], ':')) {
            return $this->scheduleError($isApi, 'start_time', 'Invalid time format');
        }
        if (!str_contains($validated['end_time'], ':')) {
            return $this->scheduleError($isApi, 'end_time', 'Invalid time format');
        }

        $teacherConflict = Schedule::where('teacher_id', $validated['teacher_id'])
            ->where('day_of_week', $validated['day_of_week'])
            ->where(function ($query) use ($validated) {
                $query->where('start_time', '<', $validated['end_time'])
                    ->where('end_time', '>', $validated['start_time']);
            })
            ->with(['teacher', 'classSection.gradeLevel', 'subject'])
            ->first();

        if ($teacherConflict) {
            $conflictTime = \Carbon\Carbon::parse($teacherConflict->start_time)->format('g:i A') . ' - ' . \Carbon\Carbon::parse($teacherConflict->end_time)->format('g:i A');
            return $this->scheduleError($isApi, 'start_time', "Teacher {$teacherConflict->teacher->name} already has a class scheduled on {$validated['day_of_week']} at {$conflictTime} ({$teacherConflict->subject->name} - {$teacherConflict->classSection->gradeLevel->name} {$teacherConflict->classSection->section_name}).");
        }

        if ($validated['room_id']) {
            $roomConflict = Schedule::where('room_id', $validated['room_id'])
                ->where('day_of_week', $validated['day_of_week'])
                ->where(function ($query) use ($validated) {
                    $query->where('start_time', '<', $validated['end_time'])
                        ->where('end_time', '>', $validated['start_time']);
                })
                ->with(['room', 'classSection.gradeLevel', 'subject'])
                ->first();

            if ($roomConflict) {
                $conflictTime = \Carbon\Carbon::parse($roomConflict->start_time)->format('g:i A') . ' - ' . \Carbon\Carbon::parse($roomConflict->end_time)->format('g:i A');
                return $this->scheduleError($isApi, 'start_time', "Room {$roomConflict->room->room_name} is already occupied on {$validated['day_of_week']} at {$conflictTime} ({$roomConflict->subject->name} - {$roomConflict->classSection->gradeLevel->name} {$roomConflict->classSection->section_name}).");
            }
        }

        $sectionConflict = Schedule::where('class_section_id', $validated['class_section_id'])
            ->where('day_of_week', $validated['day_of_week'])
            ->where(function ($query) use ($validated) {
                $query->where('start_time', '<', $validated['end_time'])
                    ->where('end_time', '>', $validated['start_time']);
            })
            ->with(['classSection.gradeLevel', 'subject', 'teacher'])
            ->first();

        if ($sectionConflict) {
            $conflictTime = \Carbon\Carbon::parse($sectionConflict->start_time)->format('g:i A') . ' - ' . \Carbon\Carbon::parse($sectionConflict->end_time)->format('g:i A');
            return $this->scheduleError($isApi, 'start_time', "Section {$sectionConflict->classSection->gradeLevel->name} {$sectionConflict->classSection->section_name} already has a class scheduled on {$validated['day_of_week']} at {$conflictTime} ({$sectionConflict->subject->name} with {$sectionConflict->teacher->name}).");
        }

        if ($validated['room_id']) {
            $room = Room::find($validated['room_id']);
            $section = ClassSection::find($validated['class_section_id']);
            $studentCount = $section->students()->count();

            if ($studentCount > $room->capacity) {
                return $this->scheduleError($isApi, 'room_id', "Room capacity exceeded. Room capacity: {$room->capacity}, Section has {$studentCount} students.");
            }
        }

        $schedule = Schedule::create($validated);

        if ($isApi) {
            return response()->json(['success' => true, 'schedule_id' => $schedule->id]);
        }

        return redirect()->route('admin.enrollment.load-scheduling')->with('success', 'Schedule created successfully');
    }

    public function update(Request $request, Schedule $schedule)
    {
        $isApi = !$request->header('X-Inertia');

        $validated = $request->validate([
            'class_section_id' => 'required|exists:tbl_class_sections,id',
            'subject_id' => 'required|exists:tbl_subjects,id',
            'teacher_id' => 'required|exists:tbl_teachers,id',
            'room_id' => 'nullable|exists:tbl_room,id',
            'day_of_week' => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
        ]);

        $teacherConflict = Schedule::where('teacher_id', $validated['teacher_id'])
            ->where('day_of_week', $validated['day_of_week'])
            ->where('id', '!=', $schedule->id)
            ->where(function ($query) use ($validated) {
                $query->where(function ($q) use ($validated) {
                    $q->where('start_time', '<', $validated['end_time'])
                        ->where('end_time', '>', $validated['start_time']);
                });
            })
            ->with(['teacher', 'classSection.gradeLevel', 'subject'])
            ->first();

        if ($teacherConflict) {
            $conflictTime = \Carbon\Carbon::parse($teacherConflict->start_time)->format('g:i A') . ' - ' . \Carbon\Carbon::parse($teacherConflict->end_time)->format('g:i A');
            return $this->scheduleError($isApi, 'start_time', "Teacher {$teacherConflict->teacher->name} already has a class scheduled on {$validated['day_of_week']} at {$conflictTime} ({$teacherConflict->subject->name} - {$teacherConflict->classSection->gradeLevel->name} {$teacherConflict->classSection->section_name}).");
        }

        if ($validated['room_id']) {
            $roomConflict = Schedule::where('room_id', $validated['room_id'])
                ->where('day_of_week', $validated['day_of_week'])
                ->where('id', '!=', $schedule->id)
                ->where(function ($query) use ($validated) {
                    $query->where(function ($q) use ($validated) {
                        $q->where('start_time', '<', $validated['end_time'])
                            ->where('end_time', '>', $validated['start_time']);
                    });
                })
                ->with(['room', 'classSection.gradeLevel', 'subject'])
                ->first();

            if ($roomConflict) {
                $conflictTime = \Carbon\Carbon::parse($roomConflict->start_time)->format('g:i A') . ' - ' . \Carbon\Carbon::parse($roomConflict->end_time)->format('g:i A');
                return $this->scheduleError($isApi, 'start_time', "Room {$roomConflict->room->room_name} is already occupied on {$validated['day_of_week']} at {$conflictTime} ({$roomConflict->subject->name} - {$roomConflict->classSection->gradeLevel->name} {$roomConflict->classSection->section_name}).");
            }
        }

        $sectionConflict = Schedule::where('class_section_id', $validated['class_section_id'])
            ->where('day_of_week', $validated['day_of_week'])
            ->where('id', '!=', $schedule->id)
            ->where(function ($query) use ($validated) {
                $query->where(function ($q) use ($validated) {
                    $q->where('start_time', '<', $validated['end_time'])
                        ->where('end_time', '>', $validated['start_time']);
                });
            })
            ->with(['classSection.gradeLevel', 'subject', 'teacher'])
            ->first();

        if ($sectionConflict) {
            $conflictTime = \Carbon\Carbon::parse($sectionConflict->start_time)->format('g:i A') . ' - ' . \Carbon\Carbon::parse($sectionConflict->end_time)->format('g:i A');
            return $this->scheduleError($isApi, 'start_time', "Section {$sectionConflict->classSection->gradeLevel->name} {$sectionConflict->classSection->section_name} already has a class scheduled on {$validated['day_of_week']} at {$conflictTime} ({$sectionConflict->subject->name} with {$sectionConflict->teacher->name}).");
        }

        if ($validated['room_id']) {
            $room = Room::find($validated['room_id']);
            $section = ClassSection::find($validated['class_section_id']);
            $studentCount = $section->students()->count();

            if ($studentCount > $room->capacity) {
                return $this->scheduleError($isApi, 'room_id', "Room capacity exceeded. Room capacity: {$room->capacity}, Section has {$studentCount} students.");
            }
        }

        $schedule->update($validated);

        if ($isApi) {
            return response()->json(['success' => true]);
        }

        return redirect()->back()->with('success', 'Schedule updated successfully');
    }

    public function destroy(Request $request, Schedule $schedule)
    {
        $schedule->delete();

        if (!$request->header('X-Inertia')) {
            return response()->json(['success' => true]);
        }

        return redirect()->back()->with('success', 'Schedule deleted successfully');
    }

    public function roomSchedule(Request $request)
    {
        $search = $request->input('search', '');
        $perPage = (int) $request->input('per_page', 10);

        $rooms = Room::withCount('schedules')
            ->when($search, fn($q) => $q->where('room_name', 'like', "%{$search}%"))
            ->orderBy('room_name')
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn($room) => [
                'id' => $room->id,
                'room_name' => $room->room_name,
                'capacity' => $room->capacity,
                'schedules_count' => $room->schedules_count,
            ]);

        return Inertia::render('admin/enrollment/room-schedule/page', [
            'rooms' => $rooms,
            'filters' => ['search' => $search],
        ]);
    }

    public function showRoomSchedule($roomId)
    {
        $room = Room::findOrFail($roomId);

        $schedules = Schedule::where('room_id', $roomId)
            ->with([
                'classSection.gradeLevel',
                'subject',
                'teacher',
                'room'
            ])->get()->map(function ($schedule) {
                return [
                    'id' => $schedule->id,
                    'room' => $schedule->room ? $schedule->room->room_name : 'N/A',
                    'subject' => $schedule->subject->name ?? 'N/A',
                    'teacher' => $schedule->teacher->name ?? 'N/A',
                    'day' => $schedule->day_of_week,
                    'time' => \Carbon\Carbon::parse($schedule->start_time)->format('g:i A') . ' - ' . \Carbon\Carbon::parse($schedule->end_time)->format('g:i A'),
                    'section' => $schedule->classSection->section_name ?? 'N/A',
                    'gradeLevel' => $schedule->classSection->gradeLevel->name ?? 'N/A',
                ];
            });

        $admin = \App\Models\Admin::where('user_id', \Illuminate\Support\Facades\Auth::id())->first();

        return Inertia::render('admin/enrollment/room-schedule/show', [
            'room' => [
                'id' => $room->id,
                'room_name' => $room->room_name,
                'capacity' => $room->capacity,
            ],
            'schedules' => $schedules,
        ]);
    }

    private function scheduleError(bool $isApi, string $field, string $message)
    {
        if ($isApi) {
            return response()->json(['errors' => [$field => [$message]]], 422);
        }

        return redirect()->back()->withErrors([$field => $message])->withInput();
    }
}
