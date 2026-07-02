<?php

namespace App\Http\Controllers;

use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class RoomController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search', '');
        $capacity = $request->input('capacity');
        $status = $request->input('status', 'All');
        $perPage = (int) $request->input('per_page', 10);

        $rooms = Room::withCount([
            'sections as students_count' => function ($query) {
                $query->join('tbl_students', 'tbl_class_sections.id', '=', 'tbl_students.current_section_id');
            }
        ])
            ->when($search, fn($q) => $q->where('room_name', 'like', "%{$search}%"))
            ->when($capacity, fn($q) => $q->where('capacity', $capacity))
            ->when($status && $status !== 'All', fn($q) => $q->where('status', $status))
            ->orderBy('room_name')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('admin/enrollment/room-listings/page', [
            'rooms' => $rooms,
            'filters' => [
                'search' => $search,
                'capacity' => $capacity,
                'status' => $status,
            ],
        ]);
    }

    public function checkRoomNumber(Request $request)
    {
        $roomNumber = $request->input('room_name');
        $roomId = $request->input('room_id');

        $query = Room::where('room_name', $roomNumber);

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
            'room_name' => 'required|string|unique:tbl_room,room_name',
            'capacity' => 'required|integer|min:1',
            'status' => 'required|in:Available,Vacant,Occupied',
        ]);

        Room::create($validated);

        return redirect()->route('admin.enrollment.room-listings')->with('success', 'Room created successfully');
    }

    public function update(Request $request, $id)
    {
        $room = Room::findOrFail($id);

        $validated = $request->validate([
            'room_name' => 'required|string|unique:tbl_room,room_name,' . $id,
            'capacity' => 'required|integer|min:1',
            'status' => 'required|in:Available,Vacant,Occupied',
        ]);

        $room->update($validated);

        return redirect()->route('admin.enrollment.room-listings')->with('success', 'Room updated successfully');
    }

    public function destroy($id)
    {
        $room = Room::findOrFail($id);

        \App\Models\Archive::create([
            'archivable_type' => Room::class,
            'archivable_id' => $room->id,
            'data' => json_encode([
                'room_name' => $room->room_name,
                'capacity' => $room->capacity,
                'status' => $room->status,
            ]),
            'archived_by' => Auth::id(),
        ]);

        $room->delete();

        return redirect()->back()->with('success', 'Room deleted successfully');
    }
}