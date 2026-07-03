<?php

namespace App\Models;

use App\Traits\CascadesSoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;

class Admin extends Model
{
    use CascadesSoftDeletes, HasFactory, SoftDeletes;

    protected $table = 'tbl_admins';

    protected $fillable = [
        'user_id',
        'employee_number',
        'first_name',
        'last_name',
        'role',
        'position',
        'updated_by',
        'can_add_teacher',
        'archived_by',
        'archive_reason',
        'purged_at',
    ];

    protected function casts(): array
    {
        return [
            'purged_at' => 'datetime',
        ];
    }

    protected function cascadeSoftDeleteRelations(): array
    {
        return ['profilePicture'];
    }

    protected static function booted(): void
    {
        static::deleting(function (Admin $admin) {
            if ($admin->isForceDeleting()) {
                return;
            }

            if ($admin->user) {
                $admin->user->markDeletingFromCascade()->delete();
            }
        });

        static::restoring(function (Admin $admin) {
            if ($admin->user()->withTrashed()->exists()) {
                $admin->user()->withTrashed()->first()?->markDeletingFromCascade()->restore();
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function archivedByUser()
    {
        return $this->belongsTo(User::class, 'archived_by');
    }

    public function profilePicture()
    {
        return $this->morphOne(ProfilePicture::class, 'profileable');
    }

    public function archiveWithMetadata(?string $reason = null): void
    {
        $this->archived_by = Auth::id();
        $this->archive_reason = $reason;
        $this->save();
        $this->delete();
    }
}
