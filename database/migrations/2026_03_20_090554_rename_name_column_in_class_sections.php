<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tbl_class_sections', function (Blueprint $table) {
            // Check if the 'name' column exists before renaming
            if (Schema::hasColumn('tbl_class_sections', 'name')) {
                $table->renameColumn('name', 'section_name');
            }
        });
    }

    public function down(): void
    {
        Schema::table('tbl_class_sections', function (Blueprint $table) {
            // Rename back to 'name' for rollback
            if (Schema::hasColumn('tbl_class_sections', 'section_name')) {
                $table->renameColumn('section_name', 'name');
            }
        });
    }
};
