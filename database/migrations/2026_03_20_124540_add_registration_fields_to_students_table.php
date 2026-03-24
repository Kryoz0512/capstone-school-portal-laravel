<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tbl_students', function (Blueprint $table) {
            // Student Status and Basic Info
            $table->string('student_status')->after('user_id')->nullable(); // new, transferee, returning
            $table->string('lrn', 12)->after('student_status')->unique()->nullable(); // 12-digit LRN
            $table->string('school_year')->after('lrn')->nullable(); // e.g., SY 2025-2026
            
            // Name fields
            $table->string('last_name')->after('school_year')->nullable();
            $table->string('first_name')->after('last_name')->nullable();
            $table->string('middle_name')->after('first_name')->nullable();
            
            // Gender
            $table->string('gender')->after('middle_name')->nullable(); // male, female
            
            // Note: birth_date already exists in the table
        });
    }

    public function down(): void
    {
        Schema::table('tbl_students', function (Blueprint $table) {
            $table->dropColumn([
                'student_status',
                'lrn',
                'school_year',
                'last_name',
                'first_name',
                'middle_name',
                'gender',
            ]);
        });
    }
};
