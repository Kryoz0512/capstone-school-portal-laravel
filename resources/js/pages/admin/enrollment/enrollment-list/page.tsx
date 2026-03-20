import { Head } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

type Enrollment = {
    id: number
    studentName: string
    section: string
    gradeLevel: string
    adviser: string
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
}

export default function EnrollmentList({ auth }: Props) {
    const [gradeFilter, setGradeFilter] = useState('All Grades')
    const [sectionFilter, setSectionFilter] = useState('All Sections')
    const [adviserSearch, setAdviserSearch] = useState('')

    const enrollments: Enrollment[] = [
        { id: 1, studentName: 'Alice Johnson', section: 'Grade 10-A', gradeLevel: '10', adviser: 'Ms. Johnson' },
        { id: 2, studentName: 'Bob Smith', section: 'Grade 10-A', gradeLevel: '10', adviser: 'Ms. Johnson' },
        { id: 3, studentName: 'Carol Davis', section: 'Grade 10-B', gradeLevel: '10', adviser: 'Mr. Smith' },
        { id: 4, studentName: 'David Wilson', section: 'Grade 9-A', gradeLevel: '9', adviser: 'Dr. Garcia' },
        { id: 5, studentName: 'Emma Brown', section: 'Grade 9-A', gradeLevel: '9', adviser: 'Dr. Garcia' }
    ]

    return (
        <AdminLayout user={auth?.user}>
            <Head title="Enrollment List" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Enrollment List</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        View enrolled students by section and adviser
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-sm font-semibold text-gray-900 mb-4">Filters</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Grade Level</label>
                            <Select value={gradeFilter} onValueChange={setGradeFilter}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All Grades">All Grades</SelectItem>
                                    <SelectItem value="9">Grade 9</SelectItem>
                                    <SelectItem value="10">Grade 10</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
                            <Select value={sectionFilter} onValueChange={setSectionFilter}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All Sections">All Sections</SelectItem>
                                    <SelectItem value="Grade 10-A">Grade 10-A</SelectItem>
                                    <SelectItem value="Grade 10-B">Grade 10-B</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Adviser (Search)</label>
                            <Input
                                type="text"
                                placeholder="Search adviser name..."
                                value={adviserSearch}
                                onChange={(e) => setAdviserSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                        <p className="text-sm text-gray-600">
                            Showing 1 to {enrollments.length} of {enrollments.length} entries
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Student Name</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Section</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Grade Level</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Adviser</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {enrollments.map((enrollment) => (
                                    <tr key={enrollment.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-900">{enrollment.studentName}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{enrollment.section}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{enrollment.gradeLevel}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{enrollment.adviser}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
