<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ImportJob extends Model
{
    protected $fillable = [
        'user_id',
        'filename',
        'status',
        'total_rows',
        'imported_count',
        'error_count',
        'errors',
        'imported_students',
        'duplicate_students',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'errors' => 'array',
        'imported_students' => 'array',
        'duplicate_students' => 'array',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
