<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class PasswordChangeController extends Controller
{
    public function show()
    {
        $user = Auth::user();
        
        return Inertia::render('auth/change-password', [
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        /** @var User $user */
        $user = Auth::user();
        
        $user->password = Hash::make($request->password);
        $user->password_changed = true;
        $user->save();

        $portal = $request->session()->pull('login_portal');

        // Redirect based on role and login portal
        if ($user->role === 'teacher') {
            $redirectRoute = $portal === 'adviser'
                ? route('adviser.dashboard')
                : route('teacher.dashboard');

            return redirect($redirectRoute)->with('success', 'Password changed successfully!');
        } elseif ($user->role === 'student') {
            return redirect()->route('student.dashboard')->with('success', 'Password changed successfully!');
        }

        return redirect()->route('dashboard')->with('success', 'Password changed successfully!');
    }
}
