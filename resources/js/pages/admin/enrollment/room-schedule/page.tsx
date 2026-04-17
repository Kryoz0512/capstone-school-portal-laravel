import { Head, router } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronLeft, ChevronRight, ChevronRight as ViewIcon, Search } from 'lucide-react'
import { useState, useMemo } from 'react'

type Room = {
    id: number
    room_number: string
    capacity: number
    schedules_count: number
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

export default function RoomSchedule({ auth, rooms = [] }: Props) {
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)

    // Filter rooms
    const filteredRooms = useMemo(() => {
        return rooms.filter(room =>
            room.room_number.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [rooms, searchTerm])

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
    }, [itemsPerPage, searchTerm])

    const handleRoomClick = (roomId: number) => {
        router.visit(`/admin/enrollment/room-schedule/${roomId}`)
    }

    return (
        <AdminLayout user={auth?.user} admin={auth?.admin}>
            <Head title="Room Schedule" />

            <div className="space-y-6">
                {/* Page Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Room Schedule</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        View and manage room schedules
                    </p>
                </div>

                {/* Search Section */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            type="text"
                            placeholder="Search by room number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Table Section */}
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
                                        Schedules
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {paginatedRooms.length > 0 ? (
                                    paginatedRooms.map((room) => (
                                        <tr key={room.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                {room.room_number}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {room.capacity} students
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {room.schedules_count} schedule{room.schedules_count !== 1 ? 's' : ''}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRoomClick(room.id)}
                                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                >
                                                    View Schedules
                                                    <ViewIcon className="w-4 h-4 ml-1" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                                            {rooms.length === 0 
                                                ? 'No rooms found. Add rooms in Room Listings to see them here.'
                                                : 'No rooms match your search.'
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
