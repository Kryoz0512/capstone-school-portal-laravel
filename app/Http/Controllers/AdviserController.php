<?php

namespace App\Http\Controllers;

use App\Models\AdviserSection;
use App\Models\Clearance;
use App\Models\Student;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AdviserController extends Controller
{
    private function resolveAdviser(?string $schoolYear = null): array
    {
        $user = Auth::user();
        $teacher = Teacher::where('user_id', $user->id)->first();

        if (!$teacher) {
            return ['teacher' => null, 'adviserSection' => null, 'schoolYear' => $schoolYear];
        }

        if (!$schoolYear) {
            $schoolYear = Student::orderBy('school_year', 'desc')
                ->value('school_year') ?? date('Y') . '-' . (date('Y') + 1);
        }

        $adviserSection = AdviserSection::where('teacher_id', $teacher->id)
            ->where('school_year', $schoolYear)
            ->with(['classSection.gradeLevel'])
            ->first();

        if (!$adviserSection) {
            $adviserSection = AdviserSection::where('teacher_id', $teacher->id)
                ->with(['classSection.gradeLevel'])
                ->orderBy('school_year', 'desc')
                ->first();

            if ($adviserSection) {
                $schoolYear = $adviserSection->school_year;
            }
        }

        return compact('teacher', 'adviserSection', 'schoolYear');
    }

    private function formatGrade($value): ?int
    {
        if ($value === null) {
            return null;
        }

        return (int) round((float) $value, 0, PHP_ROUND_HALF_UP);
    }

    private function getAdvisorySchoolYears(int $teacherId)
    {
        return AdviserSection::where('teacher_id', $teacherId)
            ->select('school_year')
            ->distinct()
            ->orderBy('school_year', 'desc')
            ->pluck('school_year')
            ->map(fn ($year) => ['value' => $year, 'label' => $year])
            ->values();
    }

    /** Subjects taught in the advisory section with assigned teachers (from schedules). */
    private function getSectionSubjectsWithTeachers(int $sectionId): array
    {
        return DB::table('tbl_schedules')
            ->join('tbl_subjects', 'tbl_schedules.subject_id', '=', 'tbl_subjects.id')
            ->join('tbl_teachers', 'tbl_schedules.teacher_id', '=', 'tbl_teachers.id')
            ->where('tbl_schedules.class_section_id', $sectionId)
            ->select(
                'tbl_subjects.id as subject_id',
                'tbl_subjects.name as subject_name',
                'tbl_subjects.code as subject_code',
                'tbl_teachers.id as teacher_id',
                'tbl_teachers.name as teacher_name',
            )
            ->distinct()
            ->orderBy('tbl_subjects.name')
            ->get()
            ->map(fn ($row) => [
                'id' => $row->subject_id,
                'subject_name' => $row->subject_name,
                'subject_code' => $row->subject_code,
                'teacher_id' => $row->teacher_id,
                'teacher_name' => $row->teacher_name,
            ])
            ->values()
            ->toArray();
    }

    private function getAdvisoryStudents(int $sectionId, string $schoolYear)
    {
        return Student::where('current_section_id', $sectionId)
            ->where('school_year', $schoolYear)
            ->with(['gradeLevel', 'section'])
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get();
    }

    private function mapStudentOption($student): array
    {
        return [
            'id' => $student->id,
            'lrn' => $student->lrn,
            'studentName' => trim($student->first_name . ' ' . ($student->middle_name ? $student->middle_name . ' ' : '') . $student->last_name),
            'gradeLevel' => $student->gradeLevel?->name ?? 'N/A',
            'section' => $student->section?->section_name ?? 'N/A',
        ];
    }

    private function advisoryContext(Request $request): array|\Illuminate\Http\RedirectResponse
    {
        $requestedYear = $request->input('school_year');
        ['teacher' => $teacher, 'adviserSection' => $adviserSection, 'schoolYear' => $schoolYear] = $this->resolveAdviser($requestedYear);

        if (!$teacher) {
            return redirect()->route('login.adviser')->withErrors(['error' => 'Teacher profile not found.']);
        }

        $section = null;
        if ($adviserSection?->classSection) {
            $classSection = $adviserSection->classSection;
            $section = [
                'id' => $classSection->id,
                'name' => $classSection->section_name,
                'grade_level_name' => $classSection->gradeLevel?->name ?? 'N/A',
            ];
        }

        return [
            'teacher' => $teacher,
            'adviserSection' => $adviserSection,
            'schoolYear' => $schoolYear,
            'section' => $section,
            'schoolYears' => $this->getAdvisorySchoolYears($teacher->id),
            'noAssignment' => !$adviserSection,
        ];
    }

    public function dashboard()
    {
        ['teacher' => $teacher, 'adviserSection' => $adviserSection] = $this->resolveAdviser();

        if (!$teacher) {
            return redirect()->route('login.adviser')->withErrors(['error' => 'Teacher profile not found.']);
        }

        if (!$adviserSection) {
            return Inertia::render('adviser/dashboard/page', [
                'stats' => null,
                'advisorySection' => null,
                'noAssignment' => true,
            ]);
        }

        $sectionId = $adviserSection->class_section_id;
        $classSection = $adviserSection->classSection;

        $totalStudents = Student::where('current_section_id', $sectionId)
            ->where('school_year', $adviserSection->school_year)
            ->count();

        return Inertia::render('adviser/dashboard/page', [
            'stats' => [
                'totalStudents' => $totalStudents,
                'sectionName' => $classSection->section_name,
                'gradeLevel' => $classSection->gradeLevel?->name ?? 'N/A',
                'currentSchoolYear' => $adviserSection->school_year,
            ],
            'advisorySection' => [
                'id' => $classSection->id,
                'name' => $classSection->section_name,
                'gradeLevel' => $classSection->gradeLevel?->name ?? 'N/A',
            ],
            'noAssignment' => false,
        ]);
    }

    public function classList(Request $request)
    {
        $requestedYear = $request->input('school_year');
        ['teacher' => $teacher, 'adviserSection' => $adviserSection, 'schoolYear' => $schoolYear] = $this->resolveAdviser($requestedYear);

        if (!$teacher) {
            return redirect()->route('login.adviser')->withErrors(['error' => 'Teacher profile not found.']);
        }

        $schoolYears = AdviserSection::where('teacher_id', $teacher->id)
            ->select('school_year')
            ->distinct()
            ->orderBy('school_year', 'desc')
            ->pluck('school_year')
            ->map(fn ($year) => ['value' => $year, 'label' => $year])
            ->values();

        $students = [];
        $section = null;

        if ($adviserSection && $adviserSection->classSection) {
            $classSection = $adviserSection->classSection;
            $section = [
                'id' => $classSection->id,
                'name' => $classSection->section_name,
                'grade_level_name' => $classSection->gradeLevel?->name ?? 'N/A',
            ];

            $students = Student::where('current_section_id', $classSection->id)
                ->where('school_year', $adviserSection->school_year)
                ->with(['gradeLevel', 'section'])
                ->orderBy('last_name')
                ->orderBy('first_name')
                ->get()
                ->map(function ($student) {
                    return [
                        'id' => $student->id,
                        'lrn' => $student->lrn,
                        'studentName' => trim($student->first_name . ' ' . ($student->middle_name ? $student->middle_name . ' ' : '') . $student->last_name),
                        'gradeLevel' => $student->gradeLevel ? $student->gradeLevel->name : 'N/A',
                        'section' => $student->section ? $student->section->section_name : 'N/A',
                    ];
                })
                ->values();
        }

        return Inertia::render('adviser/class-list/page', [
            'section' => $section,
            'schoolYears' => $schoolYears,
            'students' => $students,
            'filters' => [
                'school_year' => $schoolYear,
            ],
            'noAssignment' => !$adviserSection,
        ]);
    }

    public function subjectTeachers(Request $request)
    {
        $context = $this->advisoryContext($request);
        if ($context instanceof \Illuminate\Http\RedirectResponse) {
            return $context;
        }

        $subjects = [];
        if ($context['section']) {
            $subjects = $this->getSectionSubjectsWithTeachers($context['section']['id']);
        }

        return Inertia::render('adviser/subject-teachers/page', [
            'section' => $context['section'],
            'schoolYears' => $context['schoolYears'],
            'subjects' => $subjects,
            'filters' => ['school_year' => $context['schoolYear']],
            'noAssignment' => $context['noAssignment'],
        ]);
    }

    public function grades(Request $request)
    {
        $context = $this->advisoryContext($request);
        if ($context instanceof \Illuminate\Http\RedirectResponse) {
            return $context;
        }

        $subjectId = $request->input('subject_id') ? (int) $request->input('subject_id') : null;
        $studentId = $request->input('student_id') ? (int) $request->input('student_id') : null;
        $view = $request->input('view', $studentId ? 'student' : 'subject');

        $subjects = [];
        $students = [];
        $subjectGrades = [];
        $reportCardGrades = [];
        $selectedStudent = null;

        if ($context['section'] && $context['adviserSection']) {
            $sectionId = $context['section']['id'];
            $schoolYear = $context['adviserSection']->school_year;

            $subjects = $this->getSectionSubjectsWithTeachers($sectionId);
            $studentRecords = $this->getAdvisoryStudents($sectionId, $schoolYear);
            $students = $studentRecords->map(fn ($s) => $this->mapStudentOption($s))->values();

            if ($view === 'student' && $studentId) {
                $student = $studentRecords->firstWhere('id', $studentId);
                if ($student) {
                    $selectedStudent = $this->mapStudentOption($student);
                    $reportCardGrades = DB::table('tbl_grades')
                        ->join('tbl_subjects', 'tbl_grades.subject_id', '=', 'tbl_subjects.id')
                        ->join('tbl_teachers', 'tbl_grades.teacher_id', '=', 'tbl_teachers.id')
                        ->where('tbl_grades.student_id', $studentId)
                        ->where('tbl_grades.class_section_id', $sectionId)
                        ->where('tbl_grades.school_year', $schoolYear)
                        ->select(
                            'tbl_grades.id',
                            'tbl_subjects.name as subject',
                            'tbl_teachers.name as teacher',
                            'tbl_grades.term_1',
                            'tbl_grades.term_2',
                            'tbl_grades.term_3',
                            'tbl_grades.final_grade',
                            'tbl_grades.remarks',
                        )
                        ->orderBy('tbl_subjects.name')
                        ->get()
                        ->map(fn ($g) => [
                            'id' => $g->id,
                            'subject' => $g->subject,
                            'teacher' => $g->teacher,
                            'term1' => $this->formatGrade($g->term_1),
                            'term2' => $this->formatGrade($g->term_2),
                            'term3' => $this->formatGrade($g->term_3),
                            'finalGrade' => $this->formatGrade($g->final_grade),
                            'remarks' => $g->remarks,
                        ])
                        ->values();
                }
            } elseif ($view === 'subject' && $subjectId) {
                $gradeRecords = DB::table('tbl_grades')
                    ->where('class_section_id', $sectionId)
                    ->where('subject_id', $subjectId)
                    ->where('school_year', $schoolYear)
                    ->get()
                    ->keyBy('student_id');

                $subjectGrades = $studentRecords->map(function ($student) use ($gradeRecords) {
                    $grade = $gradeRecords->get($student->id);

                    return [
                        'id' => $student->id,
                        'lrn' => $student->lrn,
                        'studentName' => trim($student->first_name . ' ' . ($student->middle_name ? $student->middle_name . ' ' : '') . $student->last_name),
                        'gradeLevel' => $student->gradeLevel?->name ?? 'N/A',
                        'section' => $student->section?->section_name ?? 'N/A',
                        'term1' => $this->formatGrade($grade?->term_1),
                        'term2' => $this->formatGrade($grade?->term_2),
                        'term3' => $this->formatGrade($grade?->term_3),
                        'finalAverage' => $this->formatGrade($grade?->final_grade),
                        'remarks' => $grade?->remarks,
                    ];
                })->values();
            }
        }

        return Inertia::render('adviser/grades/page', [
            'section' => $context['section'],
            'schoolYears' => $context['schoolYears'],
            'subjects' => $subjects,
            'students' => $students,
            'subjectGrades' => $subjectGrades,
            'reportCardGrades' => $reportCardGrades,
            'selectedStudent' => $selectedStudent,
            'filters' => [
                'school_year' => $context['schoolYear'],
                'subject_id' => $subjectId,
                'student_id' => $studentId,
                'view' => $view,
            ],
            'noAssignment' => $context['noAssignment'],
        ]);
    }

    public function studentClearance(Request $request)
    {
        $context = $this->advisoryContext($request);
        if ($context instanceof \Illuminate\Http\RedirectResponse) {
            return $context;
        }

        $subjectId = $request->input('subject_id') ? (int) $request->input('subject_id') : null;
        $subjects = [];
        $clearanceStudents = [];

        if ($context['section'] && $context['adviserSection']) {
            $sectionId = $context['section']['id'];
            $schoolYear = $context['adviserSection']->school_year;

            $subjects = $this->getSectionSubjectsWithTeachers($sectionId);

            if ($subjectId) {
                $clearances = Clearance::where('subject_id', $subjectId)
                    ->where('class_section_id', $sectionId)
                    ->where('school_year', $schoolYear)
                    ->get()
                    ->keyBy('student_id');

                $clearanceStudents = $this->getAdvisoryStudents($sectionId, $schoolYear)
                    ->map(function ($student) use ($clearances) {
                        $clearance = $clearances->get($student->id);

                        return [
                            'id' => $student->id,
                            'student_id' => $student->lrn,
                            'firstName' => $student->first_name,
                            'lastName' => $student->last_name,
                            'middleName' => $student->middle_name,
                            'grade_level' => $student->gradeLevel?->name ?? 'N/A',
                            'section' => $student->section?->section_name ?? 'N/A',
                            'clearance_status' => $clearance?->status ?? 'pending',
                        ];
                    })
                    ->values();
            }
        }

        return Inertia::render('adviser/student-clearance/page', [
            'section' => $context['section'],
            'schoolYears' => $context['schoolYears'],
            'subjects' => $subjects,
            'students' => $clearanceStudents,
            'filters' => [
                'school_year' => $context['schoolYear'],
                'subject_id' => $subjectId,
            ],
            'noAssignment' => $context['noAssignment'],
        ]);
    }

    public function teacherDashboard()
    {
        ['teacher' => $teacher] = $this->resolveAdviser();

        if (!$teacher || !AdviserSection::where('teacher_id', $teacher->id)->exists()) {
            return redirect()->route('teacher.dashboard');
        }

        $payload = $this->buildDashboardPayload();

        if ($payload instanceof \Illuminate\Http\RedirectResponse) {
            return $payload;
        }

        return Inertia::render('teacher/advisory/dashboard/page', $payload);
    }

    public function teacherClassList(Request $request)
    {
        ['teacher' => $teacher] = $this->resolveAdviser();

        if (!$teacher || !AdviserSection::where('teacher_id', $teacher->id)->exists()) {
            return redirect()->route('teacher.dashboard');
        }

        $payload = $this->buildClassListPayload($request);

        if ($payload instanceof \Illuminate\Http\RedirectResponse) {
            return $payload;
        }

        return Inertia::render('teacher/advisory/class-list/page', $payload);
    }

    private function buildDashboardPayload(): array|\Illuminate\Http\RedirectResponse
    {
        ['teacher' => $teacher, 'adviserSection' => $adviserSection] = $this->resolveAdviser();

        if (!$teacher) {
            return redirect()->route('teacher.dashboard')->withErrors(['error' => 'Teacher profile not found.']);
        }

        if (!$adviserSection) {
            return [
                'stats' => null,
                'advisorySection' => null,
                'noAssignment' => true,
                'readOnly' => true,
            ];
        }

        $sectionId = $adviserSection->class_section_id;
        $classSection = $adviserSection->classSection;

        $totalStudents = Student::where('current_section_id', $sectionId)
            ->where('school_year', $adviserSection->school_year)
            ->count();

        return [
            'stats' => [
                'totalStudents' => $totalStudents,
                'sectionName' => $classSection->section_name,
                'gradeLevel' => $classSection->gradeLevel?->name ?? 'N/A',
                'currentSchoolYear' => $adviserSection->school_year,
            ],
            'advisorySection' => [
                'id' => $classSection->id,
                'name' => $classSection->section_name,
                'gradeLevel' => $classSection->gradeLevel?->name ?? 'N/A',
            ],
            'noAssignment' => false,
            'readOnly' => true,
        ];
    }

    private function buildClassListPayload(Request $request): array|\Illuminate\Http\RedirectResponse
    {
        $requestedYear = $request->input('school_year');
        ['teacher' => $teacher, 'adviserSection' => $adviserSection, 'schoolYear' => $schoolYear] = $this->resolveAdviser($requestedYear);

        if (!$teacher) {
            return redirect()->route('teacher.dashboard')->withErrors(['error' => 'Teacher profile not found.']);
        }

        $schoolYears = AdviserSection::where('teacher_id', $teacher->id)
            ->select('school_year')
            ->distinct()
            ->orderBy('school_year', 'desc')
            ->pluck('school_year')
            ->map(fn ($year) => ['value' => $year, 'label' => $year])
            ->values();

        $students = [];
        $section = null;

        if ($adviserSection && $adviserSection->classSection) {
            $classSection = $adviserSection->classSection;
            $section = [
                'id' => $classSection->id,
                'name' => $classSection->section_name,
                'grade_level_name' => $classSection->gradeLevel?->name ?? 'N/A',
            ];

            $students = Student::where('current_section_id', $classSection->id)
                ->where('school_year', $adviserSection->school_year)
                ->with(['gradeLevel', 'section'])
                ->orderBy('last_name')
                ->orderBy('first_name')
                ->get()
                ->map(function ($student) {
                    return [
                        'id' => $student->id,
                        'lrn' => $student->lrn,
                        'studentName' => trim($student->first_name . ' ' . ($student->middle_name ? $student->middle_name . ' ' : '') . $student->last_name),
                        'gradeLevel' => $student->gradeLevel ? $student->gradeLevel->name : 'N/A',
                        'section' => $student->section ? $student->section->section_name : 'N/A',
                    ];
                })
                ->values();
        }

        return [
            'section' => $section,
            'schoolYears' => $schoolYears,
            'students' => $students,
            'filters' => [
                'school_year' => $schoolYear,
            ],
            'noAssignment' => !$adviserSection,
            'readOnly' => true,
        ];
    }
}
