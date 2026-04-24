<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $table = 'tbl_students';

    protected $fillable = [
        'user_id',
        'student_status',
        'lrn',
        'school_year',
        'last_name',
        'first_name',
        'middle_name',
        'suffix',
        'gender',
        'current_grade_level_id',
        'current_section_id',
        'birth_date',
        'has_psa_birth_certificate',
        'has_sf9',
        'has_report_card',
        'has_good_moral',
    ];

    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
            'has_psa_birth_certificate' => 'boolean',
            'has_sf9' => 'boolean',
            'has_report_card' => 'boolean',
            'has_good_moral' => 'boolean',
        ];
    }

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function gradeLevel()
    {
        return $this->belongsTo(GradeLevel::class, 'current_grade_level_id');
    }

    public function section()
    {
        return $this->belongsTo(ClassSection::class, 'current_section_id');
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class, 'student_id');
    }

    /**
     * Get the student's profile.
     */
    public function profile()
    {
        return $this->hasOne(StudentProfile::class, 'profileable_id');
    }

    /**
     * Get the student's profile picture.
     */
    public function profilePicture()
    {
        return $this->morphOne(ProfilePicture::class, 'profileable');
    }
}