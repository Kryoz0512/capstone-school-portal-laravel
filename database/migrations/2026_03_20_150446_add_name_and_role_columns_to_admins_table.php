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
        Schema::table('tbl_admins', function (Blueprint $table) {
            $table->string('first_name')->after('user_id');
            $table->string('last_name')->after('first_name');
            $table->enum('role', ['Admin', 'Staff'])->default('Staff')->after('last_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tbl_admins', function (Blueprint $table) {
            $table->dropColumn(['first_name', 'last_name', 'role']);
        });
    }
};
