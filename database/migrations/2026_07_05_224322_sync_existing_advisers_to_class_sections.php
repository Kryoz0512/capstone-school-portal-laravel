<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Get the current school year
        $currentYear = date('Y');
        $schoolYear = $currentYear . '-' . ($currentYear + 1);

        // Sync current school year adviser assignments to class_sections
        DB::table('tbl_adviser_section')
            ->where('school_year', $schoolYear)
            ->whereNull('deleted_at')
            ->get()
            ->each(function ($adviserSection) {
                DB::table('tbl_class_sections')
                    ->where('id', $adviserSection->class_section_id)
                    ->update(['teacher_id' => $adviserSection->teacher_id]);
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Optional: Remove teacher_id assignments (but keep the column)
        DB::table('tbl_class_sections')->update(['teacher_id' => null]);
    }
};
