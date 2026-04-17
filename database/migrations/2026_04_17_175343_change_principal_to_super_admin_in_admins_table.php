<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // First, modify the enum to include 'Super Admin'
        DB::statement("ALTER TABLE tbl_admins MODIFY COLUMN role ENUM('Admin', 'Staff', 'Principal', 'Super Admin') DEFAULT 'Staff'");
        
        // Then update any existing 'Principal' values to 'Super Admin'
        DB::statement("UPDATE tbl_admins SET role = 'Super Admin' WHERE role = 'Principal'");
        
        // Finally, remove 'Principal' from the enum
        DB::statement("ALTER TABLE tbl_admins MODIFY COLUMN role ENUM('Admin', 'Staff', 'Super Admin') DEFAULT 'Staff'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert 'Super Admin' back to 'Principal'
        DB::statement("UPDATE tbl_admins SET role = 'Principal' WHERE role = 'Super Admin'");
        
        // Revert enum back to 'Principal'
        DB::statement("ALTER TABLE tbl_admins MODIFY COLUMN role ENUM('Admin', 'Staff', 'Principal') DEFAULT 'Staff'");
    }
};
