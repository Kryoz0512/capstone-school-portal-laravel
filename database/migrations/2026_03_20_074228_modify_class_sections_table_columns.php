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
        Schema::table('tbl_class_sections', function (Blueprint $table) {
            // Drop the adviser_id foreign key and column
            $table->dropForeign(['adviser_id']);
            $table->dropColumn('adviser_id');
            
            // Rename name column to section_name
            $table->renameColumn('name', 'section_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tbl_class_sections', function (Blueprint $table) {
            // Rename section_name back to name
            $table->renameColumn('section_name', 'name');
            
            // Add back the adviser_id column and foreign key
            $table->foreignId('adviser_id')->after('grade_level_id')->constrained('tbl_teachers');
        });
    }
};
