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

        return Student::orderBy('school_year', 'desc')
            ->value('school_year') ?? date('Y') . '-' . (date('Y') + 1);
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

        $schoolYear = $this->currentSchoolYear($request->input('school_year'));

        $adviserSection = AdviserSection::where('teacher_id', $teacher->id)
            ->where('school_year', $schoolYear)
            ->with(['classSection.gradeLevel'])
            ->first();

        if (!$adviserSection) {
            return redirect()
                ->route('teacher.dashboard')
                ->withErrors(['error' => 'You are not assigned as a class adviser for the selected school year.']);
        }

        return [$teacher, $adviserSection, $schoolYear];
    }

    private function getSchoolYears()
    {
        $dbSchoolYears = Student::select('school_year')
            ->distinct()
            ->pluck('school_year')
            ->toArray();

        $currentYear = (int) date('Y');
        $generatedYears = [];

        for ($year = 2018; $year <= $currentYear + 1; $year++) {
            $generatedYears[] = $year . '-' . ($year + 1);
        }

        $allYears = array_unique(array_merge($generatedYears, $dbSchoolYears));
        rsort($allYears);

        return collect($allYears)->map(fn ($year) => [
            'value' => $year,
            'label' => $year,
        ]);
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
            ->map(fn ($subject) => [
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
        ]);
    }

    public function classList(Request $request): Response|RedirectResponse
    {
        $context = $this->resolveAdvisoryContext($request);

        if ($context instanceof RedirectResponse) {
            return $context;
        }

        [$teacher, $adviserSection, $schoolYear] = $context;
        $section = $this->mapAdvisorySection($adviserSection);
        $perPage = (int) $request->input('per_page', 10);

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
            'schoolYears' => $this->getSchoolYears(),
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
        ]);
    }

    public function advisoryClearance(Request $request): Response|RedirectResponse
    {
        $context = $this->resolveAdvisoryContext($request);

        if ($context instanceof RedirectResponse) {
            return $context;
        }

        [$teacher, $adviserSection, $schoolYear] = $context;
        $section = $this->mapAdvisorySection($adviserSection);
        $sectionId = $section['id'];

        $subjectId = $request->input('subject_id');
        $search = trim((string) $request->input('search', ''));
        $status = $request->input('status', 'all');
        $perPage = (int) $request->input('per_page', 10);

        $subjects = collect($this->getSectionSubjects($sectionId))->map(function ($subject) use ($section) {
            return [
                'id' => $subject['id'],
                'subject_name' => $subject['name'],
                'subject_code' => $subject['subject_code'],
                'grade_level' => $section['grade_level_name'],
                'section' => $section['name'],
                'section_id' => $section['id'],
            ];
        })->values();

        $students = collect();
        $pagination = null;
        $stats = ['total' => 0, 'cleared' => 0, 'pending' => 0, 'not_cleared' => 0];

        if ($subjectId) {
            $clearances = Clearance::where('subject_id', $subjectId)
                ->where('class_section_id', $sectionId)
                ->where('school_year', $schoolYear)
                ->get()
                ->keyBy('student_id');

            $allIds = Student::where('current_section_id', $sectionId)
                ->where('school_year', $schoolYear)
                ->pluck('id');

            foreach ($allIds as $id) {
                $clearanceStatus = $clearances->get($id)?->status ?? 'pending';
                $stats['total']++;
                $stats[$clearanceStatus] = ($stats[$clearanceStatus] ?? 0) + 1;
            }

            $query = Student::where('current_section_id', $sectionId)
                ->where('school_year', $schoolYear)
                ->with(['gradeLevel', 'section', 'profilePicture']);

            if ($search !== '') {
                $query->where(function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('lrn', 'like', "%{$search}%");
                });
            }

            if ($status !== 'all') {
                $matchingIds = $clearances->filter(fn ($c) => $c->status === $status)->pluck('student_id');
                if ($status === 'pending') {
                    $nonPendingIds = $clearances->filter(fn ($c) => $c->status !== 'pending')->pluck('student_id');
                    $query->where(fn ($q) => $q->whereIn('id', $matchingIds)->orWhereNotIn('id', $nonPendingIds));
                } else {
                    $query->whereIn('id', $matchingIds);
                }
            }

            $paginated = $query->orderBy('last_name')->paginate($perPage);

            $students = collect($paginated->items())->map(function ($student) use ($clearances) {
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
            })->values();

            $pagination = [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ];
        }

        return Inertia::render('adviser/advisory-clearance/page', [
            'advisorySection' => $section,
            'subjects' => $subjects,
            'students' => $students,
            'stats' => $stats,
            'pagination' => $pagination,
            'schoolYears' => $this->getSchoolYears(),
            'filters' => [
                'subject_id' => $subjectId ? (int) $subjectId : null,
                'school_year' => $schoolYear,
                'search' => $search,
                'status' => $status,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function advisoryGrades(Request $request): Response|RedirectResponse
    {
        $context = $this->resolveAdvisoryContext($request);

        if ($context instanceof RedirectResponse) {
            return $context;
        }

        [$teacher, $adviserSection, $schoolYear] = $context;
        $section = $this->mapAdvisorySection($adviserSection);
        $sectionId = $section['id'];
        $subjectId = $request->input('subject_id');
        $perPage = (int) $request->input('per_page', 10);

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
            'schoolYears' => $this->getSchoolYears(),
            'students' => $students,
            'pagination' => $pagination,
            'filters' => [
                'subject_id' => $subjectId ? (int) $subjectId : null,
                'school_year' => $schoolYear,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function toggleClearance(Request $request): RedirectResponse
    {
        $context = $this->resolveAdvisoryContext($request);

        if ($context instanceof RedirectResponse) {
            return $context;
        }

        [$teacher, $adviserSection, $schoolYear] = $context;
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
