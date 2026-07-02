import { Head, router } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AddRoomModal from '@/components/modals/add-room-modal'
import EditRoomModal from '@/components/modals/edit-room-modal'
import DeleteRoomModal from '@/components/modals/delete-room-modal'
import { Pagination } from '@/components/pagination'
import { Pencil, Trash2 } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

type Room = {
    id: number
    room_name: string
    capacity: number
    status: 'Available' | 'Vacant' | 'Occupied'
    students_count: number
}

type PaginationLink = { url: string | null; label: string; active: boolean }

type Props = {
    auth?: {
        user: { id: number; name: string; email: string; role: string }
        admin?: { role: string; position: string }
    }
    rooms: {
        data: Room[]
        current_page: number
        last_page: number
        per_page: number
        total: number
        links: PaginationLink[]
    }
    filters?: { search?: string; capacity?: string; status?: string }
}

export default function RoomListings({ auth, rooms, filters = {} }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
    const [roomToDelete, setRoomToDelete] = useState<{ id: number; room_name: string } | null>(null)

    const [searchTerm, setSearchTerm] = useState(filters.search || '')
    const [capacityFilter, setCapacityFilter] = useState(filters.capacity || '')
    const [statusFilter, setStatusFilter] = useState(filters.status || 'All')
    const [perPage, setPerPage] = useState(rooms.per_page || 10)

    // Guards the filters effect below from firing on mount (including
    // remounts triggered by pagination navigation). Without this, paginating
    // to page 2+ would trigger a re-request with no `page` param, bouncing
    // the user back to page 1.
    const isFirstRender = useRef(true)

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false
            return
        }

        const timer = setTimeout(() => {
            router.get('/admin/enrollment/room-listings', {
                search: searchTerm || undefined,
                capacity: capacityFilter || undefined,
                status: statusFilter !== 'All' ? statusFilter : undefined,
                per_page: perPage,
            }, { preserveState: true, preserveScroll: true, replace: true })
        }, 300)
        return () => clearTimeout(timer)
    }, [searchTerm, capacityFilter, statusFilter, perPage])

    const handleEdit = (room: Room) => {
        setSelectedRoom(room)
        setIsEditModalOpen(true)
    }

    const handleDelete = (room: Room) => {
        setRoomToDelete({ id: room.id, room_name: room.room_name })
        setIsDeleteModalOpen(true)
    }

    const handlePageChange = (url: string | null) => {
        // preserveState is required here so the component instance (and its
        // isFirstRender ref) survives the navigation instead of remounting,
        // which previously caused the filters effect above to re-fire and
        // silently strip the `page` param, sending the user back to page 1.
        if (url) router.visit(url, { preserveScroll: true, preserveState: true })
    }

    return (
        <AdminLayout user={auth?.user} admin={auth?.admin}>
            <Head title="Room Listings" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Room Listings</h1>
                        <p className="text-sm text-gray-500 mt-1">Search and filter available rooms</p>
                    </div>
                    <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => setIsModalOpen(true)}>
                        + Add Room
                    </Button>
                </div>

                <AddRoomModal open={isModalOpen} onOpenChange={setIsModalOpen} />
                <EditRoomModal open={isEditModalOpen} onOpenChange={setIsEditModalOpen} room={selectedRoom} />
                <DeleteRoomModal
                    open={isDeleteModalOpen}
                    onOpenChange={setIsDeleteModalOpen}
                    roomId={roomToDelete?.id || null}
                    roomNumber={roomToDelete?.room_name || ''}
                />

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-sm font-semibold text-gray-900 mb-4">Filters</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Search by Room Name</label>
                            <Input
                                type="text"
                                placeholder="Enter room name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
                            <Input
                                type="number"
                                placeholder="Enter capacity..."
                                value={capacityFilter}
                                onChange={(e) => setCapacityFilter(e.target.value)}
                                min="1"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
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

                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-green-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Room Name</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Capacity</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Students</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {rooms.data.length > 0 ? (
                                    rooms.data.map((room) => (
                                        <tr key={room.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-900">{room.room_name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{room.capacity}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{room.students_count || 0}</td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                                        room.status === 'Available'
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
                                                    <button className="text-gray-600 hover:text-green-600" onClick={() => handleEdit(room)}>
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button className="text-gray-600 hover:text-red-600" onClick={() => handleDelete(room)}>
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
                                                : 'No rooms available. Click "+ Add Room" to create one.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {rooms.data.length > 0 && (
                        <Pagination
                            currentPage={rooms.current_page}
                            lastPage={rooms.last_page}
                            perPage={rooms.per_page}
                            total={rooms.total}
                            links={rooms.links}
                            onPageChange={handlePageChange}
                            onPerPageChange={setPerPage}
                        />
                    )}
                </div>
            </div>
        </AdminLayout>
    )
}