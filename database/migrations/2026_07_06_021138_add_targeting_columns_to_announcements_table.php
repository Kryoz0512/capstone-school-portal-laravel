<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('announcements', function (Blueprint $table) {
            // These are the columns the Announcement model/controller already
            // expect but that were never actually added to this table --
            // that's the source of "Unknown column 'teacher_id'".
            $table->foreignId('teacher_id')
                ->nullable()
                ->after('created_by')
                ->constrained('tbl_teachers')
                ->nullOnDelete();

            $table->foreignId('section_id')
                ->nullable()
                ->after('teacher_id')
                ->constrained('tbl_class_sections')
                ->nullOnDelete();

            $table->foreignId('subject_id')
                ->nullable()
                ->after('section_id')
                ->constrained('tbl_subjects')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('announcements', function (Blueprint $table) {
            $table->dropForeign(['teacher_id']);
            $table->dropForeign(['section_id']);
            $table->dropForeign(['subject_id']);
            $table->dropColumn(['teacher_id', 'section_id', 'subject_id']);
        });
    }
};