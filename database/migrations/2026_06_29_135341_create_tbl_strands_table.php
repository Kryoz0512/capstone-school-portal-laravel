<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_strands', function (Blueprint $table) {
            $table->id();
            $table->string('name');             // e.g. "STEM", "ABM", "HE", "ICT"
            $table->string('track');            // 'academic' | 'tvl' | 'sports' | 'arts'
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Seed default SHS strands
        $strands = [
            // Academic Track
            ['name' => 'STEM',  'track' => 'academic', 'description' => 'Science, Technology, Engineering, and Mathematics'],
            ['name' => 'ABM',   'track' => 'academic', 'description' => 'Accountancy, Business, and Management'],
            ['name' => 'HUMSS', 'track' => 'academic', 'description' => 'Humanities and Social Sciences'],
            ['name' => 'GAS',   'track' => 'academic', 'description' => 'General Academic Strand'],
            // TVL Track
            ['name' => 'HE',    'track' => 'tvl',      'description' => 'Home Economics'],
            ['name' => 'ICT',   'track' => 'tvl',      'description' => 'Information and Communications Technology'],
            ['name' => 'IA',    'track' => 'tvl',      'description' => 'Industrial Arts'],
            ['name' => 'AFA',   'track' => 'tvl',      'description' => 'Agri-Fishery Arts'],
            // Sports & Arts (optional — comment out if not offered)
            ['name' => 'Sports', 'track' => 'sports',  'description' => 'Sports Track'],
            ['name' => 'AD',     'track' => 'arts',    'description' => 'Arts and Design'],
        ];

        foreach ($strands as $strand) {
            DB::table('tbl_strands')->insert(array_merge($strand, [
                'is_active'  => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_strands');
    }
};