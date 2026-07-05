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
    ];

    protected $casts = [
        'capacity' => 'integer',
    ];

    public function schedules()
    {
        return $this->hasMany(Schedule::class, 'room_id');
    }

    public function sections()
    {
        return $this->hasMany(ClassSection::class, 'room_id');
    }
}
