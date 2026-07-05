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

        // Seed teachers - 20 teachers total with varied subjects
        // Start employee numbers with realistic format
        if (DB::table('tbl_teachers')->count() === 0) {
            $subjects = ['English', 'Filipino', 'Mathematics', 'Science', 'Araling Panlipunan', 'MAPEH', 'TLE'];
            $positions = ['Teacher I', 'Teacher II', 'Teacher III'];

            // Filipino names for teachers
            $firstNames = [
                'Shyrielle', // First teacher will be Shyrielle Bautista
                'Juan',
                'Ana',
                'Carlos',
                'Rosa',
                'Pedro',
                'Elena',
                'Miguel',
                'Carmen',
                'Luis',
                'Isabel',
                'Rafael',
                'Teresa',
                'Jose',
                'Luz',
                'Manuel',
                'Sofia',
                'Fernando',
                'Gabriela',
                'Antonio',
                'Cristina',
                'Ricardo',
                'Patricia',
                'Diego',
                'Lorena',
                'Marco',
                'Beatriz',
                'Andres',
                'Valeria',
                'Santiago'
            ];
            $lastNames = [
                'Bautista', // First teacher will be Shyrielle Bautista
                'Reyes',
                'Cruz',
                'Santos',
                'Garcia',
                'Mendoza',
                'Torres',
                'Flores',
                'Rivera',
                'Gonzales',
                'Ramos',
                'Dela Cruz',
                'Aquino',
                'Villanueva',
                'Castillo',
                'Morales',
                'Hernandez',
                'Pascual',
                'Santiago',
                'Valdez'
            ];

            // Realistic employee numbers (not sequential)
            // The 21st ('202855') is reserved for a dedicated backup/utility
            // teacher used by ensureEverySubjectHasATeacher() to cover any
            // subject that the random specialization-based assignment above
            // leaves without a teacher.
            $employeeNumbers = [
                '201815', '201823', '201956', '202012', '202045',
                '202067', '202134', '202189', '202201', '202278',
                '202315', '202389', '202401', '202456', '202512',
                '202578', '202634', '202689', '202745', '202801',
                '202855',
            ];

            // Create 21 teachers with random subject specializations
            // (the 21st is the dedicated backup/utility teacher, see above)
            for ($i = 0; $i < 21; $i++) {
                $firstName = $firstNames[$i % count($firstNames)];
                $lastName = $lastNames[$i % count($lastNames)];
                $position = $positions[array_rand($positions)];
                
                // Randomly assign a subject specialization
                $subject = $subjects[array_rand($subjects)];

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

                // Create user with password as lastname123
                $user = User::create([
                    'name' => $firstName . ' ' . $lastName,
                    'email' => $email . $emailSuffix,
                    'password' => bcrypt(strtolower($lastName) . '123'),
                    'role' => 'teacher',
                    'email_verified_at' => now(),
                    'password_changed' => false,
                ]);

                // Create teacher with realistic employee number
                DB::table('tbl_teachers')->insert([
                    'user_id' => $user->id,
                    'name' => $firstName . ' ' . $lastName,
                    'employee_number' => $employeeNumbers[$i],
                    'subject' => $subject,
                    'position' => $position,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // Seed rooms
        if (DB::table('tbl_room')->count() === 0) {
            $rooms = [
                ['room_name' => 'Room 101', 'capacity' => 50, 'status' => 'Available'],
                ['room_name' => 'Room 102', 'capacity' => 50, 'status' => 'Available'],
                ['room_name' => 'Room 103', 'capacity' => 50, 'status' => 'Available'],
                ['room_name' => 'Room 104', 'capacity' => 50, 'status' => 'Available'],
                ['room_name' => 'Room 201', 'capacity' => 50, 'status' => 'Available'],
                ['room_name' => 'Room 202', 'capacity' => 50, 'status' => 'Available'],
                ['room_name' => 'Room 203', 'capacity' => 50, 'status' => 'Available'],
                ['room_name' => 'Room 204', 'capacity' => 50, 'status' => 'Available'],
                ['room_name' => 'Room 301', 'capacity' => 50, 'status' => 'Available'],
                ['room_name' => 'Room 302', 'capacity' => 50, 'status' => 'Available'],
                ['room_name' => 'Room 303', 'capacity' => 50, 'status' => 'Available'],
                ['room_name' => 'Room 304', 'capacity' => 50, 'status' => 'Available'],
                ['room_name' => 'Room 401', 'capacity' => 50, 'status' => 'Available'],
                ['room_name' => 'Room 402', 'capacity' => 50, 'status' => 'Available'],
                ['room_name' => 'Room 403', 'capacity' => 50, 'status' => 'Available'],
                ['room_name' => 'Room 404', 'capacity' => 50, 'status' => 'Available'],
            ];

            foreach ($rooms as $room) {
                DB::table('tbl_room')->insert([
                    'room_name' => $room['room_name'],
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

            // Philippine national heroes for section names - 2 sections per grade level
            $heroNames = [
                // Grade 7 sections (2)
                'Rizal',
                'Bonifacio',
                // Grade 8 sections (2)
                'Mabini',
                'Luna',
                // Grade 9 sections (2)
                'Del Pilar',
                'Jacinto',
                // Grade 10 sections (2)
                'Aguinaldo',
                'Silang',
            ];

            $sectionIndex = 0;
            $roomIndex = 0;

            foreach ($gradeLevels as $gradeLevel) {
                // Create 2 sections per grade level
                for ($i = 0; $i < 2; $i++) {
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
        // Each teacher gets 1-2 subjects randomly
        if (DB::table('tbl_teacher_subjects')->count() === 0) {
            // Get all teachers with their specializations
            $teachers = DB::table('tbl_teachers')->get();

            // For each teacher, assign them to 1-2 subjects randomly
            foreach ($teachers as $teacher) {
                // Find all subjects that match the teacher's subject specialization
                $matchingSubjects = DB::table('tbl_subjects')
                    ->where('name', $teacher->subject)
                    ->get();

                // Randomly select 1 or 2 subjects for this teacher
                $numSubjectsToAssign = rand(1, 2);
                $subjectsToAssign = $matchingSubjects->random(min($numSubjectsToAssign, $matchingSubjects->count()));

                // Ensure $subjectsToAssign is always a collection
                if (!is_iterable($subjectsToAssign)) {
                    $subjectsToAssign = collect([$subjectsToAssign]);
                }

                // Assign teacher to selected subjects
                foreach ($subjectsToAssign as $subject) {
                    DB::table('tbl_teacher_subjects')->insert([
                        'teacher_id' => $teacher->id,
                        'subject_id' => $subject->id,
                    ]);
                }
            }

            // Guarantee Shyrielle Bautista teaches at least one subject in
            // Grade 7 AND one subject in Grade 10. This must happen before
            // seedSchedules() runs so the resulting schedules/grades/clearance
            // for those grade levels are real and consistent with the special
            // graduating (Grade 10) and promoting (Grade 7) student seeders,
            // which both assume she has an actual subject at those levels.
            $this->ensureBautistaTeachesGrades([7, 10]);

            // Guarantee every subject (every grade level) has at least one
            // teacher assigned. The random assignment above can leave a
            // subject with zero teachers, which causes seedSchedules() to
            // silently skip it for every section at that grade level -
            // meaning students end up with fewer schedule/clearance rows
            // than actual subjects (e.g. 7 subjects but only 6 schedules).
            $this->ensureEverySubjectHasATeacher();
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

        // Seed special Grade 10 student with almost complete grades for testing graduation
        $this->seedGraduatingStudent();

        // Seed special Grade 7 student with almost complete grades for testing promotion to Grade 8
        $this->seedPromotingStudent();
    }

    /**
     * Seed schedules with conflict checking and realistic teacher loads
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

        // Track teacher schedules to avoid conflicts and track loads
        $teacherSchedules = [];
        $teacherLoads = []; // Track number of schedules per teacher

        foreach ($sections as $section) {
            // Get subjects for this section's grade level
            $subjects = DB::table('tbl_subjects')
                ->where('grade_level_id', $section->grade_level_id)
                ->get();

            $slotIndex = 0;

            foreach ($subjects as $subject) {
                // Get available teachers for this subject (those who aren't overloaded)
                $availableTeachers = DB::table('tbl_teachers')
                    ->join('tbl_teacher_subjects', 'tbl_teachers.id', '=', 'tbl_teacher_subjects.teacher_id')
                    ->where('tbl_teacher_subjects.subject_id', $subject->id)
                    ->select('tbl_teachers.*')
                    ->get();

                if ($availableTeachers->isEmpty())
                    continue;

                // Filter teachers who haven't exceeded realistic load (3-8 schedules)
                $suitableTeachers = $availableTeachers->filter(function ($teacher) use ($teacherLoads) {
                    $currentLoad = $teacherLoads[$teacher->id] ?? 0;
                    return $currentLoad < 8; // Maximum 8 schedules per teacher
                });

                // If all teachers are at max load, use any available teacher
                if ($suitableTeachers->isEmpty()) {
                    $teacher = $availableTeachers->first();
                } else {
                    // Prefer teachers with fewer schedules
                    $teacher = $suitableTeachers->sortBy(function ($t) use ($teacherLoads) {
                        return $teacherLoads[$t->id] ?? 0;
                    })->first();
                }

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
                        
                        // Increment teacher's load
                        $teacherLoads[$teacher->id] = ($teacherLoads[$teacher->id] ?? 0) + 1;
                        
                        $scheduled = true;
                    }

                    $slotIndex++;
                    $attempts++;
                }
            }
        }
    }

    /**
     * Guarantee that teacher Shyrielle Bautista is assigned to teach at
     * least one subject in each of the given grade levels (by numeric
     * grade, e.g. 7 or 10).
     *
     * Must be called before seedSchedules() runs. Doing it here (instead
     * of patching it in later inside the special graduating/promoting
     * student seeders) ensures she is actually scheduled to teach that
     * subject for real sections at that grade level, so the special
     * students' "pending grade from Bautista" scenario matches what
     * regular students in the same section/subject also see, rather
     * than being a one-off record with no matching schedule.
     *
     * @param int[] $gradeNumbers e.g. [7, 10]
     */
    private function ensureBautistaTeachesGrades(array $gradeNumbers): void
    {
        $bautista = DB::table('tbl_teachers')
            ->join('users', 'tbl_teachers.user_id', '=', 'users.id')
            ->where('users.email', 'SNHS-BAUTISTA-SHYRIELLE')
            ->select('tbl_teachers.*')
            ->first();

        if (!$bautista) {
            // Fallback lookup in case the email format ever changes
            $bautista = DB::table('tbl_teachers')
                ->where('name', 'like', '%Shyrielle%')
                ->first();
        }

        if (!$bautista) {
            return;
        }

        foreach ($gradeNumbers as $gradeNumber) {
            $gradeLevel = DB::table('tbl_grade_levels')
                ->where('name', "Grade {$gradeNumber}")
                ->first();

            if (!$gradeLevel) {
                continue;
            }

            // Already teaching something at this grade level? Nothing to do.
            $alreadyAssigned = DB::table('tbl_teacher_subjects')
                ->join('tbl_subjects', 'tbl_teacher_subjects.subject_id', '=', 'tbl_subjects.id')
                ->where('tbl_teacher_subjects.teacher_id', $bautista->id)
                ->where('tbl_subjects.grade_level_id', $gradeLevel->id)
                ->exists();

            if ($alreadyAssigned) {
                continue;
            }

            // Prefer a subject matching her specialization at this grade
            // level, falling back to any subject at this grade level.
            $subject = DB::table('tbl_subjects')
                ->where('grade_level_id', $gradeLevel->id)
                ->where('name', $bautista->subject)
                ->first();

            if (!$subject) {
                $subject = DB::table('tbl_subjects')
                    ->where('grade_level_id', $gradeLevel->id)
                    ->inRandomOrder()
                    ->first();
            }

            if (!$subject) {
                continue;
            }

            DB::table('tbl_teacher_subjects')->insert([
                'teacher_id' => $bautista->id,
                'subject_id' => $subject->id,
            ]);
        }
    }

    /**
     * Guarantee every subject (across every grade level) has at least one
     * teacher assigned in tbl_teacher_subjects.
     *
     * Must be called before seedSchedules() runs. Without this, a subject
     * that ends up with zero teachers after the random per-teacher
     * assignment gets silently skipped by seedSchedules() for every
     * section at that grade level - so ALL students in that grade end up
     * with fewer schedule rows (and, downstream, fewer clearance rows)
     * than they have actual subjects. This keeps subject count, schedule
     * count, and clearance count in sync for every student.
     *
     * Any subject left uncovered is handed to the dedicated backup/utility
     * teacher (employee_number 202855, the 21st teacher created above)
     * rather than a randomly chosen existing teacher, so coverage is
     * deterministic and doesn't pile extra, unrelated subjects onto
     * teachers who were already assigned by specialization.
     */
    private function ensureEverySubjectHasATeacher(): void
    {
        $subjectsWithoutTeacher = DB::table('tbl_subjects')
            ->whereNotIn('id', function ($query) {
                $query->select('subject_id')->from('tbl_teacher_subjects');
            })
            ->get();

        if ($subjectsWithoutTeacher->isEmpty()) {
            return;
        }

        // The dedicated backup/utility teacher created specifically to
        // cover any subject the random assignment above missed.
        $backupTeacher = DB::table('tbl_teachers')
            ->where('employee_number', '202855')
            ->first();

        if (!$backupTeacher) {
            // Shouldn't happen given the teacher seeding above, but fall
            // back to any teacher rather than leaving the subject uncovered.
            $backupTeacher = DB::table('tbl_teachers')->inRandomOrder()->first();
        }

        if (!$backupTeacher) {
            return;
        }

        foreach ($subjectsWithoutTeacher as $subject) {
            DB::table('tbl_teacher_subjects')->insert([
                'teacher_id' => $backupTeacher->id,
                'subject_id' => $subject->id,
            ]);
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

        // Helper to generate unique LRN in format: 1052XXXXXXXX (12 digits total)
        $generateUniqueLRN = function () use (&$usedLRNs) {
            do {
                // Format: 1052 + 8 random digits = 12 digits total
                $lrn = '1052' . str_pad(rand(10000000, 99999999), 8, '0', STR_PAD_LEFT);
            } while (in_array($lrn, $usedLRNs));
            $usedLRNs[] = $lrn;
            return $lrn;
        };

        // PART 1: Create students ASSIGNED to sections (40 students per section - max capacity)
        foreach ($sections as $section) {
            $studentsToCreate = 40; // Exactly 40 students per section (max capacity)

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
                // Form 138 (SF9) is REQUIRED for all students
                // Other documents vary by status

                $hasSf9 = true; // ALWAYS REQUIRED
                $hasReportCard = rand(0, 1); // Optional - can be submitted as follow-up
                $hasGoodMoral = false;
                $hasPsaBirth = rand(0, 1); // Optional for new/transferee, required for returning

                if ($studentStatus === 'transferee') {
                    // Transferees: Form 138/SF9 (required) + Good Moral (required)
                    $hasGoodMoral = true; // Always required for transferees
                } elseif ($studentStatus === 'returning') {
                    // Returning: Form 138/SF9 (required) + PSA Birth Cert (required) + Good Moral (required)
                    $hasPsaBirth = true; // Required for returning
                    $hasGoodMoral = true; // Required for returning
                }
                // For 'new' students: only Form 138 (SF9) is required, Form 137 (SF10) is optional

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

        // PART 2: Create students NOT ASSIGNED to sections (10-15 per grade level)
        foreach ($gradeLevels as $gradeLevel) {
            $unassignedToCreate = rand(10, 15); // Random number between 10-15 unassigned students

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
                // New students: Form 138 (SF9) required
                // Transferees: Form 138 (SF9) + Good Moral
                // Returning: Form 138 (SF9) + PSA Birth Cert + Good Moral

                $hasSf9 = true; // ALWAYS REQUIRED
                $hasReportCard = rand(0, 1); // Optional - can be submitted as follow-up
                $hasGoodMoral = false;
                $hasPsaBirth = rand(0, 1); // Optional for new/transferee, required for returning

                if ($studentStatus === 'transferee') {
                    // Transferees: Form 138/SF9 (required) + Good Moral (required)
                    $hasGoodMoral = true; // Always required for transferees
                } elseif ($studentStatus === 'returning') {
                    // Returning: Form 138/SF9 (required) + PSA Birth Cert (required) + Good Moral (required)
                    $hasPsaBirth = true; // Required for returning
                    $hasGoodMoral = true; // Required for returning
                }
                // For 'new' students: only Form 138 (SF9) is required, Form 137 (SF10) is optional

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

        // Seed student grades for Grade 7-10
        $this->call(StudentGradesSeeder::class);
        // Seed clearance records (pending clearance for every subject)
        $this->call(ClearanceSeeder::class);
    }

    /**
     * Seed a special Grade 10 student with almost complete grades
     * Shyrielle Bautista will be the last teacher to grade this student.
     * Used for testing the graduation / graduation-presentation flow.
     */
    private function seedGraduatingStudent(): void
    {
        $currentSchoolYear = '2026-2027';

        // Get Grade 10 and find first section
        $grade10 = DB::table('tbl_grade_levels')->where('name', 'Grade 10')->first();
        if (!$grade10) return;

        $grade10Section = DB::table('tbl_class_sections')
            ->where('grade_level_id', $grade10->id)
            ->first();
        if (!$grade10Section) return;

        // Get all Grade 10 subjects
        $grade10Subjects = DB::table('tbl_subjects')
            ->where('grade_level_id', $grade10->id)
            ->get();
        if ($grade10Subjects->isEmpty()) return;

        // Find Shyrielle Bautista teacher
        $shyrielleBautista = DB::table('tbl_teachers')
            ->join('users', 'tbl_teachers.user_id', '=', 'users.id')
            ->where('users.email', 'SNHS-BAUTISTA-SHYRIELLE')
            ->select('tbl_teachers.*')
            ->first();

        if (!$shyrielleBautista) {
            // If Shyrielle Bautista doesn't exist yet, get the first teacher named Shyrielle
            $shyrielleBautista = DB::table('tbl_teachers')
                ->where('name', 'like', '%Shyrielle%')
                ->first();
        }

        if (!$shyrielleBautista) return;

        // Find which subject Shyrielle Bautista teaches in Grade 10
        $shyrielleBautistaSubject = DB::table('tbl_teacher_subjects')
            ->join('tbl_subjects', 'tbl_teacher_subjects.subject_id', '=', 'tbl_subjects.id')
            ->where('tbl_teacher_subjects.teacher_id', $shyrielleBautista->id)
            ->where('tbl_subjects.grade_level_id', $grade10->id)
            ->select('tbl_subjects.*')
            ->first();

        if (!$shyrielleBautistaSubject) {
            // If Shyrielle Bautista has no Grade 10 subject assigned, assign her to one
            $randomGrade10Subject = $grade10Subjects->random();
            DB::table('tbl_teacher_subjects')->insert([
                'teacher_id' => $shyrielleBautista->id,
                'subject_id' => $randomGrade10Subject->id,
            ]);
            $shyrielleBautistaSubject = $randomGrade10Subject;
        }

        // Create the special graduating student
        $lrn = '105255669238'; // Realistic LRN for graduating student

        // Create user account
        $userId = DB::table('users')->insertGetId([
            'name' => 'Miguel Antonio Reyes',
            'email' => 'SNHS-' . $lrn,
            'password' => Hash::make($lrn),
            'role' => 'student',
            'password_changed' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Create student record
        $studentId = DB::table('tbl_students')->insertGetId([
            'user_id' => $userId,
            'student_status' => 'returning',
            'lrn' => $lrn,
            'school_year' => $currentSchoolYear,
            'last_name' => 'Reyes',
            'first_name' => 'Miguel Antonio',
            'middle_name' => 'Villanueva',
            'suffix' => null,
            'gender' => 'male',
            'birth_date' => date('Y-m-d', strtotime('-16 years')),
            'current_grade_level_id' => $grade10->id,
            'current_section_id' => $grade10Section->id,
            'has_psa_birth_certificate' => true,
            'has_sf9' => true,
            'has_report_card' => true,
            'has_good_moral' => true,
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
            'contact_number' => '09187654321',
            'mobile_number' => '09187654321',
            'guardian_name' => 'Ricardo Reyes',
            'relation' => 'Father',
            'house_no' => '45 Rizal Street, Barangay San Jose',
            'height' => 168,
            'weight' => 62,
            'build' => 'Average',
            'eye_color' => 'Brown',
            'hair_color' => 'Black',
            'father_first_name' => 'Ricardo',
            'father_last_name' => 'Reyes',
            'father_middle_name' => 'Mendoza',
            'mother_first_name' => 'Cristina',
            'mother_last_name' => 'Villanueva',
            'mother_middle_name' => 'Torres',
            'guardian_first_name' => 'Ricardo',
            'guardian_last_name' => 'Reyes',
            'guardian_middle_name' => 'Mendoza',
            'indigenous_people' => 'No',
            'pwd' => 'No',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Create grades for all subjects EXCEPT Shyrielle Bautista's subject.
        // Every subject must end up graded, EXCEPT the one Bautista teaches,
        // which must always stay pending — regardless of whether some other
        // teacher also happens to be assigned to it.
        foreach ($grade10Subjects as $subject) {
            if ($subject->id === $shyrielleBautistaSubject->id) {
                // This is Shyrielle Bautista's subject - create grade record with NO grades yet
                DB::table('tbl_grades')->insert([
                    'student_id' => $studentId,
                    'class_section_id' => $grade10Section->id,
                    'school_year' => $currentSchoolYear,
                    'subject_id' => $subject->id,
                    'teacher_id' => $shyrielleBautista->id,
                    'quarter_1' => null,
                    'quarter_2' => null,
                    'quarter_3' => null,
                    'quarter_4' => null,
                    'final_grade' => null,
                    'remarks' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                continue;
            }

            // Prefer a teacher who isn't Bautista, but fall back to any
            // assigned teacher so this subject is never left ungraded.
            $teacher = DB::table('tbl_teacher_subjects')
                ->where('subject_id', $subject->id)
                ->where('teacher_id', '!=', $shyrielleBautista->id)
                ->first();

            if (!$teacher) {
                $teacher = DB::table('tbl_teacher_subjects')
                    ->where('subject_id', $subject->id)
                    ->first();
            }

            // No teacher is assigned to this subject at all yet - assign one
            // now (any teacher other than Bautista) so the subject can still
            // be graded rather than silently skipped.
            if (!$teacher) {
                $fallbackTeacher = DB::table('tbl_teachers')
                    ->where('id', '!=', $shyrielleBautista->id)
                    ->inRandomOrder()
                    ->first();

                if (!$fallbackTeacher) {
                    // Only Bautista exists as a teacher - nothing else we can do
                    continue;
                }

                DB::table('tbl_teacher_subjects')->insert([
                    'teacher_id' => $fallbackTeacher->id,
                    'subject_id' => $subject->id,
                ]);

                $teacher = (object) ['teacher_id' => $fallbackTeacher->id];
            }

            // Create complete grades (passing grades: 85-95)
            $q1 = rand(85, 95);
            $q2 = rand(85, 95);
            $q3 = rand(85, 95);
            $q4 = rand(85, 95);
            $finalGrade = round(($q1 + $q2 + $q3 + $q4) / 4, 2);

            DB::table('tbl_grades')->insert([
                'student_id' => $studentId,
                'class_section_id' => $grade10Section->id,
                'school_year' => $currentSchoolYear,
                'subject_id' => $subject->id,
                'teacher_id' => $teacher->teacher_id,
                'quarter_1' => $q1,
                'quarter_2' => $q2,
                'quarter_3' => $q3,
                'quarter_4' => $q4,
                'final_grade' => $finalGrade,
                'remarks' => 'Passed',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Backfill complete historical grades for Grade 7-9, same as any other Grade 10 student
        [$historicalCreated, $historicalSkipped] = StudentGradesSeeder::seedHistoricalGradesForStudent((object) [
            'id' => $studentId,
            'current_grade_level_id' => $grade10->id,
            'school_year' => $currentSchoolYear,
        ]);

        // Clear this student's clearance for every subject except Shyrielle Bautista's
        [$clearanceCreated, $clearanceSkipped] = $this->seedSpecialStudentClearance(
            $studentId,
            $grade10Section->id,
            $currentSchoolYear,
            $shyrielleBautista->id
        );

        echo "\n✓ Special graduating student created: Miguel Antonio Reyes (LRN: {$lrn})\n";
        echo "  - Grade 10, Section: {$grade10Section->section_name}\n";
        echo "  - Pending grade from: Shyrielle Bautista ({$shyrielleBautistaSubject->name})\n";
        echo "  - All other subjects: Complete with passing grades\n";
        echo "  - Historical grades (Grade 7-9) created: {$historicalCreated} (skipped: {$historicalSkipped})\n";
        echo "  - Clearance: all subjects cleared except Shyrielle Bautista's ({$clearanceCreated} created, {$clearanceSkipped} skipped)\n\n";
    }

    /**
     * Seed a special Grade 7 student with almost complete grades.
     * Shyrielle Bautista will be the last teacher to grade this student.
     * Used for testing the promotion flow (Grade 7 -> Grade 8), as
     * opposed to the Grade 10 student above which tests graduation.
     */
    private function seedPromotingStudent(): void
    {
        $currentSchoolYear = '2026-2027';

        // Get Grade 7 and find first section
        $grade7 = DB::table('tbl_grade_levels')->where('name', 'Grade 7')->first();
        if (!$grade7) return;

        $grade7Section = DB::table('tbl_class_sections')
            ->where('grade_level_id', $grade7->id)
            ->first();
        if (!$grade7Section) return;

        // Get all Grade 7 subjects
        $grade7Subjects = DB::table('tbl_subjects')
            ->where('grade_level_id', $grade7->id)
            ->get();
        if ($grade7Subjects->isEmpty()) return;

        // Find Shyrielle Bautista teacher
        $shyrielleBautista = DB::table('tbl_teachers')
            ->join('users', 'tbl_teachers.user_id', '=', 'users.id')
            ->where('users.email', 'SNHS-BAUTISTA-SHYRIELLE')
            ->select('tbl_teachers.*')
            ->first();

        if (!$shyrielleBautista) {
            // If Shyrielle Bautista doesn't exist yet, get the first teacher named Shyrielle
            $shyrielleBautista = DB::table('tbl_teachers')
                ->where('name', 'like', '%Shyrielle%')
                ->first();
        }

        if (!$shyrielleBautista) return;

        // Find which subject Shyrielle Bautista teaches in Grade 7
        $shyrielleBautistaSubject = DB::table('tbl_teacher_subjects')
            ->join('tbl_subjects', 'tbl_teacher_subjects.subject_id', '=', 'tbl_subjects.id')
            ->where('tbl_teacher_subjects.teacher_id', $shyrielleBautista->id)
            ->where('tbl_subjects.grade_level_id', $grade7->id)
            ->select('tbl_subjects.*')
            ->first();

        if (!$shyrielleBautistaSubject) {
            // If Shyrielle Bautista has no Grade 7 subject assigned, assign her to one
            $randomGrade7Subject = $grade7Subjects->random();
            DB::table('tbl_teacher_subjects')->insert([
                'teacher_id' => $shyrielleBautista->id,
                'subject_id' => $randomGrade7Subject->id,
            ]);
            $shyrielleBautistaSubject = $randomGrade7Subject;
        }

        // Create the special promoting student
        $lrn = '105255669247'; // Realistic LRN for promoting student

        // Create user account
        $userId = DB::table('users')->insertGetId([
            'name' => 'Andrea Nicole Santos',
            'email' => 'SNHS-' . $lrn,
            'password' => Hash::make($lrn),
            'role' => 'student',
            'password_changed' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Create student record
        $studentId = DB::table('tbl_students')->insertGetId([
            'user_id' => $userId,
            'student_status' => 'returning',
            'lrn' => $lrn,
            'school_year' => $currentSchoolYear,
            'last_name' => 'Santos',
            'first_name' => 'Andrea Nicole',
            'middle_name' => 'Garcia',
            'suffix' => null,
            'gender' => 'female',
            'birth_date' => date('Y-m-d', strtotime('-13 years')),
            'current_grade_level_id' => $grade7->id,
            'current_section_id' => $grade7Section->id,
            'has_psa_birth_certificate' => true,
            'has_sf9' => true,
            'has_report_card' => true,
            'has_good_moral' => true,
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
            'contact_number' => '09176543210',
            'mobile_number' => '09176543210',
            'guardian_name' => 'Fernando Santos',
            'relation' => 'Father',
            'house_no' => '12 Bonifacio Street, Barangay San Jose',
            'height' => 155,
            'weight' => 48,
            'build' => 'Average',
            'eye_color' => 'Brown',
            'hair_color' => 'Black',
            'father_first_name' => 'Fernando',
            'father_last_name' => 'Santos',
            'father_middle_name' => 'Torres',
            'mother_first_name' => 'Gabriela',
            'mother_last_name' => 'Garcia',
            'mother_middle_name' => 'Reyes',
            'guardian_first_name' => 'Fernando',
            'guardian_last_name' => 'Santos',
            'guardian_middle_name' => 'Torres',
            'indigenous_people' => 'No',
            'pwd' => 'No',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Create grades for all subjects EXCEPT Shyrielle Bautista's subject.
        // Every subject must end up graded, EXCEPT the one Bautista teaches,
        // which must always stay pending — regardless of whether some other
        // teacher also happens to be assigned to it.
        foreach ($grade7Subjects as $subject) {
            if ($subject->id === $shyrielleBautistaSubject->id) {
                // This is Shyrielle Bautista's subject - create grade record with NO grades yet
                DB::table('tbl_grades')->insert([
                    'student_id' => $studentId,
                    'class_section_id' => $grade7Section->id,
                    'school_year' => $currentSchoolYear,
                    'subject_id' => $subject->id,
                    'teacher_id' => $shyrielleBautista->id,
                    'quarter_1' => null,
                    'quarter_2' => null,
                    'quarter_3' => null,
                    'quarter_4' => null,
                    'final_grade' => null,
                    'remarks' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                continue;
            }

            // Prefer a teacher who isn't Bautista, but fall back to any
            // assigned teacher so this subject is never left ungraded.
            $teacher = DB::table('tbl_teacher_subjects')
                ->where('subject_id', $subject->id)
                ->where('teacher_id', '!=', $shyrielleBautista->id)
                ->first();

            if (!$teacher) {
                $teacher = DB::table('tbl_teacher_subjects')
                    ->where('subject_id', $subject->id)
                    ->first();
            }

            // No teacher is assigned to this subject at all yet - assign one
            // now (any teacher other than Bautista) so the subject can still
            // be graded rather than silently skipped.
            if (!$teacher) {
                $fallbackTeacher = DB::table('tbl_teachers')
                    ->where('id', '!=', $shyrielleBautista->id)
                    ->inRandomOrder()
                    ->first();

                if (!$fallbackTeacher) {
                    // Only Bautista exists as a teacher - nothing else we can do
                    continue;
                }

                DB::table('tbl_teacher_subjects')->insert([
                    'teacher_id' => $fallbackTeacher->id,
                    'subject_id' => $subject->id,
                ]);

                $teacher = (object) ['teacher_id' => $fallbackTeacher->id];
            }

            // Create complete grades (passing grades: 85-95)
            $q1 = rand(85, 95);
            $q2 = rand(85, 95);
            $q3 = rand(85, 95);
            $q4 = rand(85, 95);
            $finalGrade = round(($q1 + $q2 + $q3 + $q4) / 4, 2);

            DB::table('tbl_grades')->insert([
                'student_id' => $studentId,
                'class_section_id' => $grade7Section->id,
                'school_year' => $currentSchoolYear,
                'subject_id' => $subject->id,
                'teacher_id' => $teacher->teacher_id,
                'quarter_1' => $q1,
                'quarter_2' => $q2,
                'quarter_3' => $q3,
                'quarter_4' => $q4,
                'final_grade' => $finalGrade,
                'remarks' => 'Passed',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Clear this student's clearance for every subject except Shyrielle Bautista's
        [$clearanceCreated, $clearanceSkipped] = $this->seedSpecialStudentClearance(
            $studentId,
            $grade7Section->id,
            $currentSchoolYear,
            $shyrielleBautista->id
        );

        echo "\n✓ Special promoting student created: Andrea Nicole Santos (LRN: {$lrn})\n";
        echo "  - Grade 7, Section: {$grade7Section->section_name}\n";
        echo "  - Pending grade from: Shyrielle Bautista ({$shyrielleBautistaSubject->name})\n";
        echo "  - All other subjects: Complete with passing grades (promoting to Grade 8)\n";
        echo "  - Clearance: all subjects cleared except Shyrielle Bautista's ({$clearanceCreated} created, {$clearanceSkipped} skipped)\n\n";
    }

    /**
     * Seed clearance records for a special (individually created) student,
     * marking every subject as 'cleared' except the one taught by the
     * given teacher (e.g. Shyrielle Bautista), which stays 'pending'.
     *
     * These special students are created after ClearanceSeeder already
     * ran as part of seedStudents(), so they need their own clearance
     * records seeded here.
     *
     * @return array{0:int,1:int} [recordsCreated, recordsSkipped]
     */
    private function seedSpecialStudentClearance(int $studentId, int $sectionId, string $schoolYear, int $pendingTeacherId): array
    {
        $created = 0;
        $skipped = 0;

        $schedules = DB::table('tbl_schedules')
            ->where('class_section_id', $sectionId)
            ->select('subject_id', 'teacher_id')
            ->distinct()
            ->get();

        foreach ($schedules as $schedule) {
            $exists = DB::table('tbl_clearances')
                ->where('student_id', $studentId)
                ->where('subject_id', $schedule->subject_id)
                ->where('class_section_id', $sectionId)
                ->where('school_year', $schoolYear)
                ->exists();

            if ($exists) {
                $skipped++;
                continue;
            }

            $status = ((int) $schedule->teacher_id === $pendingTeacherId) ? 'pending' : 'cleared';

            DB::table('tbl_clearances')->insert([
                'student_id'       => $studentId,
                'teacher_id'       => $schedule->teacher_id,
                'subject_id'       => $schedule->subject_id,
                'class_section_id' => $sectionId,
                'school_year'      => $schoolYear,
                'status'           => $status,
                'created_at'       => now(),
                'updated_at'       => now(),
            ]);

            $created++;
        }

        return [$created, $skipped];
    }
}