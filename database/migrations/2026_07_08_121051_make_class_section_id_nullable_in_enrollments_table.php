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
        Schema::table('tbl_enrollments', function (Blueprint $table) {
            // Drop the existing foreign key constraint
            $table->dropForeign(['class_section_id']);
            
            // Modify the column to be nullable
            $table->foreignId('class_section_id')->nullable()->change();
            
            // Re-add the foreign key constraint
            $table->foreign('class_section_id')->references('id')->on('tbl_class_sections');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tbl_enrollments', function (Blueprint $table) {
            // Drop the foreign key constraint
            $table->dropForeign(['class_section_id']);
            
            // Modify the column back to not nullable
            $table->foreignId('class_section_id')->nullable(false)->change();
            
            // Re-add the foreign key constraint
            $table->foreign('class_section_id')->references('id')->on('tbl_class_sections');
        });
    }
};
