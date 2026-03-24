import { Head, router } from '@inertiajs/react'
import StudentLayout from '@/layouts/student-layout'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
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
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Enrolled Subjects</h1>
                    <p className="text-sm text-gray-500 mt-1">Your registered courses by school year</p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-sm font-semibold text-gray-900 mb-4">Filters</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">School Year</label>
                            <Select value={filters.school_year} onValueChange={handleSchoolYearChange}>
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
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Search Subject</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Search by name or code..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subject Summary */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Subject Summary</h2>
                    {filteredSubjects.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Subject Code</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Subject Name</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Instructor</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredSubjects.map((subject) => (
                                        <tr key={subject.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-900">{subject.subjectCode}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{subject.subjectName}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{subject.instructor}</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    {subject.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-8">
                            {search ? 'No subjects found matching your search.' : 'No enrolled subjects found.'}
                        </p>
                    )}
                </div>
            </div>
        </StudentLayout>
    )
}
