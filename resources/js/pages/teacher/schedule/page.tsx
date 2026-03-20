import { Head } from '@inertiajs/react'
import TeacherLayout from '@/layouts/teacher-layout'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'

type ScheduleItem = {
    time: string
    monday: string
    tuesday: string
    wednesday: string
    thursday: string
    friday: string
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

export default function Schedule({ auth }: Props) {
    const [schoolYear, setSchoolYear] = useState('2024-2025')

    const schedule: ScheduleItem[] = [
        {
            time: '7:00 - 8:00 AM',
            monday: 'English 10-A\nRoom 101',
            tuesday: 'English 10-B\nRoom 102',
            wednesday: 'English 10-A\nRoom 101',
            thursday: 'English 10-B\nRoom 102',
            friday: 'English 10-A\nRoom 101'
        },
        {
            time: '8:00 - 9:00 AM',
            monday: 'English 9-A\nRoom 103',
            tuesday: 'English 9-B\nRoom 104',
            wednesday: 'English 9-A\nRoom 103',
            thursday: 'English 9-B\nRoom 104',
            friday: 'English 9-A\nRoom 103'
        },
        {
            time: '9:00 - 10:00 AM',
            monday: 'Break',
            tuesday: 'Break',
            wednesday: 'Break',
            thursday: 'Break',
            friday: 'Break'
        },
        {
            time: '10:00 - 11:00 AM',
            monday: 'English 10-A\nRoom 101',
            tuesday: 'English 10-B\nRoom 102',
            wednesday: 'English 10-A\nRoom 101',
            thursday: 'English 10-B\nRoom 102',
            friday: 'English 10-A\nRoom 101'
        },
        {
            time: '11:00 - 12:00 PM',
            monday: 'Lunch Break',
            tuesday: 'Lunch Break',
            wednesday: 'Lunch Break',
            thursday: 'Lunch Break',
            friday: 'Lunch Break'
        }
    ]

    return (
        <TeacherLayout user={auth?.user}>
            <Head title="Schedule" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Schedule</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        View your weekly teaching schedule
                    </p>
                </div>

                {/* Filter */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="max-w-xs">
                        <label className="block text-sm font-medium text-gray-700 mb-2">School Year</label>
                        <Select value={schoolYear} onValueChange={setSchoolYear}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="2024-2025">2024-2025</SelectItem>
                                <SelectItem value="2023-2024">2023-2024</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Schedule Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 w-40">Time</th>
                                    <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">Monday</th>
                                    <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">Tuesday</th>
                                    <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">Wednesday</th>
                                    <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">Thursday</th>
                                    <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">Friday</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {schedule.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.time}</td>
                                        <td className="px-6 py-4 text-center">
                                            <div className={`text-sm ${item.monday === 'Break' || item.monday === 'Lunch Break' ? 'text-gray-500 italic' : 'text-gray-900 whitespace-pre-line'}`}>
                                                {item.monday}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className={`text-sm ${item.tuesday === 'Break' || item.tuesday === 'Lunch Break' ? 'text-gray-500 italic' : 'text-gray-900 whitespace-pre-line'}`}>
                                                {item.tuesday}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className={`text-sm ${item.wednesday === 'Break' || item.wednesday === 'Lunch Break' ? 'text-gray-500 italic' : 'text-gray-900 whitespace-pre-line'}`}>
                                                {item.wednesday}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className={`text-sm ${item.thursday === 'Break' || item.thursday === 'Lunch Break' ? 'text-gray-500 italic' : 'text-gray-900 whitespace-pre-line'}`}>
                                                {item.thursday}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className={`text-sm ${item.friday === 'Break' || item.friday === 'Lunch Break' ? 'text-gray-500 italic' : 'text-gray-900 whitespace-pre-line'}`}>
                                                {item.friday}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </TeacherLayout>
    )
}
