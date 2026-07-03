<?php

namespace App\Models;

use App\Traits\CascadesSoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;

class Teacher extends Model
{
    use CascadesSoftDeletes, HasFactory, SoftDeletes;

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
        'archived_by',
        'archive_reason',
        'purged_at',
    ];

    protected function casts(): array
    {
        return [
            'hire_date' => 'date',
            'purged_at' => 'datetime',
        ];
    }

    protected function cascadeSoftDeleteRelations(): array
    {
        return [
            'teacherSubjectRecords',
            'schedules',
            'adviserSections',
            'profilePicture',
        ];
    }

    protected static function booted(): void
    {
        static::deleting(function (Teacher $teacher) {
            if ($teacher->isForceDeleting()) {
                return;
            }

            if ($teacher->user) {
                $teacher->user->markDeletingFromCascade()->delete();
            }
        });

        static::restoring(function (Teacher $teacher) {
            if ($teacher->user()->withTrashed()->exists()) {
                $teacher->user()->withTrashed()->first()?->markDeletingFromCascade()->restore();
            }
        });
    }

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

    public function teacherSubjectRecords()
    {
        return $this->hasMany(TeacherSubject::class, 'teacher_id');
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

    public function archivedByUser()
    {
        return $this->belongsTo(User::class, 'archived_by');
    }

    public function profilePicture()
    {
        return $this->morphOne(ProfilePicture::class, 'profileable');
    }

    public function archiveWithMetadata(?string $reason = null): void
    {
        $this->archived_by = Auth::id();
        $this->archive_reason = $reason;
        $this->save();
        $this->delete();
    }

    public function hasAcademicRecords(): bool
    {
        return $this->grades()->exists()
            || GradeSheet::where('teacher_id', $this->id)->exists();
    }
}
