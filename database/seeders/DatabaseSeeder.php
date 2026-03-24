<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        if (DB::table('tbl_grade_levels')->count() === 0) {
            DB::table('tbl_grade_levels')->insert([
                [
                    'name' => 'Grade 7',
                    'description' => 'First year of junior high school. Students begin their secondary education with foundational subjects.',
                ],
                [
                    'name' => 'Grade 8',
                    'description' => 'Second year of junior high school. Students continue building on core academic skills and knowledge.',
                ],
                [
                    'name' => 'Grade 9',
                    'description' => 'Third year of junior high school. Students prepare for more advanced topics and develop critical thinking skills.',
                ],
                [
                    'name' => 'Grade 10',
                    'description' => 'Fourth and final year of junior high school. Students complete their basic education and prepare for senior high school.',
                ],
            ]);
        }

        if (!User::where('email', 'admin@school.edu')->exists()) {
            User::create([
                'name' => 'Admin User',
                'email' => 'admin@school.edu',
                'password' => bcrypt('admin123'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]);
        }

        if (!User::where('email', 'teacher@school.edu')->exists()) {
            User::create([
                'name' => 'Teacher User',
                'email' => 'teacher@school.edu',
                'password' => bcrypt('teacher123'),
                'role' => 'teacher',
                'email_verified_at' => now(),
            ]);
        }

        if (!User::where('email', 'student@school.edu')->exists()) {
            User::create([
                'name' => 'Student User',
                'email' => 'student@school.edu',
                'password' => bcrypt('student123'),
                'role' => 'student',
                'email_verified_at' => now(),
            ]);
        }
    }
}
