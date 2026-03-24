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
        $schedules = Schedule::with([
            'classSection.gradeLevel',
            'subject',
            'teacher',
            'room'
        ])->get()->map(function ($schedule) {
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
                'teacher' => $schedule->teacher->name ?? 'N/A',
                'teacher_id' => $schedule->teacher_id,
                'class_section_id' => $schedule->class_section_id,
            ];
        });

        $classSections = ClassSection::withCount('students')
        ->with('gradeLevel')->get()->map(function ($section) {
            return [
                'id' => $section->id,
                'name' => $section->section_name,
                'grade_level' => $section->gradeLevel->name ?? 'N/A',
                'grade_level_id' => $section->grade_level_id,
                'student_count' => $section->students_count,
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

        $teachers = Teacher::all()->map(function ($teacher) {
            return [
                'id' => $teacher->id,
                'name' => $teacher->name,
            ];
        });

        // Get teacher-subject assignments with grade level info
        $teacherSubjects = DB::table('tbl_teacher_subjects')
            ->join('tbl_subjects', 'tbl_teacher_subjects.subject_id', '=', 'tbl_subjects.id')
            ->join('tbl_teachers', 'tbl_teacher_subjects.teacher_id', '=', 'tbl_teachers.id')
            ->select(
                'tbl_teacher_subjects.teacher_id',
                'tbl_teacher_subjects.subject_id',
                'tbl_subjects.name as subject_name',
                'tbl_subjects.grade_level_id',
                'tbl_teachers.name as teacher_name'
            )
            ->get();

        // Group by teacher_id and include grade levels they teach
        $teacherSubjectsGrouped = $teacherSubjects->groupBy('teacher_id')->map(function ($assignments) {
            $gradeLevels = $assignments->pluck('grade_level_id')->unique()->values();
            $subjects = $assignments->map(function ($assignment) {
                return [
                    'subject_id' => $assignment->subject_id,
                    'subject_name' => $assignment->subject_name,
                    'grade_level_id' => $assignment->grade_level_id,
                ];
            })->values();
            
            return [
                'grade_levels' => $gradeLevels,
                'subjects' => $subjects,
            ];
        });

        $rooms = Room::all()->map(function ($room) {
            return [
                'id' => $room->id,
                'name' => $room->room_number,
                'capacity' => $room->capacity,
            ];
        });

        return Inertia::render('admin/enrollment/load-scheduling/page', [
            'schedules' => $schedules,
            'classSections' => $classSections,
            'gradeLevels' => $gradeLevels,
            'subjects' => $subjects,
            'teachers' => $teachers,
            'teacherSubjects' => $teacherSubjectsGrouped,
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
            'day_of_week' => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
        ]);

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

        return redirect()->back()->with('success', 'Schedule created successfully');
    }

    public function update(Request $request, Schedule $schedule)
    {
        $validated = $request->validate([
            'class_section_id' => 'required|exists:tbl_class_sections,id',
            'subject_id' => 'required|exists:tbl_subjects,id',
            'teacher_id' => 'required|exists:tbl_teachers,id',
            'room_id' => 'nullable|exists:tbl_room,id',
            'day_of_week' => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
        ]);

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
        $schedules = Schedule::with([
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

        return Inertia::render('admin/enrollment/room-schedule/page', [
            'schedules' => $schedules,
        ]);
    }
}
