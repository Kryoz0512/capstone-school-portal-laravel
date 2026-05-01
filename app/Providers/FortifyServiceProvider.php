<?php

namespace App\Providers;

use App\Actions\Fortify\CreateNewUser;
use App\Actions\Fortify\ResetUserPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Laravel\Fortify\Contracts\LoginResponse;
use Laravel\Fortify\Features;
use Laravel\Fortify\Fortify;

class FortifyServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Register custom login response
        $this->app->singleton(LoginResponse::class, function () {
            return new class implements LoginResponse {
                public function toResponse($request)
                {
                    $user = Auth::user();
                    
                    // Redirect based on user role
                    $redirectUrl = match ($user->role ?? 'student') {
                        'admin' => '/admin/dashboard',
                        'teacher' => '/teacher/dashboard',
                        'student' => '/student/dashboard',
                        default => '/dashboard',
                    };

                    return redirect()->intended($redirectUrl);
                }
            };
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureActions();
        $this->configureViews();
        $this->configureRateLimiting();
    }

    /**
     * Configure Fortify actions.
     */
    private function configureActions(): void
    {
        Fortify::resetUserPasswordsUsing(ResetUserPassword::class);
        Fortify::createUsersUsing(CreateNewUser::class);
        
        // Customize authentication with lockout mechanism
        Fortify::authenticateUsing(function (Request $request) {
            $user = \App\Models\User::where('email', $request->email)->first();

            if (!$user) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'email' => ['These credentials do not match our records.'],
                ]);
            }

            // Check if account is locked
            if ($user->locked_until && \Carbon\Carbon::now()->lt($user->locked_until)) {
                $secondsLeft = (int) \Carbon\Carbon::now()->diffInSeconds($user->locked_until);
                $minutes = floor($secondsLeft / 60);
                $seconds = $secondsLeft % 60;
                
                $timeMessage = '';
                if ($minutes > 0) {
                    $timeMessage = $minutes . ' minute' . ($minutes > 1 ? 's' : '');
                    if ($seconds > 0) {
                        $timeMessage .= ' and ' . $seconds . ' second' . ($seconds > 1 ? 's' : '');
                    }
                } else {
                    $timeMessage = $seconds . ' second' . ($seconds > 1 ? 's' : '');
                }
                
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'email' => ['This account is locked. Please try again in ' . $timeMessage . '.'],
                ]);
            }

            // If lock period has expired, reset the attempts
            if ($user->locked_until && \Carbon\Carbon::now()->gte($user->locked_until)) {
                $user->update([
                    'failed_login_attempts' => 0,
                    'locked_until' => null,
                ]);
            }

            // Check password
            if (!\Illuminate\Support\Facades\Hash::check($request->password, $user->password)) {
                // Increment failed attempts
                $user->increment('failed_login_attempts');
                $user->refresh(); // Reload to get updated count

                // Lock account if 3 failed attempts
                if ($user->failed_login_attempts >= 3) {
                    $lockDuration = 10;
                    $lockUntil = \Carbon\Carbon::now()->addSeconds($lockDuration);
                    
                    $user->update([
                        'locked_until' => $lockUntil, 
                    ]);

                    // Format the duration message
                    $minutes = floor($lockDuration / 60);
                    $seconds = $lockDuration % 60;
                    
                    $durationMessage = '';
                    if ($minutes > 0) {
                        $durationMessage = $minutes . ' minute' . ($minutes > 1 ? 's' : '');
                        if ($seconds > 0) {
                            $durationMessage .= ' and ' . $seconds . ' second' . ($seconds > 1 ? 's' : '');
                        }
                    } else {
                        $durationMessage = $seconds . ' second' . ($seconds > 1 ? 's' : '');
                    }

                    throw \Illuminate\Validation\ValidationException::withMessages([
                        'email' => ["Too many failed login attempts. This account is locked for {$durationMessage}."],
                    ]);
                }

                $attemptsLeft = 3 - $user->failed_login_attempts;
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'password' => ["Invalid password. You have {$attemptsLeft} attempt(s) remaining."],
                ]);
            }

            // Validate role selection
            $selectedRole = $request->input('role');
            
            // Map 'staff' to 'admin' for validation
            $roleMap = [
                'staff' => 'admin',
                'teacher' => 'teacher',
                'student' => 'student',
            ];
            
            $expectedRole = $roleMap[$selectedRole] ?? $selectedRole;
            
            if ($user->role !== $expectedRole) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'role' => ['You are not registered as a ' . ucfirst($selectedRole) . '. Please select the correct role.'],
                ]);
            }

            // Successful login - reset failed attempts
            $user->update([
                'failed_login_attempts' => 0,
                'locked_until' => null,
            ]);
            
            return $user;
        });
    }

    /**
     * Configure Fortify views.
     */
    private function configureViews(): void
    {
        Fortify::loginView(function (Request $request) {
            // Redirect to portal if no role is specified
            return redirect()->route('home');
        });

        Fortify::resetPasswordView(fn (Request $request) => Inertia::render('auth/reset-password', [
            'email' => $request->email,
            'token' => $request->route('token'),
        ]));

        Fortify::requestPasswordResetLinkView(fn (Request $request) => Inertia::render('auth/forgot-password', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::verifyEmailView(fn (Request $request) => Inertia::render('auth/verify-email', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::registerView(fn () => Inertia::render('auth/register'));

        Fortify::twoFactorChallengeView(fn () => Inertia::render('auth/two-factor-challenge'));

        Fortify::confirmPasswordView(fn () => Inertia::render('auth/confirm-password'));
    }

    /**
     * Configure rate limiting.
     */
    private function configureRateLimiting(): void
    {
        RateLimiter::for('two-factor', function (Request $request) {
            return Limit::perMinute(5)->by($request->session()->get('login.id'));
        });

        RateLimiter::for('login', function (Request $request) {
            $throttleKey = Str::transliterate(Str::lower($request->input(Fortify::username())).'|'.$request->ip());

            return Limit::perMinute(5)->by($throttleKey);
        });
    }
}
