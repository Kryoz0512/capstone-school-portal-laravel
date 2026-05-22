<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_clearances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('tbl_students')->onDelete('cascade');
            $table->foreignId('teacher_id')->constrained('tbl_teachers')->onDelete('cascade');
            $table->foreignId('subject_id')->constrained('tbl_subjects')->onDelete('cascade');
            $table->foreignId('class_section_id')->constrained('tbl_class_sections')->onDelete('cascade');
            $table->string('school_year');
            $table->enum('status', ['pending', 'cleared', 'not_cleared'])->default('pending');
            $table->timestamps();

            $table->unique(['student_id', 'subject_id', 'class_section_id', 'school_year'], 'unique_clearance');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_clearances');
    }
};