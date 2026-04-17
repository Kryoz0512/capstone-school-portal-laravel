<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tbl_students', function (Blueprint $table) {
            $table->boolean('has_good_moral')->default(false)->after('has_report_card');
        });
    }

    public function down(): void
    {
        Schema::table('tbl_students', function (Blueprint $table) {
            $table->dropColumn('has_good_moral');
        });
    }
};
