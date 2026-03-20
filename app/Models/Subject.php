<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    use HasFactory;

    protected $table = 'tbl_subjects';

    protected $fillable = [
        'name',
        'code',
        'description',
    ];

    // Relationships
    public function teachers()
    {
        return $this->belongsToMany(
            Teacher::class,
            'tbl_teacher_subjects',
            'subject_id',
            'teacher_id'
        );
    }

    public function schedules()
    {
        return $this->hasMany(Schedule::class, 'subject_id');
    }

    public function grades()
    {
        return $this->hasMany(Grade::class, 'subject_id');
    }
}