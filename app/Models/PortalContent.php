<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PortalContent extends Model
{
    protected $table = 'tbl_portal_content';

    protected $fillable = [
        // Hero
        'hero_badge_text',
        'hero_headline_top',
        'hero_headline_bottom',
        'hero_description',
        'hero_cta_label',

        // About
        'about_section_label',
        'about_headline',
        'about_description',

        // About Cards
        'mission_title',
        'mission_body',
        'vision_title',
        'vision_body',
        'values_title',
        'values_body',

        // Features
        'features_section_label',
        'features_headline',
        'features_subheadline',

        // Footer
        'footer_description',
        'footer_address_line1',
        'footer_address_line2',
        'footer_email',
        'footer_phone',
        'footer_copyright',
        'footer_powered_by',
    ];

    /**
     * Always return the single singleton row, creating it with defaults if absent.
     */
    public static function instance(): static
    {
        return static::firstOrCreate([], []);
    }
}