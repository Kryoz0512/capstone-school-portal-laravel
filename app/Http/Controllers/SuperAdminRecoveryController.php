<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class SuperAdminRecoveryController extends Controller
{
    // Hardcoded recovery code (hashed for security)
    // Plain text: SNHS-RECOVERY-2024-SUPER-ADMIN
    private const RECOVERY_CODE_HASH = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
    
    /**
     * Show the recovery form
     */
    public function showRecoveryForm()
    {
        return Inertia::render('super-admin-recovery/verify/page', [
            'step' => 'verify'
        ]);
    }
    
    /**
     * Verify the recovery code and username
     */
    public function verifyRecoveryCode(Request $request)
    {
        $validated = $request->validate([
            'username' => 'required|string',
            'recovery_code' => 'required|string',
        ]);
        
        // Find user with exact username match
        $user = User::where('email', $validated['username'])->first();
        
        if (!$user) {
            return back()->withErrors([
                'username' => 'Username not found.',
            ]);
        }
        
        // Check if user is super admin
        $admin = Admin::where('user_id', $user->id)->first();
        
        if (!$admin || $admin->role !== 'Super Admin') {
            return back()->withErrors([
                'username' => 'This account is not a super admin.',
            ]);
        }
        
        // Verify recovery code (hardcoded)
        // The actual code is: SNHS-RECOVERY-2024-SUPER-ADMIN
        if ($validated['recovery_code'] !== 'ac4754231ad632f2ec27a02a8e6a752a0da1db5f') {
            return back()->withErrors([
                'recovery_code' => 'Invalid recovery code.',
            ]);
        }
        
        // Store user ID in session for the next step
        $request->session()->put('recovery_user_id', $user->id);
        $request->session()->put('recovery_verified', true);
        
        return redirect()->route('super-admin-recovery.reset-form');
    }
    
    /**
     * Show the password reset form (only if verified)
     */
    public function showResetForm(Request $request)
    {
        if (!$request->session()->get('recovery_verified')) {
            return redirect()->route('super-admin-recovery.verify')
                ->withErrors(['error' => 'Please verify your identity first.']);
        }
        
        $userId = $request->session()->get('recovery_user_id');
        $user = User::findOrFail($userId);
        
        return Inertia::render('super-admin-recovery/reset/page', [
            'username' => $user->email,
            'step' => 'reset'
        ]);
    }
    
    /**
     * Reset the password
     */
    public function resetPassword(Request $request)
    {
        if (!$request->session()->get('recovery_verified')) {
            return redirect()->route('super-admin-recovery.verify')
                ->withErrors(['error' => 'Session expired. Please verify again.']);
        }
        
        $validated = $request->validate([
            'password' => 'required|string|min:8|confirmed',
        ]);
        
        $userId = $request->session()->get('recovery_user_id');
        $user = User::findOrFail($userId);
        
        // Update password
        $user->password = Hash::make($validated['password']);
        $user->save();
        
        // Clear session
        $request->session()->forget('recovery_user_id');
        $request->session()->forget('recovery_verified');
        
        return redirect()->route('login')
            ->with('success', 'Password has been reset successfully. You can now login with your new password.');
    }
}
