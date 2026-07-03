<?php

namespace App\Models;

use App\Traits\CascadesSoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;

class Subject extends Model
{
    use CascadesSoftDeletes, HasFactory, SoftDeletes;

    protected $table = 'tbl_subjects';

    protected $fillable = [
        'name',
        'code',
        'description',
        'grade_level_id',
        'archived_by',
        'archive_reason',
        'purged_at',
    ];

    protected function casts(): array
    {
        return [
            'purged_at' => 'datetime',
        ];
    }

    public function gradeLevel()
    {
        return $this->belongsTo(GradeLevel::class, 'grade_level_id');
    }

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

    public function archivedByUser()
    {
        return $this->belongsTo(User::class, 'archived_by');
    }

    public function archiveWithMetadata(?string $reason = null): void
    {
        $this->archived_by = Auth::id();
        $this->archive_reason = $reason;
        $this->save();
        $this->delete();
    }
}
