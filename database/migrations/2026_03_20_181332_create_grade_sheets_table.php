<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_grade_sheets', function (Blueprint $table) {
            $table->id();
            
            // Polymorphic relationship - can be linked to different entities
            $table->morphs('gradeable'); // Creates gradeable_id and gradeable_type
            
            // Student information
            $table->foreignId('student_id')->constrained('tbl_students')->onDelete('cascade');
            
            // Class and subject information
            $table->foreignId('class_section_id')->constrained('tbl_class_sections')->onDelete('cascade');
            $table->foreignId('subject_id')->constrained('tbl_subjects')->onDelete('cascade');
            $table->foreignId('teacher_id')->constrained('tbl_teachers')->onDelete('cascade');
            
            // Academic period
            $table->string('school_year'); // e.g., "2024-2025"
            $table->enum('quarter', ['1', '2', '3', '4']);
            
            // Grade information
            $table->decimal('grade', 5, 2)->nullable(); // The actual grade (0-100)
            $table->enum('remarks', ['Passed', 'Failed', 'Incomplete', 'Dropped'])->nullable();
            
            // Additional metadata
            $table->text('notes')->nullable(); // Teacher's notes
            $table->timestamp('submitted_at')->nullable(); // When grade was submitted
            
            $table->timestamps();
            
            // Indexes for better query performance
            $table->index(['student_id', 'subject_id', 'quarter', 'school_year']);
            $table->index(['teacher_id', 'class_section_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_grade_sheets');
    }
};
