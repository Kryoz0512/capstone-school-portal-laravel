<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Grade extends Model
{
    use HasFactory;

    public const TERM_COUNT = 3;

    public const TERM_COLUMNS = ['term_1', 'term_2', 'term_3'];

    protected $table = 'tbl_grades';

    protected $fillable = [
        'student_id',
        'class_section_id',
        'school_year',
        'subject_id',
        'teacher_id',
        'term_1',
        'term_2',
        'term_3',
        'final_grade',
        'remarks',
    ];

    protected function casts(): array
    {
        return [
            'term_1'      => 'decimal:2',
            'term_2'      => 'decimal:2',
            'term_3'      => 'decimal:2',
            'final_grade' => 'decimal:2',
        ];
    }

    public static function termColumn(int|string $term): string
    {
        return 'term_' . $term;
    }

    public static function termValues(self $grade): array
    {
        return [
            $grade->term_1,
            $grade->term_2,
            $grade->term_3,
        ];
    }

    // Relationships
    public function student()
    {
        return $this->belongsTo(Student::class, 'student_id');
    }

    public function classSection()
    {
        return $this->belongsTo(ClassSection::class, 'class_section_id');
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
