import { Head } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Pencil } from 'lucide-react'
import { useState } from 'react'

type Student = {
    id: number
    studentName: string
    lrn: string
    gradeLevel: string
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

export default function ViewEditStudent({ auth }: Props) {
    const [nameSearch, setNameSearch] = useState('')
    const [lrnSearch, setLrnSearch] = useState('')
    const [gradeFilter, setGradeFilter] = useState('All Grades')
    const [sectionFilter, setSectionFilter] = useState('')

    const students: Student[] = [
        { id: 1, studentName: 'John Doe', lrn: 'LRN-001', gradeLevel: '10', section: 'Grade 10-A' },
        { id: 2, studentName: 'Jane Smith', lrn: 'LRN-002', gradeLevel: '11', section: 'Grade 11-B' },
        { id: 3, studentName: 'Michael Johnson', lrn: 'LRN-003', gradeLevel: '9', section: 'Grade 9-C' },
        { id: 4, studentName: 'Sarah Williams', lrn: 'LRN-004', gradeLevel: '12', section: 'Grade 12-A' },
        { id: 5, studentName: 'Robert Brown', lrn: 'LRN-005', gradeLevel: '10', section: 'Grade 10-B' }
    ]

    return (
        <AdminLayout user={auth?.user}>
            <Head title="View & Edit Student Information" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">View & Edit Student Information</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Search and manage student records
                    </p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Filter Students</h2>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Student Name
                            </label>
                            <Input
                                type="text"
                                placeholder="Search by name"
                                value={nameSearch}
                                onChange={(e) => setNameSearch(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                LRN
                            </label>
                            <Input
                                type="text"
                                placeholder="Search by LRN"
                                value={lrnSearch}
                                onChange={(e) => setLrnSearch(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Grade Level
                            </label>
                            <Select value={gradeFilter} onValueChange={setGradeFilter}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All Grades">All Grades</SelectItem>
                                    <SelectItem value="9">Grade 9</SelectItem>
                                    <SelectItem value="10">Grade 10</SelectItem>
                                    <SelectItem value="11">Grade 11</SelectItem>
                                    <SelectItem value="12">Grade 12</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Section
                            </label>
                            <Input
                                type="text"
                                placeholder="Select a specific grade level first"
                                value={sectionFilter}
                                onChange={(e) => setSectionFilter(e.target.value)}
                                disabled
                                className="bg-gray-100"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                        <p className="text-sm text-gray-600">
                            Showing 1 to {students.length} of {students.length} entries
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Student Name</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">LRN</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Grade Level</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Section</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {students.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-900">{student.studentName}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{student.lrn}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{student.gradeLevel}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{student.section}</td>
                                        <td className="px-6 py-4">
                                            <button className="text-gray-600 hover:text-green-600">
                                                <Pencil className="w-4 h-4" />
                                            </button>
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
