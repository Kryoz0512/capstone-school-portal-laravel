import { Head } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AddRoomModal from '@/components/modals/add-room-modal'
import EditRoomModal from '@/components/modals/edit-room-modal'
import DeleteRoomModal from '@/components/modals/delete-room-modal'
import { Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'

type Room = {
    id: number
    room_number: string
    capacity: number
    status: 'Active' | 'Maintenance'
}

type Props = {
    auth?: {
        user: {
            id: number
            name: string
            email: string
            role: string
        }
    }
    rooms?: Room[]
}

export default function RoomListings({ auth, rooms = [] }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
    const [roomToDelete, setRoomToDelete] = useState<{ id: number; room_number: string } | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [capacityFilter, setCapacityFilter] = useState('All')
    const [statusFilter, setStatusFilter] = useState('All')

    const filteredRooms = rooms.filter(room => {
        const matchesSearch = room.room_number.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCapacity = capacityFilter === 'All' || room.capacity.toString() === capacityFilter
        const matchesStatus = statusFilter === 'All' || room.status === statusFilter
        return matchesSearch && matchesCapacity && matchesStatus
    })

    const handleEdit = (room: Room) => {
        setSelectedRoom(room)
        setIsEditModalOpen(true)
    }

    const handleDelete = (room: Room) => {
        setRoomToDelete({ id: room.id, room_number: room.room_number })
        setIsDeleteModalOpen(true)
    }

    return (
        <AdminLayout user={auth?.user}>
            <Head title="Room Listings" />

            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Room Listings</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Search and filter available rooms
                        </p>
                    </div>
                    <Button 
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => setIsModalOpen(true)}
                    >
                        + Add Room
                    </Button>
                </div>

                <AddRoomModal open={isModalOpen} onOpenChange={setIsModalOpen} />
                <EditRoomModal open={isEditModalOpen} onOpenChange={setIsEditModalOpen} room={selectedRoom} />
                <DeleteRoomModal 
                    open={isDeleteModalOpen} 
                    onOpenChange={setIsDeleteModalOpen} 
                    roomId={roomToDelete?.id || null}
                    roomNumber={roomToDelete?.room_number || ''}
                />

                {/* Filters Section */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-sm font-semibold text-gray-900 mb-4">Filters</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Search by Room Number
                            </label>
                            <Input
                                type="text"
                                placeholder="Enter room number..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Capacity
                            </label>
                            <Select value={capacityFilter} onValueChange={setCapacityFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All">All</SelectItem>
                                    <SelectItem value="40">40</SelectItem>
                                    <SelectItem value="45">45</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All">All</SelectItem>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Rooms Table Section */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                        <h2 className="text-sm font-semibold text-gray-900">Rooms</h2>
                    </div>

                    <div className="p-4 border-b border-gray-200">
                        <p className="text-sm text-gray-600">
                            {filteredRooms.length > 0 
                                ? `Showing 1 to ${filteredRooms.length} of ${filteredRooms.length} entries`
                                : 'No rooms found'
                            }
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                                        Room Number
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                                        Capacity
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredRooms.length > 0 ? (
                                    filteredRooms.map((room) => (
                                        <tr key={room.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {room.room_number}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {room.capacity}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                                        room.status === 'Active'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-cyan-100 text-cyan-800'
                                                    }`}
                                                >
                                                    {room.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        className="text-gray-600 hover:text-green-600"
                                                        onClick={() => handleEdit(room)}
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        className="text-gray-600 hover:text-red-600"
                                                        onClick={() => handleDelete(room)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                                            No rooms available. Click "+ Add Room" to create one.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
