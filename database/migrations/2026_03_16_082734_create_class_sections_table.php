<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_class_sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('grade_level_id')->constrained('tbl_grade_levels');
            $table->foreignId('adviser_id')->constrained('tbl_teachers');
            $table->string('name');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_class_sections');
    }
};