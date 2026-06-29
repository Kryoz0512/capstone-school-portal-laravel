<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Strand extends Model
{
    use HasFactory;

    protected $table = 'tbl_strands';

    protected $fillable = [
        'name',
        'track',
        'description',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    // Relationships
    public function students()
    {
        return $this->hasMany(Student::class, 'strand_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByTrack($query, string $track)
    {
        return $query->where('track', $track);
    }
}