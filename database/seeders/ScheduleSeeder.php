<?php

namespace Database\Seeders;

use App\Models\ClassSection;
use App\Models\Schedule;
use App\Models\Subject;
use App\Models\Teacher;
use Illuminate\Database\Seeder;

class ScheduleSeeder extends Seeder
{
    /**
     * 5 subject teachers × 8 sections = 40 schedules.
     * Each section: Mon–Fri, one subject per day, staggered times.
     * No teacher/room/section overlaps.
     */
    private const SUBJECT_ORDER = [
        ['name' => 'English', 'day' => 'Monday'],
        ['name' => 'Mathematics', 'day' => 'Tuesday'],
        ['name' => 'Science', 'day' => 'Wednesday'],
        ['name' => 'Filipino', 'day' => 'Thursday'],
        ['name' => 'MAPEH', 'day' => 'Friday'],
    ];

    private const TIME_SLOTS = [
        '07:30:00', '08:30:00', '09:30:00', '10:30:00',
        '13:00:00', '13:30:00', '14:30:00', '15:30:00',
    ];

    public function run(): void
    {
        $coreTeachers = Teacher::whereIn('employee_number', [
            '100001', '100002', '100003', '100004', '100005',
        ])->get()->keyBy('subject');

        if ($coreTeachers->count() !== 5) {
            throw new \RuntimeException('ScheduleSeeder requires 5 core subject teachers.');
        }

        $sections = ClassSection::with(['gradeLevel', 'room'])->orderBy('id')->get();

        if ($sections->count() !== 8) {
            throw new \RuntimeException('ScheduleSeeder expects exactly 8 sections.');
        }

        foreach ($sections as $index => $section) {
            $timeSlot = self::TIME_SLOTS[$index];

            foreach (self::SUBJECT_ORDER as $entry) {
                $teacher = $coreTeachers->get($entry['name']);
                if (!$teacher) {
                    throw new \RuntimeException("Missing teacher for subject: {$entry['name']}");
                }

                $subject = Subject::where('grade_level_id', $section->grade_level_id)
                    ->where('name', $entry['name'])
                    ->firstOrFail();

                Schedule::updateOrCreate(
                    [
                        'class_section_id' => $section->id,
                        'subject_id' => $subject->id,
                    ],
                    [
                        'teacher_id' => $teacher->id,
                        'room_id' => $section->room_id,
                        'day_of_week' => $entry['day'],
                        'start_time' => $timeSlot,
                        'end_time' => $this->endTime($timeSlot),
                    ]
                );
            }
        }

        $this->command?->info('Schedules seeded: ' . Schedule::count());
    }

    private function endTime(string $startTime): string
    {
        [$hour, $minute] = array_map('intval', explode(':', $startTime));

        return sprintf('%02d:%02d:00', $hour + 1, $minute);
    }
}