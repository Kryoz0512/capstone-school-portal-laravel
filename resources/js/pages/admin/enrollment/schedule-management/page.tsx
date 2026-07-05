import { Head, router } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AddRoomModal from '@/components/modals/add-room-modal'
import EditRoomModal from '@/components/modals/edit-room-modal'
import DeleteRoomModal from '@/components/modals/delete-room-modal'
import AddRoomScheduleModal from '@/components/modals/add-room-schedule-modal'
import EditRoomScheduleModal from '@/components/modals/edit-room-schedule-modal'
import { Pagination } from '@/components/pagination'
import { ArrowLeft, Pencil, Trash2, Plus, ChevronRight as ViewIcon, DoorOpen, Users2 } from 'lucide-react'
import { useState, useEffect, useRef, useMemo } from 'react'
import axios from 'axios'

type Room = {
    id: number
    room_name: string
    capacity: number
    status: 'Available' | 'Vacant' | 'Occupied'
    students_count: number
    schedules_count: number
}

type Schedule = {
    id: number
    subject_id: number
    subject: string
    teacher_id: number
    teacher: string
    class_section_id: number
    grade_level_id: number | null
    day: string
    start_time: string
    end_time: string
    time: string
    section: string
    gradeLevel: string
}

type GradeLevel = { id: number; name: string }
type ClassSection = { id: number; name: string; grade_level_id: number }
type Subject = { id: number; name: string; grade_level_id: number }
type Teacher = { id: number; name: string }
type TeacherSubjectData = { subjects: { subject_id: number; subject_name: string; grade_level_id: number }[] }

type PaginationLink = { url: string | null; label: string; active: boolean }

type ActiveRoom = {
    room: { id: number; room_name: string; capacity: number }
    schedules: Schedule[]
    gradeLevels: GradeLevel[]
    classSections: ClassSection[]
    subjects: Subject[]
    teachers: Teacher[]
    teacherSubjects: Record<number, TeacherSubjectData>
}

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
    activeRoom?: ActiveRoom | null
}

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const dayAbbr: Record<string, string> = {
    Monday: 'MON',
    Tuesday: 'TUE',
    Wednesday: 'WED',
    Thursday: 'THU',
    Friday: 'FRI',
}

const statusStyles: Record<Room['status'], { dot: string; text: string; bg: string; border: string }> = {
    Available: { dot: 'bg-green-600', text: 'text-green-800', bg: 'bg-green-100', border: 'border-green-200' },
    Vacant: { dot: 'bg-yellow-500', text: 'text-yellow-800', bg: 'bg-yellow-100', border: 'border-yellow-200' },
    Occupied: { dot: 'bg-red-500', text: 'text-red-800', bg: 'bg-red-100', border: 'border-red-200' },
}

export default function RoomListings({ auth, rooms, filters = {}, activeRoom = null }: Props) {
    // ----- room CRUD state -----
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
    const [roomToDelete, setRoomToDelete] = useState<{ id: number; room_name: string } | null>(null)

    const [searchTerm, setSearchTerm] = useState(filters.search || '')
    const [capacityFilter, setCapacityFilter] = useState(filters.capacity || '')
    const [statusFilter, setStatusFilter] = useState(filters.status || 'All')
    const [perPage, setPerPage] = useState(rooms.per_page || 10)

    // ----- inline schedule view state (now driven by the `activeRoom` Inertia prop / URL) -----
    const [view, setView] = useState<'list' | 'schedule'>(activeRoom ? 'schedule' : 'list')
    const [scheduleRoom, setScheduleRoom] = useState<{ id: number; room_name: string; capacity: number } | null>(
        activeRoom?.room ?? null
    )
    const [schedules, setSchedules] = useState<Schedule[]>(activeRoom?.schedules ?? [])
    const [isLoadingSchedule, setIsLoadingSchedule] = useState(false)

    // schedule lookup data (arrives with activeRoom, refreshed via axios after CRUD)
    const [gradeLevels, setGradeLevels] = useState<GradeLevel[]>(activeRoom?.gradeLevels ?? [])
    const [classSections, setClassSections] = useState<ClassSection[]>(activeRoom?.classSections ?? [])
    const [subjects, setSubjects] = useState<Subject[]>(activeRoom?.subjects ?? [])
    const [teachers, setTeachers] = useState<Teacher[]>(activeRoom?.teachers ?? [])
    const [teacherSubjects, setTeacherSubjects] = useState<Record<number, TeacherSubjectData>>(
        activeRoom?.teacherSubjects ?? {}
    )

    // schedule CRUD modal state
    const [isAddScheduleOpen, setIsAddScheduleOpen] = useState(false)
    const [isEditScheduleOpen, setIsEditScheduleOpen] = useState(false)
    const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)
    const [scheduleToDelete, setScheduleToDelete] = useState<Schedule | null>(null)
    const [isDeletingSchedule, setIsDeletingSchedule] = useState(false)

    const isFirstRender = useRef(true)
    const filterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false
            return
        }

        // Don't trigger filter navigation when viewing a schedule
        if (view === 'schedule') {
            return
        }

        filterTimerRef.current = setTimeout(() => {
            filterTimerRef.current = null
            router.get('/admin/enrollment/schedule-management', {
                search: searchTerm || undefined,
                capacity: capacityFilter || undefined,
                status: statusFilter !== 'All' ? statusFilter : undefined,
                per_page: perPage,
            }, { preserveState: true, preserveScroll: true, replace: true })
        }, 300)
        return () => {
            if (filterTimerRef.current) clearTimeout(filterTimerRef.current)
        }
    }, [searchTerm, capacityFilter, statusFilter, perPage])

    // Keep schedule view state in sync whenever Inertia gives us new props
    // (browser back/forward, direct link, page refresh while viewing a schedule).
    useEffect(() => {
        if (activeRoom) {
            setView('schedule')
            setScheduleRoom(activeRoom.room)
            setSchedules(activeRoom.schedules)
            setGradeLevels(activeRoom.gradeLevels)
            setClassSections(activeRoom.classSections)
            setSubjects(activeRoom.subjects)
            setTeachers(activeRoom.teachers)
            setTeacherSubjects(activeRoom.teacherSubjects)
        } else {
            setView('list')
            setScheduleRoom(null)
            setSchedules([])
        }
    }, [activeRoom])

    const handleEdit = (room: Room) => {
        setSelectedRoom(room)
        setIsEditModalOpen(true)
    }

    const handleDelete = (room: Room) => {
        setRoomToDelete({ id: room.id, room_name: room.room_name })
        setIsDeleteModalOpen(true)
    }

    const handlePageChange = (url: string | null) => {
        if (url) router.visit(url, { preserveScroll: true, preserveState: true })
    }

    const handleViewSchedule = (room: Room) => {
        // Cancel any pending debounced filter navigation — otherwise it can fire
        // a moment later and silently bounce us back to the room list.
        if (filterTimerRef.current) {
            clearTimeout(filterTimerRef.current)
            filterTimerRef.current = null
        }
        // Real Inertia navigation -> URL changes, back/forward + refresh work correctly.
        router.visit(`/admin/enrollment/schedule-management/rooms/${room.id}`, {
            preserveScroll: true,
            preserveState: false // Force clean navigation state
        })
    }

    const handleBackToRooms = () => {
        if (filterTimerRef.current) {
            clearTimeout(filterTimerRef.current)
            filterTimerRef.current = null
        }
        router.visit('/admin/enrollment/schedule-management', {
            preserveScroll: true,
            preserveState: false // Force clean navigation state
        })
    }

    // Silent refresh (no URL change) after add/edit/delete schedule actions.
    const handleScheduleChanged = () => {
        if (!scheduleRoom) return
        setIsLoadingSchedule(true)
        axios.get(`/admin/enrollment/rooms/${scheduleRoom.id}/schedule`)
            .then((response) => {
                setScheduleRoom(response.data.room)
                setSchedules(response.data.schedules)
                setGradeLevels(response.data.gradeLevels)
                setClassSections(response.data.classSections)
                setSubjects(response.data.subjects)
                setTeachers(response.data.teachers)
                setTeacherSubjects(response.data.teacherSubjects)
            })
            .catch((error) => {
                console.error('Error refreshing room schedule:', error)
            })
            .finally(() => setIsLoadingSchedule(false))
    }

    const handleEditSchedule = (schedule: Schedule) => {
        setEditingSchedule(schedule)
        setIsEditScheduleOpen(true)
    }

    const handleDeleteSchedule = async (schedule: Schedule) => {
        setScheduleToDelete(schedule)
    }

    const confirmDeleteSchedule = async () => {
        if (!scheduleToDelete) return
        setIsDeletingSchedule(true)
        try {
            await axios.delete(`/admin/enrollment/schedules/${scheduleToDelete.id}`)
            setScheduleToDelete(null)
            handleScheduleChanged()
        } catch (error) {
            console.error('Error deleting schedule:', error)
        } finally {
            setIsDeletingSchedule(false)
        }
    }

    const schedulesByDay = schedules.reduce((acc, schedule) => {
        if (!acc[schedule.day]) acc[schedule.day] = []
        acc[schedule.day].push(schedule)
        return acc
    }, {} as Record<string, Schedule[]>)

    // Sort each day's periods chronologically for the timetable columns.
    Object.keys(schedulesByDay).forEach((day) => {
        schedulesByDay[day] = [...schedulesByDay[day]].sort((a, b) => a.start_time.localeCompare(b.start_time))
    })

    const today = useMemo(() => new Date().toLocaleDateString('en-US', { weekday: 'long' }), [])

    const hasActiveFilters = searchTerm !== '' || capacityFilter !== '' || statusFilter !== 'All'

    return (
        <AdminLayout user={auth?.user} admin={auth?.admin}>
            <Head title={view === 'schedule' && scheduleRoom ? `Room ${scheduleRoom.room_name} - Schedule` : 'Schedule Management'} />

            <div>
            {view === 'list' ? (
                <div className="space-y-6">
                    <div className="flex items-end justify-between border-b border-gray-200 pb-5">
                        <div>
                            <p className="text-[11px] tracking-[0.2em] text-gray-500 uppercase mb-1">Enrollment · Facilities</p>
                            <h1 className="text-[28px] leading-tight font-semibold text-gray-900">Room &amp; Schedule Ledger</h1>
                            <p className="text-sm text-gray-500 mt-1">Track every room's capacity, occupancy, and weekly class assignments.</p>
                        </div>
                        <Button
                            className="bg-green-700 hover:bg-green-800 text-white rounded-md shadow-sm"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <Plus className="w-4 h-4 mr-1.5" />
                            Add Room
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

                    <div className="bg-gray-50 rounded-lg border border-gray-200 px-5 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr] gap-4 items-end">
                            <div>
                                <label className="block text-[10px] tracking-[0.15em] text-gray-500 uppercase mb-1.5">
                                    Search room
                                </label>
                                <Input
                                    type="text"
                                    placeholder="e.g. Room 204"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-white border-gray-300 focus-visible:ring-green-600"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] tracking-[0.15em] text-gray-500 uppercase mb-1.5">
                                    Capacity
                                </label>
                                <Input
                                    type="number"
                                    placeholder="Any"
                                    value={capacityFilter}
                                    onChange={(e) => setCapacityFilter(e.target.value)}
                                    min="1"
                                    className="bg-white border-gray-300 focus-visible:ring-green-600"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] tracking-[0.15em] text-gray-500 uppercase mb-1.5">
                                    Status
                                </label>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="bg-white border-gray-300 focus:ring-green-600">
                                        <SelectValue placeholder="All" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">All statuses</SelectItem>
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
                                <thead>
                                    <tr className="bg-green-700">
                                        <th className="px-6 py-3.5 text-left text-sm font-semibold text-green-100 uppercase tracking-wider">Room</th>
                                        <th className="px-6 py-3.5 text-left text-sm font-semibold text-green-100 uppercase tracking-wider">Occupancy</th>
                                        <th className="px-6 py-3.5 text-left text-sm font-semibold text-green-100 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3.5 text-left text-sm font-semibold text-green-100 uppercase tracking-wider">Weekly Schedule</th>
                                        <th className="px-6 py-3.5 text-right text-sm font-semibold text-green-100 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {rooms.data.length > 0 ? (
                                        rooms.data.map((room) => {
                                            const ratio = room.capacity > 0 ? Math.min(room.students_count / room.capacity, 1) : 0
                                            const s = statusStyles[room.status]
                                            return (
                                                <tr key={room.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-md bg-green-50 flex items-center justify-center shrink-0">
                                                                <DoorOpen className="w-4 h-4 text-green-700" />
                                                            </div>
                                                            <span className="text-[15px] font-semibold text-gray-900">{room.room_name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2.5 min-w-[140px]">
                                                            <div className="flex items-center gap-1 text-xs text-gray-600 shrink-0">
                                                                <Users2 className="w-3.5 h-3.5 text-gray-500" />
                                                                {room.students_count || 0}/{room.capacity}
                                                            </div>
                                                            {/* <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full ${ratio >= 1 ? 'bg-red-600' : ratio >= 0.7 ? 'bg-yellow-500' : 'bg-green-600'}`}
                                                                    style={{ width: `${Math.max(ratio * 100, room.students_count > 0 ? 6 : 0)}%` }}
                                                                />
                                                            </div> */}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${s.bg} ${s.text} ${s.border}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                                                            {room.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <button
                                                            onClick={() => handleViewSchedule(room)}
                                                            className="inline-flex items-center gap-1 text-sm text-green-700 hover:text-green-800 font-medium group"
                                                        >
                                                            <span className="px-2.5 py-1 rounded border border-green-200 bg-green-50 text-xs">
                                                                {room.schedules_count} period{room.schedules_count !== 1 ? 's' : ''}
                                                            </span>
                                                            <ViewIcon className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <button
                                                                className="p-1.5 rounded-md text-gray-500 hover:text-green-700 hover:bg-green-50 transition-colors"
                                                                onClick={() => handleEdit(room)}
                                                                aria-label={`Edit ${room.room_name}`}
                                                            >
                                                                <Pencil className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                className="p-1.5 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                                onClick={() => handleDelete(room)}
                                                                aria-label={`Delete ${room.room_name}`}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-14 text-center">
                                                <p className="text-base font-medium text-gray-900 mb-1">
                                                    {hasActiveFilters ? 'No rooms match your filters' : 'The ledger is empty'}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {hasActiveFilters
                                                        ? 'Try widening your search or clearing a filter.'
                                                        : 'Add your first room to start building schedules.'}
                                                </p>
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
            ) : (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleBackToRooms}
                            className="border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Rooms
                        </Button>
                        <Button
                            className="bg-green-700 hover:bg-green-800 text-white shadow-sm"
                            onClick={() => setIsAddScheduleOpen(true)}
                            disabled={!scheduleRoom}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Schedule
                        </Button>
                    </div>

                    {/* Room plaque */}
                    <div className="relative bg-green-700 rounded-lg px-7 py-6 overflow-hidden">
                        <div className="absolute inset-y-0 left-0 w-1.5 bg-blue-500" />
                        <div className="flex flex-wrap items-center justify-between gap-6">
                            <div>
                                <p className="text-[11px] tracking-[0.2em] text-green-200 uppercase mb-1">Room Plaque</p>
                                <h1 className="text-3xl font-semibold text-white">{scheduleRoom?.room_name}</h1>
                            </div>
                            <div className="flex items-center gap-8">
                                <div>
                                    <p className="text-[10px] tracking-[0.15em] text-green-200 uppercase mb-1">Capacity</p>
                                    <p className="text-lg font-semibold text-white">{scheduleRoom?.capacity} seats</p>
                                </div>
                                <div className="w-px h-10 bg-green-600" />
                                <div>
                                    <p className="text-[10px] tracking-[0.15em] text-green-200 uppercase mb-1">This Week</p>
                                    <p className="text-lg font-semibold text-white">
                                        {schedules.length} period{schedules.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Weekly timetable */}
                    <div>
                        <div className="flex items-baseline justify-between mb-3">
                            <h2 className="text-lg font-semibold text-gray-900">Weekly Timetable</h2>
                            <p className="text-xs text-gray-500">Sorted chronologically within each day</p>
                        </div>

                        {isLoadingSchedule ? (
                            <div className="p-14 text-center text-sm text-gray-500 bg-white rounded-lg border border-gray-200">
                                Refreshing schedule…
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                                {days.map((day) => {
                                    const daySchedules = schedulesByDay[day] || []
                                    const isToday = day === today
                                    return (
                                        <div
                                            key={day}
                                            className={`rounded-lg border overflow-hidden flex flex-col ${
                                                isToday ? 'border-blue-500 ring-1 ring-blue-500/30' : 'border-gray-200'
                                            }`}
                                        >
                                            <div
                                                className={`px-3 py-2.5 flex items-center justify-between ${
                                                    isToday ? 'bg-blue-500' : 'bg-gray-100'
                                                }`}
                                            >
                                                <span className={`text-[11px] font-semibold tracking-[0.15em] ${isToday ? 'text-white' : 'text-gray-500'}`}>
                                                    {dayAbbr[day]}
                                                </span>
                                                <span className={`text-[10px] ${isToday ? 'text-white/85' : 'text-gray-500'}`}>
                                                    {daySchedules.length}
                                                </span>
                                            </div>
                                            <div className="p-2 space-y-2 bg-gray-50 flex-1 min-h-[120px]">
                                                {daySchedules.length === 0 ? (
                                                    <div className="h-full min-h-[100px] rounded-md border border-dashed border-gray-300 flex items-center justify-center">
                                                        <p className="text-[11px] text-gray-400 text-center px-2">No classes scheduled</p>
                                                    </div>
                                                ) : (
                                                    daySchedules.map((schedule) => (
                                                        <div
                                                            key={schedule.id}
                                                            className="group bg-white rounded-md border border-gray-200 p-2.5 hover:border-green-600 transition-colors"
                                                        >
                                                            <div className="flex items-start justify-between gap-1">
                                                                <p className="text-[11px] font-semibold text-green-700 leading-tight">
                                                                    {schedule.time}
                                                                </p>
                                                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <button
                                                                        className="p-1 rounded text-gray-500 hover:text-green-700 hover:bg-green-50"
                                                                        onClick={() => handleEditSchedule(schedule)}
                                                                        aria-label="Edit period"
                                                                    >
                                                                        <Pencil className="w-3 h-3" />
                                                                    </button>
                                                                    <button
                                                                        className="p-1 rounded text-gray-500 hover:text-red-600 hover:bg-red-50"
                                                                        onClick={() => handleDeleteSchedule(schedule)}
                                                                        aria-label="Delete period"
                                                                    >
                                                                        <Trash2 className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <p className="text-sm font-semibold text-gray-900 mt-1 leading-snug">
                                                                {schedule.subject}
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-0.5">
                                                                {schedule.gradeLevel} – {schedule.section}
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-0.5 truncate">{schedule.teacher}</p>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {scheduleRoom && (
                        <>
                            <AddRoomScheduleModal
                                open={isAddScheduleOpen}
                                onOpenChange={setIsAddScheduleOpen}
                                roomId={scheduleRoom.id}
                                gradeLevels={gradeLevels}
                                classSections={classSections}
                                subjects={subjects}
                                teachers={teachers}
                                teacherSubjects={teacherSubjects}
                                onSuccess={handleScheduleChanged}
                            />
                            <EditRoomScheduleModal
                                open={isEditScheduleOpen}
                                onOpenChange={setIsEditScheduleOpen}
                                roomId={scheduleRoom.id}
                                schedule={editingSchedule}
                                gradeLevels={gradeLevels}
                                classSections={classSections}
                                subjects={subjects}
                                teachers={teachers}
                                teacherSubjects={teacherSubjects}
                                onSuccess={handleScheduleChanged}
                            />
                        </>
                    )}

                    {/* Delete confirmation */}
                    {scheduleToDelete && (
                        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50" onClick={() => setScheduleToDelete(null)}>
                            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Remove this period?</h3>
                                <p className="text-sm text-gray-500 mb-5">
                                    <span className="font-medium text-gray-900">{scheduleToDelete.subject}</span> ({scheduleToDelete.gradeLevel} – {scheduleToDelete.section}) on {scheduleToDelete.day} will be removed from this room's timetable. This can't be undone.
                                </p>
                                <div className="flex justify-end gap-3">
                                    <Button
                                        variant="outline"
                                        className="border-gray-300 text-gray-600"
                                        onClick={() => setScheduleToDelete(null)}
                                        disabled={isDeletingSchedule}
                                    >
                                        Cancel
                                    </Button>
                                    <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={confirmDeleteSchedule} disabled={isDeletingSchedule}>
                                        {isDeletingSchedule ? 'Removing…' : 'Remove period'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
            </div>
        </AdminLayout>
    )
}