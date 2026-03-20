<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GradeLevel extends Model
{
    use HasFactory;

    protected $table = 'tbl_grade_levels';

    public $timestamps = false;

    protected $fillable = [
        'name',
        'description',
    ];

    // Relationships
    public function students()
    {
        return $this->hasMany(Student::class, 'current_grade_level_id');
    }

    public function classSections()
    {
        return $this->hasMany(ClassSection::class, 'grade_level_id');
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class, 'grade_level_id');
    }
}