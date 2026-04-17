<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckPasswordChanged
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        // Only check for teachers and students
        if ($user && in_array($user->role, ['teacher', 'student'])) {
            // If password hasn't been changed and not already on change password page
            if (!$user->password_changed && !$request->is('change-password') && !$request->is('logout')) {
                return redirect()->route('change-password');
            }
        }

        return $next($request);
    }
}
