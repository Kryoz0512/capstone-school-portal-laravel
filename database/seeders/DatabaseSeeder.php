<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create test users for each role
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@school.edu',
            'password' => bcrypt('admin123'),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Teacher User',
            'email' => 'teacher@school.edu',
            'password' => bcrypt('teacher123'),
            'role' => 'teacher',
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Student User',
            'email' => 'student@school.edu',
            'password' => bcrypt('student123'),
            'role' => 'student',
            'email_verified_at' => now(),
        ]);
    }
}
