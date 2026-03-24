<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StudentGradesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the first student
        $student = DB::table('tbl_students')->first();
        
        if (!$student) {
            $this->command->error('No student found in the database.');
            return;
        }

        // Get the student's section
        if (!$student->current_section_id) {
            $this->command->error('Student does not have a section assigned.');
            return;
        }

        // Get subjects from the student's section schedules
        $schedules = DB::table('tbl_schedules')
            ->where('class_section_id', $student->current_section_id)
            ->get();

        if ($schedules->isEmpty()) {
            $this->command->error('No schedules found for the student\'s section.');
            return;
        }

        // Create grades for each subject
        foreach ($schedules as $schedule) {
            // Check if grade already exists
            $existingGrade = DB::table('tbl_grades')
                ->where('student_id', $student->id)
                ->where('subject_id', $schedule->subject_id)
                ->where('class_section_id', $student->current_section_id)
                ->where('school_year', $student->school_year)
                ->first();

            if ($existingGrade) {
                $this->command->info("Grade already exists for subject ID: {$schedule->subject_id}");
                continue;
            }

            // Generate random grades between 75-95
            $quarter1 = rand(75, 95);
            $quarter2 = rand(75, 95);
            $quarter3 = rand(75, 95);
            $quarter4 = rand(75, 95);
            
            // Calculate final grade (average of all quarters)
            $finalGrade = ($quarter1 + $quarter2 + $quarter3 + $quarter4) / 4;
            
            // Determine remarks
            $remarks = $finalGrade >= 75 ? 'Passed' : 'Failed';

            DB::table('tbl_grades')->insert([
                'student_id' => $student->id,
                'class_section_id' => $student->current_section_id,
                'school_year' => $student->school_year,
                'enrollment_id' => null, // Not using enrollment_id anymore
                'subject_id' => $schedule->subject_id,
                'teacher_id' => $schedule->teacher_id,
                'quarter_1' => $quarter1,
                'quarter_2' => $quarter2,
                'quarter_3' => $quarter3,
                'quarter_4' => $quarter4,
                'final_grade' => round($finalGrade, 2),
                'remarks' => $remarks,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $this->command->info("Created grade for subject ID: {$schedule->subject_id}");
        }

        $this->command->info('Student grades seeded successfully!');
    }
}
