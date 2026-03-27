<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    protected $table = 'tbl_room';

    protected $fillable = [
        'room_number',
        'capacity',
        'status'
    ];

    protected $casts = [
        'capacity' => 'integer'
    ];

    // Relationships
    public function schedules()
    {
        return $this->hasMany(Schedule::class, 'room_id');
    }
}
