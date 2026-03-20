<?php

namespace App\Http\Controllers;

use App\Models\Room;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoomController extends Controller
{
    public function index()
    {
        $rooms = Room::orderBy('room_number')->get();
        
        return Inertia::render('admin/enrollment/room-listings/page', [
            'rooms' => $rooms
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'room_number' => 'required|string|unique:tbl_room,room_number',
            'capacity' => 'required|integer|min:1',
            'status' => 'required|in:Active,Maintenance'
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
            'status' => 'required|in:Active,Maintenance'
        ]);

        $room->update($validated);

        return redirect()->route('admin.enrollment.room-listings')->with('success', 'Room updated successfully');
    }

    public function destroy($id)
    {
        $room = Room::findOrFail($id);
        $room->delete();

        return redirect()->back()->with('success', 'Room deleted successfully');
    }
}
