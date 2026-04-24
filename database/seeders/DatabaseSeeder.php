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
                'first_name' => 'Micah',
                'last_name' => 'Bayudang',
                'role' => 'Super Admin',
                'position' => 'School Principal',
                'updated_by' => $superAdminUser->id,
            ]);
        }
        
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
                'password' => bcrypt('mark12345'),
                'role' => 'admin',
                'email_verified_at' => now(),
                'password_changed' => true, // Admin doesn't need to change password
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
                    'password_changed' => false, // Teachers need to change password on first login
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

        // Seed students (both assigned and unassigned to sections)
        $this->seedStudents();
    }

    /**
     * Seed students - both assigned to sections and unassigned
     */
    private function seedStudents(): void
    {
        if (DB::table('tbl_students')->count() > 0) {
            return; // Students already seeded
        }

        $gradeLevels = DB::table('tbl_grade_levels')->get();
        $sections = DB::table('tbl_class_sections')->get();
        
        if ($gradeLevels->isEmpty() || $sections->isEmpty()) {
            return;
        }

        $currentSchoolYear = '2026-2027';
        
        // Filipino names
        $filipinoFirstNamesMale = ['Jose', 'Juan', 'Pedro', 'Antonio', 'Miguel', 'Carlos', 'Rafael', 'Luis', 'Manuel', 'Fernando'];
        $filipinoFirstNamesFemale = ['Maria', 'Ana', 'Rosa', 'Carmen', 'Isabel', 'Teresa', 'Luz', 'Elena', 'Sofia', 'Gabriela'];
        $filipinoLastNames = ['Santos', 'Reyes', 'Cruz', 'Bautista', 'Garcia', 'Mendoza', 'Torres', 'Flores', 'Rivera', 'Gonzales'];
        $middleNames = ['Santos', 'Reyes', 'Cruz', 'Garcia', 'Mendoza'];
        $suffixes = [null, null, null, 'Jr.'];
        $statuses = ['new', 'transferee', 'returning'];
        $usedLRNs = [];
        
        // Helper to generate unique LRN
        $generateUniqueLRN = function() use (&$usedLRNs) {
            do {
                $lrn = '2024' . str_pad(rand(10000000, 99999999), 8, '0', STR_PAD_LEFT);
            } while (in_array($lrn, $usedLRNs));
            $usedLRNs[] = $lrn;
            return $lrn;
        };
        
        // PART 1: Create students ASSIGNED to sections (10 per section for speed)
        foreach ($sections as $section) {
            $studentsToCreate = 10; // Reduced from 40-47 to 10 for faster seeding
            
            for ($i = 0; $i < $studentsToCreate; $i++) {
                $gender = ['male', 'female'][rand(0, 1)];
                $firstName = $gender === 'male' 
                    ? $filipinoFirstNamesMale[array_rand($filipinoFirstNamesMale)]
                    : $filipinoFirstNamesFemale[array_rand($filipinoFirstNamesFemale)];
                
                $lastName = $filipinoLastNames[array_rand($filipinoLastNames)];
                $middleName = $middleNames[array_rand($middleNames)];
                $suffix = $suffixes[array_rand($suffixes)];
                $lrn = $generateUniqueLRN();
                
                // Create user account
                $userId = DB::table('users')->insertGetId([
                    'name' => trim($firstName . ' ' . $lastName),
                    'email' => 'SNHS-' . $lrn,
                    'password' => Hash::make($lrn),
                    'role' => 'student',
                    'password_changed' => false, // Force password change on first login
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                
                // Create student record
                $studentId = DB::table('tbl_students')->insertGetId([
                    'user_id' => $userId,
                    'student_status' => $statuses[array_rand($statuses)],
                    'lrn' => $lrn,
                    'school_year' => $currentSchoolYear,
                    'last_name' => $lastName,
                    'first_name' => $firstName,
                    'middle_name' => $middleName,
                    'suffix' => $suffix,
                    'gender' => $gender,
                    'birth_date' => date('Y-m-d', strtotime('-' . rand(12, 16) . ' years')),
                    'current_grade_level_id' => $section->grade_level_id,
                    'current_section_id' => $section->id,
                    'has_psa_birth_certificate' => rand(0, 1),
                    'has_sf9' => rand(0, 1),
                    'has_report_card' => rand(0, 1),
                    'has_good_moral' => rand(0, 1),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                
                // Create student profile
                DB::table('tbl_student_profiles')->insert([
                    'profileable_id' => $studentId,
                    'place_of_birth' => 'Bongabon, Nueva Ecija',
                    'city_municipality' => 'Bongabon',
                    'province_state' => 'Nueva Ecija',
                    'zip_code' => '3128',
                    'country' => 'Philippines',
                    'nationality' => 'Filipino',
                    'religion' => 'Roman Catholic',
                    'contact_number' => '09' . rand(100000000, 999999999),
                    'mobile_number' => '09' . rand(100000000, 999999999),
                    'guardian_name' => $firstName . ' ' . $lastName,
                    'relation' => 'Father',
                    'house_no' => 'House No./Street/Barangay',
                    'height' => rand(140, 180),
                    'weight' => rand(40, 80),
                    'build' => 'Average',
                    'eye_color' => 'Brown',
                    'hair_color' => 'Black',
                    'father_first_name' => $firstName,
                    'father_last_name' => $lastName,
                    'father_middle_name' => $middleNames[array_rand($middleNames)],
                    'mother_first_name' => $filipinoFirstNamesFemale[array_rand($filipinoFirstNamesFemale)],
                    'mother_last_name' => $filipinoLastNames[array_rand($filipinoLastNames)],
                    'mother_middle_name' => $middleNames[array_rand($middleNames)],
                    'guardian_first_name' => $firstName,
                    'guardian_last_name' => $lastName,
                    'guardian_middle_name' => $middleNames[array_rand($middleNames)],
                    'indigenous_people' => 'No',
                    'pwd' => 'No',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
        
        // PART 2: Create students NOT ASSIGNED to sections (5 per grade level)
        foreach ($gradeLevels as $gradeLevel) {
            $unassignedToCreate = 5; // Reduced from 20-30 to 5 for faster seeding
            
            for ($i = 0; $i < $unassignedToCreate; $i++) {
                $gender = ['male', 'female'][rand(0, 1)];
                $firstName = $gender === 'male' 
                    ? $filipinoFirstNamesMale[array_rand($filipinoFirstNamesMale)]
                    : $filipinoFirstNamesFemale[array_rand($filipinoFirstNamesFemale)];
                
                $lastName = $filipinoLastNames[array_rand($filipinoLastNames)];
                $middleName = $middleNames[array_rand($middleNames)];
                $suffix = $suffixes[array_rand($suffixes)];
                $lrn = $generateUniqueLRN();
                
                // Create user account
                $userId = DB::table('users')->insertGetId([
                    'name' => trim($firstName . ' ' . $lastName),
                    'email' => 'SNHS-' . $lrn,
                    'password' => Hash::make($lrn),
                    'role' => 'student',
                    'password_changed' => false, // Force password change on first login
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                
                // Create student record WITHOUT section assignment
                $studentId = DB::table('tbl_students')->insertGetId([
                    'user_id' => $userId,
                    'student_status' => $statuses[array_rand($statuses)],
                    'lrn' => $lrn,
                    'school_year' => $currentSchoolYear,
                    'last_name' => $lastName,
                    'first_name' => $firstName,
                    'middle_name' => $middleName,
                    'suffix' => $suffix,
                    'gender' => $gender,
                    'birth_date' => date('Y-m-d', strtotime('-' . rand(12, 16) . ' years')),
                    'current_grade_level_id' => $gradeLevel->id,
                    'current_section_id' => null,
                    'has_psa_birth_certificate' => rand(0, 1),
                    'has_sf9' => rand(0, 1),
                    'has_report_card' => rand(0, 1),
                    'has_good_moral' => rand(0, 1),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                
                // Create student profile
                DB::table('tbl_student_profiles')->insert([
                    'profileable_id' => $studentId,
                    'place_of_birth' => 'Bongabon, Nueva Ecija',
                    'city_municipality' => 'Bongabon',
                    'province_state' => 'Nueva Ecija',
                    'zip_code' => '3128',
                    'country' => 'Philippines',
                    'nationality' => 'Filipino',
                    'religion' => 'Roman Catholic',
                    'contact_number' => '09' . rand(100000000, 999999999),
                    'mobile_number' => '09' . rand(100000000, 999999999),
                    'guardian_name' => $firstName . ' ' . $lastName,
                    'relation' => 'Father',
                    'house_no' => 'House No./Street/Barangay',
                    'height' => rand(140, 180),
                    'weight' => rand(40, 80),
                    'build' => 'Average',
                    'eye_color' => 'Brown',
                    'hair_color' => 'Black',
                    'father_first_name' => $firstName,
                    'father_last_name' => $lastName,
                    'father_middle_name' => $middleNames[array_rand($middleNames)],
                    'mother_first_name' => $filipinoFirstNamesFemale[array_rand($filipinoFirstNamesFemale)],
                    'mother_last_name' => $filipinoLastNames[array_rand($filipinoLastNames)],
                    'mother_middle_name' => $middleNames[array_rand($middleNames)],
                    'guardian_first_name' => $firstName,
                    'guardian_last_name' => $lastName,
                    'guardian_middle_name' => $middleNames[array_rand($middleNames)],
                    'indigenous_people' => 'No',
                    'pwd' => 'No',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}


