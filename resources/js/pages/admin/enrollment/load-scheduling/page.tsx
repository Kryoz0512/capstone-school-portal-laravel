import { Head } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'

type Schedule = {
    id: number
    grade: string
    section: string
    day: string
    time: string
    room: string
    subject: string
    teacher: string
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
}

export default function LoadScheduling({ auth }: Props) {
    const [gradeFilter, setGradeFilter] = useState('All Grades')
    const [sectionFilter, setSectionFilter] = useState('All Sections')
    const [roomFilter, setRoomFilter] = useState('All Rooms')
    const [subjectFilter, setSubjectFilter] = useState('All Subjects')

    const schedules: Schedule[] = [
        { id: 1, grade: 'Grade 10', section: 'Grade 10-A', day: 'Monday', time: '08:00 AM', room: 'Room 101', subject: 'English', teacher: 'Ms. Johnson' },
        { id: 2, grade: 'Grade 10', section: 'Grade 10-A', day: 'Monday', time: '09:15 AM', room: 'Room 102', subject: 'Mathematics', teacher: 'Mr. Smith' },
        { id: 3, grade: 'Grade 10', section: 'Grade 10-B', day: 'Tuesday', time: '10:30 AM', room: 'Room 103', subject: 'Science', teacher: 'Dr. Garcia' },
        { id: 4, grade: 'Grade 9', section: 'Grade 9-A', day: 'Wednesday', time: '01:00 PM', room: 'Lab 201', subject: 'Science', teacher: 'Mr. White' }
    ]

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
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                        + Add Schedule
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-600 font-medium">Total Schedules</p>
                        <p className="text-3xl font-bold text-blue-900 mt-2">4</p>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <p className="text-sm text-purple-600 font-medium">Planned View</p>
                        <p className="text-3xl font-bold text-purple-900 mt-2">4</p>
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
                                    <SelectItem value="Grade 9">Grade 9</SelectItem>
                                    <SelectItem value="Grade 10">Grade 10</SelectItem>
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
                                    <SelectItem value="Grade 10-A">Grade 10-A</SelectItem>
                                    <SelectItem value="Grade 10-B">Grade 10-B</SelectItem>
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
                                    <SelectItem value="Room 101">Room 101</SelectItem>
                                    <SelectItem value="Room 102">Room 102</SelectItem>
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
                                    <SelectItem value="English">English</SelectItem>
                                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                        <p className="text-sm text-gray-600">Showing 1 to 4 of 4 entries</p>
                    </div>

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
                                {schedules.map((schedule) => (
                                    <tr key={schedule.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-900">{schedule.grade}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{schedule.section}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{schedule.day}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{schedule.time}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{schedule.room}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{schedule.subject}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{schedule.teacher}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button className="text-gray-600 hover:text-green-600">
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button className="text-gray-600 hover:text-red-600">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
