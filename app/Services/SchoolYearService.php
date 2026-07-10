<?php

namespace App\Services;

use App\Models\Student;
use Illuminate\Support\Facades\Cache;

class SchoolYearService
{
    /**
     * Get the current school year, cached per request.
     */
    public static function current(): string
    {
        return once(function () {
            // First, check if the admin has explicitly set a current school year
            $setting = \App\Models\Setting::where('key', 'current_school_year')->value('value');
            if ($setting) {
                return $setting;
            }

            // Fallback: Calculate the most frequent school year among current students
            $mostFrequentYear = \Illuminate\Support\Facades\DB::table('tbl_students')
                ->select('school_year')
                ->groupBy('school_year')
                ->orderByRaw('COUNT(*) DESC')
                ->value('school_year');

            return $mostFrequentYear ?? date('Y') . '-' . (date('Y') + 1);
        });
    }

    /**
     * Get an array of school years (from DB + generated), cached for 1 hour.
     */
    public static function getSchoolYears()
    {
        return Cache::remember('school_years_list', 3600, function () {
            // Get school years from database
            $dbSchoolYears = Student::select('school_year')
                ->whereNotNull('school_year')
                ->distinct()
                ->pluck('school_year')
                ->toArray();

            // Generate school years from 2018 to current year + 1
            $currentYear = (int) date('Y');
            $generatedYears = [];
            for ($year = 2018; $year <= $currentYear + 1; $year++) {
                $generatedYears[] = $year . '-' . ($year + 1);
            }

            // Merge and get unique values
            $allYears = array_unique(array_merge($generatedYears, $dbSchoolYears));

            // Sort in descending order
            rsort($allYears);

            // Format for select dropdown
            return collect($allYears)->map(function ($year) {
                return [
                    'value' => $year,
                    'label' => $year,
                ];
            })->all();
        });
    }
}
