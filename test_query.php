<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$grades = \App\Models\GradeLevel::withCount(['students' => function ($query) {
    $query->whereNotNull('current_section_id')
          ->where('school_year', '2026-2027');
}])->get();

echo "Counts:\n";
foreach($grades as $g) {
    echo $g->name . " => " . $g->students_count . "\n";
}

$total = \App\Models\Student::whereNotNull('current_section_id')->where('school_year', '2026-2027')->count();
echo "Total => " . $total . "\n";
