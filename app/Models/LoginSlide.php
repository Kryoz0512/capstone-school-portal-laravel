<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoginSlide extends Model
{
    protected $table = 'tbl_login_slides';

    protected $fillable = [
        'image_path',
        'order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public static function getActiveSlideUrls(): array
    {
        return self::where('is_active', true)
            ->orderBy('order')
            ->get()
            ->map(fn($slide) => \Illuminate\Support\Facades\Storage::url($slide->image_path))
            ->toArray();
    }
}
