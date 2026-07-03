<?php

namespace App\Models;

use App\Traits\PreventsDirectDeletion;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TeacherSubject extends Model
{
    use PreventsDirectDeletion, SoftDeletes;

    protected $table = 'tbl_teacher_subjects';

    protected $fillable = [
        'teacher_id',
        'subject_id',
    ];

    public function teacher()
    {
        return $this->belongsTo(Teacher::class, 'teacher_id');
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class, 'subject_id');
    }
}
