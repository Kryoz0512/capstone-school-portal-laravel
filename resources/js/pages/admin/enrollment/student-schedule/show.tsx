import { Head, router } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

type Schedule = {
    id: number
    subject: string
    teacher: string
    dateTime: string
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
                            <table className="w-full">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Date & Time</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Subject</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Teacher</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Room</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {schedules.map((schedule) => (
                                        <tr key={schedule.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-900">{schedule.dateTime}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{schedule.subject}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{schedule.teacher}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{schedule.room}</td>
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
