<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Teacher extends Model
{
    use HasFactory;

    protected $table = 'tbl_teachers';

    protected $fillable = [
        'user_id',
        'name',
        'employee_number',
        'subject',
        'position',
        'phone',
        'address',
        'hire_date',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'hire_date' => 'date',
        ];
    }

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function subjects()
    {
        return $this->belongsToMany(
            Subject::class,
            'tbl_teacher_subjects',
            'teacher_id',
            'subject_id'
        );
    }

    public function adviserSections()
    {
        return $this->hasMany(AdviserSection::class, 'teacher_id');
    }

    public function schedules()
    {
        return $this->hasMany(Schedule::class, 'teacher_id');
    }

    public function grades()
    {
        return $this->hasMany(Grade::class, 'teacher_id');
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get the teacher's profile picture.
     */
    public function profilePicture()
    {
        return $this->morphOne(ProfilePicture::class, 'profileable');
    }
}