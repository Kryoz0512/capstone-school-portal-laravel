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
        Schema::table('tbl_profile_pictures', function (Blueprint $table) {
            $table->string('profileable_type')->after('profileable_id')->default('App\\Models\\Admin');
            $table->index(['profileable_id', 'profileable_type']);
        });
        
        // Update existing records to set the correct type
        DB::table('tbl_profile_pictures')->update(['profileable_type' => 'App\\Models\\Admin']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tbl_profile_pictures', function (Blueprint $table) {
            $table->dropIndex(['profileable_id', 'profileable_type']);
            $table->dropColumn('profileable_type');
        });
    }
};
