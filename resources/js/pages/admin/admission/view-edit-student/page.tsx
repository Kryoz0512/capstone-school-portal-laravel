import { Head, router } from '@inertiajs/react'
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

type GradeLevel = {
    id: number
    name: string
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
    students?: Student[]
    gradeLevels?: GradeLevel[]
}

export default function ViewEditStudent({ auth, students = [], gradeLevels = [] }: Props) {
    const [nameSearch, setNameSearch] = useState('')
    const [lrnSearch, setLrnSearch] = useState('')
    const [gradeFilter, setGradeFilter] = useState('all')
    const [sectionFilter, setSectionFilter] = useState('')

    // Filter students based on search criteria
    const filteredStudents = students.filter(student => {
        const matchesName = student.studentName.toLowerCase().includes(nameSearch.toLowerCase())
        const matchesLrn = student.lrn.toLowerCase().includes(lrnSearch.toLowerCase())
        const matchesGrade = gradeFilter === 'all' || student.gradeLevel === gradeFilter
        
        return matchesName && matchesLrn && matchesGrade
    })

    const handleEdit = (student: Student) => {
        router.visit(`/admin/admission/view-edit-student/${student.id}/edit`)
    }

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
                                    <SelectItem value="all">All Grades</SelectItem>
                                    {gradeLevels.map((grade) => (
                                        <SelectItem key={grade.id} value={grade.name}>
                                            {grade.name}
                                        </SelectItem>
                                    ))}
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
                            Showing {filteredStudents.length} of {students.length} entries
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
                                {filteredStudents.length > 0 ? (
                                    filteredStudents.map((student) => (
                                        <tr key={student.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-900">{student.studentName}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{student.lrn}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{student.gradeLevel}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{student.section}</td>
                                            <td className="px-6 py-4">
                                                <button 
                                                    className="text-gray-600 hover:text-green-600"
                                                    onClick={() => handleEdit(student)}
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                                            {students.length === 0 
                                                ? 'No enrolled students found. Students will appear here after being assigned a section.'
                                                : 'No students match your search criteria.'
                                            }
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
