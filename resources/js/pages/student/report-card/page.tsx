import { Head, router } from '@inertiajs/react'
import StudentLayout from '@/layouts/student-layout'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState, useEffect } from 'react'

type Grade = {
    id: number
    subject: string
    teacher: string
    quarter1: number | null
    quarter2: number | null
    quarter3: number | null
    quarter4: number | null
    finalGrade: number | null
}

type SchoolYear = {
    value: string
    label: string
}

type StudentInfo = {
    lrn: string
    name: string
    gradeLevel: string
    section: string
    adviser: string
}

type Props = {
    grades: Grade[]
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

export default function ReportCard({ grades, schoolYears, studentInfo, filters, auth }: Props) {
    const [schoolYear, setSchoolYear] = useState(filters.school_year || '')

    // Update filter when selection changes
    useEffect(() => {
        if (schoolYear) {
            router.get(`/student/report-card?school_year=${schoolYear}`, {}, {
                preserveState: true,
                preserveScroll: true,
            })
        }
    }, [schoolYear])

    return (
        <StudentLayout user={auth?.user}>
            <Head title="Report Card" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Report Card</h1>
                    <p className="text-sm text-gray-500 mt-1">Your academic performance</p>
                </div>

                {/* Student Info Card */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Student LRN:</p>
                            <p className="text-base font-semibold text-gray-900">{studentInfo.lrn}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Student Name:</p>
                            <p className="text-base font-semibold text-gray-900">{studentInfo.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Grade Level:</p>
                            <p className="text-base font-semibold text-gray-900">{studentInfo.gradeLevel}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Section:</p>
                            <p className="text-base font-semibold text-gray-900">{studentInfo.section}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Section Adviser:</p>
                            <p className="text-base font-semibold text-gray-900">{studentInfo.adviser}</p>
                        </div>
                    </div>
                </div>

                {/* Filter */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="max-w-xs">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by School Year</label>
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

                {/* Grades Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    {grades.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-green-700 text-white">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-medium">Subject</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium">Teacher</th>
                                        <th className="px-6 py-3 text-center text-sm font-medium">Quarter 1</th>
                                        <th className="px-6 py-3 text-center text-sm font-medium">Quarter 2</th>
                                        <th className="px-6 py-3 text-center text-sm font-medium">Quarter 3</th>
                                        <th className="px-6 py-3 text-center text-sm font-medium">Quarter 4</th>
                                        <th className="px-6 py-3 text-center text-sm font-medium">Final Grade</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {grades.map((grade) => (
                                        <tr key={grade.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-900">{grade.subject}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{grade.teacher}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900 text-center">
                                                {grade.quarter1 ?? '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 text-center">
                                                {grade.quarter2 ?? '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 text-center">
                                                {grade.quarter3 ?? '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 text-center">
                                                {grade.quarter4 ?? '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-center">
                                                {grade.finalGrade ?? '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            No grades found for this school year
                        </div>
                    )}
                </div>
            </div>
        </StudentLayout>
    )
}
