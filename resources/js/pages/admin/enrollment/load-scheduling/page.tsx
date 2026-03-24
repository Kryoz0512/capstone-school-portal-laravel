import { Head } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import AddScheduleModal from '@/components/modals/add-schedule-modal'
import EditScheduleModal from '@/components/modals/edit-schedule-modal'
import DeleteScheduleModal from '@/components/modals/delete-schedule-modal'

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
    teacher: string
    teacher_id: number
    class_section_id: number
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

type Teacher = {
    id: number
    name: string
}

type Room = {
    id: number
    name: string
}

type TeacherSubject = {
    subject_id: number
    subject_name: string
    grade_level_id: number
}

type TeacherSubjectData = {
    grade_levels: number[]
    subjects: TeacherSubject[]
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
    schedules: Schedule[]
    gradeLevels: GradeLevel[]
    classSections: ClassSection[]
    subjects: Subject[]
    teachers: Teacher[]
    teacherSubjects: Record<number, TeacherSubjectData>
    rooms: Room[]
}

type GradeLevel = {
    id: number
    name: string
}

export default function LoadScheduling({ 
    auth, 
    schedules = [], 
    gradeLevels = [],
    classSections = [], 
    subjects = [], 
    teachers = [],
    teacherSubjects = {},
    rooms = [] 
}: Props) {
    const [gradeFilter, setGradeFilter] = useState('All Grades')
    const [sectionFilter, setSectionFilter] = useState('All Sections')
    const [roomFilter, setRoomFilter] = useState('All Rooms')
    const [subjectFilter, setSubjectFilter] = useState('All Subjects')
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null)

    const filteredSchedules = schedules.filter(schedule => {
        if (gradeFilter !== 'All Grades' && schedule.grade !== gradeFilter) return false
        if (sectionFilter !== 'All Sections' && schedule.section !== sectionFilter) return false
        if (roomFilter !== 'All Rooms' && schedule.room !== roomFilter) return false
        if (subjectFilter !== 'All Subjects' && schedule.subject !== subjectFilter) return false
        return true
    })

    const handleEdit = (schedule: Schedule) => {
        setSelectedSchedule(schedule)
        setIsEditModalOpen(true)
    }

    const handleDelete = (schedule: Schedule) => {
        setSelectedSchedule(schedule)
        setIsDeleteModalOpen(true)
    }

    return (
        <AdminLayout user={auth?.user}>
            <Head title="Load Scheduling" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Load Scheduling</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Assign teachers to class schedules and manage time slots
                        </p>
                    </div>
                    <Button 
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        + Add Schedule
                    </Button>
                </div>

                <AddScheduleModal 
                    open={isAddModalOpen}
                    onOpenChange={setIsAddModalOpen}
                    gradeLevels={gradeLevels}
                    classSections={classSections}
                    subjects={subjects}
                    teachers={teachers}
                    teacherSubjects={teacherSubjects}
                    rooms={rooms}
                />

                <EditScheduleModal 
                    open={isEditModalOpen}
                    onOpenChange={setIsEditModalOpen}
                    schedule={selectedSchedule}
                    classSections={classSections}
                    subjects={subjects}
                    teachers={teachers}
                    rooms={rooms}
                />

                <DeleteScheduleModal 
                    open={isDeleteModalOpen}
                    onOpenChange={setIsDeleteModalOpen}
                    schedule={selectedSchedule}
                />

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-600 font-medium">Total Schedules</p>
                        <p className="text-3xl font-bold text-blue-900 mt-2">{schedules.length}</p>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <p className="text-sm text-purple-600 font-medium">Filtered View</p>
                        <p className="text-3xl font-bold text-purple-900 mt-2">{filteredSchedules.length}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-sm font-semibold text-gray-900 mb-4">Filters</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Grade Level</label>
                            <Select value={gradeFilter} onValueChange={setGradeFilter}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All Grades">All Grades</SelectItem>
                                    {Array.from(new Set(schedules.map(s => s.grade))).map(grade => (
                                        <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
                            <Select value={sectionFilter} onValueChange={setSectionFilter}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All Sections">All Sections</SelectItem>
                                    {Array.from(new Set(schedules.map(s => s.section))).map(section => (
                                        <SelectItem key={section} value={section}>{section}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Room</label>
                            <Select value={roomFilter} onValueChange={setRoomFilter}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All Rooms">All Rooms</SelectItem>
                                    {Array.from(new Set(schedules.map(s => s.room))).map(room => (
                                        <SelectItem key={room} value={room}>{room}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All Subjects">All Subjects</SelectItem>
                                    {Array.from(new Set(schedules.map(s => s.subject))).map(subject => (
                                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                        <p className="text-sm text-gray-600">
                            Showing {filteredSchedules.length} of {schedules.length} schedules
                        </p>
                    </div>

                    {schedules.length === 0 ? (
                        <div className="p-8 text-center">
                            <p className="text-lg font-medium text-gray-900 mb-2">No Schedules Found</p>
                            <p className="text-sm text-gray-500">
                                Click "Add Schedule" to create your first schedule.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Grade</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Section</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Day</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Time</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Room</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Subject</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Teacher</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredSchedules.length > 0 ? (
                                        filteredSchedules.map((schedule) => (
                                            <tr key={schedule.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm text-gray-900">{schedule.grade}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{schedule.section}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{schedule.day}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {schedule.start_time} - {schedule.end_time}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{schedule.room}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{schedule.subject}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{schedule.teacher}</td>
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
                                    ) : (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-500">
                                                No schedules match the selected filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    )
}
