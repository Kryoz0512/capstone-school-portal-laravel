<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class ProfilePicture extends Model
{
    use HasFactory;

    protected $table = 'tbl_profile_pictures';

    protected $fillable = [
        'profileable_id',
        'file_path',
        'file_name',
        'mime_type',
        'file_size',
    ];

    /**
     * Get the owning model based on the authenticated user's role.
     * This is a custom implementation without using profileable_type.
     */
    public function getOwner()
    {
        $user = Auth::user();
        
        if (!$user) {
            return null;
        }

        // Determine the model based on user role
        switch ($user->role) {
            case 'student':
                return Student::find($this->profileable_id);
            case 'teacher':
                return Teacher::find($this->profileable_id);
            case 'admin':
            case 'super_admin':
                return Admin::find($this->profileable_id);
            default:
                return null;
        }
    }
}
