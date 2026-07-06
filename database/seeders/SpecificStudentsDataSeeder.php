<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SpecificStudentsDataSeeder extends Seeder
{
    /**
     * Updates grades and clearances for ALL Grade 10 students:
     * 
     * - If grades/clearances exist: updates them
     * - If grades/clearances don't exist: creates them based on student's section schedules
     * - Grades for ALL subjects: Q1-Q4 complete with final grade and "Passed"
     * - All clearances: 'cleared' for ALL subjects
     */
    public function run(): void
    {
        $this->command->info('Starting to process data for Grade 10 students...');

        // Get Grade 10 grade level
        $grade10 = DB::table('tbl_grade_levels')->where('name', 'Grade 10')->first();
        
        if (!$grade10) {
            $this->command->error('Grade 10 not found in grade levels.');
            return;
        }

        $this->command->info("Found Grade 10 (ID: {$grade10->id})");

        // Get all students in Grade 10
        $students = DB::table('tbl_students')
            ->where('current_grade_level_id', $grade10->id)
            ->get();

        if ($students->isEmpty()) {
            $this->command->error('No Grade 10 students found.');
            return;
        }

        $this->command->info("Found {$students->count()} Grade 10 students.");

        $gradesCreated = 0;
        $gradesUpdated = 0;
        $clearancesCreated = 0;
        $clearancesUpdated = 0;

        foreach ($students as $student) {
            $this->command->info("Processing student: {$student->first_name} {$student->last_name} (LRN: {$student->lrn})");

            $studentGradesCreated = 0;
            $studentGradesUpdated = 0;
            $studentClearancesCreated = 0;
            $studentClearancesUpdated = 0;

            // Get schedules for the student's section to know what subjects they should have
            $schedules = DB::table('tbl_schedules')
                ->where('class_section_id', $student->current_section_id)
                ->get();

            if ($schedules->isEmpty()) {
                $this->command->warn("  No schedules found for section ID: {$student->current_section_id}");
                continue;
            }

            // Get unique subject-teacher combinations
            $processedGrades = [];
            
            foreach ($schedules as $schedule) {
                $gradeKey = "{$schedule->subject_id}-{$schedule->teacher_id}";
                
                // Skip if we already processed this subject-teacher combination
                if (in_array($gradeKey, $processedGrades)) {
                    continue;
                }
                $processedGrades[] = $gradeKey;

                // ========== GRADES ==========
                $existingGrade = DB::table('tbl_grades')
                    ->where('student_id', $student->id)
                    ->where('subject_id', $schedule->subject_id)
                    ->where('class_section_id', $student->current_section_id)
                    ->where('school_year', $student->school_year)
                    ->where('teacher_id', $schedule->teacher_id)
                    ->first();

                // Generate good grades (85-95 range) for ALL quarters
                $quarter1 = rand(85, 95);
                $quarter2 = rand(85, 95);
                $quarter3 = rand(85, 95);
                $quarter4 = rand(85, 95);
                $finalGrade = round(($quarter1 + $quarter2 + $quarter3 + $quarter4) / 4, 2);
                $remarks = 'Passed';

                if ($existingGrade) {
                    DB::table('tbl_grades')
                        ->where('id', $existingGrade->id)
                        ->update([
                            'quarter_1' => $quarter1,
                            'quarter_2' => $quarter2,
                            'quarter_3' => $quarter3,
                            'quarter_4' => $quarter4,
                            'final_grade' => $finalGrade,
                            'remarks' => $remarks,
                            'updated_at' => now(),
                        ]);
                    $gradesUpdated++;
                    $studentGradesUpdated++;
                } else {
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
                        'final_grade' => $finalGrade,
                        'remarks' => $remarks,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    $gradesCreated++;
                    $studentGradesCreated++;
                }
            }

            // ========== CLEARANCES ==========
            // Group schedules by subject to handle clearances (one per subject)
            $subjectTeachers = [];
            foreach ($schedules as $schedule) {
                if (!isset($subjectTeachers[$schedule->subject_id])) {
                    $subjectTeachers[$schedule->subject_id] = [];
                }
                if (!in_array($schedule->teacher_id, $subjectTeachers[$schedule->subject_id])) {
                    $subjectTeachers[$schedule->subject_id][] = $schedule->teacher_id;
                }
            }

            foreach ($subjectTeachers as $subjectId => $teacherIds) {
                // Check if clearance exists for this subject
                $existingClearance = DB::table('tbl_clearances')
                    ->where('student_id', $student->id)
                    ->where('subject_id', $subjectId)
                    ->where('class_section_id', $student->current_section_id)
                    ->where('school_year', $student->school_year)
                    ->first();

                // ALL clearances are set to 'cleared'
                $clearanceStatus = 'cleared';
                $assignedTeacherId = $teacherIds[0];

                if ($existingClearance) {
                    DB::table('tbl_clearances')
                        ->where('id', $existingClearance->id)
                        ->update([
                            'teacher_id' => $assignedTeacherId,
                            'status' => $clearanceStatus,
                            'updated_at' => now(),
                        ]);
                    $clearancesUpdated++;
                    $studentClearancesUpdated++;
                } else {
                    DB::table('tbl_clearances')->insert([
                        'student_id' => $student->id,
                        'teacher_id' => $assignedTeacherId,
                        'subject_id' => $subjectId,
                        'class_section_id' => $student->current_section_id,
                        'school_year' => $student->school_year,
                        'status' => $clearanceStatus,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    $clearancesCreated++;
                    $studentClearancesCreated++;
                }
            }

            $this->command->info("  ✓ Grades: {$studentGradesCreated} created, {$studentGradesUpdated} updated");
            $this->command->info("  ✓ Clearances: {$studentClearancesCreated} created, {$studentClearancesUpdated} updated");
        }

        $this->command->info('');
        $this->command->info('✓ Processing completed successfully!');
        $this->command->info("  Total grades created: {$gradesCreated}");
        $this->command->info("  Total grades updated: {$gradesUpdated}");
        $this->command->info("  Total clearances created: {$clearancesCreated}");
        $this->command->info("  Total clearances updated: {$clearancesUpdated}");
        $this->command->info("  All Grade 10 students have complete Q1-Q4 grades and all clearances are 'cleared'");
    }
}
