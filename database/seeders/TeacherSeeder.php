<?php

namespace Database\Seeders;

use App\Models\Subject;
use App\Models\Teacher;
use App\Models\TeacherSubject;
use Database\Seeders\Concerns\SeederHelpers;
use Illuminate\Database\Seeder;

class TeacherSeeder extends Seeder
{
    use SeederHelpers;

    public const SHYRIELLE_NAME = "Shyrielle Bautista";

    public function run(): void
    {
        $teachers = [
            [
                'name' => self::SHYRIELLE_NAME,
                'email' => 'SNHS-BAUTISTA-SHYRIELLE',
                'subject' => 'English',
                'phone' => '09171234567',
                'address' => 'Brgy. Poblacion, Bayudang, Pangasinan',
            ],
            [
                'name' => 'Mr. Roberto Mendoza',
                'email' => 'SNHS-MENDOZA-ROBERTO',
                'subject' => 'Mathematics',
                'phone' => '09181234567',
                'address' => 'Brgy. San Roque, Bayudang, Pangasinan',
            ],
            [
                'name' => 'Ms. Elena Cruz',
                'email' => 'SNHS-CRUZ-ELENA',
                'subject' => 'Science',
                'phone' => '09191234567',
                'address' => 'Brgy. Malasin, Bayudang, Pangasinan',
            ],
            [
                'name' => 'Mr. Antonio Reyes',
                'email' => 'SNHS-REYES-ANTONIO',
                'subject' => 'Filipino',
                'phone' => '09201234567',
                'address' => 'Brgy. Cabalitian, Bayudang, Pangasinan',
            ],
            [
                'name' => 'Ms. Patricia Santos',
                'email' => 'SNHS-SANTOS-PATRICIA',
                'subject' => 'MAPEH',
                'phone' => '09211234567',
                'address' => 'Brgy. Poblacion, Bayudang, Pangasinan',
            ],
            [
                'name' => 'Mr. Carlo Villanueva',
                'email' => 'SNHS-VILLANUEVA-CARLO',
                'subject' => 'English',
                'phone' => '09221234567',
                'address' => 'Brgy. San Vicente, Bayudang, Pangasinan',
            ],
            [
                'name' => 'Ms. Grace Aquino',
                'email' => 'SNHS-AQUINO-GRACE',
                'subject' => 'Mathematics',
                'phone' => '09231234567',
                'address' => 'Brgy. Poblacion, Bayudang, Pangasinan',
            ],
            [
                'name' => 'Mr. Kenneth Ramos',
                'email' => 'SNHS-RAMOS-KENNETH',
                'subject' => 'Science',
                'phone' => '09241234567',
                'address' => 'Brgy. Malasin, Bayudang, Pangasinan',
            ],
            [
                'name' => 'Ms. Bianca Torres',
                'email' => 'SNHS-TORRES-BIANCA',
                'subject' => 'Filipino',
                'phone' => '09251234567',
                'address' => 'Brgy. Cabalitian, Bayudang, Pangasinan',
            ],
            [
                'name' => 'Mr. Adrian Flores',
                'email' => 'SNHS-FLORES-ADRIAN',
                'subject' => 'MAPEH',
                'phone' => '09261234567',
                'address' => 'Brgy. San Roque, Bayudang, Pangasinan',
            ],
            [
                'name' => 'Ms. Jasmine Delos Santos',
                'email' => 'SNHS-DELOSSANTOS-JASMINE',
                'subject' => 'English',
                'phone' => '09271234567',
                'address' => 'Brgy. Poblacion, Bayudang, Pangasinan',
            ],
            [
                'name' => 'Mr. Vincent Garcia',
                'email' => 'SNHS-GARCIA-VINCENT',
                'subject' => 'Mathematics',
                'phone' => '09281234567',
                'address' => 'Brgy. Malasin, Bayudang, Pangasinan',
            ],
            [
                'name' => 'Ms. Pauline Navarro',
                'email' => 'SNHS-NAVARRO-PAULINE',
                'subject' => 'Science',
                'phone' => '09291234567',
                'address' => 'Brgy. San Vicente, Bayudang, Pangasinan',
            ],
            [
                'name' => 'Mr. Emmanuel Salazar',
                'email' => 'SNHS-SALAZAR-EMMANUEL',
                'subject' => 'Filipino',
                'phone' => '09301234567',
                'address' => 'Brgy. Cabalitian, Bayudang, Pangasinan',
            ],
            [
                'name' => 'Ms. Christine Valdez',
                'email' => 'SNHS-VALDEZ-CHRISTINE',
                'subject' => 'MAPEH',
                'phone' => '09311234567',
                'address' => 'Brgy. Poblacion, Bayudang, Pangasinan',
            ],
        ];

        foreach ($teachers as $index => $data) {
            $user = $this->createUser($data['name'], $data['email'], 'teacher', 'teacher123');

            $teacher = Teacher::updateOrCreate(
                ['employee_number' => $this->employeeNumberForIndex($index)],
                [
                    'user_id' => $user->id,
                    'name' => $data['name'],
                    'subject' => $data['subject'],
                    'position' => $this->randomTeacherPosition(),
                    'phone' => $data['phone'],
                    'address' => $data['address'],
                    'hire_date' => now()->subYears(fake()->numberBetween(1, 10))->subMonths(fake()->numberBetween(0, 11)),
                    'updated_by' => null,
                    'archived_by' => null,
                    'archive_reason' => null,
                    'purged_at' => null,
                ]
            );

            // Link core subject teachers (first 5) to all grade-level subjects they teach
            if ($index < 5) {
                $subjects = Subject::where('name', $data['subject'])->get();
                foreach ($subjects as $subject) {
                    TeacherSubject::firstOrCreate([
                        'teacher_id' => $teacher->id,
                        'subject_id' => $subject->id,
                    ]);
                }
            }
        }

        $this->command?->info('Teachers seeded: ' . Teacher::count());
    }

    /**
     * Build a 12-digit employee number starting with "10", incrementing per teacher.
     * e.g. 100000000001, 100000000002, ...
     */
    private function employeeNumberForIndex(int $index): string
    {
        return (string) (100000 + $index + 1);
    }

    /**
     * Pick a random position from Teacher I–VII or Master Teacher I–V.
     */
    private function randomTeacherPosition(): string
    {
        $teacherLevels = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
        $masterTeacherLevels = ['I', 'II', 'III', 'IV', 'V'];

        $positions = array_merge(
            array_map(fn ($level) => "Teacher {$level}", $teacherLevels),
            array_map(fn ($level) => "Master Teacher {$level}", $masterTeacherLevels)
        );

        return fake()->randomElement($positions);
    }
}