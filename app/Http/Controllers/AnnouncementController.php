<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AnnouncementController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $admin = Admin::where('user_id', $user->id)->first();
        $isSuperAdmin = $admin && $admin->role === 'Super Admin';

        // Super Admin sees all announcements, Regular Admin sees only their own
        $announcements = Announcement::with(['creator.admin', 'approver.admin'])
            ->when(!$isSuperAdmin, function ($query) use ($user) {
                return $query->where('created_by', $user->id);
            })
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($announcement) {
                return [
                    'id' => $announcement->id,
                    'title' => $announcement->title,
                    'content' => $announcement->content,
                    'status' => $announcement->status,
                    'is_active' => $announcement->is_active,
                    'created_by' => $announcement->creator->name,
                    'created_by_role' => $announcement->creator->admin->role ?? 'Admin',
                    'approved_by' => $announcement->approver ? $announcement->approver->name : null,
                    'approved_by_role' => $announcement->approver && $announcement->approver->admin ? $announcement->approver->admin->role : null,
                    'approved_at' => $announcement->approved_at ? $announcement->approved_at->format('M d, Y h:i A') : null,
                    'rejection_reason' => $announcement->rejection_reason,
                    'created_at' => $announcement->created_at->format('M d, Y h:i A'),
                ];
            });

        // Count pending announcements for Super Admin
        $pendingCount = $isSuperAdmin ? Announcement::pending()->count() : 0;

        return Inertia::render('admin/maintenance/announcements/page', [
            'announcements' => $announcements,
            'isSuperAdmin' => $isSuperAdmin,
            'pendingCount' => $pendingCount,
            'auth' => [
                'user' => $user,
                'admin' => $admin ? [
                    'role' => $admin->role,
                    'position' => $admin->position,
                ] : null,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        $user = Auth::user();
        $admin = Admin::where('user_id', $user->id)->first();
        $isSuperAdmin = $admin && $admin->role === 'Super Admin';

        // Super Admin announcements are auto-approved
        $status = $isSuperAdmin ? 'approved' : 'pending';
        $approvedBy = $isSuperAdmin ? $user->id : null;
        $approvedAt = $isSuperAdmin ? now() : null;

        Announcement::create([
            'title' => $validated['title'],
            'content' => $validated['content'],
            'status' => $status,
            'created_by' => $user->id,
            'approved_by' => $approvedBy,
            'approved_at' => $approvedAt,
        ]);

        return redirect()->back()->with('success', $isSuperAdmin 
            ? 'Announcement created and published successfully!' 
            : 'Announcement created and pending approval.');
    }

    public function update(Request $request, Announcement $announcement)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        // Only creator can edit, and only if pending
        if ($announcement->created_by !== Auth::id() || $announcement->status !== 'pending') {
            return redirect()->back()->withErrors(['error' => 'Cannot edit this announcement.']);
        }

        $announcement->update([
            'title' => $validated['title'],
            'content' => $validated['content'],
        ]);

        return redirect()->back()->with('success', 'Announcement updated successfully!');
    }

    public function destroy(Announcement $announcement)
    {
        $user = Auth::user();
        $admin = Admin::where('user_id', $user->id)->first();
        $isSuperAdmin = $admin && $admin->role === 'Super Admin';

        // Only creator or Super Admin can delete
        if ($announcement->created_by !== $user->id && !$isSuperAdmin) {
            return redirect()->back()->withErrors(['error' => 'Unauthorized action.']);
        }

        $announcement->delete();

        return redirect()->back()->with('success', 'Announcement deleted successfully!');
    }

    public function approve(Announcement $announcement)
    {
        $user = Auth::user();
        $admin = Admin::where('user_id', $user->id)->first();

        if (!$admin || $admin->role !== 'Super Admin') {
            return redirect()->back()->withErrors(['error' => 'Unauthorized action.']);
        }

        $announcement->update([
            'status' => 'approved',
            'approved_by' => $user->id,
            'approved_at' => now(),
            'rejection_reason' => null,
        ]);

        return redirect()->back()->with('success', 'Announcement approved and published!');
    }

    public function reject(Request $request, Announcement $announcement)
    {
        $user = Auth::user();
        $admin = Admin::where('user_id', $user->id)->first();

        if (!$admin || $admin->role !== 'Super Admin') {
            return redirect()->back()->withErrors(['error' => 'Unauthorized action.']);
        }

        $validated = $request->validate([
            'rejection_reason' => 'required|string',
        ]);

        $announcement->update([
            'status' => 'rejected',
            'rejection_reason' => $validated['rejection_reason'],
        ]);

        return redirect()->back()->with('success', 'Announcement rejected.');
    }

    public function toggleActive(Announcement $announcement)
    {
        $user = Auth::user();
        $admin = Admin::where('user_id', $user->id)->first();
        $isSuperAdmin = $admin && $admin->role === 'Super Admin';

        // Only Super Admin or creator (if approved) can toggle
        if (!$isSuperAdmin && $announcement->created_by !== $user->id) {
            return redirect()->back()->withErrors(['error' => 'Unauthorized action.']);
        }

        if ($announcement->status !== 'approved') {
            return redirect()->back()->withErrors(['error' => 'Only approved announcements can be toggled.']);
        }

        $announcement->update([
            'is_active' => !$announcement->is_active,
        ]);

        return redirect()->back()->with('success', 'Announcement ' . ($announcement->is_active ? 'activated' : 'deactivated') . ' successfully!');
    }

    // Get approved announcements for dashboard
    public function getApproved()
    {
        $announcements = Announcement::approved()
            ->with(['creator.admin'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($announcement) {
                return [
                    'id' => $announcement->id,
                    'title' => $announcement->title,
                    'content' => $announcement->content,
                    'created_by' => $announcement->creator->name,
                    'created_at' => $announcement->created_at->format('M d, Y'),
                ];
            });

        return response()->json($announcements);
    }
}
