<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;

class Room extends Model
{
    use SoftDeletes;

    protected $table = 'tbl_room';

    protected $fillable = [
        'room_name',
        'capacity',
        'status',
        'archived_by',
        'archive_reason',
        'purged_at',
    ];

    protected $casts = [
        'capacity' => 'integer',
        'purged_at' => 'datetime',
    ];

    public function schedules()
    {
        return $this->hasMany(Schedule::class, 'room_id');
    }

    public function sections()
    {
        return $this->hasMany(ClassSection::class, 'room_id');
    }

    public function archivedByUser()
    {
        return $this->belongsTo(User::class, 'archived_by');
    }

    public function archiveWithMetadata(?string $reason = null): void
    {
        $this->archived_by = Auth::id();
        $this->archive_reason = $reason;
        $this->save();
        $this->delete();
    }
}
