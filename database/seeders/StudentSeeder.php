<?php

namespace Database\Seeders;

use App\Models\ClassSection;
use App\Models\Student;
use Database\Seeders\Concerns\SeederHelpers;
use Illuminate\Database\Seeder;

class StudentSeeder extends Seeder
{
    use SeederHelpers;

    private int $lrnSequence = 105261187000;

    public function run(): void
    {
        $schoolYear = $this->activeSchoolYear();
        $sections = ClassSection::with('gradeLevel')->orderBy('id')->get();
        $totalStudents = 0;

        foreach ($sections as $section) {
            $gradeNumber = $this->gradeNumberFromLevelName($section->gradeLevel->name);

            for ($i = 1; $i <= 50; $i++) {
                $name = $this->randomFilipinoName();
                $lrn = (string) $this->lrnSequence++;
                $fullName = trim(implode(' ', array_filter([
                    $name['first_name'],
                    $name['middle_name'],
                    $name['last_name'],
                    $name['suffix'],
                ])));

                $user = $this->createUser($fullName, "SNHS-{$lrn}", 'student', 'student123');

                Student::updateOrCreate(
                    ['lrn' => $lrn],
                    [
                        'user_id' => $user->id,
                        'student_status' => $this->randomStudentStatus(),
                        'school_year' => $schoolYear,
                        'last_name' => $name['last_name'],
                        'first_name' => $name['first_name'],
                        'middle_name' => $name['middle_name'],
                        'suffix' => $name['suffix'],
                        'gender' => $name['gender'],
                        'current_grade_level_id' => $section->grade_level_id,
                        'current_section_id' => $section->id,
                        'birth_date' => $this->birthDateForGrade($gradeNumber),
                        'has_psa_birth_certificate' => fake()->boolean(85),
                        'has_sf9' => fake()->boolean(75),
                        'has_report_card' => fake()->boolean(90),
                        'has_good_moral' => fake()->boolean(80),
                        'ready_to_graduate' => false,
                        'is_valid' => true,
                        'invalid_reason' => null,
                        'archived_by' => null,
                        'archive_reason' => null,
                        'purged_at' => null,
                    ]
                );

                $totalStudents++;
            }
        }

        $this->command?->info("Students seeded: {$totalStudents}");
    }

    /**
     * Return a student_status weighted 30% new, 30% transferee, 40% old.
     */
    private function randomStudentStatus(): string
    {
        return fake()->randomElement([
            ...array_fill(0, 30, 'new'),
            ...array_fill(0, 30, 'transferee'),
            ...array_fill(0, 40, 'old'),
        ]);
    }
}