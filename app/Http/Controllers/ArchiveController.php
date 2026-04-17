<?php

namespace App\Http\Controllers;

use App\Models\Archive;
use App\Models\Teacher;
use App\Models\Admin;
use App\Models\Student;
use App\Models\Room;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class ArchiveController extends Controller
{
    public function index(Request $request)
    {
        $type = $request->input('type', 'all');
        
        $query = Archive::with('archivedBy');
        
        if ($type !== 'all') {
            $query->where('archivable_type', $type);
        }
        
        $archives = $query->orderBy('created_at', 'desc')->get()->map(function ($archive) {
            $data = is_array($archive->data) ? $archive->data : json_decode($archive->data, true);
            $type = class_basename($archive->archivable_type);
            
            // Determine the display name based on type
            $name = '';
            if ($type === 'Subject') {
                $code = $data['code'] ?? '';
                $subjectName = $data['name'] ?? '';
                $name = $code && $subjectName ? "$code - $subjectName" : ($subjectName ?: $code);
            } elseif ($type === 'Room') {
                $roomNumber = $data['room_number'] ?? '';
                $capacity = $data['capacity'] ?? '';
                $name = $roomNumber ? "Room $roomNumber (Capacity: $capacity)" : 'Unknown Room';
            } elseif (isset($data['name']) && !empty($data['name'])) {
                $name = $data['name'];
            } elseif (isset($data['first_name']) || isset($data['last_name'])) {
                $firstName = $data['first_name'] ?? '';
                $lastName = $data['last_name'] ?? '';
                $name = trim("$firstName $lastName");
            }
            
            if (empty($name)) {
                $name = 'Unknown';
            }
            
            return [
                'id' => $archive->id,
                'type' => $type,
                'name' => $name,
                'email' => $data['email'] ?? 'N/A',
                'archived_by' => $archive->archivedBy ? $archive->archivedBy->name : 'Unknown',
                'archived_at' => $archive->created_at->timezone('Asia/Manila')->format('M d, Y h:i A'),
                'reason' => $archive->reason,
                'data' => $data,
            ];
        });
        
        $admin = Admin::where('user_id', Auth::id())->first();

        return Inertia::render('admin/archive/page', [
            'archives' => $archives,
            'currentType' => $type,
            'auth' => [
                'user' => Auth::user(),
                'admin' => $admin,
            ]
        ]);
    }

    public function restore($id)
    {
        $archive = Archive::findOrFail($id);
        
        DB::beginTransaction();
        
        try {
            $data = $archive->data;
            $type = $archive->archivable_type;
            
            // Restore based on type
            if ($type === 'App\\Models\\Teacher') {
                $this->restoreTeacher($data);
            } elseif ($type === 'App\\Models\\Admin') {
                $this->restoreAdmin($data);
            } elseif ($type === 'App\\Models\\Student') {
                $this->restoreStudent($data);
            } elseif ($type === 'App\\Models\\Subject') {
                $this->restoreSubject($data);
            } elseif ($type === 'App\\Models\\Room') {
                $this->restoreRoom($data);
            }
            
            // Delete from archive
            $archive->delete();
            
            DB::commit();
            
            return redirect()->back()->with('success', 'Record restored successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to restore: ' . $e->getMessage()]);
        }
    }

    private function restoreTeacher($data)
    {
        // Restore user
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'role' => 'teacher',
            'password_changed' => false, // Force password change on first login after restore
        ]);
        
        // Restore teacher
        Teacher::create([
            'user_id' => $user->id,
            'name' => $data['name'],
            'employee_number' => $data['employee_number'],
            'subject' => $data['subject'],
            'position' => $data['position'],
            'phone' => $data['phone'] ?? null,
            'address' => $data['address'] ?? null,
            'updated_by' => Auth::id(),
        ]);
    }

    private function restoreAdmin($data)
    {
        // Restore user
        $user = User::create([
            'name' => $data['first_name'] . ' ' . $data['last_name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'role' => 'admin',
            'password_changed' => true, // Admins don't need to change password
        ]);
        
        // Restore admin
        Admin::create([
            'user_id' => $user->id,
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'position' => $data['position'],
            'role' => $data['role'] ?? 'Admin',
        ]);
    }

    private function restoreStudent($data)
    {
        // Restore user
        $user = User::create([
            'name' => $data['first_name'] . ' ' . $data['last_name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'role' => 'student',
            'password_changed' => false, // Force password change on first login after restore
        ]);
        
        // Restore student
        Student::create([
            'user_id' => $user->id,
            'lrn' => $data['lrn'],
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'middle_name' => $data['middle_name'] ?? null,
            'date_of_birth' => $data['date_of_birth'] ?? null,
            'gender' => $data['gender'] ?? null,
            'contact_number' => $data['contact_number'] ?? null,
            'current_section_id' => $data['current_section_id'] ?? null,
            'school_year' => $data['school_year'] ?? null,
        ]);
    }

    private function restoreSubject($data)
    {
        // Restore subject
        \App\Models\Subject::create([
            'code' => $data['code'],
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'grade_level_id' => $data['grade_level_id'],
        ]);
    }

    private function restoreRoom($data)
    {
        // Restore room
        Room::create([
            'room_number' => $data['room_number'],
            'capacity' => $data['capacity'],
            'status' => $data['status'] ?? 'Active',
        ]);
    }

    public function destroy($id)
    {
        $archive = Archive::findOrFail($id);
        $archive->delete();
        
        return redirect()->back()->with('success', 'Archive permanently deleted');
    }
}
