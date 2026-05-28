import { Head, router } from '@inertiajs/react'
import StudentLayout from '@/layouts/student-layout'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from 'lucide-react'
import { useState, useEffect } from 'react'

type ScheduleItem = {
    time: string
    monday: string
    tuesday: string
    wednesday: string
    thursday: string
    friday: string
}

type SchoolYear = {
    value: string
    label: string
}

type StudentInfo = {
    name: string
    lrn: string
    gradeLevel: string
    section: string
}

type Props = {
    schedules: ScheduleItem[]
    schoolYears: SchoolYear[]
    studentInfo: StudentInfo
    filters: {
        school_year: string
    }
    auth?: {
        user: {
            id: number
            name: string
            email: string
            role: string
        }
    }
}

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const
const dayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

function ScheduleCell({ value }: { value: string }) {
    if (!value) {
        return <span className="text-gray-300 text-sm">—</span>
    }

    const lines = value.split('\n').filter(Boolean)
    const subject = lines[0] ?? ''
    const teacher = lines[1] ?? ''
    const room = lines[2] ?? ''

    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-purple-900 leading-tight">{subject}</span>
            {teacher && <span className="text-sm text-gray-500 leading-tight">{teacher}</span>}
            {room && (
                <span className="text-sm text-gray-400 leading-tight">{room}</span>
            )}
        </div>
    )
}

export default function StudentSchedule({ schedules, schoolYears, studentInfo, filters, auth }: Props) {
    const [schoolYear, setSchoolYear] = useState(filters.school_year || '')

    useEffect(() => {
        if (schoolYear) {
            router.get(`/student/schedule?school_year=${schoolYear}`, {}, {
                preserveState: true,
                preserveScroll: true,
            })
        }
    }, [schoolYear])

    return (
        <StudentLayout user={auth?.user}>
            <Head title="Class Schedule" />

            <div className="space-y-6">

                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Class Schedule</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Weekly schedule for school year {filters.school_year}
                        </p>
                    </div>
                    <div className="w-48">
                        <Select value={schoolYear} onValueChange={setSchoolYear}>
                            <SelectTrigger className="bg-white border-gray-200">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {schoolYears.map((year) => (
                                    <SelectItem key={year.value} value={year.value}>
                                        {year.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Student Info Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900">
                        <p className="text-sm font-semibold text-purple-200 uppercase tracking-wider mb-0.5">Student Information</p>
                        <p className="text-lg font-bold text-white">{studentInfo.name}</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 divide-x divide-y divide-gray-100">
                        <div className="px-6 py-4">
                            <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">LRN</p>
                            <p className="text-sm font-semibold text-gray-900">{studentInfo.lrn}</p>
                        </div>
                        <div className="px-6 py-4">
                            <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Grade Level</p>
                            <p className="text-sm font-semibold text-gray-900">{studentInfo.gradeLevel}</p>
                        </div>
                        <div className="px-6 py-4">
                            <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">Section</p>
                            <p className="text-sm font-semibold text-gray-900">{studentInfo.section}</p>
                        </div>
                    </div>
                </div>

                {/* Schedule Table */}
                {schedules.length > 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900">
                                        <th className="px-6 py-3.5 text-left text-sm font-semibold text-white uppercase tracking-wider w-40">
                                            Time
                                        </th>
                                        {dayLabels.map(day => (
                                            <th
                                                key={day}
                                                className="px-4 py-3.5 text-center text-sm font-semibold text-white uppercase tracking-wider"
                                            >
                                                {day}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {schedules.map((item, index) => (
                                        <tr
                                            key={index}
                                            className={`transition-colors hover:bg-purple-50/40 ${
                                                index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                                            }`}
                                        >
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                                                {item.time}
                                            </td>
                                            {days.map(day => (
                                                <td key={day} className="px-4 py-4 text-center align-top">
                                                    <ScheduleCell value={item[day]} />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/60 flex items-center justify-between">
                            <p className="text-sm text-gray-500">
                                {schedules.length} time slot{schedules.length !== 1 ? 's' : ''} scheduled
                            </p>
                            <p className="text-sm text-gray-400">School Year {filters.school_year}</p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-dashed border-gray-300 p-14 text-center">
                        <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-sm font-semibold text-gray-600">No schedule available</p>
                        <p className="text-sm text-gray-400 mt-1">
                            No classes have been scheduled for this school year yet.
                        </p>
                    </div>
                )}
            </div>
        </StudentLayout>
    )
}