<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class GradeSheet extends Model
{
    use HasFactory;

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

    /**
     * Get the parent gradeable model (polymorphic relationship).
     * This can be any model like Schedule, Enrollment, etc.
     */
    public function gradeable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the student that owns the grade sheet.
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_id');
    }

    /**
     * Get the class section.
     */
    public function classSection(): BelongsTo
    {
        return $this->belongsTo(ClassSection::class, 'class_section_id');
    }

    /**
     * Get the subject.
     */
    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class, 'subject_id');
    }

    /**
     * Get the teacher.
     */
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class, 'teacher_id');
    }

    /**
     * Scope to filter by school year.
     */
    public function scopeSchoolYear($query, $year)
    {
        return $query->where('school_year', $year);
    }

    /**
     * Scope to filter by quarter.
     */
    public function scopeQuarter($query, $quarter)
    {
        return $query->where('quarter', $quarter);
    }

    /**
     * Scope to filter by teacher.
     */
    public function scopeByTeacher($query, $teacherId)
    {
        return $query->where('teacher_id', $teacherId);
    }

    /**
     * Scope to filter by section.
     */
    public function scopeBySection($query, $sectionId)
    {
        return $query->where('class_section_id', $sectionId);
    }

    /**
     * Scope to filter by subject.
     */
    public function scopeBySubject($query, $subjectId)
    {
        return $query->where('subject_id', $subjectId);
    }

    /**
     * Automatically set remarks based on grade.
     */
    public function setGradeAttribute($value)
    {
        $this->attributes['grade'] = $value;
        
        // Auto-set remarks based on grade
        if ($value !== null) {
            if ($value >= 75) {
                $this->attributes['remarks'] = 'Passed';
            } else {
                $this->attributes['remarks'] = 'Failed';
            }
        }
    }
}
