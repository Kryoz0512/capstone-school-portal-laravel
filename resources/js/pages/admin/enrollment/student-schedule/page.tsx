import { Head } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

type Student = {
    id: number
    studentName: string
    lrn: string
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
}

export default function StudentSchedule({ auth }: Props) {
    const [searchTerm, setSearchTerm] = useState('')

    const students: Student[] = [
        { id: 1, studentName: 'Alice Johnson', lrn: 'LRN-001', section: 'Grade 10-A' },
        { id: 2, studentName: 'Bob Smith', lrn: 'LRN-002', section: 'Grade 10-A' },
        { id: 3, studentName: 'Carol Davis', lrn: 'LRN-003', section: 'Grade 10-B' }
    ]

    const filteredStudents = students.filter(student =>
        student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.lrn.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <AdminLayout user={auth?.user}>
            <Head title="Student Schedule" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Student Schedule</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        View student schedules
                    </p>
                </div>

                {/* Search */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-sm font-semibold text-gray-900 mb-4">Search</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Student Name or LRN
                        </label>
                        <Input
                            type="text"
                            placeholder="Search student..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-md"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Student Name</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">LRN</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Section</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredStudents.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-900">{student.studentName}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{student.lrn}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{student.section}</td>
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
