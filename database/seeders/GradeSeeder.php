<?php

namespace Database\Seeders;

use App\Models\ClassSection;
use App\Models\Grade;
use App\Models\Schedule;
use App\Models\Student;
use App\Models\Teacher;
use Database\Seeders\Concerns\SeederHelpers;
use Illuminate\Database\Seeder;

class GradeSeeder extends Seeder
{
    use SeederHelpers;

    public function run(): void
    {
        $shyrielle = Teacher::where('name', TeacherSeeder::SHYRIELLE_NAME)->firstOrFail();
        $schoolYear = $this->activeSchoolYear();
        $sections = ClassSection::orderBy('id')->get();
        $gradesCreated = 0;

        foreach ($sections as $section) {
            $englishSchedule = Schedule::where('class_section_id', $section->id)
                ->where('teacher_id', $shyrielle->id)
                ->whereHas('subject', fn ($q) => $q->where('name', 'English'))
                ->first();

            if (!$englishSchedule) {
                throw new \RuntimeException("No English schedule found for section ID {$section->id}");
            }

            $students = Student::where('current_section_id', $section->id)
                ->orderBy('id')
                ->take(5)
                ->get();

            if ($students->count() < 5) {
                throw new \RuntimeException("Section ID {$section->id} has fewer than 5 students.");
            }

            foreach ($students as $student) {
                $q1 = fake()->numberBetween(85, 95);
                $q2 = fake()->numberBetween(85, 95);
                $q3 = fake()->numberBetween(85, 95);
                $q4 = fake()->numberBetween(85, 95);
                $final = round(($q1 + $q2 + $q3 + $q4) / 4, 2);

                Grade::updateOrCreate(
                    [
                        'student_id' => $student->id,
                        'class_section_id' => $section->id,
                        'subject_id' => $englishSchedule->subject_id,
                        'school_year' => $schoolYear,
                        'teacher_id' => $shyrielle->id,
                    ],
                    [
                        'quarter_1' => $q1,
                        'quarter_2' => $q2,
                        'quarter_3' => $q3,
                        'quarter_4' => $q4,
                        'final_grade' => $final,
                        'remarks' => 'Passed',
                    ]
                );

                $gradesCreated++;
            }
        }

        $this->command?->info("Grades seeded (Ma'am Shyrielle): {$gradesCreated}");
    }
}