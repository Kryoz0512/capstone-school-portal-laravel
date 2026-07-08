<?php

namespace App\Providers;

use App\Models\ClassSection;
use App\Models\GradeLevel;
use App\Models\Room;
use App\Models\Student;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\TeacherSubject;
use App\Observers\CacheInvalidationObserver;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureMorphMap();
        $this->configureGates();

        GradeLevel::observe(CacheInvalidationObserver::class);
        Teacher::observe(CacheInvalidationObserver::class);
        Subject::observe(CacheInvalidationObserver::class);
        ClassSection::observe(CacheInvalidationObserver::class);
        TeacherSubject::observe(CacheInvalidationObserver::class);
        Room::observe(CacheInvalidationObserver::class);
        Student::observe(CacheInvalidationObserver::class);
    }

    protected function configureGates(): void
    {
        \Illuminate\Support\Facades\Gate::define('manageArchive', function ($user) {
            $admin = \App\Models\Admin::where('user_id', $user->id)->first();

            return $admin !== null && $admin->role === 'Super Admin';
        });
    }

    /**
     * Configure morph map for polymorphic relationships.
     */
    protected function configureMorphMap(): void
    {
        \Illuminate\Database\Eloquent\Relations\Relation::morphMap([
            'student' => \App\Models\Student::class,
            'teacher' => \App\Models\Teacher::class,
            'admin' => \App\Models\Admin::class,
        ]);
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
