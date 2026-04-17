<?php

namespace App\Http\Controllers;

use App\Models\ClassSection;
use App\Models\GradeLevel;
use App\Models\Student;
use App\Models\User;
use App\Models\Schedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
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

public function notEnrolled(Request $request)
{
    // 1. Sanitize and Get filter parameters
    $search = $request->input('search');
    $gradeLevelFilter = $request->input('grade_level');
    $genderFilter = $request->input('gender');
    $ageFilter = $request->input('age');

    // 2. Build Student Query
    $query = Student::with(['gradeLevel']) // 'user' removed unless you actually use user data below
        ->whereNull('current_section_id');

    // Apply search filter (name or LRN)
    if ($search) {
        $query->where(function ($q) use ($search) {
            $q->where('lrn', 'like', "%{$search}%")
              ->orWhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ["%{$search}%"])
              ->orWhereRaw("CONCAT(last_name, ' ', first_name) LIKE ?", ["%{$search}%"]);
        });
    }

    if ($gradeLevelFilter) {
        $query->where('current_grade_level_id', $gradeLevelFilter);
    }

    if ($genderFilter) {
        $query->where('gender', strtolower($genderFilter));
    }

    // Optimization: Filter Age at the Database level instead of in memory
    if ($ageFilter) {
        $query->whereRaw("FLOOR(DATEDIFF(CURDATE(), birth_date) / 365.25) = ?", [$ageFilter]);
    }

    $students = $query->get()->map(fn($student) => [
        'id' => $student->id,
        'studentName' => trim("{$student->first_name} {$student->last_name}"),
        'lrn' => $student->lrn,
        'gender' => ucfirst($student->gender),
        'age' => $student->birth_date ? Carbon::parse($student->birth_date)->age : null,
        'gradeLevel' => $student->gradeLevel->name ?? '',
        'gradeLevelId' => $student->current_grade_level_id,
        'section' => '',
        'studentStatus' => $student->student_status,
    ]);

    // 3. Fetch Grade Levels (Keep it simple)
    $gradeLevels = GradeLevel::select('id', 'name')->get();

    // 4. Fetch Sections (Fixed N+1 issue using withCount)
    $sections = ClassSection::with(['gradeLevel', 'room'])
        ->withCount('students') // Automatically adds a 'students_count' attribute
        ->get()
        ->map(function ($section) {
            $capacity = $section->room->capacity ?? 0;
            $currentStudents = $section->students_count;
            $availableSlots = max(0, $capacity - $currentStudents);

            return [
                'id' => $section->id,
                'name' => $section->section_name,
                'grade_level_id' => $section->grade_level_id,
                'room_number' => $section->room->room_number ?? 'No Room',
                'capacity' => $capacity,
                'current_students' => $currentStudents,
                'available_slots' => $availableSlots,
                'is_full' => $availableSlots <= 0,
            ];
        });

    return Inertia::render('admin/enrollment/student-not-enrolled/page', [
        'students' => $students,
        'gradeLevels' => $gradeLevels,
        'sections' => $sections,
        'filters' => $request->only(['search', 'grade_level', 'gender', 'age']),
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

    public function scheduleIndex(Request $request)
    {
        $search = $request->input('search', '');
        
        // Fetch students who have been assigned a section with pagination
        $students = Student::with(['gradeLevel', 'section'])
            ->whereNotNull('current_section_id')
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                      ->orWhere('last_name', 'like', "%{$search}%")
                      ->orWhere('lrn', 'like', "%{$search}%");
                });
            })
            ->paginate(10)
            ->through(function ($student) {
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
            'filters' => [
                'search' => $search,
            ],
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
                    'day_of_week' => $schedule->day_of_week,
                    'start_time' => \Carbon\Carbon::parse($schedule->start_time)->format('g:i A'),
                    'end_time' => \Carbon\Carbon::parse($schedule->end_time)->format('g:i A'),
                    'time_slot' => \Carbon\Carbon::parse($schedule->start_time)->format('g:i A') . ' - ' . \Carbon\Carbon::parse($schedule->end_time)->format('g:i A'),
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
            'lrn' => 'required|numeric|size:12|unique:tbl_students,lrn',
            'school_year' => 'required|string',
            'gender' => 'required|in:male,female',
            'birth_date' => 'required|date|before_or_equal:-10 years',
            'last_name' => 'required|string|max:255',
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'grade_level_id' => 'nullable|exists:tbl_grade_levels,id',
            'has_psa_birth_certificate' => 'nullable|boolean',
            'has_sf9' => 'nullable|boolean',
            'has_report_card' => 'nullable|boolean',
            'has_good_moral' => 'nullable|boolean',
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
            $student = Student::create([
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
                'has_psa_birth_certificate' => $validated['has_psa_birth_certificate'] ?? false,
                'has_sf9' => $validated['has_sf9'] ?? false,
                'has_report_card' => $validated['has_report_card'] ?? false,
                'has_good_moral' => $validated['has_good_moral'] ?? false,
            ]);

            // Create student profile using polymorphic relationship
            $student->profile()->create([
                'place_of_birth' => 'Bongabon, Nueva Ecija',
                'city_municipality' => 'Bongabon',
                'province_state' => 'Nueva Ecija',
                'country' => 'Philippines',
                'nationality' => 'Filipino',
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

    public function export(Request $request)
    {
        $format = $request->input('format', 'csv'); // Default to CSV
        
        try {
            // Check if ZipArchive is available for XLSX
            if ($format === 'xlsx' && !class_exists('ZipArchive')) {
                return back()->withErrors(['export' => 'XLSX export is not available. Please use CSV format or enable the zip extension.']);
            }
            
            $students = Student::with(['user', 'gradeLevel'])->get();

            $extension = $format === 'xlsx' ? 'xlsx' : 'csv';
            $writer = \Spatie\SimpleExcel\SimpleExcelWriter::streamDownload('students_' . date('Y-m-d_His') . '.' . $extension);
            
            // Add header row
            $writer->addHeader([
                'LRN',
                'First Name',
                'Middle Name',
                'Last Name',
                'Date of Birth',
                'Gender',
                'Student Status',
                'Grade Level',
                'School Year',
                'PSA Birth Certificate',
                'SF9',
                'Report Card',
                'Good Moral',
            ]);

            // Add data rows
            foreach ($students as $student) {
                $writer->addRow([
                    "'" . $student->lrn, // Prepend with single quote to force text format
                    $student->first_name,
                    $student->middle_name ?? '',
                    $student->last_name,
                    $student->birth_date ? \Carbon\Carbon::parse($student->birth_date)->format('Y-m-d') : '',
                    $student->gender,
                    $student->student_status,
                    $student->gradeLevel->name ?? '',
                    $student->school_year ?? '',
                    $student->has_psa_birth_certificate ? 'Yes' : 'No',
                    $student->has_sf9 ? 'Yes' : 'No',
                    $student->has_report_card ? 'Yes' : 'No',
                    $student->has_good_moral ? 'Yes' : 'No',
                ]);
            }

            return $writer->toBrowser();
        } catch (\Exception $e) {
            Log::error('Export failed', ['message' => $e->getMessage(), 'format' => $format]);
            return back()->withErrors(['export' => 'Export failed: ' . $e->getMessage()]);
        }
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:2048',
        ]);

        // Manually check file extension
        $file = $request->file('file');
        $extension = strtolower($file->getClientOriginalExtension());
        
        if (!in_array($extension, ['csv', 'xlsx', 'xls'])) {
            return back()->withErrors(['file' => 'The file must be a CSV, XLSX, or XLS file.']);
        }

        try {
            $imported = 0;
            $errors = [];
            $importedStudents = [];
            
            // Create a temporary file with the correct extension
            $tempPath = $file->getRealPath();
            $newTempPath = $tempPath . '.' . $extension;
            copy($tempPath, $newTempPath);

            // Create reader based on file extension
            if (strtolower($extension) === 'csv') {
                $reader = \Spatie\SimpleExcel\SimpleExcelReader::create($newTempPath, 'csv');
            } else {
                $reader = \Spatie\SimpleExcel\SimpleExcelReader::create($newTempPath);
            }
            
            Log::info('Starting import process', ['file' => $file->getClientOriginalName()]);
            
            $reader->getRows()->each(function (array $row) use (&$imported, &$errors, &$importedStudents) {
                Log::info('Processing row', ['row' => $row]);
                try {
                    // Skip header row
                    if (isset($row['LRN']) && $row['LRN'] === 'LRN') {
                        return;
                    }

                    // Validate required fields
                    if (empty($row['LRN']) || empty($row['First Name']) || empty($row['Last Name'])) {
                        $errors[] = "Row skipped: Missing required fields (LRN: {$row['LRN']})";
                        return;
                    }

                    // Auto-generate email from LRN
                    $email = 'SNHS-' . $row['LRN'];

                    // Check if LRN already exists
                    $existingStudent = Student::where('lrn', $row['LRN'])->first();
                    if ($existingStudent) {
                        $existingName = trim($existingStudent->first_name . ' ' . $existingStudent->last_name);
                        $errors[] = "Row skipped: Student '{$existingName}' with LRN {$row['LRN']} is already registered";
                        return;
                    }

                    // Check if email already exists
                    if (User::where('email', $email)->exists()) {
                        $errors[] = "Row skipped: Email {$email} already exists";
                        return;
                    }

                    // Find grade level
                    $gradeLevel = \App\Models\GradeLevel::where('name', $row['Grade Level'])->first();
                    if (!$gradeLevel) {
                        $errors[] = "Row skipped: Grade level '{$row['Grade Level']}' not found (LRN: {$row['LRN']})";
                        return;
                    }

                    // Create user
                    $user = User::create([
                        'name' => $row['First Name'] . ' ' . $row['Last Name'],
                        'email' => $email,
                        'password' => Hash::make($row['LRN']),
                        'role' => 'student',
                    ]);

                    // Create student
                    $student = Student::create([
                        'user_id' => $user->id,
                        'lrn' => $row['LRN'],
                        'first_name' => $row['First Name'],
                        'middle_name' => $row['Middle Name'] ?? null,
                        'last_name' => $row['Last Name'],
                        'birth_date' => $row['Date of Birth'],
                        'gender' => strtolower($row['Gender']),
                        'student_status' => strtolower($row['Student Status']),
                        'current_grade_level_id' => $gradeLevel->id,
                        'school_year' => $row['School Year'] ?? '',
                        'has_psa_birth_certificate' => isset($row['PSA Birth Certificate']) && strtolower($row['PSA Birth Certificate']) === 'yes',
                        'has_sf9' => isset($row['SF9']) && strtolower($row['SF9']) === 'yes',
                        'has_report_card' => isset($row['Report Card']) && strtolower($row['Report Card']) === 'yes',
                        'has_good_moral' => isset($row['Good Moral']) && strtolower($row['Good Moral']) === 'yes',
                    ]);

                    // Create student profile using polymorphic relationship
                    $student->profile()->create([
                        'place_of_birth' => 'Bongabon, Nueva Ecija',
                        'city_municipality' => 'Bongabon',
                        'province_state' => 'Nueva Ecija',
                        'country' => 'Philippines',
                        'nationality' => 'Filipino',
                    ]);

                    // Calculate age
                    $birthDate = \Carbon\Carbon::parse($row['Date of Birth']);
                    $age = $birthDate->age;

                    // Add to imported students list
                    $importedStudents[] = [
                        'name' => $row['Last Name'] . ', ' . $row['First Name'] . ($row['Middle Name'] ? ' ' . $row['Middle Name'] : ''),
                        'lrn' => $row['LRN'],
                        'age' => $age,
                        'date_of_birth' => $birthDate->format('F d, Y'),
                        'status' => ucfirst($row['Student Status']),
                    ];

                    $imported++;
                } catch (\Exception $e) {
                    $errors[] = "Row error: " . $e->getMessage();
                }
            });

            // Close the reader to release file handle
            unset($reader);

            // Clean up temporary file
            if (file_exists($newTempPath)) {
                @unlink($newTempPath);
            }

            Log::info('Import completed', [
                'imported' => $imported,
                'errors_count' => count($errors),
                'errors' => $errors
            ]);

            if ($imported > 0) {
                return back()->with([
                    'success' => "$imported student(s) imported successfully!",
                    'imported_students' => $importedStudents,
                    'import_errors' => $errors
                ]);
            } else {
                // Return errors even when no students were imported
                return back()->with([
                    'import_errors' => $errors,
                    'imported_students' => []
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Import exception', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return back()->withErrors(['import' => 'Import failed: ' . $e->getMessage()]);
        }
    }

    public function downloadTemplate()
    {
        $rows = [
            [
                'LRN',
                'First Name',
                'Middle Name',
                'Last Name',
                'Date of Birth',
                'Gender',
                'Student Status',
                'Grade Level',
                'School Year',
                'PSA Birth Certificate',
                'SF9',
                'Report Card',
                'Good Moral',
            ],
            [
                '123456789012',
                'Juan',
                'Dela',
                'Cruz',
                '2010-01-15',
                'male',
                'new',
                'Grade 7',
                '2026-2027',
                'Yes',
                'Yes',
                'No',
                'No',
            ],
            [
                '123456789013',
                'Maria',
                'Santos',
                'Garcia',
                '2009-03-22',
                'female',
                'transferee',
                'Grade 8',
                '2026-2027',
                'Yes',
                'Yes',
                'No',
                'Yes',
            ],
        ];

        $writer = \Spatie\SimpleExcel\SimpleExcelWriter::streamDownload('student_import_template.xlsx');
        
        foreach ($rows as $row) {
            $writer->addRow($row);
        }

        return $writer->toBrowser();
    }

    public function searchReturningStudents(Request $request)
    {
        $search = $request->input('search', '');
        
        // Get students with 'returning' status who can be re-enrolled
        $students = Student::with(['gradeLevel'])
            ->where('student_status', 'returning')
            ->where(function($query) use ($search) {
                $query->where('lrn', 'like', "%{$search}%")
                    ->orWhere('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhereRaw("CONCAT(first_name, ' ', last_name) like ?", ["%{$search}%"]);
            })
            ->limit(10)
            ->get()
            ->map(function($student) {
                return [
                    'id' => $student->id,
                    'lrn' => $student->lrn,
                    'name' => trim($student->first_name . ' ' . ($student->middle_name ? $student->middle_name . ' ' : '') . $student->last_name),
                    'current_grade_level' => $student->gradeLevel ? $student->gradeLevel->name : 'N/A',
                    'current_grade_level_id' => $student->current_grade_level_id,
                    'school_year' => $student->school_year,
                    'birth_date' => $student->birth_date ? $student->birth_date->format('Y-m-d') : null,
                    'gender' => $student->gender,
                ];
            });

        return response()->json($students);
    }

    public function enrollmentList(Request $request)
    {
        $query = Student::with([
            'section.gradeLevel',
            'section.adviserSections.teacher',
            'gradeLevel'
        ])
        ->whereNotNull('current_section_id');

        // Apply filters
        if ($request->filled('grade_level')) {
            $query->where('current_grade_level_id', $request->grade_level);
        }

        if ($request->filled('section')) {
            $query->where('current_section_id', $request->section);
        }

        if ($request->filled('search')) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                // Search in student name
                $q->where(DB::raw("CONCAT(first_name, ' ', COALESCE(middle_name, ''), ' ', last_name)"), 'like', '%' . $searchTerm . '%')
                  // Search in adviser name
                  ->orWhereHas('section.adviserSections.teacher', function ($q) use ($searchTerm) {
                      $q->where('name', 'like', '%' . $searchTerm . '%');
                  });
            });
        }

        $students = $query->get()->map(function ($student) {
            $section = $student->section;
            $adviser = $section && $section->adviserSections->isNotEmpty() 
                ? $section->adviserSections->first()->teacher->name 
                : 'Not Assigned';

            return [
                'id' => $student->id,
                'student_name' => trim($student->first_name . ' ' . ($student->middle_name ? $student->middle_name . ' ' : '') . $student->last_name),
                'lrn' => $student->lrn,
                'section' => $section ? $section->section_name : 'N/A',
                'section_id' => $student->current_section_id,
                'grade_level' => $student->gradeLevel ? $student->gradeLevel->name : 'N/A',
                'grade_level_id' => $student->current_grade_level_id,
                'adviser' => $adviser,
            ];
        });

        // Get all grade levels for filter
        $gradeLevels = \App\Models\GradeLevel::orderBy('name')->get();

        // Get all sections for filter
        $sections = \App\Models\ClassSection::with('gradeLevel')
            ->orderBy('section_name')
            ->get()
            ->map(function ($section) {
                return [
                    'id' => $section->id,
                    'section_name' => $section->section_name,
                    'grade_level' => $section->gradeLevel->name ?? 'N/A',
                ];
            });

        return Inertia::render('admin/enrollment/enrollment-list/page', [
            'students' => $students,
            'gradeLevels' => $gradeLevels,
            'sections' => $sections,
            'filters' => [
                'grade_level' => $request->grade_level,
                'section' => $request->section,
                'search' => $request->search,
            ],
        ]);
    }
}
