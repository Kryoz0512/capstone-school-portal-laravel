<?php

use App\Http\Controllers\GradeController;
use App\Models\Clearance;
use App\Models\Student;
use PHPUnit\Framework\TestCase;

class GradeClearanceTest extends TestCase
{
    public function test_build_clearance_summary_uses_current_section_and_school_year(): void
    {
        $controller = new GradeController();
        $student = new Student([
            'id' => 1,
            'school_year' => '2025-2026',
        ]);

        $scheduledSubjects = collect([
            (object) [
                'subject_id' => 10,
                'subject' => (object) ['code' => 'MTH', 'name' => 'Math'],
                'teacher' => (object) ['name' => 'Teacher A'],
            ],
            (object) [
                'subject_id' => 11,
                'subject' => (object) ['code' => 'SCI', 'name' => 'Science'],
                'teacher' => (object) ['name' => 'Teacher B'],
            ],
        ]);

        $allClearances = collect([
            new Clearance([
                'student_id' => 1,
                'subject_id' => 10,
                'class_section_id' => 99,
                'school_year' => '2024-2025',
                'status' => 'pending',
            ]),
            new Clearance([
                'student_id' => 1,
                'subject_id' => 10,
                'class_section_id' => 99,
                'school_year' => '2025-2026',
                'status' => 'cleared',
            ]),
            new Clearance([
                'student_id' => 1,
                'subject_id' => 11,
                'class_section_id' => 99,
                'school_year' => '2025-2026',
                'status' => 'cleared',
            ]),
        ]);

        $method = new ReflectionMethod($controller, 'buildClearanceSummary');
        $method->setAccessible(true);

        $summary = $method->invoke($controller, $student, 99, $scheduledSubjects, $allClearances);

        $this->assertTrue($summary['all_cleared']);
        $this->assertSame(2, $summary['clearance_total']);
        $this->assertSame(2, $summary['clearance_cleared']);
        $this->assertSame('cleared', $summary['subject_clearances']->firstWhere('subject_id', 10)['status']);
    }
}
