<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tbl_schedules', function (Blueprint $table) {
            $table->dropColumn('room');
            $table->foreignId('room_id')->nullable()->after('teacher_id')->constrained('tbl_room');
        });
    }

    public function down(): void
    {
        Schema::table('tbl_schedules', function (Blueprint $table) {
            $table->dropForeign(['room_id']);
            $table->dropColumn('room_id');
            $table->string('room')->nullable();
        });
    }
};
