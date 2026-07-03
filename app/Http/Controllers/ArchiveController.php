<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use App\Models\Archive;
use App\Models\Grade;
use App\Models\Room;
use App\Models\Student;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\User;
use App\Support\ArchiveAuthorization;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ArchiveController extends Controller
{
    /** @var array<string, class-string<\Illuminate\Database\Eloquent\Model>> */
    private const ARCHIVABLE_MODELS = [
        'teacher' => Teacher::class,
        'admin' => Admin::class,
        'student' => Student::class,
        'subject' => Subject::class,
        'room' => Room::class,
    ];

    public function index(Request $request)
    {
        $tab = $request->input('tab', 'all');

        $groups = $this->collectSoftDeletedRecords();
        $legacyArchives = $this->collectLegacyArchives();

        $allRecords = collect($groups)
            ->flatten(1)
            ->merge($legacyArchives)
            ->sortByDesc('archived_at')
            ->values();

        $counts = [
            'all' => $allRecords->count(),
            'teacher' => $allRecords->where('type', 'Teacher')->count(),
            'admin' => $allRecords->where('type', 'Admin')->count(),
            'student' => $allRecords->where('type', 'Student')->count(),
            'subject' => $allRecords->where('type', 'Subject')->count(),
            'room' => $allRecords->where('type', 'Room')->count(),
        ];

        $filtered = $tab === 'all'
            ? $allRecords
            : $allRecords->filter(fn ($item) => strtolower($item['type']) === $tab)->values();

        return Inertia::render('admin/archive/page', [
            'archives' => $filtered,
            'counts' => $counts,
            'currentTab' => $tab,
            'isSuperAdmin' => true,
        ]);
    }

    public function restore(Request $request, string $source, int $id)
    {
        ArchiveAuthorization::authorizeSuperAdmin();

        return DB::transaction(function () use ($source, $id) {
            if ($source === 'legacy') {
                $this->restoreLegacyArchive($id);
            } else {
                $this->restoreSoftDeletedRecord($source, $id);
            }

            return redirect()->back()->with('success', 'Record restored successfully.');
        });
    }

    public function destroy(Request $request, string $source, int $id)
    {
        ArchiveAuthorization::authorizeSuperAdmin();

        return DB::transaction(function () use ($source, $id) {
            if ($source === 'legacy') {
                Archive::findOrFail($id)->delete();
            } else {
                $this->forceDeleteSoftDeletedRecord($source, $id);
            }

            return redirect()->back()->with('success', 'Record permanently deleted.');
        });
    }

    private function collectSoftDeletedRecords(): array
    {
        return [
            'teachers' => $this->mapSoftDeletedTeachers(),
            'admins' => $this->mapSoftDeletedAdmins(),
            'students' => $this->mapSoftDeletedStudents(),
            'subjects' => $this->mapSoftDeletedSubjects(),
            'rooms' => $this->mapSoftDeletedRooms(),
        ];
    }

    private function mapSoftDeletedTeachers(): array
    {
        return Teacher::onlyTrashed()
            ->whereNull('purged_at')
            ->with(['user' => fn ($q) => $q->withTrashed(), 'archivedByUser'])
            ->orderByDesc('deleted_at')
            ->get()
            ->map(fn (Teacher $teacher) => [
                'id' => $teacher->id,
                'source' => 'soft',
                'type' => 'Teacher',
                'name' => $teacher->name,
                'email' => $teacher->user?->email ?? 'N/A',
                'archived_by' => $teacher->archivedByUser?->name ?? 'Unknown',
                'archived_at' => $teacher->deleted_at?->timezone('Asia/Manila')->format('M d, Y h:i A'),
                'reason' => $teacher->archive_reason,
                'has_academic_records' => $teacher->hasAcademicRecords(),
            ])
            ->all();
    }

    private function mapSoftDeletedAdmins(): array
    {
        return Admin::onlyTrashed()
            ->whereNull('purged_at')
            ->with(['user' => fn ($q) => $q->withTrashed(), 'archivedByUser'])
            ->orderByDesc('deleted_at')
            ->get()
            ->map(fn (Admin $admin) => [
                'id' => $admin->id,
                'source' => 'soft',
                'type' => 'Admin',
                'name' => trim("{$admin->first_name} {$admin->last_name}"),
                'email' => $admin->user?->email ?? 'N/A',
                'archived_by' => $admin->archivedByUser?->name ?? 'Unknown',
                'archived_at' => $admin->deleted_at?->timezone('Asia/Manila')->format('M d, Y h:i A'),
                'reason' => $admin->archive_reason,
                'has_academic_records' => false,
            ])
            ->all();
    }

    private function mapSoftDeletedStudents(): array
    {
        return Student::onlyTrashed()
            ->whereNull('purged_at')
            ->with(['user' => fn ($q) => $q->withTrashed(), 'archivedByUser'])
            ->orderByDesc('deleted_at')
            ->get()
            ->map(fn (Student $student) => [
                'id' => $student->id,
                'source' => 'soft',
                'type' => 'Student',
                'name' => trim("{$student->first_name} {$student->last_name}"),
                'email' => $student->user?->email ?? 'N/A',
                'archived_by' => $student->archivedByUser?->name ?? 'Unknown',
                'archived_at' => $student->deleted_at?->timezone('Asia/Manila')->format('M d, Y h:i A'),
                'reason' => $student->archive_reason,
                'has_academic_records' => Grade::where('student_id', $student->id)->exists(),
            ])
            ->all();
    }

    private function mapSoftDeletedSubjects(): array
    {
        return Subject::onlyTrashed()
            ->whereNull('purged_at')
            ->with('archivedByUser')
            ->orderByDesc('deleted_at')
            ->get()
            ->map(fn (Subject $subject) => [
                'id' => $subject->id,
                'source' => 'soft',
                'type' => 'Subject',
                'name' => $subject->code && $subject->name
                    ? "{$subject->code} - {$subject->name}"
                    : ($subject->name ?: $subject->code),
                'email' => 'N/A',
                'archived_by' => $subject->archivedByUser?->name ?? 'Unknown',
                'archived_at' => $subject->deleted_at?->timezone('Asia/Manila')->format('M d, Y h:i A'),
                'reason' => $subject->archive_reason,
                'has_academic_records' => Grade::where('subject_id', $subject->id)->exists(),
            ])
            ->all();
    }

    private function mapSoftDeletedRooms(): array
    {
        return Room::onlyTrashed()
            ->whereNull('purged_at')
            ->with('archivedByUser')
            ->orderByDesc('deleted_at')
            ->get()
            ->map(fn (Room $room) => [
                'id' => $room->id,
                'source' => 'soft',
                'type' => 'Room',
                'name' => "Room {$room->room_name} (Capacity: {$room->capacity})",
                'email' => 'N/A',
                'archived_by' => $room->archivedByUser?->name ?? 'Unknown',
                'archived_at' => $room->deleted_at?->timezone('Asia/Manila')->format('M d, Y h:i A'),
                'reason' => $room->archive_reason,
                'has_academic_records' => false,
            ])
            ->all();
    }

    private function collectLegacyArchives(): array
    {
        return Archive::with('archivedBy')
            ->orderByDesc('created_at')
            ->get()
            ->map(function (Archive $archive) {
                $data = is_array($archive->data) ? $archive->data : json_decode($archive->data, true);
                $type = class_basename($archive->archivable_type);

                return [
                    'id' => $archive->id,
                    'source' => 'legacy',
                    'type' => $type,
                    'name' => $this->resolveLegacyName($type, $data),
                    'email' => $data['email'] ?? 'N/A',
                    'archived_by' => $archive->archivedBy?->name ?? 'Unknown',
                    'archived_at' => $archive->created_at->timezone('Asia/Manila')->format('M d, Y h:i A'),
                    'reason' => $archive->reason,
                    'has_academic_records' => false,
                ];
            })
            ->all();
    }

    private function resolveLegacyName(string $type, array $data): string
    {
        if ($type === 'Subject') {
            $code = $data['code'] ?? '';
            $subjectName = $data['name'] ?? '';

            return $code && $subjectName ? "$code - $subjectName" : ($subjectName ?: $code ?: 'Unknown');
        }

        if ($type === 'Room') {
            $roomName = $data['room_name'] ?? $data['room_number'] ?? '';

            return $roomName ? "Room {$roomName}" : 'Unknown Room';
        }

        if (! empty($data['name'])) {
            return $data['name'];
        }

        $firstName = $data['first_name'] ?? '';
        $lastName = $data['last_name'] ?? '';
        $fullName = trim("$firstName $lastName");

        return $fullName !== '' ? $fullName : 'Unknown';
    }

    private function restoreSoftDeletedRecord(string $type, int $id): void
    {
        $modelClass = self::ARCHIVABLE_MODELS[$type] ?? null;

        if (! $modelClass) {
            abort(404, 'Invalid archive type.');
        }

        /** @var Teacher|Admin|Student|Subject|Room $record */
        $record = $modelClass::onlyTrashed()->findOrFail($id);

        $record->purged_at = null;
        $record->save();

        if ($type === 'teacher') {
            /** @var Teacher $record */
            $record->restore();
            // Grades remain untouched by design.
            return;
        }

        $record->restore();
    }

    private function restoreLegacyArchive(int $id): void
    {
        $archive = Archive::findOrFail($id);
        $data = $archive->data;
        $type = $archive->archivable_type;

        match ($type) {
            Teacher::class => $this->restoreLegacyTeacher($data),
            Admin::class => $this->restoreLegacyAdmin($data),
            Student::class => $this->restoreLegacyStudent($data),
            Subject::class => Subject::create([
                'code' => $data['code'],
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'grade_level_id' => $data['grade_level_id'],
            ]),
            Room::class => Room::create([
                'room_name' => $data['room_name'] ?? $data['room_number'] ?? '',
                'capacity' => $data['capacity'],
                'status' => $data['status'] ?? 'Active',
            ]),
            default => abort(422, 'Unsupported legacy archive type.'),
        };

        $archive->delete();
    }

    private function restoreLegacyTeacher(array $data): void
    {
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'role' => 'teacher',
            'password_changed' => false,
        ]);

        Teacher::create([
            'user_id' => $user->id,
            'name' => $data['name'],
            'employee_number' => $data['employee_number'],
            'subject' => $data['subject'],
            'position' => $data['position'],
            'phone' => $data['phone'] ?? null,
            'address' => $data['address'] ?? null,
        ]);
    }

    private function restoreLegacyAdmin(array $data): void
    {
        $user = User::create([
            'name' => ($data['first_name'] ?? '') . ' ' . ($data['last_name'] ?? ''),
            'email' => $data['email'],
            'password' => $data['password'],
            'role' => 'admin',
            'password_changed' => true,
        ]);

        Admin::create([
            'user_id' => $user->id,
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'position' => $data['position'],
            'role' => $data['role'] ?? 'Admin',
        ]);
    }

    private function restoreLegacyStudent(array $data): void
    {
        $user = User::create([
            'name' => ($data['first_name'] ?? '') . ' ' . ($data['last_name'] ?? ''),
            'email' => $data['email'],
            'password' => $data['password'],
            'role' => 'student',
            'password_changed' => false,
        ]);

        Student::create([
            'user_id' => $user->id,
            'lrn' => $data['lrn'],
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'middle_name' => $data['middle_name'] ?? null,
            'birth_date' => $data['date_of_birth'] ?? $data['birth_date'] ?? null,
            'gender' => $data['gender'] ?? null,
            'current_section_id' => $data['current_section_id'] ?? null,
            'school_year' => $data['school_year'] ?? null,
        ]);
    }

    private function forceDeleteSoftDeletedRecord(string $type, int $id): void
    {
        $modelClass = self::ARCHIVABLE_MODELS[$type] ?? null;

        if (! $modelClass) {
            abort(404, 'Invalid archive type.');
        }

        if ($type === 'teacher') {
            $this->forceDeleteTeacher($id);

            return;
        }

        /** @var Admin|Student|Subject|Room $record */
        $record = $modelClass::onlyTrashed()->findOrFail($id);
        $record->forceDelete();
    }

    private function forceDeleteTeacher(int $id): void
    {
        /** @var Teacher $teacher */
        $teacher = Teacher::onlyTrashed()->with(['user' => fn ($q) => $q->withTrashed()])->findOrFail($id);
        $hasAcademicRecords = $teacher->hasAcademicRecords();

        $teacher->teacherSubjectRecords()->onlyTrashed()->get()->each->forceDelete();
        $teacher->schedules()->onlyTrashed()->get()->each->forceDelete();
        $teacher->adviserSections()->onlyTrashed()->get()->each->forceDelete();

        if ($teacher->profilePicture()->withTrashed()->exists()) {
            $teacher->profilePicture()->withTrashed()->first()?->forceDelete();
        }

        if ($teacher->user) {
            $teacher->user->markDeletingFromCascade()->forceDelete();
            $teacher->user_id = null;
            $teacher->save();
        }

        if ($hasAcademicRecords) {
            // Preserve teacher row and grade FK references for academic history.
            $teacher->purged_at = now();
            $teacher->save();

            return;
        }

        $teacher->forceDelete();
    }
}
