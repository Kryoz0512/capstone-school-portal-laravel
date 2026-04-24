<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProfilePicture extends Model
{
    use HasFactory;

    protected $table = 'tbl_profile_pictures';

    protected $fillable = [
        'profileable_id',
        'profileable_type',
        'file_path',
        'file_name',
        'mime_type',
        'file_size',
    ];

    /**
     * Get the owning profileable model (Admin, Teacher, or Student).
     */
    public function profileable()
    {
        return $this->morphTo();
    }
}
