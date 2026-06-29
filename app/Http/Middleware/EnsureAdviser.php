<?php

namespace App\Http\Middleware;

use App\Models\AdviserSection;
use App\Models\Teacher;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdviser
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if (!$user || $user->role !== 'teacher') {
            return redirect()->route('login.adviser')
                ->withErrors(['error' => 'Please log in with your adviser account.']);
        }

        $teacher = Teacher::where('user_id', $user->id)->first();

        if (!$teacher || !AdviserSection::where('teacher_id', $teacher->id)->exists()) {
            return redirect()->route('login.adviser')
                ->withErrors(['error' => 'You are not assigned as a class adviser.']);
        }

        return $next($request);
    }
}
