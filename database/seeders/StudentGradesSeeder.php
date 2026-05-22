<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StudentGradesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Seeds grades for students in Grade 7-10 with varying completion levels:
     * - Some students have all 4 quarters complete
     * - Some have partial quarters (1-3 quarters)
     * - Some have no grades yet
     */
    public function run(): void
    {
        $this->command->info('Starting to seed student grades for Grade 7-10...');

        // Get grade levels 7-10
        $gradeLevels = DB::table('tbl_grade_levels')
            ->whereIn('name', ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'])
            ->pluck('id');

        if ($gradeLevels->isEmpty()) {
            $this->command->error('No grade levels found for Grade 7-10.');
            return;
        }

        // Get students from Grade 7-10 who are assigned to sections
        $students = DB::table('tbl_students')
            ->whereIn('current_grade_level_id', $gradeLevels)
            ->whereNotNull('current_section_id')
            ->get();

        if ($students->isEmpty()) {
            $this->command->error('No students found in Grade 7-10 with assigned sections.');
            return;
        }

        $this->command->info("Found {$students->count()} students in Grade 7-10.");

        $gradesCreated = 0;
        $gradesSkipped = 0;

        foreach ($students as $student) {
            // Get schedules for the student's section
            $schedules = DB::table('tbl_schedules')
                ->where('class_section_id', $student->current_section_id)
                ->get();

            if ($schedules->isEmpty()) {
                $this->command->warn("No schedules found for student ID: {$student->id} (Section: {$student->current_section_id})");
                continue;
            }

            // Randomly decide how many quarters this student has completed
            // 60% chance: all 4 quarters complete
            // 20% chance: 3 quarters complete
            // 10% chance: 2 quarters complete
            // 5% chance: 1 quarter complete
            // 5% chance: no grades yet
            $rand = rand(1, 100);
            if ($rand <= 90) {
                $quartersCompleted = 4;
            } elseif ($rand <= 60) {
                $quartersCompleted = 3;
            } elseif ($rand <= 60) {
                $quartersCompleted = 2;
            } elseif ($rand <= 60) {
                $quartersCompleted = 1;
            } else {
                $quartersCompleted = 0;
            }

            // Skip if no grades to create
            if ($quartersCompleted === 0) {
                continue;
            }

            // Randomly decide if student is high, average, or struggling performer
            // 20% high performers (85-98)
            // 60% average performers (78-88)
            // 20% struggling performers (75-82, with some below 75)
            $performanceRand = rand(1, 100);
            if ($performanceRand <= 20) {
                $gradeRange = [91, 98]; // High performer
            } elseif ($performanceRand <= 80) {
                $gradeRange = [81, 90]; // Average performer
            } else {
                $gradeRange = [75, 80]; // Struggling performer (some may fail)
            }

            // Create grades for each subject in the schedule
            foreach ($schedules as $schedule) {
                // Check if grade already exists
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

                // Generate grades for completed quarters
                $quarter1 = $quartersCompleted >= 1 ? rand($gradeRange[0], $gradeRange[1]) : null;
                $quarter2 = $quartersCompleted >= 2 ? rand($gradeRange[0], $gradeRange[1]) : null;
                $quarter3 = $quartersCompleted >= 3 ? rand($gradeRange[0], $gradeRange[1]) : null;
                $quarter4 = $quartersCompleted >= 4 ? rand($gradeRange[0], $gradeRange[1]) : null;

                // Calculate final grade if all quarters are complete
                $finalGrade = null;
                $remarks = null;

                if ($quartersCompleted === 4) {
                    $finalGrade = ($quarter1 + $quarter2 + $quarter3 + $quarter4) / 4;
                    $remarks = $finalGrade >= 75 ? 'Passed' : 'Failed';
                }

                DB::table('tbl_grades')->insert([
                    'student_id' => $student->id,
                    'class_section_id' => $student->current_section_id,
                    'school_year' => $student->school_year,
                    'subject_id' => $schedule->subject_id,
                    'teacher_id' => $schedule->teacher_id,
                    'quarter_1' => $quarter1,
                    'quarter_2' => $quarter2,
                    'quarter_3' => $quarter3,
                    'quarter_4' => $quarter4,
                    'final_grade' => $finalGrade ? round($finalGrade, 2) : null,
                    'remarks' => $remarks,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $gradesCreated++;
            }
        }

        $this->command->info("✓ Student grades seeded successfully!");
        $this->command->info("  - Grades created: {$gradesCreated}");
        $this->command->info("  - Grades skipped (already exist): {$gradesSkipped}");
    }
}
