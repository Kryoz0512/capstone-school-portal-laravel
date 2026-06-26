import { Head, router } from '@inertiajs/react'
import TeacherLayout from '@/layouts/teacher-layout'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState, useEffect } from 'react'
import { teacherTableHeaderCellCenterClass, teacherTableHeaderCellClass, teacherTableHeaderClass } from '@/components/data-table-pagination'

type ScheduleItem = { time: string; monday: string; tuesday: string; wednesday: string; thursday: string; friday: string }
type SchoolYear = { value: string; label: string }
type Props = {
    schedules: ScheduleItem[]; schoolYears: SchoolYear[]
    filters: { school_year: string }
    auth?: { user: { id: number; name: string; email: string; role: string } }
}

export default function Schedule({ schedules, schoolYears, filters, auth }: Props) {
    const [schoolYear, setSchoolYear] = useState(filters.school_year || '')

    useEffect(() => {
        if (schoolYear) router.get(`/teacher/schedule?school_year=${schoolYear}`, {}, { preserveState: true, preserveScroll: true })
    }, [schoolYear])

    const days: { key: keyof ScheduleItem; label: string }[] = [
        { key: 'monday', label: 'Mon' },
        { key: 'tuesday', label: 'Tue' },
        { key: 'wednesday', label: 'Wed' },
        { key: 'thursday', label: 'Thu' },
        { key: 'friday', label: 'Fri' },
    ]

    return (
        <TeacherLayout user={auth?.user}>
            <Head title="Schedule" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Schedule</h1>
                    <p className="text-sm text-gray-500 mt-1">View your weekly teaching schedule</p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <h2 className="text-base font-semibold text-gray-900">Filter Options</h2>
                    </div>
                    <div className="p-4 sm:p-6">
                        <div className="w-full sm:max-w-xs">
                            <label className="block text-sm font-medium text-gray-700 mb-2">School Year <span className="text-red-500">*</span></label>
                            <Select value={schoolYear} onValueChange={setSchoolYear}>
                                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                <SelectContent>{schoolYears.map(y => <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[500px]">
                            <thead className={teacherTableHeaderClass}>
                                <tr>
                                    <th className={`${teacherTableHeaderCellClass} w-24 sm:w-40`}>Time</th>
                                    {days.map(d => (
                                        <th key={d.key} className={teacherTableHeaderCellCenterClass}>
                                            <span className="hidden sm:inline">{d.label === 'Mon' ? 'Monday' : d.label === 'Tue' ? 'Tuesday' : d.label === 'Wed' ? 'Wednesday' : d.label === 'Thu' ? 'Thursday' : 'Friday'}</span>
                                            <span className="sm:hidden">{d.label}</span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {schedules.length > 0 ? schedules.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-gray-900 whitespace-nowrap">{item.time}</td>
                                        {days.map(d => (
                                            <td key={d.key} className="px-2 sm:px-6 py-3 sm:py-4 text-center">
                                                <div className={`text-xs sm:text-sm ${!item[d.key] ? 'text-gray-400' : 'text-gray-900 whitespace-pre-line'}`}>
                                                    {item[d.key] || '-'}
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                )) : (
                                    <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">No schedule found for this school year</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </TeacherLayout>
    )
}