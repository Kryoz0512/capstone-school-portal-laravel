<?php

namespace App\Models;

use App\Traits\CascadesSoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;

class Student extends Model
{
    use CascadesSoftDeletes, HasFactory, SoftDeletes;

    protected $table = 'tbl_students';

    protected $fillable = [
        'user_id',
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
        'has_psa_birth_certificate',
        'has_sf9',
        'has_report_card',
        'has_good_moral',
        'ready_to_graduate',
        'is_valid',
        'invalid_reason',
        'archived_by',
        'archive_reason',
        'purged_at',
    ];

    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
            'has_psa_birth_certificate' => 'boolean',
            'has_sf9' => 'boolean',
            'has_report_card' => 'boolean',
            'has_good_moral' => 'boolean',
            'ready_to_graduate' => 'boolean',
            'is_valid' => 'boolean',
            'purged_at' => 'datetime',
        ];
    }

    protected function cascadeSoftDeleteRelations(): array
    {
        return ['profile', 'profilePicture'];
    }

    protected static function booted(): void
    {
        static::deleting(function (Student $student) {
            if ($student->isForceDeleting()) {
                return;
            }

            if ($student->user) {
                $student->user->markDeletingFromCascade()->delete();
            }
        });

        static::restoring(function (Student $student) {
            if ($student->user()->withTrashed()->exists()) {
                $student->user()->withTrashed()->first()?->markDeletingFromCascade()->restore();
            }
        });
    }

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
