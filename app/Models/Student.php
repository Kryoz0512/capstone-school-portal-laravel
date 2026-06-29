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
        'program',           // 'jhs' | 'shs'
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
        'strand_id',         // SHS only
        'shs_year_level',    // SHS only: 11 or 12
        'has_psa_birth_certificate',
        'has_sf9',
        'has_report_card',
        'has_good_moral',
        'ready_to_graduate',
    ];

    protected function casts(): array
    {
        return [
            'birth_date'               => 'date',
            'has_psa_birth_certificate' => 'boolean',
            'has_sf9'                  => 'boolean',
            'has_report_card'          => 'boolean',
            'has_good_moral'           => 'boolean',
            'ready_to_graduate'        => 'boolean',
            'shs_year_level'           => 'integer',
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

    public function strand()
    {
        return $this->belongsTo(Strand::class, 'strand_id');
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class, 'student_id');
    }

    public function profile()
    {
        return $this->hasOne(StudentProfile::class, 'profileable_id');
    }

    public function profilePicture()
    {
        return $this->morphOne(ProfilePicture::class, 'profileable');
    }

    // Helpers
    public function isJhs(): bool
    {
        return $this->program === 'jhs';
    }

    public function isShs(): bool
    {
        return $this->program === 'shs';
    }
}