import { Head } from '@inertiajs/react'
import StudentLayout from '@/layouts/student-layout'

type Schedule = {
    id: number
    subject: string
    time: string
    days: string
    room: string
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

export default function StudentSchedule({ auth }: Props) {
    const studentInfo = {
        name: 'Juan Dela Cruz',
        studentId: 'STU-2025-001',
        section: 'Grade 10 - Section A'
    }

    const schedules: Schedule[] = [
        { id: 1, subject: 'English', time: '8:00 AM - 9:00 AM', days: 'Monday, Wednesday, Friday', room: 'Room 101' },
        { id: 2, subject: 'Mathematics', time: '9:15 AM - 10:15 AM', days: 'Monday, Tuesday, Thursday, Friday', room: 'Room 102' },
        { id: 3, subject: 'Science', time: '10:30 AM - 11:30 AM', days: 'Tuesday, Thursday, Friday', room: 'Lab 201' },
        { id: 4, subject: 'History', time: '1:00 PM - 2:00 PM', days: 'Monday, Tuesday, Wednesday, Friday', room: 'Room 205' },
        { id: 5, subject: 'Computer Science', time: '2:15 PM - 3:15 PM', days: 'Monday, Tuesday, Thursday, Friday', room: 'IT Lab 1' },
        { id: 6, subject: 'Art Appreciation', time: '8:00 AM - 9:30 AM', days: 'Tuesday, Thursday, Friday', room: 'Studio A' },
        { id: 7, subject: 'Physical Education', time: '10:00 AM - 12:00 PM', days: 'Monday, Wednesday, Friday', room: 'Gymnasium' },
        { id: 8, subject: 'Social Studies', time: '3:30 PM - 4:30 PM', days: 'Wednesday, Thursday, Friday', room: 'Room 202' }
    ]

    return (
        <StudentLayout user={auth?.user}>
            <Head title="Class Schedule" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Class Schedule</h1>
                    <p className="text-sm text-gray-500 mt-1">Your timetable for this school year</p>
                </div>

                {/* Student Info */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Student Name</p>
                            <p className="text-base font-semibold text-gray-900">{studentInfo.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Student ID</p>
                            <p className="text-base font-semibold text-gray-900">{studentInfo.studentId}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Section</p>
                            <p className="text-base font-semibold text-gray-900">{studentInfo.section}</p>
                        </div>
                    </div>
                </div>

                {/* Schedule Summary */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Schedule Summary</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Subject</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Time</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Days</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Room</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {schedules.map((schedule) => (
                                    <tr key={schedule.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-900">{schedule.subject}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{schedule.time}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{schedule.days}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {schedule.room}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </StudentLayout>
    )
}
