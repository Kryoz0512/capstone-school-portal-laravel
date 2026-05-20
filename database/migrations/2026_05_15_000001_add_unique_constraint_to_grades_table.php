<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

return new class extends Migration
{
    public function up(): void
    {
        // First, identify and log any duplicate records
        $duplicates = DB::select("
            SELECT student_id, class_section_id, subject_id, school_year, teacher_id, COUNT(*) as count
            FROM tbl_grades
            GROUP BY student_id, class_section_id, subject_id, school_year, teacher_id
            HAVING COUNT(*) > 1
        ");

        if (!empty($duplicates)) {
            Log::warning('Found duplicate grade records before adding unique constraint', [
                'duplicates' => $duplicates
            ]);

            // For each set of duplicates, keep the most recent one and delete the rest
            foreach ($duplicates as $duplicate) {
                // Get all records for this combination
                $records = DB::table('tbl_grades')
                    ->where('student_id', $duplicate->student_id)
                    ->where('class_section_id', $duplicate->class_section_id)
                    ->where('subject_id', $duplicate->subject_id)
                    ->where('school_year', $duplicate->school_year)
                    ->where('teacher_id', $duplicate->teacher_id)
                    ->orderBy('updated_at', 'desc')
                    ->orderBy('id', 'desc')
                    ->get();

                // Keep the first (most recent) record, delete the rest
                $keepId = $records->first()->id;
                $deleteIds = $records->skip(1)->pluck('id')->toArray();

                if (!empty($deleteIds)) {
                    DB::table('tbl_grades')->whereIn('id', $deleteIds)->delete();
                    Log::info('Deleted duplicate grade records', [
                        'kept_id' => $keepId,
                        'deleted_ids' => $deleteIds
                    ]);
                }
            }
        }

        // Now add the unique constraint
        Schema::table('tbl_grades', function (Blueprint $table) {
            $table->unique(
                ['student_id', 'class_section_id', 'subject_id', 'school_year', 'teacher_id'],
                'unique_grade_record'
            );
        });
    }

    public function down(): void
    {
        Schema::table('tbl_grades', function (Blueprint $table) {
            $table->dropUnique('unique_grade_record');
        });
    }
};
