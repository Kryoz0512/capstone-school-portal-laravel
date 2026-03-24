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
        // Add column if it doesn't exist
        if (!Schema::hasColumn('tbl_teachers', 'employee_number')) {
            Schema::table('tbl_teachers', function (Blueprint $table) {
                $table->string('employee_number')->nullable()->after('user_id');
            });
        }
        
        // Update existing teachers with auto-generated employee numbers
        DB::statement('UPDATE tbl_teachers SET employee_number = CONCAT("EMP-", LPAD(id, 5, "0")) WHERE employee_number IS NULL OR employee_number = ""');
        
        // Add unique constraint if it doesn't exist
        $indexes = DB::select("SHOW INDEX FROM tbl_teachers WHERE Key_name = 'tbl_teachers_employee_number_unique'");
        if (empty($indexes)) {
            Schema::table('tbl_teachers', function (Blueprint $table) {
                $table->unique('employee_number');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tbl_teachers', function (Blueprint $table) {
            $table->dropColumn('employee_number');
        });
    }
};
