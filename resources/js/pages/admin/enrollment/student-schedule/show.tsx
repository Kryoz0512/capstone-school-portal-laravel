import { Head, router } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useMemo } from 'react'

type Schedule = {
    id: number
    subject: string
    teacher: string
    day_of_week: string
    start_time: string
    end_time: string
    time_slot: string
    room: string
}

type Student = {
    id: number
    studentName: string
    lrn: string
    gradeLevel: string
    section: string
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
    student: Student
    schedules: Schedule[]
}

export default function StudentScheduleShow({ auth, student, schedules }: Props) {
    const handleBack = () => {
        router.visit('/admin/enrollment/student-schedule')
    }

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

    // Group schedules by time slot and day
    const scheduleGrid = useMemo(() => {
        // Get unique time slots
        const timeSlots = Array.from(new Set(schedules.map(s => s.time_slot))).sort()
        
        // Create grid structure
        const grid: Record<string, Record<string, Schedule | null>> = {}
        
        timeSlots.forEach(timeSlot => {
            grid[timeSlot] = {}
            daysOfWeek.forEach(day => {
                const schedule = schedules.find(s => s.time_slot === timeSlot && s.day_of_week === day)
                grid[timeSlot][day] = schedule || null
            })
        })
        
        return { timeSlots, grid }
    }, [schedules])

    return (
        <AdminLayout user={auth?.user}>
            <Head title={`Schedule - ${student.studentName}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <Button
                            variant="outline"
                            onClick={handleBack}
                            className="mb-4"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Students
                        </Button>
                        <h1 className="text-2xl font-bold text-gray-900">Student Schedule</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            View schedule for {student.studentName}
                        </p>
                    </div>
                </div>

                {/* Student Info */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Student Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Student Name</p>
                            <p className="font-medium text-gray-900">{student.studentName}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">LRN</p>
                            <p className="font-medium text-gray-900">{student.lrn}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Grade Level</p>
                            <p className="font-medium text-gray-900">{student.gradeLevel}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Section</p>
                            <p className="font-medium text-gray-900">{student.section}</p>
                        </div>
                    </div>
                </div>

                {/* Schedule Table */}
                {schedules.length > 0 ? (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Weekly Schedule</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead className="bg-green-700">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-white border-r border-green-600 uppercase tracking-wider">Time</th>
                                        {daysOfWeek.map(day => (
                                            <th key={day} className="px-6 py-4 text-center text-sm font-semibold text-white border-r border-green-600 last:border-r-0 uppercase tracking-wider">
                                                {day}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {scheduleGrid.timeSlots.map((timeSlot, index) => (
                                        <tr key={timeSlot} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900 border-r border-gray-300 whitespace-nowrap">
                                                {timeSlot}
                                            </td>
                                            {daysOfWeek.map(day => {
                                                const schedule = scheduleGrid.grid[timeSlot][day]
                                                return (
                                                    <td key={day} className="px-6 py-4 text-center text-sm border-r border-gray-300 last:border-r-0">
                                                        {schedule ? (
                                                            <div className="space-y-1">
                                                                <div className="font-semibold text-gray-900">{schedule.subject}</div>
                                                                <div className="text-xs text-gray-600">{schedule.teacher}</div>
                                                                <div className="text-xs text-gray-500">Room {schedule.room}</div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400">-</span>
                                                        )}
                                                    </td>
                                                )
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                        <p className="text-gray-500">No schedule found for this student's section.</p>
                        <p className="text-sm text-gray-400 mt-2">Schedules need to be added in Load Scheduling for this section.</p>
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}
