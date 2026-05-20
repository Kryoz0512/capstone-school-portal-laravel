import { Head, router } from '@inertiajs/react'
import TeacherLayout from '@/layouts/teacher-layout'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState, useEffect } from 'react'
import { teacherTableHeaderCellCenterClass, teacherTableHeaderCellClass, teacherTableHeaderClass } from '@/components/data-table-pagination'

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

type Props = {
    schedules: ScheduleItem[]
    schoolYears: SchoolYear[]
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

export default function Schedule({ schedules, schoolYears, filters, auth }: Props) {
    const [schoolYear, setSchoolYear] = useState(filters.school_year || '')

    // Update filter when selection changes
    useEffect(() => {
        if (schoolYear) {
            router.get(`/teacher/schedule?school_year=${schoolYear}`, {}, {
                preserveState: true,
                preserveScroll: true,
            })
        }
    }, [schoolYear])

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
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <h2 className="text-base font-semibold text-gray-900">Filter Options</h2>
                    </div>
                    <div className="p-6">
                        <div className="max-w-xs">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                School Year <span className="text-red-500">*</span>
                            </label>
                            <Select value={schoolYear} onValueChange={setSchoolYear}>
                                <SelectTrigger>
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
                </div>

                {/* Schedule Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className={teacherTableHeaderClass}>
                                <tr>
                                    <th className={`${teacherTableHeaderCellClass} w-40`}>Time</th>
                                    <th className={teacherTableHeaderCellCenterClass}>Monday</th>
                                    <th className={teacherTableHeaderCellCenterClass}>Tuesday</th>
                                    <th className={teacherTableHeaderCellCenterClass}>Wednesday</th>
                                    <th className={teacherTableHeaderCellCenterClass}>Thursday</th>
                                    <th className={teacherTableHeaderCellCenterClass}>Friday</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {schedules.length > 0 ? (
                                    schedules.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.time}</td>
                                            <td className="px-6 py-4 text-center">
                                                <div className={`text-sm ${!item.monday ? 'text-gray-400' : 'text-gray-900 whitespace-pre-line'}`}>
                                                    {item.monday || '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className={`text-sm ${!item.tuesday ? 'text-gray-400' : 'text-gray-900 whitespace-pre-line'}`}>
                                                    {item.tuesday || '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className={`text-sm ${!item.wednesday ? 'text-gray-400' : 'text-gray-900 whitespace-pre-line'}`}>
                                                    {item.wednesday || '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className={`text-sm ${!item.thursday ? 'text-gray-400' : 'text-gray-900 whitespace-pre-line'}`}>
                                                    {item.thursday || '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className={`text-sm ${!item.friday ? 'text-gray-400' : 'text-gray-900 whitespace-pre-line'}`}>
                                                    {item.friday || '-'}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                                            No schedule found for this school year
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </TeacherLayout>
    )
}
