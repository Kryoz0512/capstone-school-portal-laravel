<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tbl_grades', function (Blueprint $table) {
            $table->decimal('term_1', 5, 2)->nullable()->after('teacher_id');
            $table->decimal('term_2', 5, 2)->nullable()->after('term_1');
            $table->decimal('term_3', 5, 2)->nullable()->after('term_2');
        });

        DB::statement('UPDATE tbl_grades SET term_1 = quarter_1, term_2 = quarter_2, term_3 = quarter_3');

        Schema::table('tbl_grades', function (Blueprint $table) {
            $table->dropColumn(['quarter_1', 'quarter_2', 'quarter_3', 'quarter_4']);
        });

        if (Schema::hasTable('tbl_grade_sheets') && Schema::hasColumn('tbl_grade_sheets', 'quarter')) {
            DB::statement("ALTER TABLE tbl_grade_sheets CHANGE quarter term ENUM('1', '2', '3') NOT NULL");
        }
    }

    public function down(): void
    {
        Schema::table('tbl_grades', function (Blueprint $table) {
            $table->decimal('quarter_1', 5, 2)->nullable()->after('teacher_id');
            $table->decimal('quarter_2', 5, 2)->nullable()->after('quarter_1');
            $table->decimal('quarter_3', 5, 2)->nullable()->after('quarter_2');
            $table->decimal('quarter_4', 5, 2)->nullable()->after('quarter_3');
        });

        DB::statement('UPDATE tbl_grades SET quarter_1 = term_1, quarter_2 = term_2, quarter_3 = term_3');

        Schema::table('tbl_grades', function (Blueprint $table) {
            $table->dropColumn(['term_1', 'term_2', 'term_3']);
        });

        if (Schema::hasTable('tbl_grade_sheets') && Schema::hasColumn('tbl_grade_sheets', 'term')) {
            DB::statement("ALTER TABLE tbl_grade_sheets CHANGE term quarter ENUM('1', '2', '3', '4') NOT NULL");
        }
    }
};
