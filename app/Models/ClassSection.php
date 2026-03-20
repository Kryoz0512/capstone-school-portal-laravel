<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClassSection extends Model
{
    use HasFactory;

    protected $table = 'tbl_class_sections';

    protected $fillable = [
        'grade_level_id',
        'adviser_id',
        'name',
    ];

    // Relationships
    public function gradeLevel()
    {
        return $this->belongsTo(GradeLevel::class, 'grade_level_id');
    }

    public function adviser()
    {
        return $this->belongsTo(Teacher::class, 'adviser_id');
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class, 'class_section_id');
    }

    public function schedules()
    {
        return $this->hasMany(Schedule::class, 'class_section_id');
    }
}