<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class LoginController extends Controller
{
    /**
     * Check if email is locked (for frontend validation)
     */
    public function checkLockStatus(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|string',
            ]);

            $user = User::where('email', $request->email)->first();

            if (!$user) {
                return response()->json([
                    'locked' => false,
                ]);
            }

            // If lock period has expired, reset the attempts in database
            if ($user->locked_until && Carbon::now()->gte($user->locked_until)) {
                Log::info('Lock expired for user: ' . $user->email . ', resetting attempts');
                
                $user->update([
                    'failed_login_attempts' => 0,
                    'locked_until' => null,
                ]);
                
                Log::info('After reset - attempts: ' . $user->failed_login_attempts . ', locked_until: ' . $user->locked_until);
                
                return response()->json([
                    'locked' => false,
                ]);
            }

            // Check if account is still locked
            if ($user->locked_until && Carbon::now()->lt($user->locked_until)) {
                $secondsLeft = (int) Carbon::now()->diffInSeconds($user->locked_until);
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
                
                return response()->json([
                    'locked' => true,
                    'seconds_left' => $secondsLeft,
                    'minutes' => $minutes,
                    'seconds' => $seconds,
                    'message' => 'This account is locked. Please try again in ' . $timeMessage . '.',
                ]);
            }

            return response()->json([
                'locked' => false,
            ]);
        } catch (\Exception $e) {
            Log::error('Error in checkLockStatus: ' . $e->getMessage());
            return response()->json([
                'locked' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
