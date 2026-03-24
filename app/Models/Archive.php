<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Archive extends Model
{
    protected $fillable = [
        'archivable_type',
        'archivable_id',
        'data',
        'archived_by',
        'reason',
    ];

    protected $casts = [
        'data' => 'array',
    ];

    public function archivable()
    {
        return $this->morphTo();
    }

    public function archivedBy()
    {
        return $this->belongsTo(User::class, 'archived_by');
    }
}
