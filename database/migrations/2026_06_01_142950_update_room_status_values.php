<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Step 1: Expand the ENUM to include both old and new values
        DB::statement("ALTER TABLE tbl_room MODIFY COLUMN status ENUM('Active', 'In Construction', 'Maintenance', 'Available', 'Vacant', 'Occupied') NOT NULL DEFAULT 'Available'");

        // Step 2: Migrate old values to new ones
        DB::table('tbl_room')->where('status', 'Active')->update(['status' => 'Available']);
        DB::table('tbl_room')->where('status', 'In Construction')->update(['status' => 'Vacant']);
        DB::table('tbl_room')->where('status', 'Maintenance')->update(['status' => 'Occupied']);

        // Step 3: Remove old values from ENUM now that no rows use them
        DB::statement("ALTER TABLE tbl_room MODIFY COLUMN status ENUM('Available', 'Vacant', 'Occupied') NOT NULL DEFAULT 'Available'");
    }

    public function down(): void
    {
        // Step 1: Expand the ENUM again to include both
        DB::statement("ALTER TABLE tbl_room MODIFY COLUMN status ENUM('Available', 'Vacant', 'Occupied', 'Active', 'In Construction', 'Maintenance') NOT NULL DEFAULT 'Active'");

        // Step 2: Revert values
        DB::table('tbl_room')->where('status', 'Available')->update(['status' => 'Active']);
        DB::table('tbl_room')->where('status', 'Vacant')->update(['status' => 'In Construction']);
        DB::table('tbl_room')->where('status', 'Occupied')->update(['status' => 'Maintenance']);

        // Step 3: Remove new values from ENUM
        DB::statement("ALTER TABLE tbl_room MODIFY COLUMN status ENUM('Active', 'In Construction', 'Maintenance') NOT NULL DEFAULT 'Active'");
    }
};