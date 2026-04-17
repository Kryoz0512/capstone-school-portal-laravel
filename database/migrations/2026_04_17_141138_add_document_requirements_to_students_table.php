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
        Schema::table('tbl_students', function (Blueprint $table) {
            // Document requirements
            $table->boolean('has_psa_birth_certificate')->default(false)->after('gender');
            $table->boolean('has_sf9')->default(false)->after('has_psa_birth_certificate');
            $table->boolean('has_report_card')->default(false)->after('has_sf9');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tbl_students', function (Blueprint $table) {
            $table->dropColumn([
                'has_psa_birth_certificate',
                'has_sf9',
                'has_report_card',
            ]);
        });
    }
};
