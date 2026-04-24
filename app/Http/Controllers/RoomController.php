<?php

namespace App\Http\Controllers;

use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class RoomController extends Controller
{
    public function index()
    {
        $rooms = Room::withCount([
            'sections as students_count' => function ($query) {
                $query->join('tbl_students', 'tbl_class_sections.id', '=', 'tbl_students.current_section_id');
            }
        ])->orderBy('room_number')->get();
        
        $admin = \App\Models\Admin::where('user_id', Auth::id())->first();
        
        return Inertia::render('admin/enrollment/room-listings/page', [
            'rooms' => $rooms,
            'auth' => [
                'user' => Auth::user(),
                'admin' => $admin,
            ],
        ]);
    }

    public function checkRoomNumber(Request $request)
    {
        $roomNumber = $request->input('room_number');
        $roomId = $request->input('room_id'); // For edit mode
        
        $query = Room::where('room_number', $roomNumber);
        
        // Exclude current room when editing
        if ($roomId) {
            $query->where('id', '!=', $roomId);
        }
        
        $exists = $query->exists();
        
        return response()->json([
            'available' => !$exists,
            'message' => $exists ? 'This room number is already taken.' : 'Room number is available.'
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'room_number' => 'required|string|unique:tbl_room,room_number',
            'capacity' => 'required|integer|min:1',
            'status' => 'required|in:Active,In Construction,Maintenance'
        ]);

        Room::create($validated);

        return redirect()->route('admin.enrollment.room-listings')->with('success', 'Room created successfully');
    }

    public function update(Request $request, $id)
    {
        $room = Room::findOrFail($id);

        $validated = $request->validate([
            'room_number' => 'required|string|unique:tbl_room,room_number,' . $id,
            'capacity' => 'required|integer|min:1',
            'status' => 'required|in:Active,In Construction,Maintenance'
        ]);

        $room->update($validated);

        return redirect()->route('admin.enrollment.room-listings')->with('success', 'Room updated successfully');
    }

    public function destroy($id)
    {
        $room = Room::findOrFail($id);
        
        // Archive the room before deletion
        \App\Models\Archive::create([
            'archivable_type' => Room::class,
            'archivable_id' => $room->id,
            'data' => json_encode([
                'room_number' => $room->room_number,
                'capacity' => $room->capacity,
                'status' => $room->status,
            ]),
            'archived_by' => Auth::id(),
        ]);
        
        $room->delete();

        return redirect()->back()->with('success', 'Room deleted successfully');
    }
}
