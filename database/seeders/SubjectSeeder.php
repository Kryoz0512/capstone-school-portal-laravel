<?php

namespace Database\Seeders;

use App\Models\GradeLevel;
use App\Models\Subject;
use Illuminate\Database\Seeder;

class SubjectSeeder extends Seeder
{
    private const SUBJECTS = [
        ['name' => 'English', 'suffix' => 'ENG', 'description' => 'English language and literature'],
        ['name' => 'Mathematics', 'suffix' => 'MATH', 'description' => 'Mathematics'],
        ['name' => 'Science', 'suffix' => 'SCI', 'description' => 'Integrated science'],
        ['name' => 'Filipino', 'suffix' => 'FIL', 'description' => 'Filipino language'],
        ['name' => 'MAPEH', 'suffix' => 'MAPEH', 'description' => 'Music, Arts, PE, and Health'],
    ];

    public function run(): void
    {
        $gradeLevels = GradeLevel::orderBy('name')->get();

        foreach ($gradeLevels as $gradeLevel) {
            preg_match('/(\d+)/', $gradeLevel->name, $matches);
            $gradeNum = $matches[1] ?? '0';

            foreach (self::SUBJECTS as $subject) {
                Subject::updateOrCreate(
                    ['code' => "G{$gradeNum}-{$subject['suffix']}"],
                    [
                        'name' => $subject['name'],
                        'description' => "{$subject['description']} for {$gradeLevel->name}",
                        'grade_level_id' => $gradeLevel->id,
                    ]
                );
            }
        }

        $this->command?->info('Subjects seeded: ' . Subject::count());
    }
}