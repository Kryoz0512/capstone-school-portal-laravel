<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\Admin;

class RedirectIfAuthenticated
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string|null  ...$guards
     * @return mixed
     */
    public function handle(Request $request, Closure $next, ...$guards)
    {
        $guards = empty($guards) ? [null] : $guards;

        foreach ($guards as $guard) {
            if (Auth::guard($guard)->check()) {
                $user = Auth::user();
                
                // Determine user role and redirect to appropriate dashboard
                if ($user->role === 'student') {
                    $student = Student::where('user_id', $user->id)->first();
                    if ($student) {
                        return redirect()->route('student.dashboard');
                    }
                } elseif ($user->role === 'teacher') {
                    $teacher = Teacher::where('user_id', $user->id)->first();
                    if ($teacher) {
                        return redirect()->route('teacher.dashboard');
                    }
                } elseif ($user->role === 'admin') {
                    $admin = Admin::where('user_id', $user->id)->first();
                    if ($admin) {
                        return redirect()->route('admin.dashboard');
                    }
                }
                
                // Fallback to general dashboard if role-specific dashboard not found
                return redirect()->route('dashboard');
            }
        }

        return $next($request);
    }
}
