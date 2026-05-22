<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ClearanceSeeder extends Seeder
{
    /**
     * Seeds clearance records for all assigned students.
     * Most subjects will be cleared, leaving 1–2 pending per student
     * to simulate a realistic near-complete clearance state.
     */
    public function run(): void
    {
        $this->command->info('Starting to seed student clearances...');

        // Only seed students who are assigned to a section
        $students = DB::table('tbl_students')
            ->whereNotNull('current_section_id')
            ->get();

        if ($students->isEmpty()) {
            $this->command->error('No enrolled students found. Run DatabaseSeeder first.');
            return;
        }

        $this->command->info("Found {$students->count()} enrolled students.");

        $created   = 0;
        $skipped   = 0;

        foreach ($students as $student) {
            // Get all scheduled subjects for the student's section
            $schedules = DB::table('tbl_schedules')
                ->where('class_section_id', $student->current_section_id)
                ->select('subject_id', 'teacher_id')
                ->distinct()
                ->get();

            if ($schedules->isEmpty()) {
                continue;
            }

            $total        = $schedules->count();
            // Leave 1 pending for small schedules, up to 2 for larger ones
            $pendingCount = $total <= 3 ? 1 : rand(1, 2);

            // Randomly pick which subjects stay pending
            $pendingIndexes = (array) array_rand($schedules->toArray(), min($pendingCount, $total));

            foreach ($schedules as $index => $schedule) {
                // Skip if already exists
                $exists = DB::table('tbl_clearances')
                    ->where('student_id',       $student->id)
                    ->where('subject_id',        $schedule->subject_id)
                    ->where('class_section_id',  $student->current_section_id)
                    ->where('school_year',        $student->school_year)
                    ->exists();

                if ($exists) {
                    $skipped++;
                    continue;
                }

                $status = in_array($index, $pendingIndexes) ? 'pending' : 'cleared';

                DB::table('tbl_clearances')->insert([
                    'student_id'       => $student->id,
                    'teacher_id'       => $schedule->teacher_id,
                    'subject_id'       => $schedule->subject_id,
                    'class_section_id' => $student->current_section_id,
                    'school_year'      => $student->school_year,
                    'status'           => $status,
                    'created_at'       => now(),
                    'updated_at'       => now(),
                ]);

                $created++;
            }
        }

        $this->command->info('✓ Clearance records seeded successfully!');
        $this->command->info("  - Records created : {$created}");
        $this->command->info("  - Records skipped : {$skipped} (already existed)");
    }
}