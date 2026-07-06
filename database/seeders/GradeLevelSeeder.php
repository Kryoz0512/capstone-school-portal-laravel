<?php

namespace Database\Seeders;

use App\Models\GradeLevel;
use Illuminate\Database\Seeder;

class GradeLevelSeeder extends Seeder
{
    public function run(): void
    {
        $levels = [
            ['name' => 'Grade 7', 'description' => 'Junior High School - Grade 7'],
            ['name' => 'Grade 8', 'description' => 'Junior High School - Grade 8'],
            ['name' => 'Grade 9', 'description' => 'Junior High School - Grade 9'],
            ['name' => 'Grade 10', 'description' => 'Junior High School - Grade 10'],
        ];

        foreach ($levels as $level) {
            GradeLevel::firstOrCreate(['name' => $level['name']], $level);
        }

        $this->command?->info('Grade levels seeded: ' . GradeLevel::count());
    }
}