import { Head } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

type Schedule = {
    id: number
    room: string
    subject: string
    teacher: string
    dateTime: string
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

    // Sample data for demonstration
    const sampleSchedules: Schedule[] = schedules.length > 0 ? schedules : [
        {
            id: 1,
            room: '101',
            subject: 'English',
            teacher: 'Ms. Johnson',
            dateTime: '2024-12-01 08:00 AM'
        },
        {
            id: 2,
            room: '102',
            subject: 'Mathematics',
            teacher: 'Mr. Smith',
            dateTime: '2024-12-01 09:15 AM'
        },
        {
            id: 3,
            room: 'Lab 201',
            subject: 'Science',
            teacher: 'Dr. Garcia',
            dateTime: '2024-12-01 01:00 PM'
        }
    ]

    const filteredSchedules = sampleSchedules.filter(schedule =>
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
                            Showing 1 to {filteredSchedules.length} of {filteredSchedules.length} entries
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
                                        Subject
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                                        Teacher
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                                        Date / Time
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredSchedules.map((schedule) => (
                                    <tr key={schedule.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {schedule.room}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {schedule.subject}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {schedule.teacher}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {schedule.dateTime}
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
