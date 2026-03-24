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
        Schema::table('tbl_teachers', function (Blueprint $table) {
            // Remove specialization column
            $table->dropColumn('specialization');
            
            // Add new columns
            $table->string('subject')->nullable()->after('user_id');
            $table->string('grade')->nullable()->after('subject');
            $table->string('position')->nullable()->after('grade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tbl_teachers', function (Blueprint $table) {
            // Restore specialization column
            $table->string('specialization')->nullable()->after('user_id');
            
            // Remove the new columns
            $table->dropColumn(['subject', 'grade', 'position']);
        });
    }
};
