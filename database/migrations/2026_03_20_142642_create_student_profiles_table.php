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
        Schema::create('tbl_student_profiles', function (Blueprint $table) {
            $table->id();
            
            // Polymorphic relationship
            $table->unsignedBigInteger('profileable_id');
            $table->string('profileable_type');
            
            // Personal Information (additional fields not in tbl_students)
            $table->string('extension_name')->nullable();
            $table->string('religion')->nullable();
            $table->enum('indigenous_people', ['Yes', 'No'])->default('No');
            $table->string('indigenous_type')->nullable();
            $table->enum('pwd', ['Yes', 'No'])->default('No');
            $table->string('pwd_type')->nullable();
            $table->string('nationality')->nullable();
            $table->string('place_of_birth')->nullable();
            $table->string('mobile_number')->nullable();
            
            // Residence Data
            $table->string('contact_number')->nullable();
            $table->string('guardian_name')->nullable();
            $table->string('relation')->nullable();
            $table->string('house_no')->nullable();
            $table->string('city_municipality')->nullable();
            $table->string('province_state')->nullable();
            $table->string('zip_code')->nullable();
            $table->string('country')->nullable();
            
            // Physical Description
            $table->decimal('height', 5, 2)->nullable(); // in cms
            $table->decimal('weight', 5, 2)->nullable(); // in kg
            $table->string('build')->nullable();
            $table->string('eye_color')->nullable();
            $table->string('hair_color')->nullable();
            
            // Family Data - Father
            $table->string('father_last_name')->nullable();
            $table->string('father_first_name')->nullable();
            $table->string('father_middle_name')->nullable();
            $table->string('father_extension_name')->nullable();
            
            // Family Data - Mother
            $table->string('mother_last_name')->nullable();
            $table->string('mother_first_name')->nullable();
            $table->string('mother_middle_name')->nullable();
            $table->string('mother_extension_name')->nullable();
            
            // Family Data - Guardian
            $table->string('guardian_last_name')->nullable();
            $table->string('guardian_first_name')->nullable();
            $table->string('guardian_middle_name')->nullable();
            $table->string('guardian_extension_name')->nullable();
            
            $table->timestamps();
            
            // Index for polymorphic relationship
            $table->index(['profileable_id', 'profileable_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_student_profiles');
    }
};
