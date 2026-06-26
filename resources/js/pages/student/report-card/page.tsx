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

    useEffect(() => {
        if (schoolYear) {
            router.get(`/student/report-card?school_year=${schoolYear}`, {}, {
                preserveState: true,
                preserveScroll: true,
            })
        }
    }, [schoolYear])

    const finalAverage = grades.length > 0
        ? (() => {
            const gradesWithFinal = grades.filter(g => g.finalGrade !== null)
            if (gradesWithFinal.length === 0) return null
            const avg = gradesWithFinal.reduce((sum, g) => sum + (g.finalGrade as number), 0) / gradesWithFinal.length
            return Math.round(avg * 100) / 100
        })()
        : null

    return (
        <StudentLayout user={auth?.user}>
            <Head title="Report Card" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Report Card</h1>
                    <p className="text-sm text-gray-500 mt-1">Your academic performance</p>
                </div>

                {/* Student Info Card */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 sm:p-6">
                    {/* FIX: was md:grid-cols-2 lg:grid-cols-5, skipped sm breakpoint */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                        <div>
                            <p className="text-xs sm:text-sm text-gray-600 mb-1">Student LRN</p>
                            <p className="text-sm sm:text-base font-semibold text-gray-900">{studentInfo.lrn}</p>
                        </div>
                        <div>
                            <p className="text-xs sm:text-sm text-gray-600 mb-1">Student Name</p>
                            <p className="text-sm sm:text-base font-semibold text-gray-900">{studentInfo.name}</p>
                        </div>
                        <div>
                            <p className="text-xs sm:text-sm text-gray-600 mb-1">Grade Level</p>
                            <p className="text-sm sm:text-base font-semibold text-gray-900">{studentInfo.gradeLevel}</p>
                        </div>
                        <div>
                            <p className="text-xs sm:text-sm text-gray-600 mb-1">Section</p>
                            <p className="text-sm sm:text-base font-semibold text-gray-900">{studentInfo.section}</p>
                        </div>
                        <div>
                            <p className="text-xs sm:text-sm text-gray-600 mb-1">Section Adviser</p>
                            <p className="text-sm sm:text-base font-semibold text-gray-900">{studentInfo.adviser}</p>
                        </div>
                    </div>
                </div>

                {/* Filter */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                    <div className="w-full sm:max-w-sm">
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
                            {/* min-w forces scroll rather than squish on mobile */}
                            <table className="w-full min-w-[600px]">
                                <thead className="bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 text-white">
                                    <tr>
                                        <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium">Subject</th>
                                        <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium">Teacher</th>
                                        <th className="px-2 sm:px-6 py-3 text-center text-xs sm:text-sm font-medium">Q1</th>
                                        <th className="px-2 sm:px-6 py-3 text-center text-xs sm:text-sm font-medium">Q2</th>
                                        <th className="px-2 sm:px-6 py-3 text-center text-xs sm:text-sm font-medium">Q3</th>
                                        <th className="px-2 sm:px-6 py-3 text-center text-xs sm:text-sm font-medium">Q4</th>
                                        <th className="px-2 sm:px-6 py-3 text-center text-xs sm:text-sm font-medium">Final</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {grades.map((grade) => (
                                        <tr key={grade.id} className="hover:bg-gray-50">
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900">{grade.subject}</td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900">{grade.teacher}</td>
                                            <td className="px-2 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 text-center">
                                                {grade.quarter1 ?? '—'}
                                            </td>
                                            <td className="px-2 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 text-center">
                                                {grade.quarter2 ?? '—'}
                                            </td>
                                            <td className="px-2 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 text-center">
                                                {grade.quarter3 ?? '—'}
                                            </td>
                                            <td className="px-2 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 text-center">
                                                {grade.quarter4 ?? '—'}
                                            </td>
                                            <td className="px-2 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-gray-900 text-center">
                                                {grade.finalGrade ?? '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                {finalAverage !== null && (
                                    <tfoot>
                                        <tr className="bg-gray-50 border-t-2 border-gray-300">
                                            {/*
                                              FIX: colSpan was 5 — misaligned. Table has 7 cols total.
                                              "General Average" label spans cols 1–6 (subject, teacher, Q1–Q4),
                                              leaving col 7 (final grade) for the average value.
                                              pass/fail badge moved into the label cell to avoid a dangling empty col.
                                            */}
                                            <td colSpan={6} className="px-3 sm:px-6 py-4 text-xs sm:text-sm text-gray-500 font-medium">
                                                <div className="flex items-center gap-3">
                                                    <span>General Average</span>
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        finalAverage >= 75
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {finalAverage >= 75 ? 'Passed' : 'Failed'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-2 sm:px-6 py-4 text-center text-base font-bold text-gray-900">
                                                {finalAverage.toFixed(2)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                )}
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