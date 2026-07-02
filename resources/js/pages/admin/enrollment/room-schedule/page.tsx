import { Head, router } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Pagination } from '@/components/pagination'
import { ChevronRight as ViewIcon, Search } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

type Room = {
    id: number
    room_name: string
    capacity: number
    schedules_count: number
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
    filters?: { search?: string }
}

export default function RoomSchedule({ auth, rooms, filters = {} }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '')
    const [perPage, setPerPage] = useState(rooms.per_page || 10)

    // Guards the search effect below from firing on mount (including
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
            router.get('/admin/enrollment/room-schedule', {
                search: searchTerm || undefined,
                per_page: perPage,
            }, { preserveState: true, preserveScroll: true, replace: true })
        }, 300)
        return () => clearTimeout(timer)
    }, [searchTerm, perPage])

    const handleRoomClick = (roomId: number) => {
        router.visit(`/admin/enrollment/room-schedule/${roomId}`)
    }

    const handlePageChange = (url: string | null) => {
        // preserveState is required here so the component instance (and its
        // isFirstRender ref) survives the navigation instead of remounting,
        // which previously caused the search effect above to re-fire and
        // silently strip the `page` param, sending the user back to page 1.
        if (url) router.visit(url, { preserveScroll: true, preserveState: true })
    }

    return (
        <AdminLayout user={auth?.user} admin={auth?.admin}>
            <Head title="Room Schedule" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Room Schedule</h1>
                    <p className="text-sm text-gray-500 mt-1">View and manage room schedules</p>
                </div>

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

                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-green-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Room Number</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Capacity</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Schedules</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {rooms.data.length > 0 ? (
                                    rooms.data.map((room) => (
                                        <tr key={room.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{room.room_name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{room.capacity} students</td>
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
                                            {rooms.total === 0
                                                ? 'No rooms found. Add rooms in Room Listings to see them here.'
                                                : 'No rooms match your search.'}
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