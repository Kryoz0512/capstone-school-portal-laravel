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
        'section_name',
        'room_id',
    ];

    // Relationships
    public function gradeLevel()
    {
        return $this->belongsTo(GradeLevel::class, 'grade_level_id');
    }

    public function room()
    {
        return $this->belongsTo(Room::class, 'room_id');
    }

    public function adviserSections()
    {
        return $this->hasMany(AdviserSection::class, 'class_section_id');
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class, 'class_section_id');
    }

    public function schedules()
    {
        return $this->hasMany(Schedule::class, 'class_section_id');
    }

    public function students()
    {
        return $this->hasMany(Student::class, 'current_section_id');
    }
}