<?php

namespace App\Observers;

use Illuminate\Support\Facades\Cache;

class CacheInvalidationObserver
{
    /**
     * Handle the "saved" event.
     */
    public function saved($model): void
    {
        $this->invalidateRelatedCaches($model);
    }

    /**
     * Handle the "deleted" event.
     */
    public function deleted($model): void
    {
        $this->invalidateRelatedCaches($model);
    }

    /**
     * Handle the "restored" event.
     */
    public function restored($model): void
    {
        $this->invalidateRelatedCaches($model);
    }

    /**
     * Invalidate caches related to the model.
     */
    protected function invalidateRelatedCaches($model): void
    {
        $modelClass = get_class($model);
        
        match ($modelClass) {
            'App\Models\GradeLevel' => $this->invalidateGradeLevelCaches(),
            'App\Models\Teacher' => $this->invalidateTeacherCaches(),
            'App\Models\Subject' => $this->invalidateSubjectCaches(),
            'App\Models\ClassSection' => $this->invalidateSectionCaches(),
            'App\Models\TeacherSubject' => $this->invalidateTeacherSubjectCaches(),
            'App\Models\Room' => $this->invalidateRoomCaches(),
            'App\Models\Student' => $this->invalidateStudentCaches(),
            default => null,
        };
    }

    protected function invalidateGradeLevelCaches(): void
    {
        Cache::forget('grade_levels_list');
    }

    protected function invalidateTeacherCaches(): void
    {
        Cache::forget('teachers_list');
        Cache::forget('teachers_for_sections');
        Cache::forget('teachers_for_adviser_assignment');
        Cache::forget('teachers_for_scheduling');
    }

    protected function invalidateSubjectCaches(): void
    {
        Cache::forget('subjects_list');
    }

    protected function invalidateSectionCaches(): void
    {
        Cache::forget('class_sections_with_grade');
        Cache::forget('sections_with_capacity');
    }

    protected function invalidateTeacherSubjectCaches(): void
    {
        Cache::forget('teacher_subjects_mapping');
    }

    protected function invalidateRoomCaches(): void
    {
        Cache::forget('rooms_for_scheduling');
        Cache::forget('rooms_list');
    }

    protected function invalidateStudentCaches(): void
    {
        Cache::forget('sections_with_capacity');
        // Clear section-specific caches if needed
    }
}
