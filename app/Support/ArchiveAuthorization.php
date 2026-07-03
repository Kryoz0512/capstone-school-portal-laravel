<?php

namespace App\Support;

use App\Models\Admin;
use Illuminate\Support\Facades\Auth;

class ArchiveAuthorization
{
    public static function isSuperAdmin(): bool
    {
        $admin = Admin::where('user_id', Auth::id())->first();

        return $admin !== null && $admin->role === 'Super Admin';
    }

    public static function authorizeSuperAdmin(): void
    {
        if (! self::isSuperAdmin()) {
            abort(404);
        }
    }
}
