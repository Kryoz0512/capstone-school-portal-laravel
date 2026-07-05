<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StudentGradesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Seeds grades for students in Grade 7-10:
     * - Current grade level: Quarters 1-3 filled in, Quarter 4 left empty
     *   (matches the student's actual schedule/teacher for this year)
     * - Previous grade levels: fully completed (Quarters 1-4 + final grade),
     *   e.g. a Grade 10 student has complete records for Grade 7, 8, and 9;
     *   a Grade 8 student has a complete record for Grade 7 only.
     *   There is never any data for grade levels above the student's
     *   current grade level.
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

            // Randomly decide if student is high, average, or struggling performer
            // 20% high performers (91-98)
            // 60% average performers (81-90)
            // 20% struggling performers (75-80, some may be below 75)
            $performanceRand = rand(1, 100);
            if ($performanceRand <= 20) {
                $gradeRange = [91, 98]; // High performer
            } elseif ($performanceRand <= 80) {
                $gradeRange = [81, 90]; // Average performer
            } else {
                $gradeRange = [75, 80]; // Struggling performer
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

                // Generate grades for Quarters 1-3 only (Quarter 4 is left empty)
                $quarter1 = rand($gradeRange[0], $gradeRange[1]);
                $quarter2 = rand($gradeRange[0], $gradeRange[1]);
                $quarter3 = rand($gradeRange[0], $gradeRange[1]);
                $quarter4 = null; // Quarter 4 is always empty

                // No final grade or remarks since Quarter 4 is not complete
                $finalGrade = null;
                $remarks = null;

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
            }
        }

        $this->command->info("✓ Current school year grades seeded successfully!");
        $this->command->info("  - Grades created: {$gradesCreated}");
        $this->command->info("  - Grades skipped (already exist): {$gradesSkipped}");
        $this->command->info("  - All students have Quarters 1-3 grades, Quarter 4 is empty");

        // Seed completed historical records for every grade level below
        // the student's current one (e.g. a Grade 9 student gets complete
        // Grade 7 and Grade 8 records; nothing above their current level).
        $this->command->info('Starting to seed historical grades for previous grade levels...');

        $historicalCreated = 0;
        $historicalSkipped = 0;

        foreach ($students as $student) {
            [$created, $skipped] = self::seedHistoricalGradesForStudent($student);
            $historicalCreated += $created;
            $historicalSkipped += $skipped;
        }

        $this->command->info("✓ Historical grades seeded successfully!");
        $this->command->info("  - Historical records created: {$historicalCreated}");
        $this->command->info("  - Historical records skipped (already exist): {$historicalSkipped}");
    }

    /**
     * Seed fully completed grade records (Quarters 1-4 + final grade) for
     * every grade level below the given student's current grade level.
     *
     * Example: a student currently in Grade 10 gets complete records for
     * Grade 7, Grade 8, and Grade 9. A student currently in Grade 8 gets
     * a complete record for Grade 7 only, and nothing for Grade 9-10.
     * A student currently in Grade 7 gets no historical records at all,
     * since there is no grade level below Grade 7.
     *
     * $student must have: id, current_grade_level_id, school_year.
     * Public + static so other seeders (e.g. DatabaseSeeder's special
     * students) can reuse this without duplicating the logic.
     *
     * @return array{0:int,1:int} [recordsCreated, recordsSkipped]
     */
    public static function seedHistoricalGradesForStudent(object $student): array
    {
        $created = 0;
        $skipped = 0;

        $gradeLevels = DB::table('tbl_grade_levels')
            ->whereIn('name', ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'])
            ->get()
            ->keyBy('name');

        if ($gradeLevels->isEmpty()) {
            return [$created, $skipped];
        }

        $currentLevel = $gradeLevels->firstWhere('id', $student->current_grade_level_id);
        if (!$currentLevel) {
            return [$created, $skipped];
        }

        // Extract the numeric grade (7, 8, 9, or 10) from the level name
        preg_match('/(\d+)/', $currentLevel->name, $matches);
        $currentOrder = (int) ($matches[1] ?? 0);

        // Grade 7 has no earlier grade level, so there's nothing to backfill
        if ($currentOrder <= 7) {
            return [$created, $skipped];
        }

        // Base year for the student's CURRENT school year, e.g. "2026-2027" -> 2026
        $baseYearStart = (int) substr($student->school_year, 0, 4);

        for ($order = 7; $order < $currentOrder; $order++) {
            $levelName = "Grade {$order}";
            $level = $gradeLevels[$levelName] ?? null;
            if (!$level) {
                continue;
            }

            $subjects = DB::table('tbl_subjects')
                ->where('grade_level_id', $level->id)
                ->get();

            if ($subjects->isEmpty()) {
                continue;
            }

            // Use any section from that grade level as the historical class record
            $section = DB::table('tbl_class_sections')
                ->where('grade_level_id', $level->id)
                ->inRandomOrder()
                ->first();

            if (!$section) {
                continue;
            }

            // Work out which school year that grade level corresponds to
            $yearsBack = $currentOrder - $order;
            $yearStart = $baseYearStart - $yearsBack;
            $schoolYear = "{$yearStart}-" . ($yearStart + 1);

            // Vary performance tier per historical year for realism
            $performanceRand = rand(1, 100);
            if ($performanceRand <= 20) {
                $gradeRange = [91, 98];
            } elseif ($performanceRand <= 80) {
                $gradeRange = [81, 90];
            } else {
                $gradeRange = [75, 80];
            }

            foreach ($subjects as $subject) {
                // Find any teacher registered to teach this subject
                $teacherLink = DB::table('tbl_teacher_subjects')
                    ->where('subject_id', $subject->id)
                    ->inRandomOrder()
                    ->first();

                if (!$teacherLink) {
                    continue;
                }

                $exists = DB::table('tbl_grades')
                    ->where('student_id', $student->id)
                    ->where('subject_id', $subject->id)
                    ->where('class_section_id', $section->id)
                    ->where('school_year', $schoolYear)
                    ->exists();

                if ($exists) {
                    $skipped++;
                    continue;
                }

                $q1 = rand($gradeRange[0], $gradeRange[1]);
                $q2 = rand($gradeRange[0], $gradeRange[1]);
                $q3 = rand($gradeRange[0], $gradeRange[1]);
                $q4 = rand($gradeRange[0], $gradeRange[1]);
                $finalGrade = round(($q1 + $q2 + $q3 + $q4) / 4, 2);

                DB::table('tbl_grades')->insert([
                    'student_id' => $student->id,
                    'class_section_id' => $section->id,
                    'school_year' => $schoolYear,
                    'subject_id' => $subject->id,
                    'teacher_id' => $teacherLink->teacher_id,
                    'quarter_1' => $q1,
                    'quarter_2' => $q2,
                    'quarter_3' => $q3,
                    'quarter_4' => $q4,
                    'final_grade' => $finalGrade,
                    'remarks' => 'Passed',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $created++;
            }
        }

        return [$created, $skipped];
    }
}