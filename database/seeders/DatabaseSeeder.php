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
                'employee_number' => '0000001',
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
                'employee_number' => '0000002',
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

        // Seed teachers - 2 teachers per subject
        // Start employee numbers at 1000 to avoid conflicts with admin employee numbers (1-999)
        if (DB::table('tbl_teachers')->count() === 0) {
            $subjects = ['English', 'Filipino', 'Mathematics', 'Science', 'Araling Panlipunan', 'MAPEH', 'TLE'];
            $positions = ['Teacher I', 'Teacher II', 'Teacher III'];
            
            // Filipino names for teachers
            $firstNames = [
                'Maria', 'Juan', 'Ana', 'Carlos', 'Rosa', 'Pedro', 'Elena', 'Miguel',
                'Carmen', 'Luis', 'Isabel', 'Rafael', 'Teresa', 'Jose', 'Luz', 'Manuel',
                'Sofia', 'Fernando', 'Gabriela', 'Antonio', 'Cristina', 'Ricardo'
            ];
            $lastNames = [
                'Santos', 'Reyes', 'Cruz', 'Bautista', 'Garcia', 'Mendoza', 'Torres',
                'Flores', 'Rivera', 'Gonzales', 'Ramos', 'Dela Cruz', 'Aquino', 'Villanueva'
            ];
            
            // Start teacher employee numbers at 1000001 to avoid conflicts with admins
            $employeeNumber = 1000001;
            $nameIndex = 0;
            
            // Create 2 teachers for each subject
            foreach ($subjects as $subject) {
                for ($i = 0; $i < 2; $i++) {
                    $firstName = $firstNames[$nameIndex % count($firstNames)];
                    $lastName = $lastNames[$nameIndex % count($lastNames)];
                    $position = $positions[array_rand($positions)];
                    
                    // Generate email in format: SNHS-LASTNAME-FIRSTNAME
                    $firstNameUpper = strtoupper(str_replace(' ', '', $firstName));
                    $lastNameUpper = strtoupper(str_replace(' ', '', $lastName));
                    $email = 'SNHS-' . $lastNameUpper . '-' . $firstNameUpper;
                    
                    // If email exists, add a number
                    $emailSuffix = '';
                    $counter = 1;
                    while (User::where('email', $email . $emailSuffix)->exists()) {
                        $emailSuffix = $counter;
                        $counter++;
                    }
                    
                    // Create user
                    $user = User::create([
                        'name' => $firstName . ' ' . $lastName,
                        'email' => $email . $emailSuffix,
                        'password' => bcrypt('teacher123'),
                        'role' => 'teacher',
                        'email_verified_at' => now(),
                        'password_changed' => false,
                    ]);

                    // Create teacher with unique employee number
                    DB::table('tbl_teachers')->insert([
                        'user_id' => $user->id,
                        'name' => $firstName . ' ' . $lastName,
                        'employee_number' => str_pad($employeeNumber, 7, '0', STR_PAD_LEFT),
                        'subject' => $subject,
                        'position' => $position,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    
                    $employeeNumber++;
                    $nameIndex++;
                }
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

        // Seed adviser assignments (one teacher per section)
        if (DB::table('tbl_adviser_section')->count() === 0) {
            $sections = DB::table('tbl_class_sections')->get();
            $teachers = DB::table('tbl_teachers')->get();
            $currentSchoolYear = '2026-2027';
            
            foreach ($sections as $index => $section) {
                // Assign teachers in round-robin fashion
                $teacher = $teachers[$index % $teachers->count()];
                
                DB::table('tbl_adviser_section')->insert([
                    'teacher_id' => $teacher->id,
                    'class_section_id' => $section->id,
                    'school_year' => $currentSchoolYear,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // Seed schedules with conflict checking
        if (DB::table('tbl_schedules')->count() === 0) {
            $this->seedSchedules();
        }

        // Seed students (both assigned and unassigned to sections)
        $this->seedStudents();
    }

    /**
     * Seed schedules with conflict checking
     */
    private function seedSchedules(): void
    {
        $sections = DB::table('tbl_class_sections')->get();
        $days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        
        // Time slots (8 AM to 5 PM, 1-hour slots)
        $timeSlots = [
            ['08:00:00', '09:00:00'],
            ['09:00:00', '10:00:00'],
            ['10:00:00', '11:00:00'],
            ['11:00:00', '12:00:00'],
            ['13:00:00', '14:00:00'], // After lunch
            ['14:00:00', '15:00:00'],
            ['15:00:00', '16:00:00'],
            ['16:00:00', '17:00:00'],
        ];
        
        // Track teacher schedules to avoid conflicts
        $teacherSchedules = [];
        
        foreach ($sections as $section) {
            // Get subjects for this section's grade level
            $subjects = DB::table('tbl_subjects')
                ->where('grade_level_id', $section->grade_level_id)
                ->get();
            
            $slotIndex = 0;
            
            foreach ($subjects as $subject) {
                // Get a teacher for this subject
                $teacher = DB::table('tbl_teachers')
                    ->join('tbl_teacher_subjects', 'tbl_teachers.id', '=', 'tbl_teacher_subjects.teacher_id')
                    ->where('tbl_teacher_subjects.subject_id', $subject->id)
                    ->select('tbl_teachers.*')
                    ->first();
                
                if (!$teacher) continue;
                
                // Find an available time slot for this teacher
                $scheduled = false;
                $attempts = 0;
                
                while (!$scheduled && $attempts < 100) {
                    $day = $days[$slotIndex % count($days)];
                    $timeSlot = $timeSlots[floor($slotIndex / count($days)) % count($timeSlots)];
                    
                    // Check if teacher has conflict
                    $conflictKey = $teacher->id . '_' . $day . '_' . $timeSlot[0];
                    
                    if (!isset($teacherSchedules[$conflictKey])) {
                        // No conflict, schedule it
                        DB::table('tbl_schedules')->insert([
                            'class_section_id' => $section->id,
                            'subject_id' => $subject->id,
                            'teacher_id' => $teacher->id,
                            'room_id' => $section->room_id,
                            'day_of_week' => $day,
                            'start_time' => $timeSlot[0],
                            'end_time' => $timeSlot[1],
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                        
                        // Mark this slot as used by this teacher
                        $teacherSchedules[$conflictKey] = true;
                        $scheduled = true;
                    }
                    
                    $slotIndex++;
                    $attempts++;
                }
            }
        }
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
                
                // Determine student status
                $studentStatus = $statuses[array_rand($statuses)];
                
                // Generate documents based on student status
                // SF9 (Form 138) is REQUIRED for all students
                // Other documents vary by status
                
                $hasSf9 = true; // ALWAYS REQUIRED
                $hasReportCard = rand(0, 1); // Optional - can be submitted as follow-up
                $hasGoodMoral = false;
                $hasPsaBirth = rand(0, 1); // Optional for new/transferee, required for returning
                
                if ($studentStatus === 'transferee') {
                    // Transferees: SF9 (required) + Good Moral (required)
                    $hasGoodMoral = true; // Always required for transferees
                } elseif ($studentStatus === 'returning') {
                    // Returning: SF9 (required) + PSA Birth Cert (required) + Good Moral (required)
                    $hasPsaBirth = true; // Required for returning
                    $hasGoodMoral = true; // Required for returning
                }
                // For 'new' students: only SF9 is required, others are optional
                
                // Create student record
                $studentId = DB::table('tbl_students')->insertGetId([
                    'user_id' => $userId,
                    'student_status' => $studentStatus,
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
                    'has_psa_birth_certificate' => $hasPsaBirth,
                    'has_sf9' => $hasSf9,
                    'has_report_card' => $hasReportCard,
                    'has_good_moral' => $hasGoodMoral,
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
                
                // Determine student status
                $studentStatus = $statuses[array_rand($statuses)];
                
                // Generate documents based on student status
                // New students: At least 1 document (SF9 or Report Card)
                // Transferees: At least 2 documents (SF9/Report Card + Good Moral)
                // Returning: SF9 (required) + PSA Birth Cert (required) + Good Moral (required)
                
                $hasSf9 = true; // ALWAYS REQUIRED
                $hasReportCard = rand(0, 1); // Optional - can be submitted as follow-up
                $hasGoodMoral = false;
                $hasPsaBirth = rand(0, 1); // Optional for new/transferee, required for returning
                
                if ($studentStatus === 'transferee') {
                    // Transferees: SF9 (required) + Good Moral (required)
                    $hasGoodMoral = true; // Always required for transferees
                } elseif ($studentStatus === 'returning') {
                    // Returning: SF9 (required) + PSA Birth Cert (required) + Good Moral (required)
                    $hasPsaBirth = true; // Required for returning
                    $hasGoodMoral = true; // Required for returning
                }
                // For 'new' students: only SF9 is required, others are optional
                
                // Create student record WITHOUT section assignment
                $studentId = DB::table('tbl_students')->insertGetId([
                    'user_id' => $userId,
                    'student_status' => $studentStatus,
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
                    'has_psa_birth_certificate' => $hasPsaBirth,
                    'has_sf9' => $hasSf9,
                    'has_report_card' => $hasReportCard,
                    'has_good_moral' => $hasGoodMoral,
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


