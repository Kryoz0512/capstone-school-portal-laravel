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
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // Admin who made the change
            $table->string('action'); // e.g., 'created', 'updated', 'deleted'
            $table->string('model_type'); // e.g., 'Teacher', 'Admin', 'Student'
            $table->unsignedBigInteger('model_id'); // ID of the affected record
            $table->text('description')->nullable(); // Human-readable description
            $table->json('changes')->nullable(); // Store what changed
            $table->timestamps();
            
            $table->index(['model_type', 'model_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
