<?php

namespace App\Http\Controllers;

use App\Models\ClassSection;
use App\Models\GradeLevel;
use App\Models\Student;
use App\Models\User;
use App\Models\Schedule;
use App\Models\Archive;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Carbon;
use App\Models\ActivityLog;
use App\Jobs\ImportStudentsJob;
use Illuminate\Support\Str;

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
                        'status' => 'Enrolled',
                    ];
                });
        }

        return Inertia::render('student/enrolled-subjects/page', [
            'subjects' => $subjects,
            'schoolYears' => $schoolYears,
            'filters' => [
                'school_year' => $schoolYear,
            ],
        ]);
    }

    public function clearance()
    {
        $user = Auth::user();
        $student = Student::where('user_id', $user->id)->with('profile')->first();

        if (!$student) {
            return redirect()->route('login')->withErrors(['error' => 'Student profile not found.']);
        }

        $subjectClearances = [];
        $schoolYear = $student->school_year;

        if ($student->current_section_id) {
            // Get all scheduled subjects for the student's section with teacher info
            $scheduledSubjects = DB::table('tbl_schedules')
                ->join('tbl_subjects', 'tbl_schedules.subject_id', '=', 'tbl_subjects.id')
                ->join('tbl_teachers', 'tbl_schedules.teacher_id', '=', 'tbl_teachers.id')
                ->where('tbl_schedules.class_section_id', $student->current_section_id)
                ->select(
                    'tbl_subjects.id as subject_id',
                    'tbl_subjects.name as subject_name',
                    'tbl_subjects.code as subject_code',
                    'tbl_teachers.id as teacher_id',
                    'tbl_teachers.name as teacher_name',
                )
                ->distinct()
                ->get();

            // Get all clearances for this student in the current section/year
            $clearances = \App\Models\Clearance::where('student_id', $student->id)
                ->where('class_section_id', $student->current_section_id)
                ->where('school_year', $schoolYear)
                ->get()
                ->keyBy('subject_id');

            $subjectClearances = $scheduledSubjects->map(function ($subject) use ($clearances) {
                $clearance = $clearances->get($subject->subject_id);
                return [
                    'subject_id' => $subject->subject_id,
                    'subject_name' => $subject->subject_name,
                    'subject_code' => $subject->subject_code,
                    'teacher_name' => $subject->teacher_name,
                    'status' => $clearance?->status ?? 'pending',
                ];
            })->values()->toArray();
        }

        $totalSubjects = count($subjectClearances);
        $clearedCount = collect($subjectClearances)->where('status', 'cleared')->count();
        $overallStatus = ($totalSubjects > 0 && $clearedCount >= $totalSubjects) ? 'Cleared' : 'Pending';

        return Inertia::render('student/clearance/page', [
            'clearanceInfo' => [
                'schoolYear' => $schoolYear,
                'studentLRN' => $student->lrn,
                'studentName' => trim($student->first_name . ' ' . $student->last_name),
                'overallStatus' => $overallStatus,
                'clearedSubjects' => $clearedCount,
                'totalSubjects' => $totalSubjects,
            ],
            'subjectClearances' => $subjectClearances,
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
                    'tbl_room.room_name as room',
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
                    $formatGrade = function ($value) {
                        if ($value === null)
                            return null;
                        return (int) round((float) $value, 0, PHP_ROUND_HALF_UP);
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
                    'room_name' => $section->room->room_name ?? 'No Room',
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
        $students = Student::with(['user', 'gradeLevel', 'section'])
            ->get()  // Remove the whereNotNull filter
            ->map(function ($student) {
                return [
                    'id' => $student->id,
                    'studentName' => trim($student->first_name . ' ' . $student->last_name),
                    'lrn' => $student->lrn,
                    'gradeLevel' => $student->gradeLevel ? $student->gradeLevel->name : '',
                    'section' => $student->section ? $student->section->section_name : '',
                    'readyToGraduate' => $student->ready_to_graduate ?? false,
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

    public function userManagement()
    {
        $students = Student::with('gradeLevel')
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get()
            ->map(function ($student) {
                return [
                    'id' => $student->id,
                    'lrn' => $student->lrn,
                    'name' => trim($student->first_name . ' ' . ($student->middle_name ? $student->middle_name . ' ' : '') . $student->last_name),
                    'grade_level' => $student->gradeLevel ? $student->gradeLevel->name : 'N/A',
                    'requires_password_change' => $this->studentRequiresPasswordChange($student),
                ];
            });

        $gradeLevels = GradeLevel::select('id', 'name')->get();

        return Inertia::render('admin/user-management/student/page', [
            'students' => $students,
            'gradeLevels' => $gradeLevels,
        ]);
    }

    private function studentRequiresPasswordChange(Student $student): bool
    {
        $user = User::find($student->user_id);
        return $user ? !$user->password_changed : false;
    }

    public function resetPassword(Student $student)
    {
        $user = User::find($student->user_id);

        if (!$user) {
            return back()->withErrors(['error' => 'This student does not have a linked user account.']);
        }

        DB::beginTransaction();
        try {
            $user->update([
                'password' => Hash::make($student->lrn),
                'password_changed' => false, // forces redirect to change-password on next login
            ]);

            ActivityLog::create([
                'user_id' => Auth::id(),
                'action' => 'reset_password',
                'description' => 'Reset password for student: ' . trim($student->first_name . ' ' . $student->last_name) . ' (LRN: ' . $student->lrn . ')',
            ]);

            DB::commit();

            return redirect()->back()->with('success', 'Password reset successfully. The student must set a new password on their next login.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to reset password: ' . $e->getMessage()]);
        }
    }

    public function scheduleIndex(Request $request)
    {
        $search = $request->input('search', '');
        $gradeLevelFilter = $request->input('grade_level');
        $perPage = $request->input('per_page', 10);

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
            ->when($gradeLevelFilter, function ($query, $gradeLevelFilter) {
                $query->where('current_grade_level_id', $gradeLevelFilter);
            })
            ->paginate($perPage)
            ->through(function ($student) {
                return [
                    'id' => $student->id,
                    'studentName' => trim($student->first_name . ' ' . $student->last_name),
                    'lrn' => $student->lrn,
                    'gradeLevel' => $student->gradeLevel ? $student->gradeLevel->name : '',
                    'section' => $student->section ? $student->section->section_name : '',
                ];
            });

        // Fetch grade levels for filter dropdown
        $gradeLevels = GradeLevel::select('id', 'name')->get();

        return Inertia::render('admin/enrollment/student-schedule/page', [
            'students' => $students,
            'gradeLevels' => $gradeLevels,
            'filters' => [
                'search' => $search,
                'grade_level' => $gradeLevelFilter,
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
                    'room' => $schedule->room ? $schedule->room->room_name : 'N/A',
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
        // Base validation rules
        $rules = [
            'student_status' => 'required|in:new,transferee,returning',
            'lrn' => 'required|string|digits:12',
            'school_year' => 'required|string',
            'gender' => 'required|in:male,female',
            'birth_date' => 'required|date|before_or_equal:-10 years',
            'last_name' => 'required|string|max:255',
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'suffix' => 'nullable|string|max:10',
            'grade_level_id' => 'nullable|exists:tbl_grade_levels,id',
            'has_psa_birth_certificate' => 'nullable|boolean',
            'has_sf9' => 'nullable|boolean',
            'has_report_card' => 'required|accepted',
            'has_good_moral' => 'nullable|boolean',
        ];

        $messages = [
            'has_report_card.required' => 'Form 138 (SF9) is required when enrolling.',
            'has_report_card.accepted' => 'Form 138 (SF9) must be submitted.',
        ];

        // Conditional validation based on student status
        $studentStatus = $request->input('student_status');

        // For returning students (old): PSA Birth Certificate and Good Moral are required
        if ($studentStatus === 'returning') {
            $rules['has_psa_birth_certificate'] = 'required|accepted';
            $rules['has_good_moral'] = 'required|accepted';
            $messages['has_psa_birth_certificate.required'] = 'PSA Birth Certificate is required for returning students.';
            $messages['has_psa_birth_certificate.accepted'] = 'PSA Birth Certificate must be submitted for returning students.';
            $messages['has_good_moral.required'] = 'Good Moral Certificate is required for returning students.';
            $messages['has_good_moral.accepted'] = 'Good Moral Certificate must be submitted for returning students.';
        }

        // For transferees: Good Moral is required
        if ($studentStatus === 'transferee') {
            $rules['has_good_moral'] = 'required|accepted';
            $messages['has_good_moral.required'] = 'Good Moral Certificate is required for transferee students.';
            $messages['has_good_moral.accepted'] = 'Good Moral Certificate must be submitted for transferee students.';
        }

        $validated = $request->validate($rules, $messages);

        DB::beginTransaction();
        try {
            // Check if student with this LRN already exists
            $existingStudent = Student::where('lrn', $validated['lrn'])->first();

            if ($existingStudent) {
                // If student exists and is being registered for the same school year, reject
                if ($existingStudent->school_year === $validated['school_year']) {
                    DB::rollBack();
                    $studentName = trim($existingStudent->first_name . ' ' . $existingStudent->last_name);
                    return redirect()->back()->withErrors([
                        'lrn' => "Student '{$studentName}' with LRN {$validated['lrn']} is already registered for school year {$validated['school_year']}."
                    ])->withInput();
                }

                // If student exists and status is 'returning', validate grade level progression
                if ($validated['student_status'] === 'returning') {
                    $currentGradeLevel = $existingStudent->gradeLevel;
                    $newGradeLevel = \App\Models\GradeLevel::find($validated['grade_level_id']);

                    if ($currentGradeLevel && $newGradeLevel) {
                        // Extract grade numbers (e.g., "Grade 7" -> 7)
                        $currentGradeNumber = (int) filter_var($currentGradeLevel->name, FILTER_SANITIZE_NUMBER_INT);
                        $newGradeNumber = (int) filter_var($newGradeLevel->name, FILTER_SANITIZE_NUMBER_INT);

                        // Validate that new grade is exactly one level higher
                        if ($newGradeNumber !== $currentGradeNumber + 1) {
                            DB::rollBack();
                            $studentName = trim($existingStudent->first_name . ' ' . $existingStudent->last_name);
                            return redirect()->back()->withErrors([
                                'grade_level_id' => "Student '{$studentName}' is currently in {$currentGradeLevel->name}. They can only advance to Grade " . ($currentGradeNumber + 1) . "."
                            ])->withInput();
                        }

                        // Check if student has already graduated (Grade 10)
                        if ($currentGradeNumber >= 10) {
                            DB::rollBack();
                            $studentName = trim($existingStudent->first_name . ' ' . $existingStudent->last_name);
                            return redirect()->back()->withErrors([
                                'lrn' => "Student '{$studentName}' has already completed Grade 10 and cannot be re-enrolled."
                            ])->withInput();
                        }
                    }

                    // Update existing student record for new school year
                    $existingStudent->update([
                        'school_year' => $validated['school_year'],
                        'current_grade_level_id' => $validated['grade_level_id'],
                        'student_status' => 'returning',
                        'has_psa_birth_certificate' => $validated['has_psa_birth_certificate'] ?? $existingStudent->has_psa_birth_certificate,
                        'has_sf9' => $validated['has_sf9'] ?? $existingStudent->has_sf9,
                        'has_report_card' => $validated['has_report_card'] ?? $existingStudent->has_report_card,
                        'has_good_moral' => $validated['has_good_moral'] ?? $existingStudent->has_good_moral,
                    ]);

                    DB::commit();
                    return redirect()->back()->with('success', 'Returning student registered successfully for the new school year');
                }

                // If student exists but not returning status, reject duplicate
                DB::rollBack();
                $studentName = trim($existingStudent->first_name . ' ' . $existingStudent->last_name);
                return redirect()->back()->withErrors([
                    'lrn' => "Student '{$studentName}' with LRN {$validated['lrn']} already exists in the system. Use 'Old Student' tab for returning students."
                ])->withInput();
            }

            // Create user account for the student (new student only)
            $user = User::create([
                'name' => trim($validated['first_name'] . ' ' . $validated['last_name']),
                'email' => 'SNHS-' . $validated['lrn'],
                'password' => Hash::make($validated['lrn']), // Default password is LRN
                'role' => 'student',
                'password_changed' => false, // Force password change on first login
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
                'suffix' => $validated['suffix'] ?? null,
                'gender' => $validated['gender'],
                'birth_date' => $validated['birth_date'],
                'current_grade_level_id' => $gradeLevelId,
                'has_psa_birth_certificate' => $validated['has_psa_birth_certificate'] ?? false,
                'has_sf9' => $validated['has_sf9'] ?? false,
                'has_report_card' => $validated['has_report_card'] ?? false,
                'has_good_moral' => $validated['has_good_moral'] ?? false,
            ]);

            // Create student profile using relationship
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
            'student' => $studentData,
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
                ['profileable_id' => $student->id],
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
        $student = Student::where('user_id', $user->id)->with(['profile', 'profilePicture'])->first();

        if (!$student) {
            return redirect()->route('login')->withErrors(['error' => 'Student profile not found.']);
        }

        return Inertia::render('student/profile-settings/page', [
            'student' => [
                'firstName' => $student->first_name,
                'lastName' => $student->last_name,
                'email' => $user->email,
                'mobileNumber' => $student->profile ? ($student->profile->mobile_number ?? '') : '',
                'contactNumber' => $student->profile ? ($student->profile->contact_number ?? '') : '',
                'birthDate' => $student->birth_date ? $student->birth_date->format('Y-m-d') : '',
                'placeOfBirth' => $student->profile ? ($student->profile->place_of_birth ?? '') : '',
                'cityMunicipality' => $student->profile ? ($student->profile->city_municipality ?? '') : '',
                'provinceState' => $student->profile ? ($student->profile->province_state ?? '') : '',
                'country' => $student->profile ? ($student->profile->country ?? '') : '',
                'nationality' => $student->profile ? ($student->profile->nationality ?? '') : '',
                'religion' => $student->profile ? ($student->profile->religion ?? '') : '',
                'profile_picture' => $student->profilePicture && $student->profilePicture->file_path ? asset('storage/' . $student->profilePicture->file_path) : null,
            ],
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
            'mobileNumber' => 'nullable|string|max:11',
            'contactNumber' => 'nullable|string|max:11',
            'birthDate' => 'nullable|date',
            'placeOfBirth' => 'nullable|string|max:255',
            'cityMunicipality' => 'nullable|string|max:255',
            'provinceState' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:255',
            'nationality' => 'nullable|string|max:255',
            'religion' => 'nullable|string|max:255',
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
                    'mobile_number' => $validated['mobileNumber'],
                    'contact_number' => $validated['contactNumber'],
                    'place_of_birth' => $validated['placeOfBirth'],
                    'city_municipality' => $validated['cityMunicipality'],
                    'province_state' => $validated['provinceState'],
                    'country' => $validated['country'],
                    'nationality' => $validated['nationality'],
                    'religion' => $validated['religion'],
                ]);
            } else {
                $student->profile()->create([
                    'mobile_number' => $validated['mobileNumber'],
                    'contact_number' => $validated['contactNumber'],
                    'place_of_birth' => $validated['placeOfBirth'],
                    'city_municipality' => $validated['cityMunicipality'],
                    'province_state' => $validated['provinceState'],
                    'country' => $validated['country'],
                    'nationality' => $validated['nationality'],
                    'religion' => $validated['religion'],
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
        $format = $request->input('format', 'csv');

        try {
            if ($format === 'xlsx' && !class_exists('ZipArchive')) {
                return back()->withErrors(['export' => 'XLSX export is not available. Please use CSV format or enable the zip extension.']);
            }

            $students = Student::with(['gradeLevel'])->get();
            $extension = $format === 'xlsx' ? 'xlsx' : 'csv';

            $writer = \Spatie\SimpleExcel\SimpleExcelWriter::streamDownload(
                'students_' . date('Y-m-d_His') . '.' . $extension
            );

            $writer->addHeader([
                'LRN',
                'First Name',
                'Middle Name',
                'Last Name',
                'Suffix',
                'Date of Birth',
                'Gender',
                'Student Status',
                'Grade Level',
                'School Year',
                'PSA Birth Certificate',
                'Form 137 (SF10)',
                'Form 138 (SF9)',
                'Good Moral',
            ]);

            foreach ($students as $student) {
                $writer->addRow([
                    "'" . $student->lrn,
                    $student->first_name,
                    $student->middle_name ?? '',
                    $student->last_name,
                    $student->suffix ?? '',
                    $student->birth_date ? \Carbon\Carbon::parse($student->birth_date)->format('m/d/Y') : '',
                    $student->gender,
                    $student->student_status,
                    $student->gradeLevel->name ?? '',
                    $student->school_year ?? '',
                    $student->has_psa_birth_certificate ? 'Submitted' : 'Not Submitted',
                    $student->has_sf9 ? 'Submitted' : 'Not Submitted',
                    $student->has_report_card ? 'Submitted' : 'Not Submitted',
                    $student->has_good_moral ? 'Submitted' : 'Not Submitted',
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
            'file' => 'required|file|mimes:csv,xlsx,xls|max:2048',
        ]);

        $file = $request->file('file');
        $extension = strtolower($file->getClientOriginalExtension());

        try {
            $rows = \Spatie\SimpleExcel\SimpleExcelReader::create($file->getRealPath(), $extension)
                ->noHeaderRow()
                ->getRows();

            $importedCount = 0;
            $duplicateCount = 0;
            $errorCount = 0;
            $errors = [];
            $importedStudents = [];
            $duplicateStudents = [];

            $isFirstRow = true;

            foreach ($rows as $index => $row) {
                // Skip header row
                if ($isFirstRow) {
                    $isFirstRow = false;
                    continue;
                }

                $rowNum = $index + 1;

                // Map columns by position, cast everything to string to handle
                // DateTimeImmutable objects that Excel returns for date cells
                $values = array_values($row);

                $lrn = isset($values[0]) ? ltrim(trim((string) $values[0]), "'") : null;
                $firstName = isset($values[1]) ? trim((string) $values[1]) : null;
                $middleName = isset($values[2]) ? trim((string) $values[2]) : null;
                $lastName = isset($values[3]) ? trim((string) $values[3]) : null;
                $suffix = isset($values[4]) ? trim((string) $values[4]) : null;
                $birthDateRaw = isset($values[5]) ? $values[5] : null;
                $gender = isset($values[6]) ? strtolower(trim((string) $values[6])) : null;
                $studentStatus = isset($values[7]) ? strtolower(trim((string) $values[7])) : null;
                $gradeLevelName = isset($values[8]) ? trim((string) $values[8]) : null;
                $schoolYear = isset($values[9]) ? trim((string) $values[9]) : null;
                $hasPsa = isset($values[10]) ? strtolower(trim((string) $values[10])) === 'submitted' : false;
                $hasSf9 = isset($values[11]) ? strtolower(trim((string) $values[11])) === 'submitted' : false;
                $hasReportCard = isset($values[12]) ? strtolower(trim((string) $values[12])) === 'submitted' : false;
                $hasGoodMoral = isset($values[13]) ? strtolower(trim((string) $values[13])) === 'submitted' : false;

                // Safely parse birth date whether it's a string or DateTimeImmutable
                $birthDate = null;
                if ($birthDateRaw !== null && $birthDateRaw !== '') {
                    try {
                        if ($birthDateRaw instanceof \DateTimeInterface) {
                            $birthDate = \Carbon\Carbon::instance($birthDateRaw)->format('Y-m-d');
                        } else {
                            $dateStr = (string) $birthDateRaw;
                            // Handle MM/DD/YYYY format
                            if (preg_match('/^\d{2}\/\d{2}\/\d{4}$/', $dateStr)) {
                                $birthDate = \Carbon\Carbon::createFromFormat('m/d/Y', $dateStr)->format('Y-m-d');
                            } else {
                                $birthDate = \Carbon\Carbon::parse($dateStr)->format('Y-m-d');
                            }
                        }
                    } catch (\Exception $e) {
                        $birthDate = null;
                    }
                }

                // Basic validation
                if (!$lrn || !$firstName || !$lastName) {
                    $errors[] = "Row {$rowNum}: Missing required fields (LRN, First Name, or Last Name).";
                    $errorCount++;
                    continue;
                }

                if (!$hasReportCard) {
                    $errors[] = "Row {$rowNum}: Form 138 (SF9) is required.";
                    $errorCount++;
                    continue;
                }

                if (strlen($lrn) !== 12 || !ctype_digit($lrn)) {
                    $errors[] = "Row {$rowNum}: LRN '{$lrn}' must be exactly 12 digits.";
                    $errorCount++;
                    continue;
                }

                if (!in_array($gender, ['male', 'female'])) {
                    $errors[] = "Row {$rowNum}: Invalid gender '{$gender}'. Must be male or female.";
                    $errorCount++;
                    continue;
                }

                if (!in_array($studentStatus, ['new', 'transferee', 'returning'])) {
                    $errors[] = "Row {$rowNum}: Invalid student status '{$studentStatus}'.";
                    $errorCount++;
                    continue;
                }

                // Resolve grade level
                $gradeLevel = \App\Models\GradeLevel::where('name', $gradeLevelName)->first();
                if ($studentStatus !== 'new' && !$gradeLevel) {
                    $errors[] = "Row {$rowNum}: Grade level '{$gradeLevelName}' not found.";
                    $errorCount++;
                    continue;
                }

                // For new students, always auto-assign Grade 7
                if ($studentStatus === 'new') {
                    $gradeLevel = \App\Models\GradeLevel::where('name', 'Grade 7')->first();
                }

                DB::beginTransaction();
                try {
                    $existingStudent = Student::where('lrn', $lrn)->first();

                    if ($existingStudent) {
                        // Same school year = duplicate, skip
                        if ($existingStudent->school_year === $schoolYear) {
                            $duplicateStudents[] = ['name' => trim($firstName . ' ' . $lastName), 'lrn' => $lrn];
                            $duplicateCount++;
                            DB::rollBack();
                            continue;
                        }

                        // Returning student — update for new school year
                        if ($studentStatus === 'returning') {
                            $existingStudent->update([
                                'school_year' => $schoolYear,
                                'current_grade_level_id' => $gradeLevel?->id,
                                'student_status' => 'returning',
                                'has_psa_birth_certificate' => $hasPsa,
                                'has_sf9' => $hasSf9,
                                'has_report_card' => $hasReportCard,
                                'has_good_moral' => $hasGoodMoral,
                            ]);

                            $importedStudents[] = ['name' => trim($firstName . ' ' . $lastName), 'lrn' => $lrn];
                            $importedCount++;
                            DB::commit();
                            continue;
                        }

                        // Exists but not marked as returning — treat as duplicate
                        $duplicateStudents[] = ['name' => trim($firstName . ' ' . $lastName), 'lrn' => $lrn];
                        $duplicateCount++;
                        DB::rollBack();
                        continue;
                    }

                    // Create user account
                    $user = User::create([
                        'name' => trim($firstName . ' ' . $lastName),
                        'email' => 'SNHS-' . $lrn,
                        'password' => Hash::make($lrn),
                        'role' => 'student',
                        'password_changed' => false,
                    ]);

                    // Create student record
                    $student = Student::create([
                        'user_id' => $user->id,
                        'student_status' => $studentStatus,
                        'lrn' => $lrn,
                        'school_year' => $schoolYear,
                        'last_name' => $lastName,
                        'first_name' => $firstName,
                        'middle_name' => $middleName ?: null,
                        'suffix' => $suffix ?: null,
                        'gender' => $gender,
                        'birth_date' => $birthDate,
                        'current_grade_level_id' => $gradeLevel?->id,
                        'has_psa_birth_certificate' => $hasPsa,
                        'has_sf9' => $hasSf9,
                        'has_report_card' => $hasReportCard,
                        'has_good_moral' => $hasGoodMoral,
                    ]);

                    // Create default profile
                    $student->profile()->create([
                        'place_of_birth' => 'Bongabon, Nueva Ecija',
                        'city_municipality' => 'Bongabon',
                        'province_state' => 'Nueva Ecija',
                        'country' => 'Philippines',
                        'nationality' => 'Filipino',
                    ]);

                    $importedStudents[] = ['name' => trim($firstName . ' ' . $lastName), 'lrn' => $lrn];
                    $importedCount++;
                    DB::commit();

                } catch (\Exception $e) {
                    DB::rollBack();
                    $errors[] = "Row {$rowNum}: " . $e->getMessage();
                    $errorCount++;
                }
            }

            $message = "Import complete. {$importedCount} student(s) imported, {$duplicateCount} duplicate(s) skipped, {$errorCount} error(s).";

            return back()->with([
                'success' => $message,
                'imported_count' => $importedCount,
                'duplicate_count' => $duplicateCount,
                'error_count' => $errorCount,
                'imported_students' => $importedStudents,
                'duplicate_students' => $duplicateStudents,
                'import_row_errors' => $errors,  // renamed from 'errors'
            ]);

        } catch (\Exception $e) {
            Log::error('Import failed', ['message' => $e->getMessage()]);
            return back()->withErrors(['import' => 'Import failed: ' . $e->getMessage()]);
        }
    }

    public function checkImportStatus($importJobId)
    {
        $importJob = \App\Models\ImportJob::find($importJobId);

        if (!$importJob) {
            return response()->json(['error' => 'Import job not found'], 404);
        }

        // Only allow users to check their own import jobs
        if ($importJob->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json([
            'status' => $importJob->status,
            'imported_count' => $importJob->imported_count,
            'error_count' => $importJob->error_count,
            'total_rows' => $importJob->total_rows,
            'imported_students' => $importJob->imported_students ?? [],
            'duplicate_students' => $importJob->duplicate_students ?? [],
            'errors' => $importJob->errors ?? [],
            'completed_at' => $importJob->completed_at,
        ]);
    }

    public function downloadTemplate()
    {
        $rows = [
            [
                'LRN',
                'First Name',
                'Middle Name',
                'Last Name',
                'Suffix',
                'Date of Birth',
                'Gender',
                'Student Status',
                'Grade Level',
                'School Year',
                'PSA Birth Certificate',
                'Form 137 (SF10)',
                'Form 138 (SF9)',
                'Good Moral',
            ],
            [
                '123456789012',
                'Juan',
                'Dela',
                'Cruz',
                'Jr.',
                '01/15/2010',
                'male',
                'new',
                'Grade 7',
                '2026-2027',
                'Submitted',
                'Not Submitted',
                'Submitted',
                'Not Submitted',
            ],
            [
                '123456789013',
                'Maria',
                'Santos',
                'Garcia',
                '',
                '03/22/2009',
                'female',
                'transferee',
                'Grade 8',
                '2026-2027',
                'Submitted',
                'Not Submitted',
                'Submitted',
                'Submitted',
            ],
        ];

        $writer = \Spatie\SimpleExcel\SimpleExcelWriter::streamDownload('student_import_template.xlsx')
            ->noHeaderRow();

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
            ->where(function ($query) use ($search) {
                $query->where('lrn', 'like', "%{$search}%")
                    ->orWhere('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhereRaw("CONCAT(first_name, ' ', last_name) like ?", ["%{$search}%"]);
            })
            ->limit(10)
            ->get()
            ->map(function ($student) {
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

    public function checklist()
    {
        // Get ALL students
        $allStudents = Student::with(['gradeLevel', 'section'])
            ->get()
            ->map(function ($student) {
                return [
                    'id' => $student->id,
                    'lrn' => $student->lrn,
                    'name' => trim($student->first_name . ' ' . ($student->middle_name ? $student->middle_name . ' ' : '') . $student->last_name),
                    'gender' => ucfirst($student->gender),
                    'grade_level' => $student->gradeLevel ? $student->gradeLevel->name : 'N/A',
                    'section' => $student->section ? $student->section->section_name : null,
                    'school_year' => $student->school_year,
                    'has_psa_birth_certificate' => $student->has_psa_birth_certificate,
                    'has_sf9' => $student->has_sf9,
                    'has_report_card' => $student->has_report_card,
                    'has_good_moral' => $student->has_good_moral,
                ];
            });

        // Get current students by grade level
        $grade7Students = Student::with(['gradeLevel', 'section'])
            ->whereHas('gradeLevel', function ($query) {
                $query->where('name', 'Grade 7');
            })
            ->get()
            ->map(function ($student) {
                return [
                    'id' => $student->id,
                    'lrn' => $student->lrn,
                    'name' => trim($student->first_name . ' ' . ($student->middle_name ? $student->middle_name . ' ' : '') . $student->last_name),
                    'gender' => ucfirst($student->gender),
                    'section' => $student->section ? $student->section->section_name : null,
                    'school_year' => $student->school_year,
                    'has_psa_birth_certificate' => $student->has_psa_birth_certificate,
                    'has_sf9' => $student->has_sf9,
                    'has_report_card' => $student->has_report_card,
                    'has_good_moral' => $student->has_good_moral,
                ];
            });

        $grade8Students = Student::with(['gradeLevel', 'section'])
            ->whereHas('gradeLevel', function ($query) {
                $query->where('name', 'Grade 8');
            })
            ->get()
            ->map(function ($student) {
                return [
                    'id' => $student->id,
                    'lrn' => $student->lrn,
                    'name' => trim($student->first_name . ' ' . ($student->middle_name ? $student->middle_name . ' ' : '') . $student->last_name),
                    'gender' => ucfirst($student->gender),
                    'section' => $student->section ? $student->section->section_name : null,
                    'school_year' => $student->school_year,
                    'has_psa_birth_certificate' => $student->has_psa_birth_certificate,
                    'has_sf9' => $student->has_sf9,
                    'has_report_card' => $student->has_report_card,
                    'has_good_moral' => $student->has_good_moral,
                ];
            });

        $grade9Students = Student::with(['gradeLevel', 'section'])
            ->whereHas('gradeLevel', function ($query) {
                $query->where('name', 'Grade 9');
            })
            ->get()
            ->map(function ($student) {
                return [
                    'id' => $student->id,
                    'lrn' => $student->lrn,
                    'name' => trim($student->first_name . ' ' . ($student->middle_name ? $student->middle_name . ' ' : '') . $student->last_name),
                    'gender' => ucfirst($student->gender),
                    'section' => $student->section ? $student->section->section_name : null,
                    'school_year' => $student->school_year,
                    'has_psa_birth_certificate' => $student->has_psa_birth_certificate,
                    'has_sf9' => $student->has_sf9,
                    'has_report_card' => $student->has_report_card,
                    'has_good_moral' => $student->has_good_moral,
                ];
            });

        $grade10Students = Student::with(['gradeLevel', 'section'])
            ->whereHas('gradeLevel', function ($query) {
                $query->where('name', 'Grade 10');
            })
            ->get()
            ->map(function ($student) {
                return [
                    'id' => $student->id,
                    'lrn' => $student->lrn,
                    'name' => trim($student->first_name . ' ' . ($student->middle_name ? $student->middle_name . ' ' : '') . $student->last_name),
                    'gender' => ucfirst($student->gender),
                    'section' => $student->section ? $student->section->section_name : null,
                    'school_year' => $student->school_year,
                    'has_psa_birth_certificate' => $student->has_psa_birth_certificate,
                    'has_sf9' => $student->has_sf9,
                    'has_report_card' => $student->has_report_card,
                    'has_good_moral' => $student->has_good_moral,
                ];
            });

        // Get past students grouped by school year
        // Since archives store data as JSON, we need to extract it differently
        $pastStudents = Archive::where('archivable_type', 'App\\Models\\Student')
            ->get()
            ->map(function ($archive) {
                $data = $archive->data;
                return [
                    'school_year' => $data['school_year'] ?? 'Unknown',
                    'grade_level' => $data['grade_level'] ?? 'Unknown',
                ];
            })
            ->groupBy('school_year')
            ->map(function ($group, $schoolYear) {
                return [
                    'school_year' => $schoolYear,
                    'count' => $group->count(),
                    'grade7' => $group->where('grade_level', 'Grade 7')->count(),
                    'grade8' => $group->where('grade_level', 'Grade 8')->count(),
                    'grade9' => $group->where('grade_level', 'Grade 9')->count(),
                    'grade10' => $group->where('grade_level', 'Grade 10')->count(),
                ];
            })
            ->sortByDesc('school_year')
            ->values();

        return \Inertia\Inertia::render('admin/registrar/student-checklist/page', [
            'allStudents' => $allStudents,
            'grade7Students' => $grade7Students,
            'grade8Students' => $grade8Students,
            'grade9Students' => $grade9Students,
            'grade10Students' => $grade10Students,
            'pastStudents' => $pastStudents,
        ]);
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

        // Get all grade levels for filter - ordered properly (7, 8, 9, 10, Rizal)
        $gradeLevels = \App\Models\GradeLevel::orderByRaw("
            CASE 
                WHEN name = 'Grade 7' THEN 1
                WHEN name = 'Grade 8' THEN 2
                WHEN name = 'Grade 9' THEN 3
                WHEN name = 'Grade 10' THEN 4
                ELSE 5
            END
        ")->get();

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

    public function uploadProfilePicture(Request $request)
    {
        $request->validate([
            'profile_picture' => ['required', 'image', 'mimes:jpeg,jpg,png', 'max:2048'],
        ]);

        $user = Auth::user();
        $student = Student::where('user_id', $user->id)->first();

        if (!$student) {
            return back()->withErrors(['error' => 'Student profile not found.']);
        }

        // Get existing profile picture
        $existingPicture = $student->profilePicture;

        // Delete old file if exists
        if ($existingPicture && Storage::disk('public')->exists($existingPicture->file_path)) {
            Storage::disk('public')->delete($existingPicture->file_path);
        }

        // Store new profile picture
        $file = $request->file('profile_picture');
        $fileName = time() . '_' . $file->getClientOriginalName();
        $filePath = $file->storeAs('profile-pictures', $fileName, 'public');

        // Update or create profile picture record
        if ($existingPicture) {
            // Update existing record
            $existingPicture->update([
                'file_path' => $filePath,
                'file_name' => $fileName,
                'mime_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
            ]);
        } else {
            // Create new record - Laravel will automatically set profileable_type
            $student->profilePicture()->create([
                'file_path' => $filePath,
                'file_name' => $fileName,
                'mime_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
            ]);
        }

        return back()->with('success', 'Profile picture updated successfully.');
    }

    public function deleteProfilePicture()
    {
        $user = Auth::user();
        $student = Student::where('user_id', $user->id)->first();

        if (!$student) {
            return back()->withErrors(['error' => 'Student profile not found.']);
        }

        $profilePicture = $student->profilePicture;

        if ($profilePicture) {
            Storage::disk('public')->delete($profilePicture->file_path);
            $profilePicture->delete();
        }

        return back()->with('success', 'Profile picture deleted successfully.');
    }
}
