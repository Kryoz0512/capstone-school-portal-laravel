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
        Schema::create('archives', function (Blueprint $table) {
            $table->id();
            $table->string('archivable_type'); // Model type (Teacher, Admin, Student, etc.)
            $table->unsignedBigInteger('archivable_id'); // ID of the archived record
            $table->json('data'); // Store the complete record data
            $table->foreignId('archived_by')->constrained('users')->onDelete('cascade'); // Who archived it
            $table->string('reason')->nullable(); // Optional reason for archiving
            $table->timestamps();
            
            $table->index(['archivable_type', 'archivable_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('archives');
    }
};
