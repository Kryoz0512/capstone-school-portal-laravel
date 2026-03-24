<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tbl_class_sections', function (Blueprint $table) {
            // Check if the column exists before trying to drop it
            if (Schema::hasColumn('tbl_class_sections', 'adviser_id')) {
                // Just drop the column (foreign key may have been removed already)
                $table->dropColumn('adviser_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('tbl_class_sections', function (Blueprint $table) {
            // Add back the adviser_id column if needed for rollback
            $table->foreignId('adviser_id')->nullable()->after('grade_level_id')->constrained('tbl_teachers');
        });
    }
};
