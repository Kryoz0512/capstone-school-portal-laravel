<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tbl_students', function (Blueprint $table) {
            $table->dropColumn('address');
            $table->string('status')->default('active')->after('current_section_id');
        });
    }

    public function down(): void
    {
        Schema::table('tbl_students', function (Blueprint $table) {
            $table->dropColumn('status');
            $table->text('address')->nullable()->after('birth_date');
        });
    }
};
