<?php

namespace App\Http\Controllers;

use App\Models\Teacher;
use App\Models\Student;
use App\Models\Grade;
use App\Models\ClassSection;
use App\Models\GradeLevel;
use App\Models\Subject;
use App\Models\Schedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class GradeController extends Controller
{
    /**
     * Generate school years from 2018 to current year + 1
     * Format: 2018-2019, 2019-2020, etc.
     * Also includes unique school years from database
     */
    private function getSchoolYears()
    {
        // Get school years from database
        $dbSchoolYears = Student::select('school_year')
            ->distinct()
            ->pluck('school_year')
            ->toArray();

        // Generate school years from 2018 to current year + 1
        $currentYear = (int)date('Y');
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

    public function index(Request $request)
    {
        $user = Auth::user();
        $teacher = Teacher::where('user_id', $user->id)->first();

        if (!$teacher) {
            return redirect()->route('login')->withErrors(['error' => 'Teacher profile not found.']);
        }

        // Get filter parameters
        $gradeLevelId = $request->input('grade_level_id');
        $sectionId = $request->input('section_id');
        $subjectId = $request->input('subject_id');
        $quarter = $request->input('quarter', '1');
        $schoolYear = $request->input('school_year');

        // Get current school year if not provided
        if (!$schoolYear) {
            $schoolYear = Student::orderBy('school_year', 'desc')
                ->value('school_year') ?? date('Y') . '-' . (date('Y') + 1);
        }

        // Get grade levels
        $gradeLevels = GradeLevel::all()->map(function ($level) {
            return [
                'id' => $level->id,
                'name' => $level->name,
            ];
        });

        // Get sections based on teacher's schedules
        $sections = ClassSection::whereIn('id', function($query) use ($teacher) {
            $query->select('class_section_id')
                ->from('tbl_schedules')
                ->where('teacher_id', $teacher->id)
                ->distinct();
        })
        ->when($gradeLevelId, function($query) use ($gradeLevelId) {
            $query->where('grade_level_id', $gradeLevelId);
        })
        ->with('gradeLevel')
        ->get()
        ->map(function ($section) {
            return [
                'id' => $section->id,
                'name' => $section->section_name,
                'grade_level_id' => $section->grade_level_id,
            ];
        });

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

        // Get students with their grades
        $students = [];
        if ($sectionId && $subjectId) {
            $quarterColumn = 'quarter_' . $quarter;
            
            $studentRecords = Student::where('current_section_id', $sectionId)
                ->where('school_year', $schoolYear)
                ->get();
            
            // Fetch all grades in one query to avoid N+1
            $studentIds = $studentRecords->pluck('id');
            $gradeRecords = Grade::where('class_section_id', $sectionId)
                ->where('subject_id', $subjectId)
                ->where('school_year', $schoolYear)
                ->where('teacher_id', $teacher->id)
                ->whereIn('student_id', $studentIds)
                ->get();
            
            // Check for duplicate records (should not happen with unique constraint)
            $duplicateCheck = $gradeRecords->groupBy('student_id');
            foreach ($duplicateCheck as $studentId => $records) {
                if ($records->count() > 1) {
                    Log::warning('Found duplicate grade records for student', [
                        'student_id' => $studentId,
                        'section_id' => $sectionId,
                        'subject_id' => $subjectId,
                        'school_year' => $schoolYear,
                        'teacher_id' => $teacher->id,
                        'record_count' => $records->count(),
                        'record_ids' => $records->pluck('id')->toArray()
                    ]);
                }
            }
            
            // Use keyBy to get one record per student (most recent if duplicates exist)
            $gradeRecords = $gradeRecords->keyBy('student_id');
            
            $students = $studentRecords->map(function ($student) use ($gradeRecords, $quarterColumn) {
                $gradeRecord = $gradeRecords->get($student->id);
                $grade = $gradeRecord ? $gradeRecord->$quarterColumn : null;
                
                // Format grade to remove unnecessary decimals
                $formattedGrade = null;
                if ($grade !== null) {
                    $formattedGrade = (float)$grade;
                    // Remove .00 if it's a whole number
                    if ($formattedGrade == floor($formattedGrade)) {
                        $formattedGrade = (int)$formattedGrade;
                    }
                }
                
                // Only show remarks if this specific quarter has a grade
                $remarks = null;
                if ($grade !== null) {
                    $remarks = $formattedGrade >= 75 ? 'Passed' : 'Failed';
                }
                
                return [
                    'id' => $student->id,
                    'lrn' => $student->lrn,
                    'studentName' => trim($student->first_name . ' ' . $student->last_name),
                    'grade' => $formattedGrade,
                    'remarks' => $remarks,
                    'gradeId' => $gradeRecord ? $gradeRecord->id : null,
                ];
            })->values();
        }

        // Get available school years
        $schoolYears = $this->getSchoolYears();

        return Inertia::render('teacher/grade-sheets/page', [
            'gradeLevels' => $gradeLevels,
            'sections' => $sections,
            'subjects' => $subjects,
            'students' => $students,
            'schoolYears' => $schoolYears,
            'filters' => [
                'grade_level_id' => $gradeLevelId,
                'section_id' => $sectionId,
                'subject_id' => $subjectId,
                'quarter' => $quarter,
                'school_year' => $schoolYear,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        $teacher = Teacher::where('user_id', $user->id)->first();

        Log::info('Grade Store Request', [
            'request_data' => $request->all(),
            'teacher_id' => $teacher ? $teacher->id : null
        ]);

        $validated = $request->validate([
            'student_id' => 'required|exists:tbl_students,id',
            'class_section_id' => 'required|exists:tbl_class_sections,id',
            'subject_id' => 'required|exists:tbl_subjects,id',
            'quarter' => 'required|in:1,2,3,4',
            'school_year' => 'required|string',
            'grade' => 'required|numeric|min:75|max:100',
        ]);

        $quarterColumn = 'quarter_' . $validated['quarter'];
        
        // First, get or create the grade record
        $grade = Grade::firstOrCreate([
            'student_id' => $validated['student_id'],
            'class_section_id' => $validated['class_section_id'],
            'subject_id' => $validated['subject_id'],
            'school_year' => $validated['school_year'],
            'teacher_id' => $teacher->id,
        ]);
        
        // Update the specific quarter grade
        $grade->$quarterColumn = (string)$validated['grade'];
        
        // Recalculate final grade and remarks based on all available quarters
        $quarters = [
            $grade->quarter_1,
            $grade->quarter_2,
            $grade->quarter_3,
            $grade->quarter_4
        ];
        
        $availableQuarters = array_filter($quarters, function($q) {
            return $q !== null;
        });
        
        if (count($availableQuarters) > 0) {
            $sum = array_sum($availableQuarters);
            $count = count($availableQuarters);
            $finalGradeValue = $sum / $count;
            $grade->final_grade = (string)$finalGradeValue;
            $grade->remarks = $finalGradeValue >= 75 ? 'Passed' : 'Failed';
        } else {
            $currentGrade = (float)$validated['grade'];
            $grade->remarks = $currentGrade >= 75 ? 'Passed' : 'Failed';
        }
        
        $saved = $grade->save();
        
        Log::info('Grade Save Result', [
            'saved' => $saved,
            'grade_id' => $grade->id,
            'quarter_column' => $quarterColumn,
            'grade_value' => $grade->$quarterColumn,
            'remarks' => $grade->remarks
        ]);

        return back()->with('success', 'Grade saved successfully.');
    }

    public function update(Request $request, Grade $grade)
    {
        $validated = $request->validate([
            'quarter' => 'required|in:1,2,3,4',
            'grade' => 'required|numeric|min:75|max:100',
        ]);

        $quarterColumn = 'quarter_' . $validated['quarter'];
        $grade->$quarterColumn = (string)$validated['grade'];
        
        $quarters = [
            $grade->quarter_1,
            $grade->quarter_2,
            $grade->quarter_3,
            $grade->quarter_4
        ];
        
        $availableQuarters = array_filter($quarters, function($q) {
            return $q !== null;
        });
        
        if (count($availableQuarters) > 0) {
            $sum = array_sum($availableQuarters);
            $count = count($availableQuarters);
            $finalGradeValue = $sum / $count;
            $grade->final_grade = (string)$finalGradeValue;
            $grade->remarks = $finalGradeValue >= 75 ? 'Passed' : 'Failed';
        } else {
            // Set remarks based on current quarter grade if no quarters available yet
            $currentGrade = (float)$validated['grade'];
            $grade->remarks = $currentGrade >= 75 ? 'Passed' : 'Failed';
        }
        
        $grade->save();

        return back()->with('success', 'Grade updated successfully.');
    }

    public function adminFinalReports(Request $request)
    {
        $user = Auth::user();

        // Get filter parameters
        $schoolYear = $request->input('school_year');
        $gradeLevelId = $request->input('grade_level_id');
        $sectionId = $request->input('section_id');

        // Get current school year if not provided
        if (!$schoolYear) {
            $schoolYear = Student::orderBy('school_year', 'desc')
                ->value('school_year') ?? date('Y') . '-' . (date('Y') + 1);
        }

        // Get available school years
        $schoolYears = $this->getSchoolYears();

        // Get grade levels - ordered properly (7, 8, 9, 10)
        $gradeLevels = GradeLevel::orderByRaw("
            CASE 
                WHEN name = 'Grade 7' THEN 1
                WHEN name = 'Grade 8' THEN 2
                WHEN name = 'Grade 9' THEN 3
                WHEN name = 'Grade 10' THEN 4
                ELSE 5
            END
        ")->get()->map(function ($level) {
            return [
                'id' => $level->id,
                'name' => $level->name,
            ];
        });

        // Get sections based on selected grade level
        $sections = ClassSection::when($gradeLevelId, function($query) use ($gradeLevelId) {
            $query->where('grade_level_id', $gradeLevelId);
        })
        ->with('gradeLevel')
        ->get()
        ->map(function ($section) {
            return [
                'id' => $section->id,
                'name' => $section->section_name,
                'grade_level_id' => $section->grade_level_id,
                'grade_level_name' => $section->gradeLevel->name,
            ];
        });

        // Get students with their final grades
        $students = [];
        if ($sectionId && $schoolYear) {
            $studentRecords = Student::where('current_section_id', $sectionId)
                ->where('school_year', $schoolYear)
                ->with(['gradeLevel', 'section'])
                ->get();

            // Fetch all grades for these students
            $studentIds = $studentRecords->pluck('id');
            $gradeRecords = Grade::whereIn('student_id', $studentIds)
                ->where('class_section_id', $sectionId)
                ->where('school_year', $schoolYear)
                ->get()
                ->groupBy('student_id');

            $students = $studentRecords->map(function ($student) use ($gradeRecords) {
                $studentGrades = $gradeRecords->get($student->id, collect());

                // Calculate overall final average from all subjects
                $finalGrades = $studentGrades->pluck('final_grade')->filter(function($grade) {
                    return $grade !== null;
                });

                $overallAverage = null;
                $overallRemarks = null;

                if ($finalGrades->count() > 0) {
                    $overallAverage = round($finalGrades->avg(), 2);
                    $overallRemarks = $overallAverage >= 75 ? 'Passed' : 'Failed';
                }

                return [
                    'id' => $student->id,
                    'lrn' => $student->lrn,
                    'studentName' => trim($student->first_name . ' ' . $student->last_name),
                    'gradeLevel' => $student->gradeLevel ? $student->gradeLevel->name : 'N/A',
                    'section' => $student->section ? $student->section->section_name : 'N/A',
                    'finalAverage' => $overallAverage,
                    'remarks' => $overallRemarks,
                ];
            })->values();
        }

        return Inertia::render('admin/records/final-reports/page', [
            'schoolYears' => $schoolYears,
            'gradeLevels' => $gradeLevels,
            'sections' => $sections,
            'students' => $students,
            'filters' => [
                'school_year' => $schoolYear,
                'grade_level_id' => $gradeLevelId,
                'section_id' => $sectionId,
            ],
        ]);
    }

    private const PROMOTABLE_GRADE_LEVELS = ['Grade 7', 'Grade 8', 'Grade 9'];

    private const NEXT_GRADE_LEVEL = [
        'Grade 7' => 'Grade 8',
        'Grade 8' => 'Grade 9',
        'Grade 9' => 'Grade 10',
    ];

    /**
     * Get numeric order for grade level comparison.
     */
    private function getGradeLevelOrder(string $name): int
    {
        return match ($name) {
            'Grade 7' => 1,
            'Grade 8' => 2,
            'Grade 9' => 3,
            'Grade 10' => 4,
            default => 5,
        };
    }

    /**
     * Check if every subject has all quarterly and final grades recorded.
     */
    private function allSubjectsHaveCompleteGrades($subjects): bool
    {
        if ($subjects->isEmpty()) {
            return false;
        }

        return $subjects->every(function ($subject) {
            return $subject['quarter_1'] !== null
                && $subject['quarter_2'] !== null
                && $subject['quarter_3'] !== null
                && $subject['quarter_4'] !== null
                && $subject['final_grade'] !== null;
        });
    }

    /**
     * Resolve the class section the student was in for a given grade level.
     */
    private function resolveSectionIdForGradeLevel(Student $student, int $gradeLevelId, $gradesForLevel): ?int
    {
        if ($student->current_grade_level_id === $gradeLevelId && $student->current_section_id) {
            return $student->current_section_id;
        }

        if ($gradesForLevel->isNotEmpty()) {
            return $gradesForLevel->first()->class_section_id;
        }

        return null;
    }

    /**
     * Get student's complete academic record across all grade levels
     */
    public function getStudentAcademicRecord($studentId)
    {
        $student = Student::with(['gradeLevel', 'section'])->findOrFail($studentId);

        // Get all grade levels ordered properly
        $gradeLevels = GradeLevel::orderByRaw("
            CASE 
                WHEN name = 'Grade 7' THEN 1
                WHEN name = 'Grade 8' THEN 2
                WHEN name = 'Grade 9' THEN 3
                WHEN name = 'Grade 10' THEN 4
                ELSE 5
            END
        ")->get();

        // All subjects per grade level (from subject listings / registrar catalog)
        $catalogSubjectsByGradeLevel = Subject::orderBy('name')
            ->get()
            ->groupBy('grade_level_id');

        // Get all grades for this student across all grade levels
        $allGrades = Grade::where('student_id', $studentId)
            ->with(['subject', 'teacher', 'classSection.gradeLevel'])
            ->get()
            ->groupBy(function ($grade) {
                return $grade->classSection->gradeLevel->name ?? 'Unknown';
            });

        $currentLevelName = $student->gradeLevel->name ?? '';
        $currentLevelOrder = $this->getGradeLevelOrder($currentLevelName);

        // Build academic record for each grade level
        $academicRecord = $gradeLevels->map(function ($gradeLevel) use ($allGrades, $catalogSubjectsByGradeLevel, $student, $currentLevelName, $currentLevelOrder) {
            $gradeLevelName = $gradeLevel->name;
            $gradesForLevel = $allGrades->get($gradeLevelName, collect());
            $gradesBySubjectId = $gradesForLevel->keyBy('subject_id');

            $isEnrolledAtLevel = $student->current_grade_level_id === $gradeLevel->id
                || $gradesForLevel->isNotEmpty();

            $catalogSubjects = $catalogSubjectsByGradeLevel->get($gradeLevel->id, collect());

            if (!$isEnrolledAtLevel || $catalogSubjects->isEmpty()) {
                return [
                    'grade_level' => $gradeLevelName,
                    'grade_level_id' => $gradeLevel->id,
                    'has_data' => false,
                    'subjects' => [],
                    'final_average' => null,
                    'remarks' => null,
                ];
            }

            $sectionId = $this->resolveSectionIdForGradeLevel($student, $gradeLevel->id, $gradesForLevel);

            $schedulesBySubjectId = collect();
            if ($sectionId) {
                $schedulesBySubjectId = Schedule::where('class_section_id', $sectionId)
                    ->with('teacher')
                    ->get()
                    ->unique('subject_id')
                    ->keyBy('subject_id');
            }

            // Merge catalog subjects with any graded subjects not in the catalog
            $subjectIdsFromGrades = $gradesBySubjectId->keys()->diff($catalogSubjects->pluck('id'));
            $extraSubjects = $gradesForLevel
                ->filter(fn ($grade) => $subjectIdsFromGrades->contains($grade->subject_id))
                ->map(fn ($grade) => $grade->subject)
                ->filter()
                ->unique('id');

            $allSubjects = $catalogSubjects->concat($extraSubjects)->unique('id')->sortBy('name')->values();

            $subjects = $allSubjects->map(function ($subject) use ($gradesBySubjectId, $schedulesBySubjectId) {
                $grade = $gradesBySubjectId->get($subject->id);
                $schedule = $schedulesBySubjectId->get($subject->id);

                return [
                    'subject_code' => $subject->code ?? null,
                    'subject_name' => $subject->name ?? 'N/A',
                    'teacher_name' => $grade?->teacher?->name
                        ?? $schedule?->teacher?->name
                        ?? '-',
                    'quarter_1' => $grade?->quarter_1,
                    'quarter_2' => $grade?->quarter_2,
                    'quarter_3' => $grade?->quarter_3,
                    'quarter_4' => $grade?->quarter_4,
                    'final_grade' => $grade?->final_grade,
                    'remarks' => $grade?->remarks,
                ];
            })->values();

            $finalGrades = $gradesForLevel->pluck('final_grade')->filter(fn ($g) => $g !== null);

            $finalAverage = null;
            $remarks = null;

            if ($finalGrades->count() > 0) {
                $finalAverage = round($finalGrades->avg(), 2);
                $remarks = $finalAverage >= 75 ? 'Passed' : 'Failed';
            }

            $levelOrder = $this->getGradeLevelOrder($gradeLevelName);
            $isCurrentLevel = $student->current_grade_level_id === $gradeLevel->id;
            $isCompleted = $levelOrder < $currentLevelOrder;
            $allGradesComplete = $this->allSubjectsHaveCompleteGrades($subjects);
            $isPromotableLevel = in_array($gradeLevelName, self::PROMOTABLE_GRADE_LEVELS, true);
            $nextGradeLevel = self::NEXT_GRADE_LEVEL[$gradeLevelName] ?? null;

            $canPromote = $isCurrentLevel
                && $isPromotableLevel
                && $allGradesComplete
                && $remarks === 'Passed';

            return [
                'grade_level' => $gradeLevelName,
                'grade_level_id' => $gradeLevel->id,
                'has_data' => true,
                'subjects' => $subjects,
                'final_average' => $finalAverage,
                'remarks' => $remarks,
                'is_current_level' => $isCurrentLevel,
                'is_completed' => $isCompleted,
                'all_grades_complete' => $allGradesComplete,
                'is_promotable_level' => $isPromotableLevel,
                'can_promote' => $canPromote,
                'next_grade_level' => $nextGradeLevel,
            ];
        });

        return Inertia::render('admin/records/student-academic-record/page', [
            'student' => [
                'id' => $student->id,
                'name' => trim($student->first_name . ' ' . $student->last_name),
                'lrn' => $student->lrn,
                'current_grade_level' => $student->gradeLevel->name ?? 'N/A',
                'current_grade_level_id' => $student->current_grade_level_id,
                'current_section' => $student->section->section_name ?? 'N/A',
                'ready_to_graduate' => $student->ready_to_graduate ?? false,
                'is_grade_10' => $currentLevelName === 'Grade 10',
            ],
            'academic_record' => $academicRecord,
            'grade_levels' => $gradeLevels->map(function($level) {
                return [
                    'id' => $level->id,
                    'name' => $level->name,
                ];
            }),
        ]);
    }

    /**
     * Promote student from Grade 7–9 to the next grade level.
     */
    public function promoteStudent($studentId)
    {
        $student = Student::with('gradeLevel')->findOrFail($studentId);
        $currentLevelName = $student->gradeLevel->name ?? null;

        if (!in_array($currentLevelName, self::PROMOTABLE_GRADE_LEVELS, true)) {
            return back()->withErrors([
                'error' => 'Only students in Grade 7, 8, or 9 can be promoted to the next level from here.',
            ]);
        }

        $nextLevelName = self::NEXT_GRADE_LEVEL[$currentLevelName];
        $nextGradeLevel = GradeLevel::where('name', $nextLevelName)->first();

        if (!$nextGradeLevel) {
            return back()->withErrors(['error' => 'Next grade level not found in the system.']);
        }

        // Re-validate grades for current level
        $catalogSubjects = Subject::where('grade_level_id', $student->current_grade_level_id)->get();
        $gradesForLevel = Grade::where('student_id', $studentId)
            ->whereHas('classSection', fn ($q) => $q->where('grade_level_id', $student->current_grade_level_id))
            ->get()
            ->keyBy('subject_id');

        $subjects = $catalogSubjects->map(function ($subject) use ($gradesForLevel) {
            $grade = $gradesForLevel->get($subject->id);

            return [
                'quarter_1' => $grade?->quarter_1,
                'quarter_2' => $grade?->quarter_2,
                'quarter_3' => $grade?->quarter_3,
                'quarter_4' => $grade?->quarter_4,
                'final_grade' => $grade?->final_grade,
            ];
        });

        if (!$this->allSubjectsHaveCompleteGrades($subjects)) {
            return back()->withErrors([
                'error' => 'All subjects must have complete quarterly and final grades before promotion.',
            ]);
        }

        $finalGrades = $gradesForLevel->pluck('final_grade')->filter(fn ($g) => $g !== null);
        $finalAverage = round($finalGrades->avg(), 2);

        if ($finalAverage < 75) {
            return back()->withErrors([
                'error' => 'Student must pass their current grade level (final average of 75 or higher) before promotion.',
            ]);
        }

        $student->update([
            'current_grade_level_id' => $nextGradeLevel->id,
            'current_section_id' => null,
        ]);

        return redirect()
            ->route('admin.records.student-academic-record', $studentId)
            ->with('success', "Student promoted to {$nextLevelName}. Please assign a new section in Enrollment.");
    }

    /**
     * Update student's ready to graduate status
     */
    public function updateGraduationStatus(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:tbl_students,id',
            'ready_to_graduate' => 'required|boolean',
        ]);

        $student = Student::findOrFail($validated['student_id']);
        $student->ready_to_graduate = $validated['ready_to_graduate'];
        $student->save();

        return back()->with('success', 'Graduation status updated successfully.');
    }
}
