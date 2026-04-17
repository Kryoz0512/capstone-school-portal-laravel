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
        // MySQL doesn't support modifying enum directly, so we need to use raw SQL
        DB::statement("ALTER TABLE tbl_admins MODIFY COLUMN role ENUM('Admin', 'Staff', 'Principal') DEFAULT 'Staff'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back to original enum values
        DB::statement("ALTER TABLE tbl_admins MODIFY COLUMN role ENUM('Admin', 'Staff') DEFAULT 'Staff'");
    }
};
