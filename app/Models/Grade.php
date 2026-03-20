<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Grade extends Model
{
    use HasFactory;

    protected $table = 'tbl_grades';

    protected $fillable = [
        'enrollment_id',
        'subject_id',
        'teacher_id',
        'quarter_1',
        'quarter_2',
        'quarter_3',
        'quarter_4',
        'final_grade',
        'remarks',
    ];

    protected function casts(): array
    {
        return [
            'quarter_1'   => 'decimal:2',
            'quarter_2'   => 'decimal:2',
            'quarter_3'   => 'decimal:2',
            'quarter_4'   => 'decimal:2',
            'final_grade' => 'decimal:2',
        ];
    }

    // Relationships
    public function enrollment()
    {
        return $this->belongsTo(Enrollment::class, 'enrollment_id');
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class, 'subject_id');
    }

    public function teacher()
    {
        return $this->belongsTo(Teacher::class, 'teacher_id');
    }
}