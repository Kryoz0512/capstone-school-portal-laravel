<?php

namespace Database\Seeders;

use App\Models\ClassSection;
use App\Models\GradeLevel;
use App\Models\Room;
use App\Models\Teacher;
use Illuminate\Database\Seeder;

class SectionSeeder extends Seeder
{
    public function run(): void
    {
        $gradeLevels = GradeLevel::orderBy('name')->get();
        $rooms = Room::orderBy('room_name')->get();

        // Advisers: teachers 6–13 (skip the 5 core subject teachers)
        $advisers = Teacher::orderBy('employee_number')
            ->skip(5)
            ->take(8)
            ->get();

        if ($advisers->count() < 8) {
            throw new \RuntimeException('SectionSeeder requires at least 13 teachers (5 core + 8 advisers).');
        }

        if ($rooms->count() < 8) {
            throw new \RuntimeException('SectionSeeder requires at least 8 rooms.');
        }

        // Philippine heroes used as section names, 2 per grade level
        $heroNames = [
            'Rizal',
            'Bonifacio',
            'Mabini',
            'Del Pilar',
            'Aguinaldo',
            'Luna',
            'Silang',
            'Jacinto',
            'Aquino',
            'Osmeña',
            'Quezon',
            'Lapu-Lapu',
        ];

        $neededSections = $gradeLevels->count() * 2;

        if (count($heroNames) < $neededSections) {
            throw new \RuntimeException(
                "SectionSeeder needs {$neededSections} hero names but only " . count($heroNames) . ' were provided.'
            );
        }

        $roomIndex = 0;
        $heroIndex = 0;

        foreach ($gradeLevels as $gradeLevel) {
            foreach (['A', 'B'] as $sectionLetter) {
                $sectionName = $heroNames[$heroIndex];

                ClassSection::updateOrCreate(
                    [
                        'grade_level_id' => $gradeLevel->id,
                        'section_name' => $sectionName,
                    ],
                    [
                        'room_id' => $rooms[$roomIndex % $rooms->count()]->id,
                        'teacher_id' => $advisers[$roomIndex % $advisers->count()]->id,
                    ]
                );

                $roomIndex++;
                $heroIndex++;
            }
        }

        $this->command?->info('Sections seeded: ' . ClassSection::count());
    }
}