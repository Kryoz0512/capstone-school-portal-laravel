<?php

namespace Database\Seeders;

use App\Models\Grade;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StudentGradesSeeder extends Seeder
{
    /**
     * Seed tbl_grades for Grade 7–12 students using 3-term grading.
     *
     * Distribution per student:
     * - 60% all 3 terms complete (final grade + remarks set)
     * - 20% 2 terms complete
     * - 10% 1 term complete
     * - 10% no grades yet
     */
    public function run(): void
    {
        $this->command->info('Starting to seed student grades (3-term system) for Grade 7-12...');

        $gradeLevels = DB::table('tbl_grade_levels')
            ->whereIn('name', [
                'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
                'Grade 11', 'Grade 12',
            ])
            ->pluck('id');

        if ($gradeLevels->isEmpty()) {
            $this->command->error('No grade levels found for Grade 7-12.');
            return;
        }

        $students = DB::table('tbl_students')
            ->whereIn('current_grade_level_id', $gradeLevels)
            ->whereNotNull('current_section_id')
            ->get();

        if ($students->isEmpty()) {
            $this->command->error('No students found in Grade 7-12 with assigned sections.');
            return;
        }

        $this->command->info("Found {$students->count()} students in Grade 7-12.");

        $gradesCreated = 0;
        $gradesSkipped = 0;

        foreach ($students as $student) {
            $schedules = DB::table('tbl_schedules')
                ->where('class_section_id', $student->current_section_id)
                ->get();

            if ($schedules->isEmpty()) {
                $this->command->warn("No schedules found for student ID: {$student->id} (Section: {$student->current_section_id})");
                continue;
            }

            $termsCompleted = $this->randomTermsCompleted();

            if ($termsCompleted === 0) {
                continue;
            }

            $gradeRange = $this->randomGradeRange();

            foreach ($schedules as $schedule) {
                $existingGrade = DB::table('tbl_grades')
                    ->where('student_id', $student->id)
                    ->where('subject_id', $schedule->subject_id)
                    ->where('class_section_id', $student->current_section_id)
                    ->where('school_year', $student->school_year)
                    ->where('teacher_id', $schedule->teacher_id)
                    ->first();

                if ($existingGrade) {
                    $gradesSkipped++;
                    continue;
                }

                $term1 = $termsCompleted >= 1 ? rand($gradeRange[0], $gradeRange[1]) : null;
                $term2 = $termsCompleted >= 2 ? rand($gradeRange[0], $gradeRange[1]) : null;
                $term3 = $termsCompleted >= 3 ? rand($gradeRange[0], $gradeRange[1]) : null;

                [$finalGrade, $remarks] = $this->resolveFinalGradeAndRemarks($term1, $term2, $term3, $termsCompleted);

                DB::table('tbl_grades')->insert([
                    'student_id' => $student->id,
                    'class_section_id' => $student->current_section_id,
                    'school_year' => $student->school_year,
                    'subject_id' => $schedule->subject_id,
                    'teacher_id' => $schedule->teacher_id,
                    'term_1' => $term1,
                    'term_2' => $term2,
                    'term_3' => $term3,
                    'final_grade' => $finalGrade,
                    'remarks' => $remarks,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $gradesCreated++;
            }
        }

        $this->command->info('✓ Student grades seeded successfully!');
        $this->command->info("  - Grades created: {$gradesCreated}");
        $this->command->info("  - Grades skipped (already exist): {$gradesSkipped}");
    }

    private function randomTermsCompleted(): int
    {
        $rand = rand(1, 100);

        if ($rand <= 60) {
            return Grade::TERM_COUNT;
        }
        if ($rand <= 80) {
            return 2;
        }
        if ($rand <= 90) {
            return 1;
        }

        return 0;
    }

    /**
     * @return array{0: int, 1: int}
     */
    private function randomGradeRange(): array
    {
        $performanceRand = rand(1, 100);

        if ($performanceRand <= 20) {
            return [91, 98];
        }
        if ($performanceRand <= 80) {
            return [81, 90];
        }

        return [75, 80];
    }

    /**
     * Final grade and remarks are only set when all 3 terms are complete,
     * matching promotion / academic-record completion rules.
     *
     * @return array{0: float|null, 1: string|null}
     */
    private function resolveFinalGradeAndRemarks(?int $term1, ?int $term2, ?int $term3, int $termsCompleted): array
    {
        if ($termsCompleted !== Grade::TERM_COUNT || $term1 === null || $term2 === null || $term3 === null) {
            return [null, null];
        }

        $finalGrade = round(($term1 + $term2 + $term3) / Grade::TERM_COUNT, 2);

        return [$finalGrade, $finalGrade >= 75 ? 'Passed' : 'Failed'];
    }
}
