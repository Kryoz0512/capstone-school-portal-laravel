<?php

namespace App\Models;

use App\Traits\PreventsDirectDeletion;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProfilePicture extends Model
{
    use HasFactory, PreventsDirectDeletion, SoftDeletes;

    protected $table = 'tbl_profile_pictures';

    protected $fillable = [
        'profileable_id',
        'profileable_type',
        'file_path',
        'file_name',
        'mime_type',
        'file_size',
    ];

    public function profileable()
    {
        return $this->morphTo();
    }
}
