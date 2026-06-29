import { Head, router } from '@inertiajs/react'
import AdviserLayout from '@/layouts/adviser-layout'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UserSquare2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { teacherTableHeaderCellClass, teacherTableHeaderClass } from '@/components/data-table-pagination'

type SubjectTeacher = {
    id: number
    subject_name: string
    subject_code: string | null
    teacher_id: number
    teacher_name: string
}
type Section = { id: number; name: string; grade_level_name: string }
type SchoolYear = { value: string; label: string }
type Props = {
    section: Section | null
    schoolYears: SchoolYear[]
    subjects: SubjectTeacher[]
    filters: { school_year: string }
    noAssignment: boolean
    auth?: { user: { id: number; name: string; email: string; role: string } }
}

export default function SubjectTeachers({ section, schoolYears, subjects, filters, noAssignment, auth }: Props) {
    const [schoolYear, setSchoolYear] = useState(filters.school_year || '')

    useEffect(() => {
        const params = new URLSearchParams()
        if (schoolYear) params.set('school_year', schoolYear)
        router.get(`/adviser/subject-teachers?${params.toString()}`, {}, { preserveState: true, preserveScroll: true })
    }, [schoolYear])

    return (
        <AdviserLayout user={auth?.user}>
            <Head title="Subject Teachers" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Subject Teachers</h1>
                    <p className="text-sm text-gray-500 mt-1">Teachers assigned to each subject in your advisory class</p>
                </div>

                {noAssignment ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                        <p className="text-amber-800 font-medium">No advisory class assigned</p>
                    </div>
                ) : (
                    <>
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {section && (
                                    <div>
                                        <p className="text-sm text-gray-500">Advisory Section</p>
                                        <p className="text-base font-semibold text-gray-900">{section.grade_level_name} - {section.name}</p>
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">School Year</label>
                                    <Select value={schoolYear} onValueChange={setSchoolYear}>
                                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {schoolYears.map(y => <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[500px]">
                                    <thead className={teacherTableHeaderClass}>
                                        <tr>
                                            <th className={teacherTableHeaderCellClass}>No.</th>
                                            <th className={teacherTableHeaderCellClass}>Subject</th>
                                            <th className={teacherTableHeaderCellClass}>Subject Code</th>
                                            <th className={teacherTableHeaderCellClass}>Teacher</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {subjects.length > 0 ? subjects.map((item, index) => (
                                            <tr key={`${item.id}-${item.teacher_id}`} className="hover:bg-gray-50">
                                                <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-900">{index + 1}</td>
                                                <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm font-medium text-gray-900">{item.subject_name}</td>
                                                <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-600">{item.subject_code || '—'}</td>
                                                <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-900">{item.teacher_name}</td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-12 text-center">
                                                    <UserSquare2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                                    <p className="text-sm text-gray-500">No subjects scheduled for this advisory class yet</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AdviserLayout>
    )
}
