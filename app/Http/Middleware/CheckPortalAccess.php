<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckPortalAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if (!$user) {
            return $next($request);
        }

        $path = $request->path();
        $segments = explode('/', $path);
        $prefix = $segments[0] ?? '';

        $allowedPrefixes = [];
        $dashboard = 'home';

        if ($user->role === 'student') {
            $allowedPrefixes = ['student'];
            $dashboard = 'student.dashboard';
        } elseif ($user->role === 'teacher') {
            $allowedPrefixes = ['teacher', 'adviser'];
            $dashboard = 'teacher.dashboard';
        } elseif ($user->role === 'admin') {
            // Admin role covers both Admin and Super Admin models
            $allowedPrefixes = ['admin'];
            $dashboard = 'admin.dashboard';
        }

        $portalPrefixes = ['student', 'teacher', 'adviser', 'admin'];

        if (in_array($prefix, $portalPrefixes)) {
            if (!in_array($prefix, $allowedPrefixes)) {
                return redirect()->route($dashboard)
                    ->withErrors(['error' => 'Unauthorized access. You have been redirected to your portal.']);
            }
        }

        return $next($request);
    }
}
