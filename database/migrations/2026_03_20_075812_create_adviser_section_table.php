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
        Schema::create('tbl_adviser_section', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained('tbl_teachers')->onDelete('cascade');
            $table->foreignId('class_section_id')->constrained('tbl_class_sections')->onDelete('cascade');
            $table->string('school_year'); // e.g., "2025-2026"
            $table->unique(['teacher_id', 'class_section_id', 'school_year'], 'adviser_section_unique');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_adviser_section');
    }
};
