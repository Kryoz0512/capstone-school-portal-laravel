<?php

namespace Database\Seeders;

use App\Models\Room;
use Illuminate\Database\Seeder;

class RoomSeeder extends Seeder
{
    public function run(): void
    {
        $rooms = [
            ['room_name' => 'Room 101', 'capacity' => 55, 'status' => 'Available'],
            ['room_name' => 'Room 102', 'capacity' => 55, 'status' => 'Available'],
            ['room_name' => 'Room 103', 'capacity' => 55, 'status' => 'Available'],
            ['room_name' => 'Room 104', 'capacity' => 55, 'status' => 'Available'],
            ['room_name' => 'Room 201', 'capacity' => 55, 'status' => 'Available'],
            ['room_name' => 'Room 202', 'capacity' => 55, 'status' => 'Available'],
            ['room_name' => 'Room 203', 'capacity' => 55, 'status' => 'Available'],
            ['room_name' => 'Room 204', 'capacity' => 55, 'status' => 'Available'],
        ];

        foreach ($rooms as $room) {
            Room::firstOrCreate(['room_name' => $room['room_name']], $room);
        }

        $this->command?->info('Rooms seeded: ' . Room::count());
    }
}