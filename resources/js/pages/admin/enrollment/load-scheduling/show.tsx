import { Head, router } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useMemo } from 'react'
import DeleteScheduleModal from '@/components/modals/delete-schedule-modal'

type Teacher = {
    id: number
    name: string
    employee_number: string
    subject: string
    position: string
}

type Schedule = {
    id: number
    grade: string
    section: string
    day: string
    start_time: string
    end_time: string
    room: string
    room_id: number | null
    subject: string
    subject_id: number
    class_section_id: number
    teacher: string
}

type ClassSection = {
    id: number
    name: string
    grade_level: string
    grade_level_id: number
}

type Subject = {
    id: number
    name: string
    grade_level_id: number
}

type Room = {
    id: number
    name: string
}

type GradeLevel = {
    id: number
    name: string
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
    teacher: Teacher
    schedules: Schedule[]
    classSections: ClassSection[]
    gradeLevels: GradeLevel[]
    subjects: Subject[]
    rooms: Room[]
}

export default function TeacherSchedules({ 
    auth, 
    teacher, 
    schedules = []
}: Props) {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)

    const handleBack = () => {
        router.visit('/admin/enrollment/load-scheduling')
    }

    const handleAddSchedule = () => {
        router.visit(`/admin/enrollment/load-scheduling/${teacher.id}/create`)
    }

    const handleEdit = (schedule: Schedule) => {
        router.visit(`/admin/enrollment/schedules/${schedule.id}/edit`)
    }

    const handleDelete = (schedule: Schedule) => {
        setSelectedSchedule(schedule)
        setIsDeleteModalOpen(true)
    }

    // Pagination
    const totalPages = Math.ceil(schedules.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedSchedules = schedules.slice(startIndex, endIndex)

    // Reset to page 1 when itemsPerPage changes
    useMemo(() => {
        setCurrentPage(1)
    }, [itemsPerPage])

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
            <Head title={`${teacher.name} - Schedules`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleBack}
                            className="hover:bg-gray-100"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Teachers
                        </Button>
                    </div>
                    <Button 
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={handleAddSchedule}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Schedule
                    </Button>
                </div>

                {/* Teacher Info Card */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-green-600 rounded-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-gray-900">{teacher.name}</h1>
                            <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Employee Number</p>
                                    <p className="text-sm font-medium text-gray-900">{teacher.employee_number}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Specialization</p>
                                    <p className="text-sm font-medium text-gray-900">{teacher.subject}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Position</p>
                                    <p className="text-sm font-medium text-gray-900">{teacher.position}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-600 font-medium">Total Schedules</p>
                        <p className="text-3xl font-bold text-blue-900 mt-2">{schedules.length}</p>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <p className="text-sm text-purple-600 font-medium">Days Teaching</p>
                        <p className="text-3xl font-bold text-purple-900 mt-2">{Object.keys(schedulesByDay).length}</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-600 font-medium">Unique Sections</p>
                        <p className="text-3xl font-bold text-green-900 mt-2">
                            {new Set(schedules.map(s => s.section)).size}
                        </p>
                    </div>
                </div>

                {/* Schedules Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Class Schedules</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Manage {teacher.name}'s teaching schedule
                        </p>
                    </div>

                    {schedules.length === 0 ? (
                        <div className="p-8 text-center">
                            <p className="text-lg font-medium text-gray-900 mb-2">No Schedules Assigned</p>
                            <p className="text-sm text-gray-500 mb-4">
                                Click "Add Schedule" to assign classes to this teacher.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-green-700">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-white">Day</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-white">Time</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-white">Subject</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-white">Grade & Section</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-white">Room</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-white">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {days.map(day => {
                                        const daySchedules = schedulesByDay[day] || []
                                        if (daySchedules.length === 0) return null
                                        
                                        return daySchedules.map((schedule, index) => (
                                            <tr key={schedule.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{schedule.day}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {schedule.start_time} - {schedule.end_time}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{schedule.subject}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {schedule.grade} - {schedule.section}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{schedule.room}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button 
                                                            className="text-gray-600 hover:text-green-600"
                                                            onClick={() => handleEdit(schedule)}
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            className="text-gray-600 hover:text-red-600"
                                                            onClick={() => handleDelete(schedule)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

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
                                {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map((page) => {
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

            {/* Modals */}
            <DeleteScheduleModal 
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                schedule={selectedSchedule}
            />
        </AdminLayout>
    )
}
