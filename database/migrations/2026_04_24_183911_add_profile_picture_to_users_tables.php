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
            $table->string('profile_picture')->nullable();
        });

        Schema::table('tbl_teachers', function (Blueprint $table) {
            $table->string('profile_picture')->nullable();
        });

        Schema::table('tbl_admins', function (Blueprint $table) {
            $table->string('profile_picture')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tbl_students', function (Blueprint $table) {
            $table->dropColumn('profile_picture');
        });

        Schema::table('tbl_teachers', function (Blueprint $table) {
            $table->dropColumn('profile_picture');
        });

        Schema::table('tbl_admins', function (Blueprint $table) {
            $table->dropColumn('profile_picture');
        });
    }
};
