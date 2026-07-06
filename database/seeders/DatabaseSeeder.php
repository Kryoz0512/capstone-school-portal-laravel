<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Admin;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create Super Admin (Principal) account
        $email = 'SNHS-BAYUDANG-MICAH';
        if (!User::where('email', $email)->exists()) {
            // Create super admin user account
            $superAdminUser = User::create([
                'name' => 'Micah Bayudang',
                'email' => $email,
                'password' => Hash::make('micah123'),
                'role' => 'admin',
                'email_verified_at' => now(),
                'password_changed' => true, // Super admin doesn't need to change password
            ]);

            // Create admin record with 'Super Admin' role
            Admin::create([
                'user_id' => $superAdminUser->id,
                'employee_number' => '202401',
                'first_name' => 'Micah',
                'last_name' => 'Bayudang',
                'role' => 'Super Admin',
                'position' => 'School Principal',
                'updated_by' => $superAdminUser->id,
            ]);
        }

        // Create Super Admin (Principal) account
        $email = 'SNHS-TEJANO-MICHAEL';
        if (!User::where('email', $email)->exists()) {
            // Create super admin user account
            $superAdminUser = User::create([
                'name' => 'Michael Tejano',
                'email' => $email,
                'password' => Hash::make('tejano123'),
                'role' => 'admin',
                'email_verified_at' => now(),
                'password_changed' => true,
            ]);

            // Create admin record with 'Super Admin' role
            Admin::create([
                'user_id' => $superAdminUser->id,
                'employee_number' => '202402',
                'first_name' => 'Michael',
                'last_name' => 'Tejano',
                'role' => 'Super Admin',
                'position' => 'School Principal',
                'updated_by' => $superAdminUser->id,
            ]);
        }

        if (!User::where('email', 'SNHS-BAYUDANG-MARK')->exists()) {
            $user = User::create([
                'name' => 'Mark Robert Bayudang',
                'email' => 'SNHS-BAYUDANG-MARK',
                'password' => bcrypt('mark12345'),
                'role' => 'admin',
                'email_verified_at' => now(),
                'password_changed' => true, // Admin doesn't need to change password
            ]);

            // Create admin record
            DB::table('tbl_admins')->insert([
                'user_id' => $user->id,
                'employee_number' => '202403',
                'first_name' => 'Mark',
                'last_name' => 'Bayudang',
                'position' => 'System Administrator',
                'role' => 'Admin',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $this->call([
            GradeLevelSeeder::class,
            SubjectSeeder::class,
            RoomSeeder::class,
            TeacherSeeder::class,
            SectionSeeder::class,
            ScheduleSeeder::class,
            StudentSeeder::class,
            GradeSeeder::class,
        ]);
        $this->command?->info('Database seeding completed.');
        $this->command?->info('Expected totals: 4 grade levels, 8 sections, 400 students, 15 teachers, 20 subjects, 8 rooms, 40 schedules, 40 grades (Ma\'am Shyrielle).');

    }
}
