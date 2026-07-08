<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Students table indexes
        if (!$this->indexExists('tbl_students', 'students_section_school_year_idx')) {
            Schema::table('tbl_students', function (Blueprint $table) {
                $table->index('current_section_id', 'students_section_idx');
                $table->index('current_grade_level_id', 'students_grade_level_idx');
                $table->index('school_year', 'students_school_year_idx');
                $table->index(['current_section_id', 'school_year'], 'students_section_school_year_idx');
                $table->index('user_id', 'students_user_id_idx');
                $table->index('lrn', 'students_lrn_idx');
                $table->index('gender', 'students_gender_idx');
                $table->index('student_status', 'students_status_idx');
            });
        }

        // Enrollments table indexes
        if (!$this->indexExists('tbl_enrollments', 'enrollments_student_year_idx')) {
            Schema::table('tbl_enrollments', function (Blueprint $table) {
                $table->index(['student_id', 'school_year'], 'enrollments_student_year_idx');
                $table->index('class_section_id', 'enrollments_section_idx');
                $table->index('grade_level_id', 'enrollments_grade_level_idx');
                $table->index('status', 'enrollments_status_idx');
            });
        }

        // Schedules table indexes
        if (!$this->indexExists('tbl_schedules', 'schedules_section_teacher_idx')) {
            Schema::table('tbl_schedules', function (Blueprint $table) {
                $table->index(['class_section_id', 'teacher_id'], 'schedules_section_teacher_idx');
                $table->index('subject_id', 'schedules_subject_idx');
                $table->index('room_id', 'schedules_room_idx');
                $table->index('day_of_week', 'schedules_day_idx');
            });
        }

        // Grades table indexes
        if (!$this->indexExists('tbl_grades', 'grades_student_year_idx')) {
            Schema::table('tbl_grades', function (Blueprint $table) {
                $table->index(['student_id', 'school_year'], 'grades_student_year_idx');
                $table->index(['class_section_id', 'subject_id'], 'grades_section_subject_idx');
                $table->index('teacher_id', 'grades_teacher_idx');
                $table->index('subject_id', 'grades_subject_idx');
            });
        }

        // Clearances table indexes
        if (!$this->indexExists('tbl_clearances', 'clearances_student_section_idx')) {
            Schema::table('tbl_clearances', function (Blueprint $table) {
                $table->index(['student_id', 'class_section_id'], 'clearances_student_section_idx');
                $table->index(['class_section_id', 'school_year'], 'clearances_section_year_idx');
                $table->index('status', 'clearances_status_idx');
                $table->index('subject_id', 'clearances_subject_idx');
            });
        }

        // Notifications table indexes
        if (!$this->indexExists('tbl_notifications', 'notifications_user_read_idx')) {
            Schema::table('tbl_notifications', function (Blueprint $table) {
                $table->index(['user_id', 'is_read'], 'notifications_user_read_idx');
                $table->index('announcement_id', 'notifications_announcement_idx');
                $table->index('created_at', 'notifications_created_idx');
            });
        }

        // Announcements table indexes
        if (!$this->indexExists('tbl_announcements', 'announcements_section_idx')) {
            Schema::table('tbl_announcements', function (Blueprint $table) {
                $table->index('section_id', 'announcements_section_idx');
                $table->index('author_id', 'announcements_author_idx');
                $table->index('created_at', 'announcements_created_idx');
            });
        }

        // Class Sections table indexes
        if (!$this->indexExists('tbl_class_sections', 'sections_grade_level_idx')) {
            Schema::table('tbl_class_sections', function (Blueprint $table) {
                $table->index('grade_level_id', 'sections_grade_level_idx');
                $table->index('room_id', 'sections_room_idx');
                $table->index('section_name', 'sections_name_idx');
            });
        }

        // Teacher Subjects table indexes
        if (!$this->indexExists('tbl_teacher_subjects', 'teacher_subjects_teacher_idx')) {
            Schema::table('tbl_teacher_subjects', function (Blueprint $table) {
                $table->index('teacher_id', 'teacher_subjects_teacher_idx');
                $table->index('subject_id', 'teacher_subjects_subject_idx');
                $table->index(['teacher_id', 'subject_id'], 'teacher_subjects_composite_idx');
            });
        }

        // Adviser Section table indexes
        if (!$this->indexExists('tbl_adviser_section', 'adviser_section_teacher_idx')) {
            Schema::table('tbl_adviser_section', function (Blueprint $table) {
                $table->index('teacher_id', 'adviser_section_teacher_idx');
                $table->index('class_section_id', 'adviser_section_section_idx');
                $table->index('school_year', 'adviser_section_year_idx');
            });
        }

        // Archives table indexes
        if (!$this->indexExists('tbl_archives', 'archives_type_idx')) {
            Schema::table('tbl_archives', function (Blueprint $table) {
                $table->index('type', 'archives_type_idx');
                $table->index('archived_at', 'archives_archived_at_idx');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop indexes for Students table
        Schema::table('tbl_students', function (Blueprint $table) {
            $table->dropIndex('students_section_idx');
            $table->dropIndex('students_grade_level_idx');
            $table->dropIndex('students_school_year_idx');
            $table->dropIndex('students_section_school_year_idx');
            $table->dropIndex('students_user_id_idx');
            $table->dropIndex('students_lrn_idx');
            $table->dropIndex('students_gender_idx');
            $table->dropIndex('students_status_idx');
        });

        // Drop indexes for Enrollments table
        Schema::table('tbl_enrollments', function (Blueprint $table) {
            $table->dropIndex('enrollments_student_year_idx');
            $table->dropIndex('enrollments_section_idx');
            $table->dropIndex('enrollments_grade_level_idx');
            $table->dropIndex('enrollments_status_idx');
        });

        // Drop indexes for Schedules table
        Schema::table('tbl_schedules', function (Blueprint $table) {
            $table->dropIndex('schedules_section_teacher_idx');
            $table->dropIndex('schedules_subject_idx');
            $table->dropIndex('schedules_room_idx');
            $table->dropIndex('schedules_day_idx');
        });

        // Drop indexes for Grades table
        Schema::table('tbl_grades', function (Blueprint $table) {
            $table->dropIndex('grades_student_year_idx');
            $table->dropIndex('grades_section_subject_idx');
            $table->dropIndex('grades_teacher_idx');
            $table->dropIndex('grades_subject_idx');
        });

        // Drop indexes for Clearances table
        Schema::table('tbl_clearances', function (Blueprint $table) {
            $table->dropIndex('clearances_student_section_idx');
            $table->dropIndex('clearances_section_year_idx');
            $table->dropIndex('clearances_status_idx');
            $table->dropIndex('clearances_subject_idx');
        });

        // Drop indexes for Notifications table
        Schema::table('tbl_notifications', function (Blueprint $table) {
            $table->dropIndex('notifications_user_read_idx');
            $table->dropIndex('notifications_announcement_idx');
            $table->dropIndex('notifications_created_idx');
        });

        // Drop indexes for Announcements table
        Schema::table('tbl_announcements', function (Blueprint $table) {
            $table->dropIndex('announcements_section_idx');
            $table->dropIndex('announcements_author_idx');
            $table->dropIndex('announcements_created_idx');
        });

        // Drop indexes for Class Sections table
        Schema::table('tbl_class_sections', function (Blueprint $table) {
            $table->dropIndex('sections_grade_level_idx');
            $table->dropIndex('sections_room_idx');
            $table->dropIndex('sections_name_idx');
        });

        // Drop indexes for Teacher Subjects table
        Schema::table('tbl_teacher_subjects', function (Blueprint $table) {
            $table->dropIndex('teacher_subjects_teacher_idx');
            $table->dropIndex('teacher_subjects_subject_idx');
            $table->dropIndex('teacher_subjects_composite_idx');
        });

        // Drop indexes for Adviser Section table
        Schema::table('tbl_adviser_section', function (Blueprint $table) {
            $table->dropIndex('adviser_section_teacher_idx');
            $table->dropIndex('adviser_section_section_idx');
            $table->dropIndex('adviser_section_year_idx');
        });

        // Drop indexes for Archives table
        Schema::table('tbl_archives', function (Blueprint $table) {
            $table->dropIndex('archives_type_idx');
            $table->dropIndex('archives_archived_at_idx');
        });
    }

    /**
     * Check if index exists
     */
    private function indexExists(string $table, string $index): bool
    {
        $conn = Schema::getConnection();
        $dbSchemaManager = $conn->getDoctrineSchemaManager();
        $doctrineTable = $dbSchemaManager->listTableDetails($table);
        
        return $doctrineTable->hasIndex($index);
    }
};
