<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private array $parentTables = [
        'users',
        'tbl_teachers',
        'tbl_admins',
        'tbl_students',
        'tbl_subjects',
        'tbl_room',
    ];

    private array $childTables = [
        'tbl_teacher_subjects',
        'tbl_schedules',
        'tbl_adviser_section',
        'tbl_student_profiles',
    ];

    public function up(): void
    {
        foreach ($this->parentTables as $tableName) {
            Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                if (! Schema::hasColumn($tableName, 'deleted_at')) {
                    $table->softDeletes();
                }

                if (! Schema::hasColumn($tableName, 'archived_by')) {
                    $table->foreignId('archived_by')->nullable()->constrained('users')->nullOnDelete();
                }

                if (! Schema::hasColumn($tableName, 'archive_reason')) {
                    $table->text('archive_reason')->nullable();
                }

                if (! Schema::hasColumn($tableName, 'purged_at')) {
                    $table->timestamp('purged_at')->nullable();
                }
            });
        }

        foreach ($this->childTables as $tableName) {
            Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                if (! Schema::hasColumn($tableName, 'deleted_at')) {
                    $table->softDeletes();
                }
            });
        }

        if (Schema::hasTable('tbl_profile_pictures') && ! Schema::hasColumn('tbl_profile_pictures', 'deleted_at')) {
            Schema::table('tbl_profile_pictures', function (Blueprint $table) {
                $table->softDeletes();
            });
        }

        if (Schema::hasColumn('tbl_teachers', 'user_id')) {
            Schema::table('tbl_teachers', function (Blueprint $table) {
                $table->dropForeign(['user_id']);
            });

            Schema::table('tbl_teachers', function (Blueprint $table) {
                $table->unsignedBigInteger('user_id')->nullable()->change();
                $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        foreach ($this->childTables as $tableName) {
            Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                if (Schema::hasColumn($tableName, 'deleted_at')) {
                    $table->dropSoftDeletes();
                }
            });
        }

        if (Schema::hasColumn('tbl_profile_pictures', 'deleted_at')) {
            Schema::table('tbl_profile_pictures', function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }

        foreach ($this->parentTables as $tableName) {
            Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                if (Schema::hasColumn($tableName, 'purged_at')) {
                    $table->dropColumn('purged_at');
                }

                if (Schema::hasColumn($tableName, 'archive_reason')) {
                    $table->dropColumn('archive_reason');
                }

                if (Schema::hasColumn($tableName, 'archived_by')) {
                    $table->dropForeign(['archived_by']);
                    $table->dropColumn('archived_by');
                }

                if (Schema::hasColumn($tableName, 'deleted_at')) {
                    $table->dropSoftDeletes();
                }
            });
        }
    }
};
