<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\User;
use App\Models\Schedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Illuminate\Support\Carbon;

class StudentController extends Controller
{
    public function dashboard()
    {
        $user = Auth::user();
        $student = Student::where('user_id', $user->id)->with('profile')->first();

        if (!$student) {
            return redirect()->route('login')->withErrors(['error' => 'Student profile not found.']);
        }

        $studentInfo = [
            'name' => trim($student->first_name . ' ' . $student->last_name),
            'lrn' => $student->lrn,
            'mobileNumber' => $student->profile ? ($student->profile->mobile_number ?? 'N/A') : 'N/A',
            'parentMobileNumber' => $student->profile ? ($student->profile->contact_number ?? 'N/A') : 'N/A',
        ];

        return Inertia::render('student/dashboard/page', [
            'studentInfo' => $studentInfo,
            'auth' => [
                'user' => $user
            ]
        ]);
    }

    public function enrolledSubjects(Request $request)
    {
        $user = Auth::user();
        $student = Student::where('user_id', $user->id)->first();

        if (!$student) {
            return redirect()->route('login')->withErrors(['error' => 'Student profile not found.']);
        }

        // Get school year filter
        $schoolYear = $request->input('school_year', $student->school_year);

        // Get available school years
        $schoolYears = Student::select('school_year')
            ->distinct()
            ->orderBy('school_year', 'desc')
            ->pluck('school_year')
            ->map(function ($year) {
                return [
                    'value' => $year,
                    'label' => $year,
                ];
            });

        // Get subjects for the student's section
        $subjects = [];
        if ($student->current_section_id) {
            $subjects = DB::table('tbl_schedules')
                ->join('tbl_subjects', 'tbl_schedules.subject_id', '=', 'tbl_subjects.id')
                ->join('tbl_teachers', 'tbl_schedules.teacher_id', '=', 'tbl_teachers.id')
                ->where('tbl_schedules.class_section_id', $student->current_section_id)
                ->select(
                    'tbl_subjects.id',
                    'tbl_subjects.code as subject_code',
                    'tbl_subjects.name as subject_name',
                    'tbl_teachers.name as instructor'
                )
                ->distinct()
                ->get()
                ->map(function ($subject) {
                    return [
                        'id' => $subject->id,
                        'subjectCode' => $subject->subject_code ?? 'N/A',
                        'subjectName' => $subject->subject_name,
                        'instructor' => $subject->instructor,
                        'status' => 'Active',
                    ];
                });
        }

        return Inertia::render('student/enrolled-subjects/page', [
            'subjects' => $subjects,
            'schoolYears' => $schoolYears,
            'filters' => [
                'school_year' => $schoolYear,
            ],
            'auth' => [
                'user' => $user
            ]
        ]);
    }

    public function clearance()
    {
        $user = Auth::user();
        $student = Student::where('user_id', $user->id)->with('profile')->first();

        if (!$student) {
            return redirect()->route('login')->withErrors(['error' => 'Student profile not found.']);
        }

        $schoolYears = [$student->school_year];
        
        $clearances = [];
        foreach ($schoolYears as $year) {
            $hasSection = $student->current_section_id !== null;
            $hasProfile = $student->profile !== null;
            
            $status = ($hasSection && $hasProfile) ? 'Cleared' : 'Pending';
            
            $clearances[] = [
                'id' => $student->id,
                'schoolYear' => $year,
                'studentLRN' => $student->lrn,
                'studentName' => trim($student->first_name . ' ' . $student->last_name),
                'clearanceStatus' => $status,
            ];
        }

        return Inertia::render('student/clearance/page', [
            'clearances' => $clearances,
            'auth' => [
                'user' => $user
            ]
        ]);
    }

    public function schedule(Request $request)
    {
        $user = Auth::user();
        $student = Student::where('user_id', $user->id)->with(['gradeLevel', 'section'])->first();

        if (!$student) {
            return redirect()->route('login')->withErrors(['error' => 'Student profile not found.']);
        }

        // Get school year filter
        $schoolYear = $request->input('school_year', $student->school_year);

        // Get available school years
        $schoolYears = Student::select('school_year')
            ->distinct()
            ->orderBy('school_year', 'desc')
            ->pluck('school_year')
            ->map(function ($year) {
                return [
                    'value' => $year,
                    'label' => $year,
                ];
            });

        // Get student's schedules
        $schedules = [];
        if ($student->current_section_id) {
            $rawSchedules = DB::table('tbl_schedules')
                ->join('tbl_subjects', 'tbl_schedules.subject_id', '=', 'tbl_subjects.id')
                ->join('tbl_teachers', 'tbl_schedules.teacher_id', '=', 'tbl_teachers.id')
                ->leftJoin('tbl_room', 'tbl_schedules.room_id', '=', 'tbl_room.id')
                ->where('tbl_schedules.class_section_id', $student->current_section_id)
                ->select(
                    'tbl_schedules.day_of_week',
                    'tbl_schedules.start_time',
                    'tbl_schedules.end_time',
                    'tbl_room.room_number as room',
                    'tbl_subjects.name as subject_name',
                    'tbl_teachers.name as teacher_name'
                )
                ->orderBy('tbl_schedules.start_time')
                ->get();

            // Group schedules by time slots
            $timeSlots = [];
            foreach ($rawSchedules as $schedule) {
                $timeKey = $schedule->start_time . ' - ' . $schedule->end_time;
                
                if (!isset($timeSlots[$timeKey])) {
                    $timeSlots[$timeKey] = [
                        'time' => date('g:i A', strtotime($schedule->start_time)) . ' - ' . date('g:i A', strtotime($schedule->end_time)),
                        'monday' => '',
                        'tuesday' => '',
                        'wednesday' => '',
                        'thursday' => '',
                        'friday' => '',
                    ];
                }
                
                $dayKey = strtolower($schedule->day_of_week);
                $timeSlots[$timeKey][$dayKey] = $schedule->subject_name . "\n" . 
                                                $schedule->teacher_name . 
                                                ($schedule->room ? "\n" . $schedule->room : '');
            }

            // Convert to array
            $schedules = array_values($timeSlots);
        }

        return Inertia::render('student/schedule/page', [
            'schedules' => $schedules,
            'schoolYears' => $schoolYears,
            'studentInfo' => [
                'name' => trim($student->first_name . ' ' . $student->last_name),
                'lrn' => $student->lrn,
                'gradeLevel' => $student->gradeLevel ? $student->gradeLevel->name : 'N/A',
                'section' => $student->section ? $student->section->section_name : 'N/A',
            ],
            'filters' => [
                'school_year' => $schoolYear,
            ],
            'auth' => [
                'user' => $user
            ]
        ]);
    }

    public function reportCard(Request $request)
    {
        $user = Auth::user();
        $student = Student::where('user_id', $user->id)->with(['gradeLevel', 'section'])->first();

        if (!$student) {
            return redirect()->route('login')->withErrors(['error' => 'Student profile not found.']);
        }

        // Get school year filter
        $schoolYear = $request->input('school_year', $student->school_year);

        // Get available school years
        $schoolYears = Student::select('school_year')
            ->distinct()
            ->orderBy('school_year', 'desc')
            ->pluck('school_year')
            ->map(function ($year) {
                return [
                    'value' => $year,
                    'label' => $year,
                ];
            });

        // Get adviser for the student's section
        $adviser = 'N/A';
        if ($student->current_section_id) {
            $adviserRecord = DB::table('tbl_adviser_section')
                ->join('tbl_teachers', 'tbl_adviser_section.teacher_id', '=', 'tbl_teachers.id')
                ->where('tbl_adviser_section.class_section_id', $student->current_section_id)
                ->select('tbl_teachers.name')
                ->first();
            
            if ($adviserRecord) {
                $adviser = $adviserRecord->name;
            }
        }

        // Get grades for the student
        $grades = [];
        if ($student->current_section_id) {
            $grades = DB::table('tbl_grades')
                ->join('tbl_subjects', 'tbl_grades.subject_id', '=', 'tbl_subjects.id')
                ->join('tbl_teachers', 'tbl_grades.teacher_id', '=', 'tbl_teachers.id')
                ->where('tbl_grades.student_id', $student->id)
                ->where('tbl_grades.class_section_id', $student->current_section_id)
                ->where('tbl_grades.school_year', $schoolYear)
                ->select(
                    'tbl_grades.id',
                    'tbl_subjects.name as subject',
                    'tbl_teachers.name as teacher',
                    'tbl_grades.quarter_1',
                    'tbl_grades.quarter_2',
                    'tbl_grades.quarter_3',
                    'tbl_grades.quarter_4',
                    'tbl_grades.final_grade'
                )
                ->get()
                ->map(function ($grade) {
                    // Format grades to remove unnecessary decimals
                    $formatGrade = function($value) {
                        if ($value === null) return null;
                        $formatted = (float)$value;
                        return ($formatted == floor($formatted)) ? (int)$formatted : $formatted;
                    };

                    return [
                        'id' => $grade->id,
                        'subject' => $grade->subject,
                        'teacher' => $grade->teacher,
                        'quarter1' => $formatGrade($grade->quarter_1),
                        'quarter2' => $formatGrade($grade->quarter_2),
                        'quarter3' => $formatGrade($grade->quarter_3),
                        'quarter4' => $formatGrade($grade->quarter_4),
                        'finalGrade' => $formatGrade($grade->final_grade),
                    ];
                });
        }

        return Inertia::render('student/report-card/page', [
            'grades' => $grades,
            'schoolYears' => $schoolYears,
            'studentInfo' => [
                'lrn' => $student->lrn,
                'name' => trim($student->first_name . ' ' . $student->last_name),
                'gradeLevel' => $student->gradeLevel ? $student->gradeLevel->name : 'N/A',
                'section' => $student->section ? $student->section->section_name : 'N/A',
                'adviser' => $adviser,
            ],
            'filters' => [
                'school_year' => $schoolYear,
            ],
            'auth' => [
                'user' => $user
            ]
        ]);
    }

    public function notEnrolled()
    {
        // Fetch students who don't have a section assigned (not enrolled)
        $students = Student::with(['user', 'gradeLevel'])
            ->whereNull('current_section_id')
            ->get()
            ->map(function ($student) {
                $age = null;
                if ($student->birth_date) {
                    $age = \Carbon\Carbon::parse($student->birth_date)->age;
                }

                return [
                    'id' => $student->id,
                    'studentName' => trim($student->first_name . ' ' . $student->last_name),
                    'lrn' => $student->lrn,
                    'gender' => ucfirst($student->gender),
                    'age' => $age,
                    'gradeLevel' => $student->gradeLevel ? $student->gradeLevel->name : '',
                    'gradeLevelId' => $student->current_grade_level_id,
                    'section' => '',
                    'studentStatus' => $student->student_status,
                ];
            });

        $gradeLevels = \App\Models\GradeLevel::all()->map(function ($gradeLevel) {
            return [
                'id' => $gradeLevel->id,
                'name' => $gradeLevel->name,
            ];
        });

        $sections = \App\Models\ClassSection::with('gradeLevel')->get()->map(function ($section) {
            return [
                'id' => $section->id,
                'name' => $section->section_name,
                'grade_level_id' => $section->grade_level_id,
            ];
        });

        return Inertia::render('admin/enrollment/student-not-enrolled/page', [
            'students' => $students,
            'gradeLevels' => $gradeLevels,
            'sections' => $sections,
        ]);
    }

    public function assignSection(Request $request, Student $student)
    {
        $validated = $request->validate([
            'grade_level_id' => 'required|exists:tbl_grade_levels,id',
            'section_id' => 'required|exists:tbl_class_sections,id',
        ]);

        try {
            $student->update([
                'current_grade_level_id' => $validated['grade_level_id'],
                'current_section_id' => $validated['section_id'],
            ]);

            return redirect()->back()->with('success', 'Student assigned successfully');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Failed to assign student: ' . $e->getMessage()]);
        }
    }

    public function viewEdit()
    {
        // Fetch students who have been assigned a section (enrolled students)
        $students = Student::with(['user', 'gradeLevel', 'section'])
            ->whereNotNull('current_section_id')
            ->get()
            ->map(function ($student) {
                return [
                    'id' => $student->id,
                    'studentName' => trim($student->first_name . ' ' . $student->last_name),
                    'lrn' => $student->lrn,
                    'gradeLevel' => $student->gradeLevel ? $student->gradeLevel->name : '',
                    'section' => $student->section ? $student->section->section_name : '',
                ];
            });

        $gradeLevels = \App\Models\GradeLevel::all()->map(function ($gradeLevel) {
            return [
                'id' => $gradeLevel->id,
                'name' => $gradeLevel->name,
            ];
        });

        return Inertia::render('admin/admission/view-edit-student/page', [
            'students' => $students,
            'gradeLevels' => $gradeLevels,
        ]);
    }

    public function scheduleIndex()
    {
        // Fetch students who have been assigned a section
        $students = Student::with(['gradeLevel', 'section'])
            ->whereNotNull('current_section_id')
            ->get()
            ->map(function ($student) {
                return [
                    'id' => $student->id,
                    'studentName' => trim($student->first_name . ' ' . $student->last_name),
                    'lrn' => $student->lrn,
                    'gradeLevel' => $student->gradeLevel ? $student->gradeLevel->name : '',
                    'section' => $student->section ? $student->section->section_name : '',
                ];
            });

        return Inertia::render('admin/enrollment/student-schedule/page', [
            'students' => $students,
        ]);
    }

    public function scheduleShow(Student $student)
    {
        // Get the student's section
        $section = $student->section;
        
        if (!$section) {
            return redirect()->back()->withErrors(['error' => 'Student is not assigned to a section']);
        }

        // Fetch schedules for the student's section
        $schedules = Schedule::with(['subject', 'teacher', 'room'])
            ->where('class_section_id', $section->id)
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get()
            ->map(function ($schedule) {
                return [
                    'id' => $schedule->id,
                    'subject' => $schedule->subject->name ?? 'N/A',
                    'teacher' => $schedule->teacher->name ?? 'N/A',
                    'dateTime' => $schedule->day_of_week . ' ' . \Carbon\Carbon::parse($schedule->start_time)->format('g:i A') . ' - ' . \Carbon\Carbon::parse($schedule->end_time)->format('g:i A'),
                    'room' => $schedule->room ? $schedule->room->room_number : 'N/A',
                ];
            });

        $studentData = [
            'id' => $student->id,
            'studentName' => trim($student->first_name . ' ' . $student->last_name),
            'lrn' => $student->lrn,
            'gradeLevel' => $student->gradeLevel ? $student->gradeLevel->name : '',
            'section' => $section->section_name,
        ];

        return Inertia::render('admin/enrollment/student-schedule/show', [
            'student' => $studentData,
            'schedules' => $schedules,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_status' => 'required|in:new,transferee,returning',
            'lrn' => 'required|string|size:12|unique:tbl_students,lrn',
            'school_year' => 'required|string',
            'gender' => 'required|in:male,female',
            'birth_date' => 'required|date',
            'last_name' => 'required|string|max:255',
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'grade_level_id' => 'nullable|exists:tbl_grade_levels,id',
        ]);

        DB::beginTransaction();
        try {
            // Create user account for the student
            $user = User::create([
                'name' => trim($validated['first_name'] . ' ' . $validated['last_name']),
                'email' => strtolower($validated['lrn']) . '@student.snhs.edu.ph',
                'password' => Hash::make($validated['lrn']), // Default password is LRN
                'role' => 'student',
            ]);

            // Determine grade level
            // For new students, automatically assign Grade 7
            if ($validated['student_status'] === 'new') {
                $gradeLevel = \App\Models\GradeLevel::where('name', 'Grade 7')->first();
                $gradeLevelId = $gradeLevel ? $gradeLevel->id : null;
            } else {
                // For transferee and returning, use provided grade level or null
                $gradeLevelId = $validated['grade_level_id'] ?? null;
            }

            // Create student record
            Student::create([
                'user_id' => $user->id,
                'student_status' => $validated['student_status'],
                'lrn' => $validated['lrn'],
                'school_year' => $validated['school_year'],
                'last_name' => $validated['last_name'],
                'first_name' => $validated['first_name'],
                'middle_name' => $validated['middle_name'],
                'gender' => $validated['gender'],
                'birth_date' => $validated['birth_date'],
                'current_grade_level_id' => $gradeLevelId,
            ]);

            DB::commit();

            return redirect()->back()->with('success', 'Student registered successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Failed to register student: ' . $e->getMessage()]);
        }
    }

    public function edit($id)
    {
        $student = Student::with(['gradeLevel', 'section', 'profile'])->findOrFail($id);
        
        $age = null;
        if ($student->birth_date) {
            $age = \Carbon\Carbon::parse($student->birth_date)->age;
        }
        
        $studentData = [
            'id' => $student->id,
            'studentName' => trim($student->first_name . ' ' . $student->last_name),
            'lrn' => $student->lrn,
            'gender' => ucfirst($student->gender),
            'age' => $age,
            'gradeLevel' => $student->gradeLevel ? $student->gradeLevel->name : '',
            'section' => $student->section ? $student->section->section_name : '',
            'schoolYear' => $student->school_year,
            'lastName' => $student->last_name,
            'firstName' => $student->first_name,
            'middleName' => $student->middle_name,
            'birthDate' => $student->birth_date ? Carbon::parse($student->birth_date)->format('Y-m-d') : '',
            // Profile data
            'profile' => $student->profile ? [
                'extensionName' => $student->profile->extension_name,
                'religion' => $student->profile->religion,
                'indigenousPeople' => $student->profile->indigenous_people,
                'indigenousType' => $student->profile->indigenous_type,
                'pwd' => $student->profile->pwd,
                'pwdType' => $student->profile->pwd_type,
                'nationality' => $student->profile->nationality,
                'placeOfBirth' => $student->profile->place_of_birth,
                'mobileNumber' => $student->profile->mobile_number,
                'contactNumber' => $student->profile->contact_number,
                'guardianName' => $student->profile->guardian_name,
                'relation' => $student->profile->relation,
                'houseNo' => $student->profile->house_no,
                'cityMunicipality' => $student->profile->city_municipality,
                'provinceState' => $student->profile->province_state,
                'zipCode' => $student->profile->zip_code,
                'country' => $student->profile->country,
                'height' => $student->profile->height,
                'weight' => $student->profile->weight,
                'build' => $student->profile->build,
                'eyeColor' => $student->profile->eye_color,
                'hairColor' => $student->profile->hair_color,
                'fatherLastName' => $student->profile->father_last_name,
                'fatherFirstName' => $student->profile->father_first_name,
                'fatherMiddleName' => $student->profile->father_middle_name,
                'fatherExtensionName' => $student->profile->father_extension_name,
                'motherLastName' => $student->profile->mother_last_name,
                'motherFirstName' => $student->profile->mother_first_name,
                'motherMiddleName' => $student->profile->mother_middle_name,
                'motherExtensionName' => $student->profile->mother_extension_name,
                'guardianLastName' => $student->profile->guardian_last_name,
                'guardianFirstName' => $student->profile->guardian_first_name,
                'guardianMiddleName' => $student->profile->guardian_middle_name,
                'guardianExtensionName' => $student->profile->guardian_extension_name,
            ] : null,
        ];
        
        return Inertia::render('admin/admission/view-edit-student/edit', [
            'student' => $studentData
        ]);
    }

    public function updateProfile(Request $request, $id)
    {
        $student = Student::findOrFail($id);

        $validated = $request->validate([
            // Basic student info
            'lastName' => 'required|string|max:255',
            'firstName' => 'required|string|max:255',
            'middleName' => 'nullable|string|max:255',
            'dateOfBirth' => 'required|date',
            'gender' => 'required|in:Male,Female',
            
            // Profile data
            'extensionName' => 'nullable|string|max:50',
            'religion' => 'nullable|string|max:100',
            'indigenousPeople' => 'required|in:Yes,No',
            'indigenousType' => 'nullable|string|max:100',
            'pwd' => 'required|in:Yes,No',
            'pwdType' => 'nullable|string|max:100',
            'nationality' => 'nullable|string|max:100',
            'placeOfBirth' => 'nullable|string|max:255',
            'mobileNumber' => 'nullable|string|max:20',
            'contactNumber' => 'nullable|string|max:20',
            'guardianName' => 'nullable|string|max:255',
            'relation' => 'nullable|string|max:100',
            'houseNo' => 'nullable|string|max:255',
            'cityMunicipality' => 'nullable|string|max:100',
            'provinceState' => 'nullable|string|max:100',
            'zipCode' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'height' => 'nullable|numeric',
            'weight' => 'nullable|numeric',
            'build' => 'nullable|string|max:50',
            'eyeColor' => 'nullable|string|max:50',
            'hairColor' => 'nullable|string|max:50',
            'fatherLastName' => 'nullable|string|max:100',
            'fatherFirstName' => 'nullable|string|max:100',
            'fatherMiddleName' => 'nullable|string|max:100',
            'fatherExtensionName' => 'nullable|string|max:50',
            'motherLastName' => 'nullable|string|max:100',
            'motherFirstName' => 'nullable|string|max:100',
            'motherMiddleName' => 'nullable|string|max:100',
            'motherExtensionName' => 'nullable|string|max:50',
            'guardianLastName' => 'nullable|string|max:100',
            'guardianFirstName' => 'nullable|string|max:100',
            'guardianMiddleName' => 'nullable|string|max:100',
            'guardianExtensionName' => 'nullable|string|max:50',
        ]);

        DB::beginTransaction();
        try {
            // Update basic student info
            $student->update([
                'last_name' => $validated['lastName'],
                'first_name' => $validated['firstName'],
                'middle_name' => $validated['middleName'],
                'birth_date' => $validated['dateOfBirth'],
                'gender' => strtolower($validated['gender']),
            ]);

            // Update or create profile
            $student->profile()->updateOrCreate(
                ['profileable_id' => $student->id, 'profileable_type' => 'student'],
                [
                    'extension_name' => $validated['extensionName'],
                    'religion' => $validated['religion'],
                    'indigenous_people' => $validated['indigenousPeople'],
                    'indigenous_type' => $validated['indigenousType'],
                    'pwd' => $validated['pwd'],
                    'pwd_type' => $validated['pwdType'],
                    'nationality' => $validated['nationality'],
                    'place_of_birth' => $validated['placeOfBirth'],
                    'mobile_number' => $validated['mobileNumber'],
                    'contact_number' => $validated['contactNumber'],
                    'guardian_name' => $validated['guardianName'],
                    'relation' => $validated['relation'],
                    'house_no' => $validated['houseNo'],
                    'city_municipality' => $validated['cityMunicipality'],
                    'province_state' => $validated['provinceState'],
                    'zip_code' => $validated['zipCode'],
                    'country' => $validated['country'],
                    'height' => $validated['height'],
                    'weight' => $validated['weight'],
                    'build' => $validated['build'],
                    'eye_color' => $validated['eyeColor'],
                    'hair_color' => $validated['hairColor'],
                    'father_last_name' => $validated['fatherLastName'],
                    'father_first_name' => $validated['fatherFirstName'],
                    'father_middle_name' => $validated['fatherMiddleName'],
                    'father_extension_name' => $validated['fatherExtensionName'],
                    'mother_last_name' => $validated['motherLastName'],
                    'mother_first_name' => $validated['motherFirstName'],
                    'mother_middle_name' => $validated['motherMiddleName'],
                    'mother_extension_name' => $validated['motherExtensionName'],
                    'guardian_last_name' => $validated['guardianLastName'],
                    'guardian_first_name' => $validated['guardianFirstName'],
                    'guardian_middle_name' => $validated['guardianMiddleName'],
                    'guardian_extension_name' => $validated['guardianExtensionName'],
                ]
            );

            DB::commit();

            return redirect()->route('admin.admission.view-edit-student')->with('success', 'Student profile updated successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Failed to update student profile: ' . $e->getMessage()]);
        }
    }

    public function profileSettings()
    {
        $user = Auth::user();
        $student = Student::where('user_id', $user->id)->with('profile')->first();

        if (!$student) {
            return redirect()->route('login')->withErrors(['error' => 'Student profile not found.']);
        }

        return Inertia::render('student/profile-settings/page', [
            'student' => [
                'firstName' => $student->first_name,
                'lastName' => $student->last_name,
                'email' => $user->email,
                'phone' => $student->profile ? ($student->profile->mobile_number ?? '') : '',
                'birthDate' => $student->birth_date ? $student->birth_date->format('Y-m-d') : '',
                'address' => $student->profile ? ($student->profile->house_no ?? '') : '',
            ],
            'auth' => [
                'user' => $user
            ]
        ]);
    }

    public function updateProfileSettings(Request $request)
    {
        $user = User::find(Auth::id());
        $student = Student::where('user_id', $user->id)->first();

        if (!$student) {
            return redirect()->route('login')->withErrors(['error' => 'Student profile not found.']);
        }

        $validated = $request->validate([
            'firstName' => 'required|string|max:255',
            'lastName' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'birthDate' => 'nullable|date',
            'address' => 'nullable|string|max:255',
        ]);

        DB::beginTransaction();

        try {
            $student->update([
                'first_name' => $validated['firstName'],
                'last_name' => $validated['lastName'],
                'birth_date' => $validated['birthDate'],
            ]);

            $user->update([
                'name' => $validated['firstName'] . ' ' . $validated['lastName'],
            ]);

            // Update or create profile
            if ($student->profile) {
                $student->profile->update([
                    'mobile_number' => $validated['phone'],
                    'house_no' => $validated['address'],
                ]);
            } else {
                $student->profile()->create([
                    'profileable_type' => 'student',
                    'mobile_number' => $validated['phone'],
                    'house_no' => $validated['address'],
                ]);
            }

            DB::commit();

            return redirect()->route('student.profile-settings')->with('success', 'Profile updated successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to update profile: ' . $e->getMessage()]);
        }
    }

    public function updateStudentPassword(Request $request)
    {
        $user = User::find(Auth::id());

        $validated = $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        // Check if current password is correct
        if (!Hash::check($validated['current_password'], $user->password)) {
            return back()->withErrors(['current_password' => 'Current password is incorrect']);
        }

        try {
            $user->update([
                'password' => Hash::make($validated['new_password']),
            ]);

            return redirect()->route('student.profile-settings')->with('success', 'Password changed successfully');
            // will remove and use the texterror component
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to change password: ' . $e->getMessage()]);
        }
    }
}
