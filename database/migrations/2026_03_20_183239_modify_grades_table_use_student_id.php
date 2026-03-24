<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tbl_grades', function (Blueprint $table) {
            // Drop the enrollment_id foreign key and column
            $table->dropForeign(['enrollment_id']);
            $table->dropColumn('enrollment_id');
            
            // Add student_id, school_year, and class_section_id
            $table->foreignId('student_id')->after('id')->constrained('tbl_students');
            $table->foreignId('class_section_id')->after('student_id')->constrained('tbl_class_sections');
            $table->string('school_year')->after('class_section_id');
        });
    }

    public function down(): void
    {
        Schema::table('tbl_grades', function (Blueprint $table) {
            // Remove the new columns
            $table->dropForeign(['student_id']);
            $table->dropForeign(['class_section_id']);
            $table->dropColumn(['student_id', 'class_section_id', 'school_year']);
            
            // Add back enrollment_id
            $table->foreignId('enrollment_id')->after('id')->constrained('tbl_enrollments');
        });
    }
};
