<?php

namespace App\Http\Controllers;

use App\Models\AdviserSection;
use App\Models\Clearance;
use App\Models\Student;
use App\Models\Teacher;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AdviserController extends Controller
{
    private function currentSchoolYear(?string $requested = null): string
    {
        if ($requested) {
            return $requested;
        }

        return \App\Services\SchoolYearService::current();
    }

    /**
     * @return array{0: Teacher, 1: AdviserSection, 2: string}|RedirectResponse
     */
    private function resolveAdvisoryContext(Request $request): array|RedirectResponse
    {
        $user = Auth::user();

        if (!$user || $user->role !== 'teacher') {
            abort(403, 'Only teachers can access the adviser portal.');
        }

        $teacher = Teacher::where('user_id', $user->id)->first();

        if (!$teacher) {
            return redirect()->route('login.teacher')->withErrors(['error' => 'Teacher profile not found.']);
        }

        // Only bounce them out of the adviser portal entirely if they've never
        // been assigned as an adviser at all. If they HAVE an assignment (just
        // not for the currently-selected year), let the page render an empty
        // state instead of redirecting away.
        $hasAnyAssignment = AdviserSection::where('teacher_id', $teacher->id)->exists();

        if (!$hasAnyAssignment) {
            return redirect()
                ->route('teacher.dashboard')
                ->withErrors(['error' => 'You are not assigned as a class adviser.']);
        }

        $schoolYear = $this->currentSchoolYear($request->input('school_year'));

        $adviserSection = AdviserSection::where('teacher_id', $teacher->id)
            ->where('school_year', $schoolYear)
            ->with(['classSection.gradeLevel'])
            ->first();

        // $adviserSection may be null here — that's expected when the teacher
        // isn't advising a section for the selected year. Each page below
        // decides how to render that (empty state, not a redirect).
        return [$teacher, $adviserSection, $schoolYear];
    }



    private function mapAdvisorySection(AdviserSection $adviserSection): array
    {
        $section = $adviserSection->classSection;

        return [
            'id' => $section->id,
            'name' => $section->section_name,
            'grade_level_id' => $section->grade_level_id,
            'grade_level_name' => $section->gradeLevel?->name ?? 'N/A',
        ];
    }

    private function getSectionSubjects(int $sectionId): array
    {
        return DB::table('tbl_schedules')
            ->join('tbl_subjects', 'tbl_schedules.subject_id', '=', 'tbl_subjects.id')
            ->where('tbl_schedules.class_section_id', $sectionId)
            ->select(
                'tbl_subjects.id',
                'tbl_subjects.name',
                'tbl_subjects.code as subject_code'
            )
            ->distinct()
            ->orderBy('tbl_subjects.name')
            ->get()
            ->map(fn($subject) => [
                'id' => $subject->id,
                'name' => $subject->name,
                'subject_code' => $subject->subject_code,
            ])
            ->values()
            ->toArray();
    }

    public function dashboard(Request $request): Response|RedirectResponse
    {
        $context = $this->resolveAdvisoryContext($request);

        if ($context instanceof RedirectResponse) {
            return $context;
        }

        [$teacher, $adviserSection, $schoolYear] = $context;

        if (!$adviserSection) {
            return Inertia::render('adviser/dashboard/page', [
                'stats' => [
                    'totalStudents' => 0,
                    'subjectsCount' => 0,
                    'clearedStudents' => 0,
                    'currentSchoolYear' => $schoolYear,
                ],
                'advisorySection' => null,
                'noAssignment' => true,
            ]);
        }

        $section = $this->mapAdvisorySection($adviserSection);
        $sectionId = $section['id'];

        $totalStudents = Student::where('current_section_id', $sectionId)
            ->where('school_year', $schoolYear)
            ->count();

        $subjectsCount = count($this->getSectionSubjects($sectionId));

        $clearedStudents = Student::where('current_section_id', $sectionId)
            ->where('school_year', $schoolYear)
            ->whereIn('id', function ($query) use ($sectionId, $schoolYear) {
                $query->select('student_id')
                    ->from('tbl_clearances')
                    ->where('class_section_id', $sectionId)
                    ->where('school_year', $schoolYear)
                    ->where('status', 'cleared');
            })
            ->count();

        return Inertia::render('adviser/dashboard/page', [
            'stats' => [
                'totalStudents' => $totalStudents,
                'subjectsCount' => $subjectsCount,
                'clearedStudents' => $clearedStudents,
                'currentSchoolYear' => $schoolYear,
            ],
            'advisorySection' => $section,
            'noAssignment' => false,
        ]);
    }

    public function classList(Request $request): Response|RedirectResponse
    {
        $context = $this->resolveAdvisoryContext($request);

        if ($context instanceof RedirectResponse) {
            return $context;
        }

        [$teacher, $adviserSection, $schoolYear] = $context;
        $perPage = (int) $request->input('per_page', 10);

        if (!$adviserSection) {
            return Inertia::render('adviser/class-list/page', [
                'advisorySection' => null,
                'schoolYears' => \App\Services\SchoolYearService::getSchoolYears(),
                'students' => [],
                'pagination' => null,
                'filters' => [
                    'school_year' => $schoolYear,
                    'per_page' => $perPage,
                ],
                'noAssignment' => true,
            ]);
        }

        $section = $this->mapAdvisorySection($adviserSection);

        $paginated = Student::where('current_section_id', $section['id'])
            ->where('school_year', $schoolYear)
            ->with(['gradeLevel', 'section'])
            ->orderBy('last_name')
            ->paginate($perPage);

        $students = collect($paginated->items())->map(function ($student) {
            return [
                'id' => $student->id,
                'lrn' => $student->lrn,
                'studentName' => trim($student->first_name . ' ' . $student->last_name),
                'gradeLevel' => $student->gradeLevel ? $student->gradeLevel->name : 'N/A',
                'section' => $student->section ? $student->section->section_name : 'N/A',
            ];
        })->values();

        return Inertia::render('adviser/class-list/page', [
            'advisorySection' => $section,
            'schoolYears' => \App\Services\SchoolYearService::getSchoolYears(),
            'students' => $students,
            'pagination' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ],
            'filters' => [
                'school_year' => $schoolYear,
                'per_page' => $perPage,
            ],
            'noAssignment' => false,
        ]);
    }

    public function advisoryClearance(Request $request): Response|RedirectResponse
    {
        $context = $this->resolveAdvisoryContext($request);

        if ($context instanceof RedirectResponse) {
            return $context;
        }

        [$teacher, $adviserSection, $schoolYear] = $context;
        $search = trim((string) $request->input('search', ''));
        $studentId = $request->input('student_id');
        $perPage = (int) $request->input('per_page', 10);

        if (!$adviserSection) {
            return Inertia::render('adviser/advisory-clearance/page', [
                'advisorySection' => null,
                'students' => [],
                'pagination' => null,
                'stats' => ['total' => 0, 'cleared' => 0, 'pending' => 0, 'not_cleared' => 0],
                'schoolYears' => \App\Services\SchoolYearService::getSchoolYears(),
                'selectedStudent' => null,
                'subjectClearances' => [],
                'filters' => [
                    'school_year' => $schoolYear,
                    'search' => $search,
                    'student_id' => null,
                    'per_page' => $perPage,
                ],
                'noAssignment' => true,
            ]);
        }

        $section = $this->mapAdvisorySection($adviserSection);
        $sectionId = $section['id'];

        $sectionSubjects = collect($this->getSectionSubjects($sectionId));
        $totalSubjects = $sectionSubjects->count();

        $allClearances = Clearance::where('class_section_id', $sectionId)
            ->where('school_year', $schoolYear)
            ->get()
            ->groupBy('student_id');

        $overallStatusFor = function ($clearancesForStudent) use ($totalSubjects) {
            $clearancesForStudent = $clearancesForStudent ?? collect();
            $hasNotCleared = $clearancesForStudent->contains(fn($c) => $c->status === 'not_cleared');
            $clearedCount = $clearancesForStudent->where('status', 'cleared')->count();

            if ($hasNotCleared) {
                return 'not_cleared';
            }

            if ($totalSubjects > 0 && $clearedCount >= $totalSubjects) {
                return 'cleared';
            }

            return 'pending';
        };

        $allStudentIds = Student::where('current_section_id', $sectionId)
            ->where('school_year', $schoolYear)
            ->pluck('id');

        $stats = ['total' => $allStudentIds->count(), 'cleared' => 0, 'pending' => 0, 'not_cleared' => 0];
        foreach ($allStudentIds as $sid) {
            $status = $overallStatusFor($allClearances->get($sid));
            $stats[$status]++;
        }

        $query = Student::where('current_section_id', $sectionId)
            ->where('school_year', $schoolYear)
            ->with('profilePicture');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('lrn', 'like', "%{$search}%");
            });
        }

        $paginated = $query->orderBy('last_name')->paginate($perPage);

        $students = collect($paginated->items())->map(function ($student) use ($allClearances, $overallStatusFor) {
            return [
                'id' => $student->id,
                'student_id' => $student->lrn,
                'firstName' => $student->first_name,
                'lastName' => $student->last_name,
                'middleName' => $student->middle_name ?? null,
                'profile_picture' => $student->profilePicture
                    ? asset('storage/' . $student->profilePicture->file_path)
                    : null,
                'overall_status' => $overallStatusFor($allClearances->get($student->id)),
            ];
        })->values();

        $pagination = [
            'current_page' => $paginated->currentPage(),
            'last_page' => $paginated->lastPage(),
            'per_page' => $paginated->perPage(),
            'total' => $paginated->total(),
        ];

        $selectedStudent = null;
        $subjectClearances = [];

        if ($studentId) {
            $student = Student::where('id', $studentId)
                ->where('current_section_id', $sectionId)
                ->where('school_year', $schoolYear)
                ->first();

            if ($student) {
                $studentClearances = Clearance::where('student_id', $studentId)
                    ->where('class_section_id', $sectionId)
                    ->where('school_year', $schoolYear)
                    ->get()
                    ->keyBy('subject_id');

                $subjectClearances = $sectionSubjects->map(function ($subject) use ($studentClearances) {
                    $clearance = $studentClearances->get($subject['id']);

                    return [
                        'subject_id' => $subject['id'],
                        'subject_name' => $subject['name'],
                        'subject_code' => $subject['subject_code'],
                        'status' => $clearance?->status ?? 'pending',
                    ];
                })->values();

                $selectedStudent = [
                    'id' => $student->id,
                    'student_id' => $student->lrn,
                    'firstName' => $student->first_name,
                    'lastName' => $student->last_name,
                    'middleName' => $student->middle_name ?? null,
                ];
            }
        }

        return Inertia::render('adviser/advisory-clearance/page', [
            'advisorySection' => $section,
            'students' => $students,
            'pagination' => $pagination,
            'stats' => $stats,
            'schoolYears' => \App\Services\SchoolYearService::getSchoolYears(),
            'selectedStudent' => $selectedStudent,
            'subjectClearances' => $subjectClearances,
            'filters' => [
                'school_year' => $schoolYear,
                'search' => $search,
                'student_id' => $studentId ? (int) $studentId : null,
                'per_page' => $perPage,
            ],
            'noAssignment' => false,
        ]);
    }

    public function advisoryGrades(Request $request): Response|RedirectResponse
    {
        $context = $this->resolveAdvisoryContext($request);

        if ($context instanceof RedirectResponse) {
            return $context;
        }

        [$teacher, $adviserSection, $schoolYear] = $context;
        $subjectId = $request->input('subject_id');
        $perPage = (int) $request->input('per_page', 10);

        if (!$adviserSection) {
            return Inertia::render('adviser/advisory-grades/page', [
                'advisorySection' => null,
                'subjects' => [],
                'schoolYears' => \App\Services\SchoolYearService::getSchoolYears(),
                'students' => [],
                'pagination' => null,
                'filters' => [
                    'subject_id' => $subjectId ? (int) $subjectId : null,
                    'school_year' => $schoolYear,
                    'per_page' => $perPage,
                ],
                'noAssignment' => true,
            ]);
        }

        $section = $this->mapAdvisorySection($adviserSection);
        $sectionId = $section['id'];

        $subjects = $this->getSectionSubjects($sectionId);
        $students = [];
        $pagination = null;

        if ($subjectId) {
            $paginated = Student::where('current_section_id', $sectionId)
                ->where('school_year', $schoolYear)
                ->with(['gradeLevel', 'section'])
                ->orderBy('last_name')
                ->paginate($perPage);

            $studentRecords = collect($paginated->items());
            $studentIds = $studentRecords->pluck('id');

            $gradeRecords = DB::table('tbl_grades')
                ->where('class_section_id', $sectionId)
                ->where('subject_id', $subjectId)
                ->where('school_year', $schoolYear)
                ->whereIn('student_id', $studentIds)
                ->get()
                ->keyBy('student_id');

            $formatGrade = function ($grade) {
                if ($grade === null) {
                    return null;
                }

                return (int) round((float) $grade, 0, PHP_ROUND_HALF_UP);
            };

            $students = $studentRecords->map(function ($student) use ($gradeRecords, $formatGrade) {
                $gradeRecord = $gradeRecords->get($student->id);

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
                ];
            })->values();

            $pagination = [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ];
        }

        return Inertia::render('adviser/advisory-grades/page', [
            'advisorySection' => $section,
            'subjects' => $subjects,
            'schoolYears' => \App\Services\SchoolYearService::getSchoolYears(),
            'students' => $students,
            'pagination' => $pagination,
            'filters' => [
                'subject_id' => $subjectId ? (int) $subjectId : null,
                'school_year' => $schoolYear,
                'per_page' => $perPage,
            ],
            'noAssignment' => false,
        ]);
    }

    public function toggleClearance(Request $request): RedirectResponse
    {
        $context = $this->resolveAdvisoryContext($request);

        if ($context instanceof RedirectResponse) {
            return $context;
        }

        [$teacher, $adviserSection, $schoolYear] = $context;

        if (!$adviserSection) {
            return back()->withErrors(['error' => 'You are not assigned as a class adviser for the selected school year.']);
        }

        $sectionId = $adviserSection->class_section_id;

        $validated = $request->validate([
            'student_id' => 'required|exists:tbl_students,id',
            'subject_id' => 'required|exists:tbl_subjects,id',
            'cleared' => 'required|boolean',
        ]);

        $subjectInSection = DB::table('tbl_schedules')
            ->where('class_section_id', $sectionId)
            ->where('subject_id', $validated['subject_id'])
            ->exists();

        if (!$subjectInSection) {
            return back()->withErrors(['error' => 'Invalid subject for your advisory class.']);
        }

        $studentInSection = Student::where('id', $validated['student_id'])
            ->where('current_section_id', $sectionId)
            ->where('school_year', $schoolYear)
            ->exists();

        if (!$studentInSection) {
            return back()->withErrors(['error' => 'Student is not in your advisory class.']);
        }

        Clearance::updateOrCreate(
            [
                'student_id' => $validated['student_id'],
                'subject_id' => $validated['subject_id'],
                'class_section_id' => $sectionId,
                'school_year' => $schoolYear,
            ],
            [
                'teacher_id' => $teacher->id,
                'status' => $validated['cleared'] ? 'cleared' : 'pending',
            ]
        );

        return back()->with('success', 'Clearance updated.');
    }
}
