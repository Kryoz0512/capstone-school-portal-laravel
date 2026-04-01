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

        if (!User::where('email', 'SNHS-BAYUDANG-MARK')->exists()) {
            $user = User::create([
                'name' => 'Mark Robert Bayudang',
                'email' => 'SNHS-BAYUDANG-MARK',
                'password' => bcrypt('mark1234'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]);

            // Create admin record
            DB::table('tbl_admins')->insert([
                'user_id' => $user->id,
                'first_name' => 'Mark',
                'last_name' => 'Bayudang',
                'position' => 'System Administrator',
                'role' => 'Admin',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Seed subjects for Grade 7-10
        if (DB::table('tbl_subjects')->count() === 0) {
            $gradeLevels = DB::table('tbl_grade_levels')->get();
            $subjects = [
                [
                    'name' => 'English',
                    'code' => 'ENG',
                    'description' => 'English language and literature',
                ],
                [
                    'name' => 'Filipino',
                    'code' => 'FIL',
                    'description' => 'Filipino language and literature',
                ],
                [
                    'name' => 'Mathematics',
                    'code' => 'MATH',
                    'description' => 'Mathematics',
                ],
                [
                    'name' => 'Science',
                    'code' => 'SCI',
                    'description' => 'General Science',
                ],
                [
                    'name' => 'Araling Panlipunan',
                    'code' => 'AP',
                    'description' => 'Social Studies',
                ],
                [
                    'name' => 'MAPEH',
                    'code' => 'MAPEH',
                    'description' => 'Music, Arts, Physical Education, and Health',
                ],
                [
                    'name' => 'TLE',
                    'code' => 'TLE',
                    'description' => 'Technology and Livelihood Education',
                ],
            ];

            foreach ($gradeLevels as $gradeLevel) {
                foreach ($subjects as $subject) {
                    DB::table('tbl_subjects')->insert([
                        'code' => $subject['code'] . '-' . $gradeLevel->id,
                        'name' => $subject['name'],
                        'description' => $subject['description'] . ' for ' . $gradeLevel->name,
                        'grade_level_id' => $gradeLevel->id,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }

        // Seed teachers
        if (DB::table('tbl_teachers')->count() === 0) {
            $teachers = [
                [
                    'firstName' => 'Maria',
                    'lastName' => 'Santos',
                    'employeeNumber' => 'T-2024-001',
                    'subject' => 'English',
                    'position' => 'Teacher I',
                    'password' => 'teacher123',
                ],
                [
                    'firstName' => 'Juan',
                    'lastName' => 'Dela Cruz',
                    'employeeNumber' => 'T-2024-002',
                    'subject' => 'Filipino',
                    'position' => 'Teacher II',
                    'password' => 'teacher123',
                ],
                [
                    'firstName' => 'Carlos',
                    'lastName' => 'Mendoza',
                    'employeeNumber' => 'T-2024-003',
                    'subject' => 'Mathematics',
                    'position' => 'Teacher II',
                    'password' => 'teacher123',
                ],
                [
                    'firstName' => 'Ana',
                    'lastName' => 'Reyes',
                    'employeeNumber' => 'T-2024-004',
                    'subject' => 'Science',
                    'position' => 'Teacher I',
                    'password' => 'teacher123',
                ],
                [
                    'firstName' => 'Pedro',
                    'lastName' => 'Garcia',
                    'employeeNumber' => 'T-2024-005',
                    'subject' => 'Araling Panlipunan',
                    'position' => 'Teacher III',
                    'password' => 'teacher123',
                ],
                [
                    'firstName' => 'Rosa',
                    'lastName' => 'Cruz',
                    'employeeNumber' => 'T-2024-006',
                    'subject' => 'MAPEH',
                    'position' => 'Teacher II',
                    'password' => 'teacher123',
                ],
                [
                    'firstName' => 'Jose',
                    'lastName' => 'Ramos',
                    'employeeNumber' => 'T-2024-007',
                    'subject' => 'TLE',
                    'position' => 'Teacher I',
                    'password' => 'teacher123',
                ],
            ];

            foreach ($teachers as $teacherData) {
                // Generate email in format: SNHS-LASTNAME-FIRSTNAME
                $firstName = strtoupper(str_replace(' ', '', $teacherData['firstName']));
                $lastName = strtoupper(str_replace(' ', '', $teacherData['lastName']));
                $email = 'SNHS-' . $lastName . '-' . $firstName;

                // Create user
                $user = User::create([
                    'name' => $teacherData['firstName'] . ' ' . $teacherData['lastName'],
                    'email' => $email,
                    'password' => bcrypt($teacherData['password']),
                    'role' => 'teacher',
                    'email_verified_at' => now(),
                ]);

                // Create teacher
                DB::table('tbl_teachers')->insert([
                    'user_id' => $user->id,
                    'name' => $teacherData['firstName'] . ' ' . $teacherData['lastName'],
                    'employee_number' => $teacherData['employeeNumber'],
                    'subject' => $teacherData['subject'],
                    'position' => $teacherData['position'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // Seed rooms
        if (DB::table('tbl_room')->count() === 0) {
            $rooms = [
                ['room_number' => 'Room 101', 'capacity' => 50, 'status' => 'Active'],
                ['room_number' => 'Room 102', 'capacity' => 50, 'status' => 'Active'],
                ['room_number' => 'Room 103', 'capacity' => 50, 'status' => 'Active'],
                ['room_number' => 'Room 104', 'capacity' => 50, 'status' => 'Active'],
                ['room_number' => 'Room 201', 'capacity' => 50, 'status' => 'Active'],
                ['room_number' => 'Room 202', 'capacity' => 50, 'status' => 'Active'],
                ['room_number' => 'Room 203', 'capacity' => 50, 'status' => 'Active'],
                ['room_number' => 'Room 204', 'capacity' => 50, 'status' => 'Active'],
                ['room_number' => 'Room 301', 'capacity' => 50, 'status' => 'Active'],
                ['room_number' => 'Room 302', 'capacity' => 50, 'status' => 'Active'],
                ['room_number' => 'Room 303', 'capacity' => 50, 'status' => 'Active'],
                ['room_number' => 'Room 304', 'capacity' => 50, 'status' => 'Active'],
                ['room_number' => 'Room 401', 'capacity' => 50, 'status' => 'Active'],
                ['room_number' => 'Room 402', 'capacity' => 50, 'status' => 'Active'],
                ['room_number' => 'Room 403', 'capacity' => 50, 'status' => 'Active'],
                ['room_number' => 'Room 404', 'capacity' => 50, 'status' => 'Active'],
            ];

            foreach ($rooms as $room) {
                DB::table('tbl_room')->insert([
                    'room_number' => $room['room_number'],
                    'capacity' => $room['capacity'],
                    'status' => $room['status'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // Seed class sections with Philippine national heroes
        if (DB::table('tbl_class_sections')->count() === 0) {
            $gradeLevels = DB::table('tbl_grade_levels')->get();
            $rooms = DB::table('tbl_room')->get();
            
            // Philippine national heroes for section names - one per section
            $heroNames = [
                // Grade 7 sections
                'Rizal',
                'Bonifacio',
                'Mabini',
                'Luna',
                // Grade 8 sections
                'Del Pilar',
                'Jacinto',
                'Aguinaldo',
                'Silang',
                // Grade 9 sections
                'Burgos',
                'Gomez',
                'Zamora',
                'Dagohoy',
                // Grade 10 sections
                'Lakandula',
                'Sulayman',
                'Lapulapu',
                'Gabriela',
            ];

            $sectionIndex = 0;
            $roomIndex = 0;
            
            foreach ($gradeLevels as $gradeLevel) {
                // Create 4 sections per grade level
                for ($i = 0; $i < 4; $i++) {
                    DB::table('tbl_class_sections')->insert([
                        'grade_level_id' => $gradeLevel->id,
                        'section_name' => $heroNames[$sectionIndex],
                        'room_id' => $rooms[$roomIndex % $rooms->count()]->id,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    $sectionIndex++;
                    $roomIndex++;
                }
            }
        }

        // Seed teacher-subject assignments (Faculty & Subjects)
        if (DB::table('tbl_teacher_subjects')->count() === 0) {
            // Get all teachers with their specializations
            $teachers = DB::table('tbl_teachers')->get();
            
            // For each teacher, assign them to all subjects matching their specialization across all grade levels
            foreach ($teachers as $teacher) {
                // Find all subjects that match the teacher's subject specialization
                $matchingSubjects = DB::table('tbl_subjects')
                    ->where('name', $teacher->subject)
                    ->get();
                
                // Assign teacher to each matching subject (one for each grade level)
                foreach ($matchingSubjects as $subject) {
                    DB::table('tbl_teacher_subjects')->insert([
                        'teacher_id' => $teacher->id,
                        'subject_id' => $subject->id,
                    ]);
                }
            }
        }
    }
}
