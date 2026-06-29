<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tbl_students', function (Blueprint $table) {
            // 'jhs' (default / existing) or 'shs'
            $table->string('program')->default('jhs')->after('student_status');
            // FK to tbl_strands — only filled for SHS students
            $table->unsignedBigInteger('strand_id')->nullable()->after('program');
            $table->foreign('strand_id')->references('id')->on('tbl_strands')->nullOnDelete();
            // SHS-specific year level: 11 or 12
            $table->unsignedTinyInteger('shs_year_level')->nullable()->after('strand_id');
        });
    }

    public function down(): void
    {
        Schema::table('tbl_students', function (Blueprint $table) {
            $table->dropForeign(['strand_id']);
            $table->dropColumn(['program', 'strand_id', 'shs_year_level']);
        });
    }
};