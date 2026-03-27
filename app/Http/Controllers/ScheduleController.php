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
    public function index()
    {
        // Get all teachers with their schedule count
        $teachers = Teacher::withCount('schedules')->get()->map(function ($teacher) {
            return [
                'id' => $teacher->id,
                'name' => $teacher->name,
                'employee_number' => $teacher->employee_number,
                'subject' => $teacher->subject,
                'position' => $teacher->position,
                'schedules_count' => $teacher->schedules_count,
            ];
        });

        return Inertia::render('admin/enrollment/load-scheduling/page', [
            'teachers' => $teachers,
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
                    'room' => $schedule->room ? $schedule->room->room_number : 'N/A',
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
                'name' => $room->room_number,
            ];
        });

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
                'name' => $room->room_number,
            ];
        });

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
                'name' => $room->room_number,
            ];
        });

        return Inertia::render('admin/enrollment/load-scheduling/edit', [
            'schedule' => [
                'id' => $schedule->id,
                'class_section_id' => $schedule->class_section_id,
                'class_section_name' => $schedule->classSection->section_name ?? '',
                'subject_id' => $schedule->subject_id,
                'subject_name' => $schedule->subject->name ?? '',
                'teacher_id' => $schedule->teacher_id,
                'room_id' => $schedule->room_id,
                'room_name' => $schedule->room ? $schedule->room->room_number : '',
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
        $validated = $request->validate([
            'class_section_id' => 'required|exists:tbl_class_sections,id',
            'subject_id' => 'required|exists:tbl_subjects,id',
            'teacher_id' => 'required|exists:tbl_teachers,id',
            'room_id' => 'nullable|exists:tbl_room,id',
            'day' => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'start_time' => 'required',
            'end_time' => 'required',
        ]);

        // Convert day to day_of_week for database
        $validated['day_of_week'] = $validated['day'];
        unset($validated['day']);

        // Ensure times are in correct format
        if (!str_contains($validated['start_time'], ':')) {
            return redirect()->back()->withErrors(['start_time' => 'Invalid time format'])->withInput();
        }
        if (!str_contains($validated['end_time'], ':')) {
            return redirect()->back()->withErrors(['end_time' => 'Invalid time format'])->withInput();
        }

        // Check for teacher schedule conflicts
        $teacherConflict = Schedule::where('teacher_id', $validated['teacher_id'])
            ->where('day_of_week', $validated['day_of_week'])
            ->where(function ($query) use ($validated) {
                // Check if new schedule overlaps with existing schedule
                // Overlap occurs if: (new_start < existing_end) AND (new_end > existing_start)
                $query->where('start_time', '<', $validated['end_time'])
                      ->where('end_time', '>', $validated['start_time']);
            })
            ->with(['teacher', 'classSection.gradeLevel', 'subject'])
            ->first();

        if ($teacherConflict) {
            $conflictTime = \Carbon\Carbon::parse($teacherConflict->start_time)->format('g:i A') . ' - ' . \Carbon\Carbon::parse($teacherConflict->end_time)->format('g:i A');
            return redirect()->back()->withErrors([
                'start_time' => "Teacher {$teacherConflict->teacher->name} already has a class scheduled on {$validated['day_of_week']} at {$conflictTime} ({$teacherConflict->subject->name} - {$teacherConflict->classSection->gradeLevel->name} {$teacherConflict->classSection->section_name})."
            ])->withInput();
        }

        // Check for room schedule conflicts
        if ($validated['room_id']) {
            $roomConflict = Schedule::where('room_id', $validated['room_id'])
                ->where('day_of_week', $validated['day_of_week'])
                ->where(function ($query) use ($validated) {
                    // Check if new schedule overlaps with existing schedule
                    $query->where('start_time', '<', $validated['end_time'])
                          ->where('end_time', '>', $validated['start_time']);
                })
                ->with(['room', 'classSection.gradeLevel', 'subject'])
                ->first();

            if ($roomConflict) {
                $conflictTime = \Carbon\Carbon::parse($roomConflict->start_time)->format('g:i A') . ' - ' . \Carbon\Carbon::parse($roomConflict->end_time)->format('g:i A');
                return redirect()->back()->withErrors([
                    'start_time' => "Room {$roomConflict->room->room_number} is already occupied on {$validated['day_of_week']} at {$conflictTime} ({$roomConflict->subject->name} - {$roomConflict->classSection->gradeLevel->name} {$roomConflict->classSection->section_name})."
                ])->withInput();
            }
        }

        // Check for section schedule conflicts
        $sectionConflict = Schedule::where('class_section_id', $validated['class_section_id'])
            ->where('day_of_week', $validated['day_of_week'])
            ->where(function ($query) use ($validated) {
                // Check if new schedule overlaps with existing schedule
                $query->where('start_time', '<', $validated['end_time'])
                      ->where('end_time', '>', $validated['start_time']);
            })
            ->with(['classSection.gradeLevel', 'subject', 'teacher'])
            ->first();

        if ($sectionConflict) {
            $conflictTime = \Carbon\Carbon::parse($sectionConflict->start_time)->format('g:i A') . ' - ' . \Carbon\Carbon::parse($sectionConflict->end_time)->format('g:i A');
            return redirect()->back()->withErrors([
                'start_time' => "Section {$sectionConflict->classSection->gradeLevel->name} {$sectionConflict->classSection->section_name} already has a class scheduled on {$validated['day_of_week']} at {$conflictTime} ({$sectionConflict->subject->name} with {$sectionConflict->teacher->name})."
            ])->withInput();
        }

        // Validate room capacity if room is selected
        if ($validated['room_id']) {
            $room = Room::find($validated['room_id']);
            $section = ClassSection::find($validated['class_section_id']);
            $studentCount = $section->students()->count();

            if ($studentCount > $room->capacity) {
                return redirect()->back()->withErrors([
                    'room_id' => "Room capacity exceeded. Room capacity: {$room->capacity}, Section has {$studentCount} students."
                ])->withInput();
            }
        }

        Schedule::create($validated);

        return redirect()->route('admin.enrollment.load-scheduling')->with('success', 'Schedule created successfully');
    }

    public function update(Request $request, Schedule $schedule)
    {
        $validated = $request->validate([
            'class_section_id' => 'required|exists:tbl_class_sections,id',
            'subject_id' => 'required|exists:tbl_subjects,id',
            'teacher_id' => 'required|exists:tbl_teachers,id',
            'room_id' => 'nullable|exists:tbl_room,id',
            'day_of_week' => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
        ]);

        // Check for teacher schedule conflicts (excluding current schedule)
        $teacherConflict = Schedule::where('teacher_id', $validated['teacher_id'])
            ->where('day_of_week', $validated['day_of_week'])
            ->where('id', '!=', $schedule->id)
            ->where(function ($query) use ($validated) {
                // Check if new schedule overlaps with existing schedule
                $query->where(function ($q) use ($validated) {
                    $q->where('start_time', '<', $validated['end_time'])
                      ->where('end_time', '>', $validated['start_time']);
                });
            })
            ->with(['teacher', 'classSection.gradeLevel', 'subject'])
            ->first();

        if ($teacherConflict) {
            $conflictTime = \Carbon\Carbon::parse($teacherConflict->start_time)->format('g:i A') . ' - ' . \Carbon\Carbon::parse($teacherConflict->end_time)->format('g:i A');
            return redirect()->back()->withErrors([
                'start_time' => "Teacher {$teacherConflict->teacher->name} already has a class scheduled on {$validated['day_of_week']} at {$conflictTime} ({$teacherConflict->subject->name} - {$teacherConflict->classSection->gradeLevel->name} {$teacherConflict->classSection->section_name})."
            ])->withInput();
        }

        // Check for room schedule conflicts (excluding current schedule)
        if ($validated['room_id']) {
            $roomConflict = Schedule::where('room_id', $validated['room_id'])
                ->where('day_of_week', $validated['day_of_week'])
                ->where('id', '!=', $schedule->id)
                ->where(function ($query) use ($validated) {
                    // Check if new schedule overlaps with existing schedule
                    $query->where(function ($q) use ($validated) {
                        $q->where('start_time', '<', $validated['end_time'])
                          ->where('end_time', '>', $validated['start_time']);
                    });
                })
                ->with(['room', 'classSection.gradeLevel', 'subject'])
                ->first();

            if ($roomConflict) {
                $conflictTime = \Carbon\Carbon::parse($roomConflict->start_time)->format('g:i A') . ' - ' . \Carbon\Carbon::parse($roomConflict->end_time)->format('g:i A');
                return redirect()->back()->withErrors([
                    'start_time' => "Room {$roomConflict->room->room_number} is already occupied on {$validated['day_of_week']} at {$conflictTime} ({$roomConflict->subject->name} - {$roomConflict->classSection->gradeLevel->name} {$roomConflict->classSection->section_name})."
                ])->withInput();
            }
        }

        // Check for section schedule conflicts (excluding current schedule)
        $sectionConflict = Schedule::where('class_section_id', $validated['class_section_id'])
            ->where('day_of_week', $validated['day_of_week'])
            ->where('id', '!=', $schedule->id)
            ->where(function ($query) use ($validated) {
                // Check if new schedule overlaps with existing schedule
                $query->where(function ($q) use ($validated) {
                    $q->where('start_time', '<', $validated['end_time'])
                      ->where('end_time', '>', $validated['start_time']);
                });
            })
            ->with(['classSection.gradeLevel', 'subject', 'teacher'])
            ->first();

        if ($sectionConflict) {
            $conflictTime = \Carbon\Carbon::parse($sectionConflict->start_time)->format('g:i A') . ' - ' . \Carbon\Carbon::parse($sectionConflict->end_time)->format('g:i A');
            return redirect()->back()->withErrors([
                'start_time' => "Section {$sectionConflict->classSection->gradeLevel->name} {$sectionConflict->classSection->section_name} already has a class scheduled on {$validated['day_of_week']} at {$conflictTime} ({$sectionConflict->subject->name} with {$sectionConflict->teacher->name})."
            ])->withInput();
        }

        // Validate room capacity if room is selected
        if ($validated['room_id']) {
            $room = Room::find($validated['room_id']);
            $section = ClassSection::find($validated['class_section_id']);
            $studentCount = $section->students()->count();

            if ($studentCount > $room->capacity) {
                return redirect()->back()->withErrors([
                    'room_id' => "Room capacity exceeded. Room capacity: {$room->capacity}, Section has {$studentCount} students."
                ])->withInput();
            }
        }

        $schedule->update($validated);

        return redirect()->back()->with('success', 'Schedule updated successfully');
    }

    public function destroy(Schedule $schedule)
    {
        $schedule->delete();

        return redirect()->back()->with('success', 'Schedule deleted successfully');
    }

    public function roomSchedule()
    {
        // Get all rooms with their schedule count
        $rooms = Room::withCount('schedules')->get()->map(function ($room) {
            return [
                'id' => $room->id,
                'room_number' => $room->room_number,
                'capacity' => $room->capacity,
                'schedules_count' => $room->schedules_count,
            ];
        });

        return Inertia::render('admin/enrollment/room-schedule/page', [
            'rooms' => $rooms,
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
                    'room' => $schedule->room ? $schedule->room->room_number : 'N/A',
                    'subject' => $schedule->subject->name ?? 'N/A',
                    'teacher' => $schedule->teacher->name ?? 'N/A',
                    'day' => $schedule->day_of_week,
                    'time' => \Carbon\Carbon::parse($schedule->start_time)->format('g:i A') . ' - ' . \Carbon\Carbon::parse($schedule->end_time)->format('g:i A'),
                    'section' => $schedule->classSection->section_name ?? 'N/A',
                    'gradeLevel' => $schedule->classSection->gradeLevel->name ?? 'N/A',
                ];
            });

        return Inertia::render('admin/enrollment/room-schedule/show', [
            'room' => [
                'id' => $room->id,
                'room_number' => $room->room_number,
                'capacity' => $room->capacity,
            ],
            'schedules' => $schedules,
        ]);
    }
}
