<?php

namespace App\Http\Controllers;

use App\Models\Teacher;
use App\Models\User;
use App\Models\Student;
use App\Models\Schedule;
use App\Models\ActivityLog;
use App\Models\Archive;
use App\Models\ProfilePicture;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class TeacherController extends Controller
{
    public function dashboard()
    {
        $user = Auth::user();

        $teacher = Teacher::where('user_id', $user->id)->first();

        if (!$teacher) {
            return redirect()->route('login')->withErrors(['error' => 'Teacher profile not found.']);
        }

        $sectionsAssigned = Schedule::where('teacher_id', $teacher->id)
            ->distinct('class_section_id')
            ->count('class_section_id');

        $totalStudents = Student::whereIn('current_section_id', function ($query) use ($teacher) {
            $query->select('class_section_id')
                ->from('tbl_schedules')
                ->where('teacher_id', $teacher->id)
                ->distinct();
        })->count();

        $subjectsHandled = DB::table('tbl_teacher_subjects')
            ->where('teacher_id', $teacher->id)
            ->distinct('subject_id')
            ->count('subject_id');

        $currentSchoolYear = Student::orderBy('school_year', 'desc')
            ->value('school_year') ?? date('Y') . '-' . (date('Y') + 1);

        return Inertia::render('teacher/dashboard/page', [
            'stats' => [
                'totalStudents' => $totalStudents,
                'subjectsHandled' => $subjectsHandled,
                'sectionsAssigned' => $sectionsAssigned,
                'currentSchoolYear' => $currentSchoolYear,
            ],
        ]);
    }

    public function index()
    {
        $teachers = Teacher::with(['user', 'updatedBy'])->get()->map(function ($teacher) {
            return [
                'id' => $teacher->id,
                'employee_no' => $teacher->employee_number,
                'name' => $teacher->name,
                'email' => $teacher->user->email,
                'subject' => $teacher->subject,
                'position' => $teacher->position,
                'updated_by' => $teacher->updatedBy ? $teacher->updatedBy->name : null,
                'updated_at' => $teacher->updated_at ? $teacher->updated_at->timezone('Asia/Manila')->format('M d, Y h:i A') : null,
            ];
        });

        $gradeLevels = \App\Models\GradeLevel::all()->map(function ($gradeLevel) {
            return [
                'id' => $gradeLevel->id,
                'name' => $gradeLevel->name,
            ];
        });

        $subjects = \App\Models\Subject::select('name')
            ->distinct()
            ->orderBy('name')
            ->get()
            ->map(function ($subject) {
                return [
                    'name' => $subject->name,
                ];
            });

        // $admin = \App\Models\Admin::where('user_id', \Illuminate\Support\Facades\Auth::id())->first();

        $admin = Auth::user()->admin;
        //eto ung way ata

        return Inertia::render('admin/user-management/teacher/page', [
            'teachers' => $teachers,
            'gradeLevels' => $gradeLevels,
            'subjects' => $subjects,
            'canAddTeacher' => $admin ? $admin->can_add_teacher : true,
        ]);
    }

    public function store(Request $request)
    {
        // Check if current admin has permission to add teachers
        $currentAdmin = \App\Models\Admin::where('user_id', Auth::id())->first();

        if ($currentAdmin && !$currentAdmin->can_add_teacher) {
            return back()->withErrors(['error' => 'You do not have permission to add teachers. Please contact the Super Admin.']);
        }

        $validated = $request->validate([
            'firstName' => 'required|string|max:255',
            'lastName' => 'required|string|max:255',
            'employeeNumber' => 'required|string|digits:6|unique:tbl_teachers,employee_number',
            'subject' => 'required|string',
            'position' => 'required|string',
            'password' => 'required|string|min:8',
        ]);

        // Generate email in format: SNHS-LASTNAME-FIRSTNAME
        $firstName = strtoupper(str_replace(' ', '', $validated['firstName']));
        $lastName = strtoupper(str_replace(' ', '', $validated['lastName']));
        $email = 'SNHS-' . $lastName . '-' . $firstName;

        // Check if email already exists
        if (User::where('email', $email)->exists()) {
            return back()->withErrors(['email' => 'A teacher with this name already exists.']);
        }

        DB::beginTransaction();

        try {
            $user = User::create([
                'name' => $validated['firstName'] . ' ' . $validated['lastName'],
                'email' => $email,
                'password' => Hash::make($validated['password']),
                'role' => 'teacher',
                'password_changed' => false, // Force password change on first login
            ]);

            $teacher = Teacher::create([
                'user_id' => $user->id,
                'name' => $validated['firstName'] . ' ' . $validated['lastName'],
                'employee_number' => $validated['employeeNumber'],
                'subject' => $validated['subject'],
                'position' => $validated['position'],
                'updated_by' => Auth::id(),
            ]);

            // Log activity
            ActivityLog::create([
                'user_id' => Auth::id(),
                'action' => 'created',
                'description' => 'Created teacher: ' . $teacher->name,
            ]);

            DB::commit();

            return redirect()->route('admin.user-management.teacher')->with('success', 'Teacher created successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to create teacher: ' . $e->getMessage()]);
        }
    }

    public function update(Request $request, Teacher $teacher)
    {
        $validated = $request->validate([
            'firstName' => 'required|string|max:255',
            'lastName' => 'required|string|max:255',
            'employeeNumber' => 'required|string|digits:6|unique:tbl_teachers,employee_number,' . $teacher->id,
            'subject' => 'required|string',
            'position' => 'required|string',
            'password' => 'nullable|string|min:8',
        ]);

        // Generate email in format: SNHS-LASTNAME-FIRSTNAME
        $firstName = strtoupper(str_replace(' ', '', $validated['firstName']));
        $lastName = strtoupper(str_replace(' ', '', $validated['lastName']));
        $email = 'SNHS-' . $lastName . '-' . $firstName;

        // Check if email already exists for another user
        if (User::where('email', $email)->where('id', '!=', $teacher->user_id)->exists()) {
            return back()->withErrors(['email' => 'A teacher with this name already exists.']);
        }

        DB::beginTransaction();

        try {
            $fullName = $validated['firstName'] . ' ' . $validated['lastName'];

            // Track changes
            $changes = [];
            if ($teacher->name !== $fullName) {
                $changes['name'] = ['old' => $teacher->name, 'new' => $fullName];
            }
            if ($teacher->employee_number !== $validated['employeeNumber']) {
                $changes['employee_number'] = ['old' => $teacher->employee_number, 'new' => $validated['employeeNumber']];
            }
            if ($teacher->subject !== $validated['subject']) {
                $changes['subject'] = ['old' => $teacher->subject, 'new' => $validated['subject']];
            }
            if ($teacher->position !== $validated['position']) {
                $changes['position'] = ['old' => $teacher->position, 'new' => $validated['position']];
            }

            $userData = [
                'name' => $fullName,
                'email' => $email,
            ];

            // Only update password if provided
            if (!empty($validated['password'])) {
                $userData['password'] = Hash::make($validated['password']);
                $changes['password'] = 'changed';
            }

            $teacher->user->update($userData);

            $teacher->update([
                'name' => $fullName,
                'employee_number' => $validated['employeeNumber'],
                'subject' => $validated['subject'],
                'position' => $validated['position'],
                'updated_by' => Auth::id(),
            ]);

            // Log activity
            if (!empty($changes)) {
                ActivityLog::create([
                    'user_id' => Auth::id(),
                    'action' => 'updated',
                    'description' => 'Updated teacher: ' . $teacher->name,
                    'changes' => $changes,
                ]);
            }

            DB::commit();

            return redirect()->route('admin.user-management.teacher')->with('success', 'Teacher updated successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to update teacher: ' . $e->getMessage()]);
        }
    }

    public function destroy(Teacher $teacher)
    {
        DB::beginTransaction();

        try {
            // Archive the teacher data before deletion
            Archive::create([
                'archivable_type' => Teacher::class,
                'archivable_id' => $teacher->id,
                'data' => [
                    'name' => $teacher->name,
                    'email' => $teacher->user->email,
                    'password' => $teacher->user->password, // Store hashed password
                    'employee_number' => $teacher->employee_number,
                    'subject' => $teacher->subject,
                    'position' => $teacher->position,
                    'phone' => $teacher->phone,
                    'address' => $teacher->address,
                ],
                'archived_by' => Auth::id(),
                'reason' => 'Deleted by admin',
            ]);

            // Delete teacher record
            $teacher->delete();

            // Delete user account
            $teacher->user->delete();

            DB::commit();

            return redirect()->back()->with('success', 'Teacher deleted and archived successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to delete teacher: ' . $e->getMessage()]);
        }
    }

    public function checkEmployeeNumber(Request $request)
    {
        $employeeNumber = $request->input('employee_number');
        $teacherId = $request->input('teacher_id');

        $query = Teacher::where('employee_number', $employeeNumber);

        if ($teacherId) {
            $query->where('id', '!=', $teacherId);
        }

        $exists = $query->exists();

        return response()->json(['exists' => $exists]);
    }

    public function classList(Request $request)
    {
        $user = Auth::user();
        $teacher = Teacher::where('user_id', $user->id)->first();

        if (!$teacher) {
            return redirect()->route('login')->withErrors(['error' => 'Teacher profile not found.']);
        }

        // Get filter parameters
        $subjectId = $request->input('subject_id');
        $sectionId = $request->input('section_id');
        $schoolYear = $request->input('school_year');

        // Get current school year if not provided
        if (!$schoolYear) {
            $schoolYear = Student::orderBy('school_year', 'desc')
                ->value('school_year') ?? date('Y') . '-' . (date('Y') + 1);
        }

        // Get subjects that teacher teaches (unique by name)
        $subjects = DB::table('tbl_teacher_subjects')
            ->join('tbl_subjects', 'tbl_teacher_subjects.subject_id', '=', 'tbl_subjects.id')
            ->where('tbl_teacher_subjects.teacher_id', $teacher->id)
            ->select('tbl_subjects.id', 'tbl_subjects.name')
            ->distinct()
            ->get()
            ->unique('name')
            ->values()
            ->toArray();

        // Get sections based on teacher's schedules
        $sections = DB::table('tbl_schedules')
            ->join('tbl_class_sections', 'tbl_schedules.class_section_id', '=', 'tbl_class_sections.id')
            ->join('tbl_grade_levels', 'tbl_class_sections.grade_level_id', '=', 'tbl_grade_levels.id')
            ->where('tbl_schedules.teacher_id', $teacher->id)
            ->select(
                'tbl_class_sections.id',
                'tbl_class_sections.section_name as name',
                'tbl_grade_levels.name as grade_level_name'
            )
            ->distinct()
            ->get()
            ->toArray();

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

        // Get students if section is selected
        $students = [];
        if ($sectionId) {
            $students = Student::where('current_section_id', $sectionId)
                ->where('school_year', $schoolYear)
                ->with(['gradeLevel', 'section'])
                ->get()
                ->map(function ($student) {
                    return [
                        'id' => $student->id,
                        'lrn' => $student->lrn,
                        'studentName' => trim($student->first_name . ' ' . $student->last_name),
                        'gradeLevel' => $student->gradeLevel ? $student->gradeLevel->name : 'N/A',
                        'section' => $student->section ? $student->section->section_name : 'N/A',
                    ];
                })
                ->values();
        }

        return Inertia::render('teacher/class-list/page', [
            'subjects' => $subjects,
            'sections' => $sections,
            'schoolYears' => $schoolYears,
            'students' => $students,
            'filters' => [
                'subject_id' => $subjectId,
                'section_id' => $sectionId,
                'school_year' => $schoolYear,
            ],
        ]);
    }

    public function finalReport(Request $request)
    {
        $user = Auth::user();
        $teacher = Teacher::where('user_id', $user->id)->first();

        if (!$teacher) {
            return redirect()->route('login')->withErrors(['error' => 'Teacher profile not found.']);
        }

        $filters = $this->getFinalReportFilters($request, $teacher);

        return Inertia::render('teacher/final-report/page', array_merge($filters, [
        ]));
    }

    private function getFinalReportFilters(Request $request, Teacher $teacher): array
    {
        $gradeLevelId = $request->input('grade_level_id');
        $sectionId = $request->input('section_id');
        $subjectId = $request->input('subject_id');
        $schoolYear = $request->input('school_year') ?? Student::orderBy('school_year', 'desc')->value('school_year') ?? date('Y') . '-' . (date('Y') + 1);

        return [
            'gradeLevels' => $this->getGradeLevels(),
            'sections' => $this->getTeacherSections($teacher, $gradeLevelId),
            'subjects' => $this->getTeacherSubjects($teacher),
            'schoolYears' => $this->getSchoolYears(),
            'students' => $this->getFinalReportStudents($sectionId, $subjectId, $schoolYear, $teacher),
            'filters' => compact('gradeLevelId', 'sectionId', 'subjectId', 'schoolYear'),
        ];
    }

    private function getGradeLevels(): array
    {
        return DB::table('tbl_grade_levels')
            ->select('id', 'name')
            ->get()
            ->toArray();
    }

    private function getTeacherSections(Teacher $teacher, ?int $gradeLevelId): array
    {
        return DB::table('tbl_schedules')
            ->join('tbl_class_sections', 'tbl_schedules.class_section_id', '=', 'tbl_class_sections.id')
            ->join('tbl_grade_levels', 'tbl_class_sections.grade_level_id', '=', 'tbl_grade_levels.id')
            ->where('tbl_schedules.teacher_id', $teacher->id)
            ->when($gradeLevelId, fn($q) => $q->where('tbl_class_sections.grade_level_id', $gradeLevelId))
            ->select(
                'tbl_class_sections.id',
                'tbl_class_sections.section_name as name',
                'tbl_class_sections.grade_level_id',
                'tbl_grade_levels.name as grade_level_name'
            )
            ->distinct()
            ->get()
            ->toArray();
    }

    private function getTeacherSubjects(Teacher $teacher): array
    {
        return DB::table('tbl_teacher_subjects')
            ->join('tbl_subjects', 'tbl_teacher_subjects.subject_id', '=', 'tbl_subjects.id')
            ->where('tbl_teacher_subjects.teacher_id', $teacher->id)
            ->select('tbl_subjects.id', 'tbl_subjects.name')
            ->distinct()
            ->get()
            ->unique('name')
            ->values()
            ->toArray();
    }

    private function getSchoolYears()
    {
        // Get school years from database
        $dbSchoolYears = Student::select('school_year')
            ->distinct()
            ->pluck('school_year')
            ->toArray();

        // Generate school years from 2018 to current year + 1
        $currentYear = (int) date('Y');
        $generatedYears = [];

        for ($year = 2018; $year <= $currentYear + 1; $year++) {
            $generatedYears[] = $year . '-' . ($year + 1);
        }

        // Merge and get unique values
        $allYears = array_unique(array_merge($generatedYears, $dbSchoolYears));

        // Sort in descending order
        rsort($allYears);

        // Format for select dropdown
        return collect($allYears)->map(function ($year) {
            return [
                'value' => $year,
                'label' => $year,
            ];
        });
    }

    private function getFinalReportStudents($sectionId, $subjectId, $schoolYear, Teacher $teacher)
    {
        if (!$sectionId || !$subjectId) {
            return [];
        }

        $studentRecords = Student::where('current_section_id', $sectionId)
            ->where('school_year', $schoolYear)
            ->with(['gradeLevel', 'section'])
            ->get();

        // Fetch all grades in one query to avoid N+1
        $studentIds = $studentRecords->pluck('id');
        $gradeRecords = DB::table('tbl_grades')
            ->where('class_section_id', $sectionId)
            ->where('subject_id', $subjectId)
            ->where('school_year', $schoolYear)
            ->where('teacher_id', $teacher->id)
            ->whereIn('student_id', $studentIds)
            ->get()
            ->keyBy('student_id');

        return $studentRecords->map(fn($student) => $this->mapStudentWithGrade(
            $student,
            $gradeRecords
        ))->values();
    }

    private function mapStudentWithGrade($student, $gradeRecords): array
    {
        $gradeRecord = $gradeRecords->get($student->id);

        // Format grade helper
        $formatGrade = function ($grade) {
            if ($grade === null)
                return null;
            return (int) round((float) $grade, 0, PHP_ROUND_HALF_UP);
        };

        return [
            'id' => $student->id,
            'lrn' => $student->lrn,
            'studentName' => trim($student->first_name . ' ' . $student->last_name),
            'gradeLevel' => $student->gradeLevel?->name ?? 'N/A',
            'section' => $student->section?->section_name ?? 'N/A',
            'quarter1' => $formatGrade($gradeRecord?->quarter_1),
            'quarter2' => $formatGrade($gradeRecord?->quarter_2),
            'quarter3' => $formatGrade($gradeRecord?->quarter_3),
            'quarter4' => $formatGrade($gradeRecord?->quarter_4),
            'finalAverage' => $formatGrade($gradeRecord?->final_grade),
            'remarks' => $gradeRecord?->remarks,
            'readyToGraduate' => $student->ready_to_graduate ?? false,
        ];
    }

    public function schedule(Request $request)
    {
        $user = Auth::user();
        $teacher = Teacher::where('user_id', $user->id)->first();

        if (!$teacher) {
            return redirect()->route('login')->withErrors(['error' => 'Teacher profile not found.']);
        }

        // Get school year filter
        $schoolYear = $request->input('school_year');
        if (!$schoolYear) {
            $schoolYear = Student::orderBy('school_year', 'desc')
                ->value('school_year') ?? date('Y') . '-' . (date('Y') + 1);
        }

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

        // Get teacher's schedules
        $schedules = DB::table('tbl_schedules')
            ->join('tbl_subjects', 'tbl_schedules.subject_id', '=', 'tbl_subjects.id')
            ->join('tbl_class_sections', 'tbl_schedules.class_section_id', '=', 'tbl_class_sections.id')
            ->join('tbl_grade_levels', 'tbl_class_sections.grade_level_id', '=', 'tbl_grade_levels.id')
            ->leftJoin('tbl_room', 'tbl_schedules.room_id', '=', 'tbl_room.id')
            ->where('tbl_schedules.teacher_id', $teacher->id)
            ->select(
                'tbl_schedules.day_of_week',
                'tbl_schedules.start_time',
                'tbl_schedules.end_time',
                'tbl_room.room_number as room',
                'tbl_subjects.name as subject_name',
                'tbl_class_sections.section_name',
                'tbl_grade_levels.name as grade_level_name'
            )
            ->orderBy('tbl_schedules.start_time')
            ->get();

        // Group schedules by time slots
        $timeSlots = [];
        foreach ($schedules as $schedule) {
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
            $timeSlots[$timeKey][$dayKey] = $schedule->subject_name . ' ' .
                $schedule->grade_level_name . '-' .
                $schedule->section_name .
                ($schedule->room ? "\n" . $schedule->room : '');
        }

        // Convert to array and sort by time
        $scheduleData = array_values($timeSlots);

        return Inertia::render('teacher/schedule/page', [
            'schedules' => $scheduleData,
            'schoolYears' => $schoolYears,
            'filters' => [
                'school_year' => $schoolYear,
            ],
        ]);
    }

    public function profile()
    {
        $user = Auth::user();
        $teacher = Teacher::where('user_id', $user->id)->with('user')->first();

        if (!$teacher) {
            return redirect()->route('login')->withErrors(['error' => 'Teacher profile not found.']);
        }

        // Get assigned classes with student counts
        $assignedClasses = DB::table('tbl_schedules')
            ->join('tbl_subjects', 'tbl_schedules.subject_id', '=', 'tbl_subjects.id')
            ->join('tbl_class_sections', 'tbl_schedules.class_section_id', '=', 'tbl_class_sections.id')
            ->join('tbl_grade_levels', 'tbl_class_sections.grade_level_id', '=', 'tbl_grade_levels.id')
            ->where('tbl_schedules.teacher_id', $teacher->id)
            ->select(
                'tbl_grade_levels.name as grade_level',
                'tbl_class_sections.section_name as section',
                'tbl_subjects.name as subject',
                'tbl_class_sections.id as section_id'
            )
            ->distinct()
            ->get()
            ->map(function ($class) {
                // Count students in this section
                $studentCount = Student::where('current_section_id', $class->section_id)->count();

                return [
                    'gradeLevel' => $class->grade_level,
                    'section' => $class->section,
                    'subject' => $class->subject,
                    'students' => $studentCount
                ];
            });

        return Inertia::render('teacher/profile/page', [
            'teacher' => [
                'name' => $teacher->name,
                'email' => $teacher->user->email,
                'phone' => $teacher->phone ?? 'N/A',
                'address' => $teacher->address ?? 'N/A',
                'employeeNumber' => $teacher->employee_number ?? 'N/A',
                'position' => $teacher->position ?? 'Teacher',
            ],
            'assignedClasses' => $assignedClasses,
        ]);
    }

    public function profileSettings()
    {
        $user = Auth::user();
        $teacher = Teacher::where('user_id', $user->id)->with(['user', 'profilePicture'])->first();

        if (!$teacher) {
            return redirect()->route('login')->withErrors(['error' => 'Teacher profile not found.']);
        }

        // Split name into first and last name
        $nameParts = explode(' ', $teacher->name, 2);
        $firstName = $nameParts[0] ?? '';
        $lastName = $nameParts[1] ?? '';

        return Inertia::render('teacher/profile-settings/page', [
            'teacher' => [
                'firstName' => $firstName,
                'lastName' => $lastName,
                'email' => $teacher->user->email,
                'phone' => $teacher->phone ?? '',
                'address' => $teacher->address ?? '',
                'profile_picture' => $teacher->profilePicture && $teacher->profilePicture->file_path ? asset('storage/' . $teacher->profilePicture->file_path) : null,
            ],
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = User::find(Auth::id());
        $teacher = Teacher::where('user_id', $user->id)->first();

        if (!$teacher) {
            return redirect()->route('login')->withErrors(['error' => 'Teacher profile not found.']);
        }

        $validated = $request->validate([
            'firstName' => 'required|string|max:255',
            'lastName' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
        ]);

        DB::beginTransaction();

        try {
            $fullName = $validated['firstName'] . ' ' . $validated['lastName'];

            $teacher->update([
                'name' => $fullName,
                'phone' => $validated['phone'],
                'address' => $validated['address'],
            ]);

            $user->update([
                'name' => $fullName,
            ]);

            DB::commit();

            return redirect()->route('teacher.profile-settings')->with('success', 'Profile updated successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to update profile: ' . $e->getMessage()]);
        }
    }

    public function updatePassword(Request $request)
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

            return redirect()->route('teacher.profile-settings')->with('success', 'Password changed successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to change password: ' . $e->getMessage()]);
        }
    }

    public function uploadProfilePicture(Request $request)
    {
        $request->validate([
            'profile_picture' => ['required', 'image', 'mimes:jpeg,jpg,png', 'max:2048'],
        ]);

        $user = Auth::user();
        $teacher = Teacher::where('user_id', $user->id)->first();

        if (!$teacher) {
            return back()->withErrors(['error' => 'Teacher profile not found.']);
        }

        // Delete old profile picture if exists
        $oldPicture = $teacher->profilePicture;
        if ($oldPicture) {
            Storage::disk('public')->delete($oldPicture->file_path);
            $oldPicture->delete();
        }

        // Store new profile picture
        $file = $request->file('profile_picture');
        $fileName = time() . '_' . $file->getClientOriginalName();
        $filePath = $file->storeAs('profile-pictures', $fileName, 'public');

        // Create profile picture record
        ProfilePicture::create([
            'profileable_id' => $teacher->id,
            'file_path' => $filePath,
            'file_name' => $fileName,
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
        ]);

        return back()->with('success', 'Profile picture updated successfully.');
    }

    public function deleteProfilePicture()
    {
        $user = Auth::user();
        $teacher = Teacher::where('user_id', $user->id)->first();

        if (!$teacher) {
            return back()->withErrors(['error' => 'Teacher profile not found.']);
        }

        $profilePicture = $teacher->profilePicture;

        if ($profilePicture) {
            Storage::disk('public')->delete($profilePicture->file_path);
            $profilePicture->delete();
        }

        return back()->with('success', 'Profile picture deleted successfully.');
    }

    public function updateGraduationReadiness(Request $request, Student $student)
    {
        $validated = $request->validate([
            'ready_to_graduate' => 'required|boolean',
        ]);

        try {
            $student->update([
                'ready_to_graduate' => $validated['ready_to_graduate'],
            ]);

            // Log activity
            ActivityLog::create([
                'user_id' => Auth::id(),
                'action' => 'updated',
                'description' => 'Updated graduation readiness for student: ' . $student->first_name . ' ' . $student->last_name . ' to ' . ($validated['ready_to_graduate'] ? 'ready' : 'not ready'),
            ]);

            return back()->with('success', 'Graduation readiness updated successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to update graduation readiness: ' . $e->getMessage()]);
        }
    }

    public function studentClearance(Request $request)
    {
        $user = Auth::user();
        $teacher = Teacher::where('user_id', $user->id)->first();

        if (!$teacher) {
            return redirect()->route('login')->withErrors(['error' => 'Teacher profile not found.']);
        }

        $subjectId = $request->input('subject_id');
        $sectionId = $request->input('section_id');
        $schoolYear = $request->input('school_year')
            ?? Student::orderBy('school_year', 'desc')->value('school_year')
            ?? date('Y') . '-' . (date('Y') + 1);

        // Drive purely from tbl_schedules — this is the single source of truth
        // for which teacher teaches which subject in which section.
        // tbl_teacher_subjects is redundant here and was causing the bad join.
        $subjects = DB::table('tbl_schedules')
            ->join('tbl_subjects', 'tbl_schedules.subject_id', '=', 'tbl_subjects.id')
            ->join('tbl_class_sections', 'tbl_schedules.class_section_id', '=', 'tbl_class_sections.id')
            ->join('tbl_grade_levels', 'tbl_class_sections.grade_level_id', '=', 'tbl_grade_levels.id')
            ->where('tbl_schedules.teacher_id', $teacher->id)
            ->select(
                'tbl_subjects.id',
                'tbl_subjects.name as subject_name',
                'tbl_subjects.code as subject_code',
                'tbl_grade_levels.name as grade_level',
                'tbl_class_sections.section_name as section',
                'tbl_class_sections.id as section_id'
            )
            ->distinct()
            ->get();

        $students = collect();

        if ($subjectId && $sectionId) {
            // Verify this teacher actually teaches this subject in this section
            // to prevent teachers from querying other sections
            $validAssignment = DB::table('tbl_schedules')
                ->where('teacher_id', $teacher->id)
                ->where('subject_id', $subjectId)
                ->where('class_section_id', $sectionId)
                ->exists();

            if ($validAssignment) {
                $clearances = \App\Models\Clearance::where('subject_id', $subjectId)
                    ->where('class_section_id', $sectionId)
                    ->where('school_year', $schoolYear)
                    ->get()
                    ->keyBy('student_id');

                $students = Student::where('current_section_id', $sectionId)
                    ->with(['gradeLevel', 'section', 'profilePicture'])
                    ->get()
                    ->map(function ($student) use ($clearances) {
                        $clearance = $clearances->get($student->id);
                        return [
                            'id' => $student->id,
                            'student_id' => $student->lrn,
                            'firstName' => $student->first_name,
                            'lastName' => $student->last_name,
                            'middleName' => $student->middle_name ?? null,
                            'grade_level' => $student->gradeLevel?->name ?? 'N/A',
                            'section' => $student->section?->section_name ?? 'N/A',
                            'clearance_status' => $clearance?->status ?? 'pending',
                            'profile_picture' => $student->profilePicture
                                ? asset('storage/' . $student->profilePicture->file_path)
                                : null,
                        ];
                    })
                    ->values();
            }
        }

        return Inertia::render('teacher/student-clearance/page', [
            'subjects' => $subjects,
            'students' => $students,
            'filters' => [
                'subject_id' => $subjectId ? (int) $subjectId : null,
                'section_id' => $sectionId ? (int) $sectionId : null,
                'school_year' => $schoolYear,
            ],
        ]);
    }
}
