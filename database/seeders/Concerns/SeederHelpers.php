<?php

namespace Database\Seeders\Concerns;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

trait SeederHelpers
{
    protected function activeSchoolYear(): string
    {
        $year = (int) date('Y');
        $month = (int) date('n');

        if ($month >= 6) {
            return "{$year}-" . ($year + 1);
        }

        return ($year - 1) . "-{$year}";
    }

    protected function createUser(string $name, string $email, string $role, string $password = 'password'): User
    {
        return User::firstOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => Hash::make($password),
                'role' => $role,
                'email_verified_at' => now(),
                'password_changed' => $role !== 'student',
            ]
        );
    }

    protected function randomFilipinoName(): array
    {
        $firstNamesMale = [
            'Juan', 'Jose', 'Mark', 'Angelo', 'Carlo', 'Rafael', 'Miguel', 'Paolo', 'Jerome', 'Luis',
            'Gabriel', 'Christian', 'Adrian', 'Kenneth', 'Bryan', 'John', 'James', 'Daniel', 'Vincent', 'Emmanuel',
        ];
        $firstNamesFemale = [
            'Maria', 'Ana', 'Joy', 'Grace', 'Angelica', 'Patricia', 'Camille', 'Hannah', 'Nicole', 'Bianca',
            'Andrea', 'Christine', 'Jasmine', 'Kristine', 'Lea', 'Michelle', 'Pauline', 'Rachel', 'Sophia', 'Trisha',
        ];
        $lastNames = [
            'Santos', 'Reyes', 'Cruz', 'Bautista', 'Garcia', 'Mendoza', 'Torres', 'Flores', 'Rivera', 'Gonzales',
            'Ramos', 'Aquino', 'Castillo', 'Domingo', 'Lopez', 'Navarro', 'Salazar', 'Valdez', 'Villanueva', 'Diaz',
            'Fernandez', 'Pascual', 'Morales', 'Santiago', 'Tolentino', 'Magbanua', 'Tejano', 'Bayudang', 'Delos Santos', 'Manalo',
        ];
        $middleNames = [
            'Santos', 'Cruz', 'Reyes', 'Garcia', 'Lopez', 'Mae', 'Rose', 'Ann', 'Marie', 'Jane', 'Lyn', 'Grace', null, null,
        ];
        $suffixes = [null, null, null, null, 'Jr.', 'III', 'II'];

        $gender = fake()->randomElement(['male', 'female']);
        $first = $gender === 'male'
            ? fake()->randomElement($firstNamesMale)
            : fake()->randomElement($firstNamesFemale);

        return [
            'first_name' => $first,
            'middle_name' => fake()->randomElement($middleNames),
            'last_name' => fake()->randomElement($lastNames),
            'suffix' => fake()->randomElement($suffixes),
            'gender' => $gender,
        ];
    }

    protected function birthDateForGrade(int $gradeNumber): string
    {
        $age = match ($gradeNumber) {
            7 => fake()->numberBetween(12, 13),
            8 => fake()->numberBetween(13, 14),
            9 => fake()->numberBetween(14, 15),
            10 => fake()->numberBetween(15, 16),
            default => 13,
        };

        return now()->subYears($age)->subMonths(fake()->numberBetween(0, 11))->format('Y-m-d');
    }

    protected function gradeNumberFromLevelName(string $name): int
    {
        preg_match('/(\d+)/', $name, $matches);

        return (int) ($matches[1] ?? 7);
    }
}