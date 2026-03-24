<?php

namespace App\Http\Controllers;

use App\Models\Teacher;
use App\Models\Student;
use App\Models\Grade;
use App\Models\ClassSection;
use App\Models\GradeLevel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class GradeController extends Controller
{
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
                ->get()
                ->keyBy('student_id');
            
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
                
                return [
                    'id' => $student->id,
                    'lrn' => $student->lrn,
                    'studentName' => trim($student->first_name . ' ' . $student->last_name),
                    'grade' => $formattedGrade,
                    'remarks' => $gradeRecord ? $gradeRecord->remarks : null,
                    'gradeId' => $gradeRecord ? $gradeRecord->id : null,
                ];
            })->values();
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
            'auth' => [
                'user' => $user
            ]
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
            'grade' => 'required|numeric|min:0|max:100',
        ]);

        $quarterColumn = 'quarter_' . $validated['quarter'];
        
        $grade = Grade::firstOrNew([
            'student_id' => $validated['student_id'],
            'class_section_id' => $validated['class_section_id'],
            'subject_id' => $validated['subject_id'],
            'school_year' => $validated['school_year'],
            'teacher_id' => $teacher->id,
        ]);
        
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
            'grade' => 'required|numeric|min:0|max:100',
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
}
