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
        Schema::create('tbl_accreditations', function (Blueprint $table) {
            $table->id();
            $table->string('accreditation_type'); // e.g., "DepEd Recognition", "ISO Certification", etc.
            $table->string('accrediting_body'); // e.g., "Department of Education", "ISO"
            $table->string('certificate_number')->unique();
            $table->date('date_issued');
            $table->date('valid_from');
            $table->date('valid_until');
            $table->enum('status', ['Active', 'Expired', 'Pending', 'Suspended'])->default('Active');
            $table->text('description')->nullable();
            $table->string('document_path')->nullable(); // Path to uploaded certificate/document
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_accreditations');
    }
};
