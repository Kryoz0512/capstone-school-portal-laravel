<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SchedulePicture extends Model
{
    use HasFactory;

    protected $table = 'tbl_schedule_pictures';

    protected $fillable = [
        'file_path',
        'file_name',
        'mime_type',
        'file_size',
        'label',
        'uploaded_by',
    ];

    public function uploadedBy()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}