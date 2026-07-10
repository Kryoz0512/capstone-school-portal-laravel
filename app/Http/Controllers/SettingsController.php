<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        $currentSchoolYear = \App\Services\SchoolYearService::current();
        $schoolYears = \App\Services\SchoolYearService::getSchoolYears();

        return Inertia::render('admin/maintenance/settings/page', [
            'currentSchoolYear' => $currentSchoolYear,
            'schoolYears' => $schoolYears,
        ]);
    }

    public function updateSchoolYear(Request $request)
    {
        $request->validate([
            'school_year' => 'required|string',
            'password' => 'required|string',
        ]);

        if (!Hash::check($request->password, auth()->user()->password)) {
            return back()->withErrors(['password' => 'The provided password does not match our records.']);
        }

        Setting::updateOrCreate(
            ['key' => 'current_school_year'],
            ['value' => $request->school_year]
        );

        return back()->with('success', 'Current school year updated successfully.');
    }
}
