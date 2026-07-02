<?php

namespace App\Jobs;

use App\Models\User;
use App\Models\Student;
use App\Models\GradeLevel;
use App\Models\ImportJob;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Spatie\SimpleExcel\SimpleExcelReader;

class ImportStudentsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $filePath;
    protected $extension;
    protected $originalName;
    protected $importJobId;

    /**
     * Create a new job instance.
     */
    public function __construct(string $filePath, string $extension, string $originalName, int $importJobId)
    {
        $this->filePath = $filePath; // Relative path inside storage/app/
        $this->extension = strtolower($extension);
        $this->originalName = $originalName;
        $this->importJobId = $importJobId;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $importJob = ImportJob::find($this->importJobId);
        
        if (!$importJob) {
            Log::error("Import job not found: {$this->importJobId}");
            return;
        }

        // Update status to processing
        $importJob->update([
            'status' => 'processing',
            'started_at' => now(),
        ]);

        // Get absolute system path for Spatie SimpleExcel
        // Check both possible locations
        $absolutePath = storage_path('app/' . $this->filePath);
        
        // If not found in app/, try app/private/
        if (!file_exists($absolutePath)) {
            $absolutePath = storage_path('app/private/' . $this->filePath);
        }

        if (!file_exists($absolutePath)) {
            Log::error("Import failed: File not found at {$absolutePath}");
            $importJob->update([
                'status' => 'failed',
                'errors' => ['File not found at: ' . $absolutePath],
                'completed_at' => now(),
            ]);
            return;
        }

        try {
            $imported = 0;
            $errors = [];
            $importedStudents = [];
            $duplicateStudents = [];
            $totalRows = 0;

            // Create reader based on file extension
            if ($this->extension === 'csv') {
                $reader = SimpleExcelReader::create($absolutePath, 'csv');
            } else {
                $reader = SimpleExcelReader::create($absolutePath);
            }

            Log::info('Starting queued import process', ['file' => $this->originalName]);

            $reader->getRows()->each(function (array $row) use (&$imported, &$errors, &$importedStudents, &$duplicateStudents, &$totalRows) {
                try {
                    // Skip header row
                    if (isset($row['LRN']) && $row['LRN'] === 'LRN') {
                        return;
                    }

                    $totalRows++;

                    // Validate required fields
                    if (empty($row['LRN']) || empty($row['First Name']) || empty($row['Last Name'])) {
                        $errors[] = "Row skipped: Missing required fields (LRN: " . ($row['LRN'] ?? 'Unknown') . ")";
                        return;
                    }

                    $email = 'SNHS-' . $row['LRN'];
                    $studentName = trim($row['First Name'] . ' ' . $row['Last Name']);

                    // Check duplicate LRN
                    if (Student::where('lrn', $row['LRN'])->exists()) {
                        $duplicateStudents[] = [
                            'lrn' => $row['LRN'],
                            'name' => $studentName
                        ];
                        $errors[] = "Duplicate: LRN {$row['LRN']} ({$studentName}) is already registered";
                        return;
                    }

                    // Check duplicate Email
                    if (User::where('email', $email)->exists()) {
                        $duplicateStudents[] = [
                            'lrn' => $row['LRN'],
                            'name' => $studentName
                        ];
                        $errors[] = "Duplicate: Email {$email} already exists";
                        return;
                    }

                    // Find grade level
                    $gradeLevel = GradeLevel::where('name', $row['Grade Level'])->first();
                    if (!$gradeLevel) {
                        $errors[] = "Row skipped: Grade level '{$row['Grade Level']}' not found (LRN: {$row['LRN']}, Name: {$studentName})";
                        return;
                    }

                    // Use a database transaction to ensure atomicity
                    DB::transaction(function () use ($row, $email, $gradeLevel) {
                        $user = User::create([
                            'name' => $row['First Name'] . ' ' . $row['Last Name'],
                            'email' => $email,
                            'password' => Hash::make($row['LRN']),
                            'role' => 'student',
                            'password_changed' => false,
                        ]);

                        $student = Student::create([
                            'user_id' => $user->id,
                            'lrn' => $row['LRN'],
                            'first_name' => $row['First Name'],
                            'middle_name' => $row['Middle Name'] ?? null,
                            'last_name' => $row['Last Name'],
                            'suffix' => $row['Suffix'] ?? null,
                            'birth_date' => $row['Date of Birth'],
                            'gender' => strtolower($row['Gender']),
                            'student_status' => strtolower($row['Student Status']),
                            'current_grade_level_id' => $gradeLevel->id,
                            'school_year' => $row['School Year'] ?? '',
                            'has_psa_birth_certificate' => isset($row['PSA Birth Certificate']) && strtolower($row['PSA Birth Certificate']) === 'yes',
                            'has_sf9' => $this->isSubmitted($row, ['Form 137 (SF10)', 'SF10', 'SF9']),
                            'has_report_card' => $this->isSubmitted($row, ['Form 138 (SF9)', 'Report Card']),
                            'has_good_moral' => isset($row['Good Moral']) && strtolower($row['Good Moral']) === 'yes',
                        ]);

                        $student->profile()->create([
                            'place_of_birth' => 'Bongabon, Nueva Ecija',
                            'city_municipality' => 'Bongabon',
                            'province_state' => 'Nueva Ecija',
                            'country' => 'Philippines',
                            'nationality' => 'Filipino',
                        ]);
                    });

                    $imported++;
                    $importedStudents[] = [
                        'lrn' => $row['LRN'],
                        'name' => $studentName
                    ];
                } catch (\Exception $e) {
                    $errors[] = "Row error (LRN: " . ($row['LRN'] ?? 'Unknown') . "): " . $e->getMessage();
                }
            });

            unset($reader);

            // Update import job with results
            $importJob->update([
                'status' => 'completed',
                'total_rows' => $totalRows,
                'imported_count' => $imported,
                'error_count' => count($errors),
                'errors' => $errors,
                'imported_students' => $importedStudents,
                'duplicate_students' => $duplicateStudents,
                'completed_at' => now(),
            ]);

            Log::info('Queued import completed', [
                'file' => $this->originalName,
                'imported' => $imported,
                'errors_count' => count($errors),
                'duplicates' => count($duplicateStudents),
            ]);

        } catch (\Exception $e) {
            Log::error('Queue import exception', ['message' => $e->getMessage()]);
            $importJob->update([
                'status' => 'failed',
                'errors' => [$e->getMessage()],
                'completed_at' => now(),
            ]);
        } finally {
            // Secure clean up: delete the file from the local disk when job finishes
            if (Storage::exists($this->filePath)) {
                Storage::delete($this->filePath);
            }
        }
    }

    /**
     * @param  array<string, mixed>  $row
     * @param  list<string>  $columns
     */
    private function isSubmitted(array $row, array $columns): bool
    {
        foreach ($columns as $column) {
            if (! isset($row[$column])) {
                continue;
            }

            $value = strtolower(trim((string) $row[$column]));

            if (in_array($value, ['yes', 'submitted', 'true', '1'], true)) {
                return true;
            }
        }

        return false;
    }
}