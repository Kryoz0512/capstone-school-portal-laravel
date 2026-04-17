<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Announcement extends Model
{
    protected $fillable = [
        'title',
        'content',
        'status',
        'created_by',
        'approved_by',
        'approved_at',
        'rejection_reason',
        'is_active',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved')->where('is_active', true);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }
}
