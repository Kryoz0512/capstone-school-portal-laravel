<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdviserSection extends Model
{
    use HasFactory;

    protected $table = 'tbl_adviser_section';

    protected $fillable = [
        'teacher_id',
        'class_section_id',
        'school_year',
    ];

    // Relationships
    public function teacher()
    {
        return $this->belongsTo(Teacher::class, 'teacher_id');
    }

    public function classSection()
    {
        return $this->belongsTo(ClassSection::class, 'class_section_id');
    }
}
