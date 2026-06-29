<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_portal_content', function (Blueprint $table) {
            $table->id();

            // Hero Section
            $table->string('hero_badge_text')->default('Santor National High School — Digital Platform');
            $table->string('hero_headline_top')->default('Empowering');
            $table->string('hero_headline_bottom')->default('Education');
            $table->text('hero_description')->default('A comprehensive digital platform built to streamline school operations, elevate student outcomes, and connect every part of your school community.');
            $table->string('hero_cta_label')->default('Learn More');

            // About Section
            $table->string('about_section_label')->default('Who We Are');
            $table->string('about_headline')->default('Built for schools that believe in better');
            $table->text('about_description')->default('DIGISTAR is an integrated digital platform developed specifically for the purpose of upgrading and modernizing the educational and administrative experience at Santor National High School (SNHS) to an efficient and reliable digital format. As the official student portal, DIGISTAR provides a replacement for traditional paper processes utilizing a secure centralized environment that supports a more efficient, reliable and sustainable campus.');

            // About Cards
            $table->string('mission_title')->default('Our Mission');
            $table->text('mission_body')->default('To provide quality education through innovative digital solutions, fostering academic excellence and holistic development for every student in our care.');
            $table->string('vision_title')->default('Our Vision');
            $table->text('vision_body')->default('To become the leading institution in digital education, equipping every student with knowledge and 21st-century skills for a successful future.');
            $table->string('values_title')->default('Our Values');
            $table->text('values_body')->default('Excellence, Integrity, Innovation, Collaboration, and Compassion. These principles guide every decision we make in shaping future leaders.');

            // Features Section
            $table->string('features_section_label')->default('Platform Features');
            $table->string('features_headline')->default('Everything your school needs');
            $table->string('features_subheadline')->default('Powerful tools that make administration effortless and learning meaningful.');

            // Footer
            $table->string('footer_description')->default('Empowering the Santor National High School community through thoughtful digital innovation and academic excellence.');
            $table->string('footer_address_line1')->default('Bongabon, Nueva Ecija');
            $table->string('footer_address_line2')->default('Philippines 3128');
            $table->string('footer_email')->default('info@snhs.edu.ph');
            $table->string('footer_phone')->default('(123) 456-7890');
            $table->string('footer_copyright')->default('2026 Santor National High School. All rights reserved.');
            $table->string('footer_powered_by')->default('Powered by SNHS DigiStar');

            $table->timestamps();
        });

        // Seed a single row of defaults
        DB::table('tbl_portal_content')->insert([
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_portal_content');
    }
};