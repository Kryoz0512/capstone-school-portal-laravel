import { Head, router } from '@inertiajs/react'
import StudentLayout from '@/layouts/student-layout'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Search, BookOpen } from 'lucide-react'
import { useState } from 'react'

type Subject = {
    id: number
    subjectCode: string
    subjectName: string
    instructor: string
    status: 'Active'
}

type SchoolYear = {
    value: string
    label: string
}

type Props = {
    subjects: Subject[]
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

export default function EnrolledSubjects({ subjects, schoolYears, filters, auth }: Props) {
    const [search, setSearch] = useState('')

    const handleSchoolYearChange = (value: string) => {
        router.get('/student/enrolled-subjects', { school_year: value }, {
            preserveState: true,
            preserveScroll: true,
        })
    }

    const filteredSubjects = subjects.filter(subject => {
        const searchLower = search.toLowerCase()
        return (
            subject.subjectName.toLowerCase().includes(searchLower) ||
            subject.subjectCode.toLowerCase().includes(searchLower) ||
            subject.instructor.toLowerCase().includes(searchLower)
        )
    })

    return (
        <StudentLayout user={auth?.user}>
            <Head title="Enrolled Subjects" />

            <div className="space-y-6">

                {/* Page Header */}
                {/* FIX: was flex items-center justify-between — collides on mobile */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Enrolled Subjects</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Your registered courses for school year {filters.school_year}
                        </p>
                    </div>
                    <div className="sm:text-right">
                        <p className="text-2xl font-bold text-purple-800">{subjects.length}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Total Subjects</p>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="w-full sm:w-56">
                        <Select value={filters.school_year} onValueChange={handleSchoolYearChange}>
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
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search by subject name, code, or instructor..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 bg-white border-gray-200"
                        />
                    </div>
                </div>

                {/* Table */}
                {filteredSubjects.length > 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900">
                                        {/* FIX: hide # column on mobile */}
                                        <th className="hidden sm:table-cell px-3 sm:px-6 py-3.5 text-left text-xs font-semibold text-white uppercase tracking-wider w-8">
                                            #
                                        </th>
                                        <th className="px-3 sm:px-6 py-3.5 text-left text-xs font-semibold text-white uppercase tracking-wider">
                                            Subject Code
                                        </th>
                                        <th className="px-3 sm:px-6 py-3.5 text-left text-xs font-semibold text-white uppercase tracking-wider">
                                            Subject Name
                                        </th>
                                        <th className="hidden sm:table-cell px-3 sm:px-6 py-3.5 text-left text-xs font-semibold text-white uppercase tracking-wider">
                                            Instructor
                                        </th>
                                        <th className="px-3 sm:px-6 py-3.5 text-center text-xs font-semibold text-white uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredSubjects.map((subject, index) => (
                                        <tr
                                            key={subject.id}
                                            className={`transition-colors hover:bg-purple-50/40 ${
                                                index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                                            }`}
                                        >
                                            {/* FIX: hide # cell on mobile to match header */}
                                            <td className="hidden sm:table-cell px-3 sm:px-6 py-4 text-sm text-gray-400 font-medium">
                                                {index + 1}
                                            </td>
                                            <td className="px-3 sm:px-6 py-4 text-sm font-semibold text-gray-900">
                                                {subject.subjectCode}
                                            </td>
                                            <td className="px-3 sm:px-6 py-4 text-sm font-medium text-gray-800">
                                                {subject.subjectName}
                                                {/* Show instructor under subject name on mobile */}
                                                <p className="sm:hidden text-xs text-gray-500 mt-0.5">{subject.instructor}</p>
                                            </td>
                                            <td className="hidden sm:table-cell px-3 sm:px-6 py-4 text-sm text-gray-600">
                                                {subject.instructor}
                                            </td>
                                            <td className="px-3 sm:px-6 py-4 text-center">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                                    {subject.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Table Footer */}
                        <div className="px-4 sm:px-6 py-3 border-t border-gray-100 bg-gray-50/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                            <p className="text-xs text-gray-500">
                                Showing {filteredSubjects.length} of {subjects.length} subject{subjects.length !== 1 ? 's' : ''}
                            </p>
                            <p className="text-xs text-gray-400">
                                School Year {filters.school_year}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-dashed border-gray-300 p-10 sm:p-14 text-center">
                        <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BookOpen className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-sm font-semibold text-gray-600">No subjects found</p>
                        <p className="text-xs text-gray-400 mt-1">
                            {search
                                ? 'Try adjusting your search query.'
                                : 'You are not currently enrolled in any subjects.'}
                        </p>
                    </div>
                )}
            </div>
        </StudentLayout>
    )
}