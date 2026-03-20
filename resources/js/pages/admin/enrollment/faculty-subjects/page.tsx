import { Head } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'

type Assignment = {
    id: number
    subjectCode: string
    subjectName: string
    gradeLevel: number
    description: string
    assignedTeacher: string
    status: 'Assigned'
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

export default function FacultySubjects({ auth }: Props) {
    const [gradeFilter, setGradeFilter] = useState('All Grades')
    const [subjectFilter, setSubjectFilter] = useState('All Subjects')

    const assignments: Assignment[] = [
        { id: 1, subjectCode: 'ENG 10', subjectName: 'English', gradeLevel: 10, description: 'Basic English', assignedTeacher: 'Mr. Smith', status: 'Assigned' },
        { id: 2, subjectCode: 'MATH 10', subjectName: 'Mathematics', gradeLevel: 10, description: 'Algebra & Geometry', assignedTeacher: 'Ms. Johnson', status: 'Assigned' },
        { id: 3, subjectCode: 'SCI 10', subjectName: 'Science', gradeLevel: 10, description: 'Physics & Chemistry', assignedTeacher: 'Mr. Garcia', status: 'Assigned' },
        { id: 4, subjectCode: 'HIST 9', subjectName: 'History', gradeLevel: 9, description: 'World History', assignedTeacher: 'Ms. Lopez', status: 'Assigned' },
        { id: 5, subjectCode: 'PE 10', subjectName: 'Physical Education', gradeLevel: 10, description: 'Sports & Wellness', assignedTeacher: 'Mr. Davis', status: 'Assigned' }
    ]

    return (
        <AdminLayout user={auth?.user}>
            <Head title="Faculty & Subjects" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Faculty & Subjects</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Manage subject assignments and validate teacher-subject alignment
                        </p>
                    </div>
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                        + Assign Subject
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-600 font-medium">Total Subjects</p>
                        <p className="text-3xl font-bold text-blue-900 mt-2">5</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-600 font-medium">Aligned Assignments</p>
                        <p className="text-3xl font-bold text-green-900 mt-2">5</p>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-yellow-600 font-medium">Unmet Assignment</p>
                        <p className="text-3xl font-bold text-yellow-900 mt-2">0</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-sm font-semibold text-gray-900 mb-4">Filters</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Subject Name
                            </label>
                            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All Subjects">All Subjects</SelectItem>
                                    <SelectItem value="English">English</SelectItem>
                                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                        <h2 className="text-sm font-semibold text-gray-900">Subject Assignments</h2>
                    </div>

                    <div className="p-4 border-b border-gray-200">
                        <p className="text-sm text-gray-600">Showing 1 to 5 of 5 entries</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Subject Code</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Subject Name</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Grade Level</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Description</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Assigned Teacher</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {assignments.map((assignment) => (
                                    <tr key={assignment.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-900">{assignment.subjectCode}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{assignment.subjectName}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{assignment.gradeLevel}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{assignment.description}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{assignment.assignedTeacher}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                {assignment.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button className="text-gray-600 hover:text-green-600">
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button className="text-gray-600 hover:text-red-600">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 bg-blue-50 border-t border-blue-200">
                        <div className="flex items-start gap-2">
                            <div className="text-blue-600 mt-0.5">ℹ️</div>
                            <div>
                                <p className="text-sm font-medium text-blue-900">About Teacher-Subject Alignment</p>
                                <p className="text-sm text-blue-700 mt-1">
                                    The system validates that assigned teachers have the proper specialization and teach the assigned grade level. Review alignment status and adjust assignments as needed.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
