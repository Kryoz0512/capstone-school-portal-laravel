import { Head, router } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useMemo } from 'react'

type Room = {
    id: number
    room_name: string
    capacity: number
}

type Schedule = {
    id: number
    room: string
    subject: string
    teacher: string
    day: string
    time: string
    section: string
    gradeLevel: string
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
    room: Room
    schedules: Schedule[]
}

export default function RoomScheduleShow({ auth, room, schedules = [] }: Props) {
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)

    // Paginate schedules
    const paginatedSchedules = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        return schedules.slice(startIndex, endIndex)
    }, [schedules, currentPage, itemsPerPage])

    const totalPages = Math.ceil(schedules.length / itemsPerPage)

    // Reset to page 1 when itemsPerPage changes
    useMemo(() => {
        setCurrentPage(1)
    }, [itemsPerPage])

    const handleBack = () => {
        router.visit('/admin/enrollment/room-schedule')
    }

    // Group schedules by day
    const schedulesByDay = paginatedSchedules.reduce((acc, schedule) => {
        if (!acc[schedule.day]) {
            acc[schedule.day] = []
        }
        acc[schedule.day].push(schedule)
        return acc
    }, {} as Record<string, Schedule[]>)

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

    return (
        <AdminLayout user={auth?.user} admin={auth?.admin}>
            <Head title={`Room ${room.room_name} - Schedule`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBack}
                        className="hover:bg-gray-100"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Rooms
                    </Button>
                </div>

                {/* Room Info Card */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-green-600 rounded-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-gray-900">Room {room.room_name}</h1>
                            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Capacity</p>
                                    <p className="text-sm font-medium text-gray-900">{room.capacity} students</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Total Schedules</p>
                                    <p className="text-sm font-medium text-gray-900">{schedules.length} schedule{schedules.length !== 1 ? 's' : ''}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Schedules Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Room Schedules</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            View all schedules assigned to this room
                        </p>
                    </div>

                    {schedules.length === 0 ? (
                        <div className="p-8 text-center">
                            <p className="text-lg font-medium text-gray-900 mb-2">No Schedules Assigned</p>
                            <p className="text-sm text-gray-500 mb-4">
                                This room has no schedules assigned yet.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-green-700">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-white">Day</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-white">Time</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-white">Subject</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-white">Grade & Section</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-white">Teacher</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {days.map(day => {
                                            const daySchedules = schedulesByDay[day] || []
                                            if (daySchedules.length === 0) return null
                                            
                                            return daySchedules.map((schedule) => (
                                                <tr key={schedule.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{schedule.day}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-900">{schedule.time}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-900">{schedule.subject}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-900">
                                                        {schedule.gradeLevel} - {schedule.section}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900">{schedule.teacher}</td>
                                                </tr>
                                            ))
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {schedules.length > 0 && (
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
                                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, schedules.length)} of {schedules.length} entries
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
                        </>
                    )}
                </div>
            </div>
        </AdminLayout>
    )
}
