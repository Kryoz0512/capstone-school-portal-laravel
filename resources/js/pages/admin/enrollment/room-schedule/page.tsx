import { Head } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

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
    }
    schedules?: Schedule[]
}

export default function RoomSchedule({ auth, schedules = [] }: Props) {
    const [searchTerm, setSearchTerm] = useState('')

    const filteredSchedules = schedules.filter(schedule =>
        schedule.room.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <AdminLayout user={auth?.user}>
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
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Search by Room Number
                    </label>
                    <Input
                        type="text"
                        placeholder="Enter room number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-md"
                    />
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                        <p className="text-sm text-gray-600">
                            Showing {filteredSchedules.length} of {schedules.length} entries
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                                        Room
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                                        Grade Level
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                                        Section
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                                        Subject
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                                        Teacher
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                                        Day
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                                        Time
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredSchedules.length > 0 ? (
                                    filteredSchedules.map((schedule) => (
                                        <tr key={schedule.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {schedule.room}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {schedule.gradeLevel}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {schedule.section}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {schedule.subject}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {schedule.teacher}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {schedule.day}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {schedule.time}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                                            {schedules.length === 0 
                                                ? 'No schedules found. Add schedules in Load Scheduling to see them here.'
                                                : 'No schedules match your search.'
                                            }
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
