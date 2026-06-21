import { Head } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AddRoomModal from '@/components/modals/add-room-modal'
import EditRoomModal from '@/components/modals/edit-room-modal'
import DeleteRoomModal from '@/components/modals/delete-room-modal'
import { Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useMemo } from 'react'

type Room = {
    id: number
    room_number: string
    capacity: number
    status: 'Available' | 'Vacant' | 'Occupied'
    students_count: number
}

type Props = {
    auth?: {
        user: {
            id: number
            name: string
            email: string
            role: string
        }
        admin?: {
            role: string
            position: string
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
    const [capacityFilter, setCapacityFilter] = useState('')
    const [statusFilter, setStatusFilter] = useState('All')

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)

    const filteredRooms = rooms.filter(room => {
        const matchesSearch = room.room_number.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCapacity = capacityFilter === '' || room.capacity.toString() === capacityFilter
        const matchesStatus = statusFilter === 'All' || room.status === statusFilter
        return matchesSearch && matchesCapacity && matchesStatus
    })

    // Paginate filtered rooms
    const paginatedRooms = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        return filteredRooms.slice(startIndex, endIndex)
    }, [filteredRooms, currentPage, itemsPerPage])

    const totalPages = Math.ceil(filteredRooms.length / itemsPerPage)

    // Reset to page 1 when filters or itemsPerPage change
    useMemo(() => {
        setCurrentPage(1)
    }, [searchTerm, capacityFilter, statusFilter, itemsPerPage])

    const handleEdit = (room: Room) => {
        setSelectedRoom(room)
        setIsEditModalOpen(true)
    }

    const handleDelete = (room: Room) => {
        setRoomToDelete({ id: room.id, room_number: room.room_number })
        setIsDeleteModalOpen(true)
    }

    return (
        <AdminLayout user={auth?.user} admin={auth?.admin}>
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
                            <Input
                                type="number"
                                placeholder="Enter capacity..."
                                value={capacityFilter}
                                onChange={(e) => setCapacityFilter(e.target.value)}
                                min="1"
                            />
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
                                    <SelectItem value="Available">Available</SelectItem>
                                    <SelectItem value="Vacant">Vacant</SelectItem>
                                    <SelectItem value="Occupied">Occupied</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Rooms Table Section */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-green-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                                        Room Number
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                                        Capacity
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                                        Students
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {paginatedRooms.length > 0 ? (
                                    paginatedRooms.map((room) => (
                                        <tr key={room.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {room.room_number}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {room.capacity}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {room.students_count || 0}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${room.status === 'Available'
                                                            ? 'bg-green-100 text-green-800'
                                                            : room.status === 'Vacant'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : 'bg-red-100 text-red-800'
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
                                        <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                                            {searchTerm || capacityFilter !== '' || statusFilter !== 'All'
                                                ? 'No rooms found matching your filters.'
                                                : 'No rooms available. Click "+ Add Room" to create one.'
                                            }
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {filteredRooms.length > 0 && (
                        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">Show</span>
                                    <Select
                                        value={itemsPerPage.toString()}
                                        onValueChange={(value) => setItemsPerPage(Number(value))}
                                    >
                                        <SelectTrigger className="w-20">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="10">10</SelectItem>
                                            <SelectItem value="25">25</SelectItem>
                                            <SelectItem value="50">50</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <span className="text-sm text-gray-600">entries</span>
                                </div>
                                <p className="text-sm text-gray-600">
                                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredRooms.length)} of {filteredRooms.length} entries
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>

                                <div className="flex items-center gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                        // Show first page, last page, current page, and pages around current
                                        if (
                                            page === 1 ||
                                            page === totalPages ||
                                            (page >= currentPage - 1 && page <= currentPage + 1)
                                        ) {
                                            return (
                                                <Button
                                                    key={page}
                                                    variant={currentPage === page ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => setCurrentPage(page)}
                                                    className={currentPage === page ? "bg-green-600 hover:bg-green-700" : ""}
                                                >
                                                    {page}
                                                </Button>
                                            )
                                        } else if (
                                            page === currentPage - 2 ||
                                            page === currentPage + 2
                                        ) {
                                            return <span key={page} className="px-2">...</span>
                                        }
                                        return null
                                    })}
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    )
}
