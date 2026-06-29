<?php

namespace App\Http\Controllers;

use App\Models\PortalContent;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PortalContentController extends Controller
{
    public function index()
    {
        $content = PortalContent::instance();

        return Inertia::render('admin/maintenance/portal-content/page', [
            'content' => $content,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            // Hero
            'hero_badge_text'        => 'required|string|max:255',
            'hero_headline_top'      => 'required|string|max:255',
            'hero_headline_bottom'   => 'required|string|max:255',
            'hero_description'       => 'required|string|max:1000',
            'hero_cta_label'         => 'required|string|max:100',

            // About
            'about_section_label'    => 'required|string|max:100',
            'about_headline'         => 'required|string|max:255',
            'about_description'      => 'required|string|max:2000',

            // About Cards
            'mission_title'          => 'required|string|max:100',
            'mission_body'           => 'required|string|max:500',
            'vision_title'           => 'required|string|max:100',
            'vision_body'            => 'required|string|max:500',
            'values_title'           => 'required|string|max:100',
            'values_body'            => 'required|string|max:500',

            // Features
            'features_section_label' => 'required|string|max:100',
            'features_headline'      => 'required|string|max:255',
            'features_subheadline'   => 'required|string|max:500',

            // Footer
            'footer_description'     => 'required|string|max:500',
            'footer_address_line1'   => 'required|string|max:255',
            'footer_address_line2'   => 'required|string|max:255',
            'footer_email'           => 'required|email|max:255',
            'footer_phone'           => 'required|string|max:50',
            'footer_copyright'       => 'required|string|max:255',
            'footer_powered_by'      => 'required|string|max:255',
        ]);

        $content = PortalContent::instance();
        $content->update($validated);

        return back()->with('success', 'Portal content updated successfully.');
    }
}