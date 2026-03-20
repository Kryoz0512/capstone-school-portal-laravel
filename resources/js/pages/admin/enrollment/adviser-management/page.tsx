import { Head } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

type Adviser = {
    id: number
    section: string
    gradeLevel: string
    currentAdviser: string
    students: string
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

export default function AdviserManagement({ auth }: Props) {
    const [searchTerm, setSearchTerm] = useState('')

    const advisers: Adviser[] = [
        { id: 1, section: 'Grade 10-A', gradeLevel: 'Grade 10', currentAdviser: 'Ms. Johnson', students: '35 students' },
        { id: 2, section: 'Grade 10-B', gradeLevel: 'Grade 10', currentAdviser: 'Mr. Smith', students: '32 students' },
        { id: 3, section: 'Grade 9-A', gradeLevel: 'Grade 9', currentAdviser: 'Dr. Garcia', students: '30 students' },
        { id: 4, section: 'Grade 9-B', gradeLevel: 'Grade 9', currentAdviser: 'Ms. Lee', students: '28 students' },
        { id: 5, section: 'Grade 8-A', gradeLevel: 'Grade 8', currentAdviser: 'Mrs. Williams', students: '33 students' }
    ]

    const filteredAdvisers = advisers.filter(adviser =>
        adviser.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
        adviser.currentAdviser.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <AdminLayout user={auth?.user}>
            <Head title="Adviser Assignment" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Adviser Assignment</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Assign and manage section advisers
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-600 font-medium">Total Sections</p>
                        <p className="text-3xl font-bold text-blue-900 mt-2">5</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-600 font-medium">Assigned Advisers</p>
                        <p className="text-3xl font-bold text-green-900 mt-2">5</p>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <p className="text-sm text-purple-600 font-medium">Total Students</p>
                        <p className="text-3xl font-bold text-purple-900 mt-2">158</p>
                    </div>
                </div>

                {/* Search */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-sm font-semibold text-gray-900 mb-4">Search</h2>
                    <Input
                        type="text"
                        placeholder="Search by section or adviser name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-md"
                    />
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                        <h2 className="text-sm font-semibold text-gray-900">Section Advisers</h2>
                    </div>

                    <div className="p-4 border-b border-gray-200">
                        <p className="text-sm text-gray-600">
                            Showing 1 to {filteredAdvisers.length} of {filteredAdvisers.length} sections
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Section</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Grade Level</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Current Adviser</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Students</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredAdvisers.map((adviser) => (
                                    <tr key={adviser.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-900">{adviser.section}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {adviser.gradeLevel}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{adviser.currentAdviser}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{adviser.students}</td>
                                        <td className="px-6 py-4">
                                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                                                Assign
                                            </Button>
                                        </td>
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
