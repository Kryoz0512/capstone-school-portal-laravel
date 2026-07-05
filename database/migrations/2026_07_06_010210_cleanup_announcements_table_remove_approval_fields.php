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
        Schema::table('announcements', function (Blueprint $table) {
            // Drop foreign keys first
            $table->dropForeign(['approved_by']);
            
            // Drop approval system columns
            $table->dropColumn(['status', 'approved_by', 'approved_at', 'rejection_reason']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('announcements', function (Blueprint $table) {
            // Restore approval system fields
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending')->after('content');
            $table->foreignId('approved_by')->nullable()->after('teacher_id')->constrained('users')->onDelete('set null');
            $table->timestamp('approved_at')->nullable()->after('approved_by');
            $table->text('rejection_reason')->nullable()->after('approved_at');
        });
    }
};
