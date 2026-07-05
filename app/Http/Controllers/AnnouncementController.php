<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\Teacher;
use App\Models\ClassSection;
use App\Models\Subject;
use App\Models\User;
use App\Models\Notification;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AnnouncementController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $teacher = Teacher::where('user_id', $user->id)->first();

        if (!$teacher) {
            return redirect()->back()->withErrors(['error' => 'Teacher profile not found.']);
        }

        // Get teacher's announcements with relationships
        $announcements = Announcement::with(['teacher.user', 'section.gradeLevel', 'subject'])
            ->where('teacher_id', $teacher->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($announcement) {
                $sectionName = 'N/A';
                $gradeLevelId = null;

                if ($announcement->section) {
                    $gradeLevel = $announcement->section->gradeLevel ? $announcement->section->gradeLevel->name : 'N/A';
                    $sectionName = $gradeLevel . ' - ' . $announcement->section->section_name;
                    $gradeLevelId = $announcement->section->grade_level_id;
                }

                $subjectName = $announcement->subject ? $announcement->subject->name : 'N/A';
                if ($announcement->subject && $announcement->subject->code) {
                    $subjectName .= ' (' . $announcement->subject->code . ')';
                }

                return [
                    'id' => $announcement->id,
                    'title' => $announcement->title,
                    'content' => $announcement->content,
                    'is_active' => $announcement->is_active,
                    'section_name' => $sectionName,
                    'subject_name' => $subjectName,
                    // IDs needed so the Edit dialog can restore the original
                    // grade level / section / subject selection instead of
                    // resetting them to blank.
                    'grade_level_id' => $gradeLevelId,
                    'section_id' => $announcement->section_id,
                    'subject_id' => $announcement->subject_id,
                    'created_at' => $announcement->created_at->format('M d, Y h:i A'),
                ];
            });

        // Get the sections this teacher actually teaches in, via their
        // schedule assignments — not ClassSection.teacher_id, which is the
        // section's homeroom/adviser teacher and misses regular subject
        // teachers entirely. This mirrors classList()/finalReport() elsewhere
        // in TeacherController.
        $sections = DB::table('tbl_schedules')
            ->join('tbl_class_sections', 'tbl_schedules.class_section_id', '=', 'tbl_class_sections.id')
            ->leftJoin('tbl_grade_levels', 'tbl_class_sections.grade_level_id', '=', 'tbl_grade_levels.id')
            ->where('tbl_schedules.teacher_id', $teacher->id)
            ->select(
                'tbl_class_sections.id',
                'tbl_class_sections.section_name',
                'tbl_class_sections.grade_level_id',
                'tbl_grade_levels.name as grade_level_name'
            )
            ->distinct()
            ->get()
            ->map(function ($section) {
                return [
                    'id' => $section->id,
                    'section_name' => $section->section_name,
                    'grade_level_id' => $section->grade_level_id,
                    'grade_level_name' => $section->grade_level_name ?? 'N/A',
                ];
            });

        // Get unique grade levels from sections
        $gradeLevels = $sections->unique('grade_level_id')->map(function ($section) {
            return [
                'id' => $section['grade_level_id'],
                'name' => $section['grade_level_name'],
            ];
        })->values();

        // Get all subjects that the teacher is assigned to with their grade levels
        $subjects = $teacher->subjects()
            ->with('gradeLevel')
            ->get()
            ->map(function ($subject) {
                return [
                    'id' => $subject->id,
                    'name' => $subject->name,
                    'code' => $subject->code ?? '',
                    'grade_level_id' => $subject->grade_level_id,
                    'display_name' => $subject->name . ($subject->code ? ' (' . $subject->code . ')' : ''),
                ];
            });

        return Inertia::render('teacher/announcements/page', [
            'announcements' => $announcements,
            'sections' => $sections,
            'subjects' => $subjects,
            'gradeLevels' => $gradeLevels,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'section_id' => 'required|exists:tbl_class_sections,id',
            'subject_id' => 'required|exists:tbl_subjects,id',
        ]);

        $user = Auth::user();
        $teacher = Teacher::where('user_id', $user->id)->first();

        if (!$teacher) {
            return redirect()->back()->withErrors(['error' => 'Teacher profile not found.']);
        }

        $announcement = Announcement::create([
            'title' => $validated['title'],
            'content' => $validated['content'],
            'created_by' => $user->id,
            'teacher_id' => $teacher->id,
            'section_id' => $validated['section_id'],
            'subject_id' => $validated['subject_id'],
        ]);

        // Create notifications for targeted students
        $this->createNotificationsForStudents($announcement);

        return redirect()->back()->with('success', 'Announcement created successfully!');
    }

    public function update(Request $request, Announcement $announcement)
    {
        $user = Auth::user();
        $teacher = Teacher::where('user_id', $user->id)->first();

        // Only the creator teacher can edit
        if (!$teacher || $announcement->teacher_id !== $teacher->id) {
            return redirect()->back()->withErrors(['error' => 'Cannot edit this announcement.']);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'section_id' => 'required|exists:tbl_class_sections,id',
            'subject_id' => 'required|exists:tbl_subjects,id',
        ]);

        $announcement->update([
            'title' => $validated['title'],
            'content' => $validated['content'],
            'section_id' => $validated['section_id'],
            'subject_id' => $validated['subject_id'],
        ]);

        return redirect()->back()->with('success', 'Announcement updated successfully!');
    }

    public function destroy(Announcement $announcement)
    {
        $user = Auth::user();
        $teacher = Teacher::where('user_id', $user->id)->first();

        // Only the creator teacher can delete
        if (!$teacher || $announcement->teacher_id !== $teacher->id) {
            return redirect()->back()->withErrors(['error' => 'Unauthorized action.']);
        }

        $announcement->delete();

        return redirect()->back()->with('success', 'Announcement deleted successfully!');
    }

    public function toggleActive(Announcement $announcement)
    {
        $user = Auth::user();
        $teacher = Teacher::where('user_id', $user->id)->first();

        // Only the creator teacher can toggle
        if (!$teacher || $announcement->teacher_id !== $teacher->id) {
            return redirect()->back()->withErrors(['error' => 'Unauthorized action.']);
        }

        $announcement->update([
            'is_active' => !$announcement->is_active,
        ]);

        return redirect()->back()->with('success', 'Announcement ' . ($announcement->is_active ? 'activated' : 'deactivated') . ' successfully!');
    }

    // Get active announcements for dashboard - filtered by student's section/subject if applicable
    public function getApproved()
    {
        $user = Auth::user();

        // If student, filter by their section
        if ($user->role === 'student') {
            $student = Student::where('user_id', $user->id)->first();

            if ($student) {
                $announcements = Announcement::active()
                    ->with(['teacher.user', 'section', 'subject'])
                    ->where(function ($query) use ($student) {
                        // Announcements for all sections/subjects
                        $query->where(function ($q) {
                            $q->whereNull('section_id')->whereNull('subject_id');
                        })
                        // Or announcements for student's section (any subject)
                        ->orWhere(function ($q) use ($student) {
                            $q->where('section_id', $student->current_section_id)->whereNull('subject_id');
                        })
                        // Or announcements for student's section and a specific subject
                        ->orWhere(function ($q) use ($student) {
                            $q->where('section_id', $student->current_section_id)->whereNotNull('subject_id');
                        })
                        // Or announcements for specific subject (any section)
                        ->orWhere(function ($q) {
                            $q->whereNull('section_id')->whereNotNull('subject_id');
                        });
                    })
                    ->orderBy('created_at', 'desc')
                    ->limit(10)
                    ->get();
            } else {
                $announcements = collect();
            }
        } else {
            // For teachers and admins, show all active announcements
            $announcements = Announcement::active()
                ->with(['teacher.user', 'section', 'subject'])
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();
        }

        $announcements = $announcements->map(function ($announcement) {
            return [
                'id' => $announcement->id,
                'title' => $announcement->title,
                'content' => $announcement->content,
                'created_by' => $announcement->teacher->user->name ?? 'Unknown',
                'section_name' => $announcement->section ? $announcement->section->section_name : null,
                'subject_name' => $announcement->subject ? $announcement->subject->name : null,
                'created_at' => $announcement->created_at->format('M d, Y'),
            ];
        });

        return response()->json($announcements);
    }

    /**
     * Create notifications for students based on section and subject targeting
     */
    private function createNotificationsForStudents(Announcement $announcement)
    {
        $studentsQuery = Student::query();

        // Filter by section if specified
        if ($announcement->section_id) {
            $studentsQuery->where('current_section_id', $announcement->section_id);
        }

        // If subject is specified, we still notify all students in the section
        // Teachers can specify both section and subject for context

        $students = $studentsQuery->get();
        $notifications = [];

        foreach ($students as $student) {
            if ($student->user_id) {
                $notifications[] = [
                    'user_id' => $student->user_id,
                    'type' => 'announcement',
                    'title' => 'New Announcement',
                    'message' => $announcement->title,
                    'announcement_id' => $announcement->id,
                    'is_read' => false,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        // If no section specified, notify all students
        if (!$announcement->section_id && count($notifications) === 0) {
            $allStudents = Student::all();
            foreach ($allStudents as $student) {
                if ($student->user_id) {
                    $notifications[] = [
                        'user_id' => $student->user_id,
                        'type' => 'announcement',
                        'title' => 'New Announcement',
                        'message' => $announcement->title,
                        'announcement_id' => $announcement->id,
                        'is_read' => false,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
            }
        }

        // Bulk insert for better performance
        if (count($notifications) > 0) {
            Notification::insert($notifications);
        }
    }
}