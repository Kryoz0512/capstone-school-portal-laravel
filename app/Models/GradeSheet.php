<?php

namespace App\Models;

use App\Traits\ProtectsAcademicRecords;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class GradeSheet extends Model
{
    use HasFactory, ProtectsAcademicRecords;

    protected $table = 'tbl_grade_sheets';

    protected $fillable = [
        'gradeable_id',
        'gradeable_type',
        'student_id',
        'class_section_id',
        'subject_id',
        'teacher_id',
        'school_year',
        'quarter',
        'grade',
        'remarks',
        'notes',
        'submitted_at',
    ];

    protected $casts = [
        'grade' => 'decimal:2',
        'submitted_at' => 'datetime',
    ];

    public function gradeable(): MorphTo
    {
        return $this->morphTo();
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_id');
    }

    public function classSection(): BelongsTo
    {
        return $this->belongsTo(ClassSection::class, 'class_section_id');
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class, 'subject_id');
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class, 'teacher_id')->withTrashed();
    }

    public function scopeSchoolYear($query, $year)
    {
        return $query->where('school_year', $year);
    }

    public function scopeQuarter($query, $quarter)
    {
        return $query->where('quarter', $quarter);
    }

    public function scopeByTeacher($query, $teacherId)
    {
        return $query->where('teacher_id', $teacherId);
    }

    public function scopeBySection($query, $sectionId)
    {
        return $query->where('class_section_id', $sectionId);
    }

    public function scopeBySubject($query, $subjectId)
    {
        return $query->where('subject_id', $subjectId);
    }

    public function setGradeAttribute($value)
    {
        $this->attributes['grade'] = $value;

        if ($value !== null) {
            if ($value >= 75) {
                $this->attributes['remarks'] = 'Passed';
            } else {
                $this->attributes['remarks'] = 'Failed';
            }
        }
    }
}
