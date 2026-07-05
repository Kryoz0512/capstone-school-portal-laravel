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
        Schema::table('tbl_class_sections', function (Blueprint $table) {
            $table->softDeletes();
            $table->unsignedBigInteger('archived_by')->nullable()->after('teacher_id');
            $table->text('archive_reason')->nullable()->after('archived_by');
            
            $table->foreign('archived_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tbl_class_sections', function (Blueprint $table) {
            $table->dropForeign(['archived_by']);
            $table->dropColumn(['deleted_at', 'archived_by', 'archive_reason']);
        });
    }
};
