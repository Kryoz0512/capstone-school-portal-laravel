import { Head } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Pencil, ChevronLeft, ChevronRight } from 'lucide-react'
import EditStudentAssignmentModal from '@/components/modals/edit-student-assignment-modal'
import { useState, useMemo } from 'react'

type Student = {
    id: number
    studentName: string
    lrn: string
    gender: string
    age: number
    gradeLevel: string
    gradeLevelId: number | null
    section: string
    studentStatus: string
}

type GradeLevel = {
    id: number
    name: string
}

type Section = {
    id: number
    name: string
    grade_level_id: number
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
    sections?: Section[]
}

export default function StudentNotEnrolled({ auth, students = [], gradeLevels = [], sections = [] }: Props) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)

    // Pagination
    const totalPages = Math.ceil(students.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedStudents = students.slice(startIndex, endIndex)

    // Reset to page 1 when itemsPerPage changes
    useMemo(() => {
        setCurrentPage(1)
    }, [itemsPerPage])

    const totalStudents = students.length
    const pendingAssignment = students.filter(s => !s.gradeLevel || !s.section).length
    const assigned = students.filter(s => s.gradeLevel && s.section).length

    const handleEdit = (student: Student) => {
        setSelectedStudent(student)
        setIsEditModalOpen(true)
    }

    return (
        <AdminLayout user={auth?.user}>
            <Head title="Students Not Enrolled" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Students Not Enrolled</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage and assign grade levels and sections to students
                    </p>
                </div>

                <EditStudentAssignmentModal 
                    open={isEditModalOpen}
                    onOpenChange={setIsEditModalOpen}
                    student={selectedStudent}
                    gradeLevels={gradeLevels}
                    sections={sections}
                />

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-600 font-medium">Total Students</p>
                        <p className="text-3xl font-bold text-blue-900 mt-2">{totalStudents}</p>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-yellow-600 font-medium">Pending Assignment</p>
                        <p className="text-3xl font-bold text-yellow-900 mt-2">{pendingAssignment}</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-600 font-medium">Assigned</p>
                        <p className="text-3xl font-bold text-green-900 mt-2">{assigned}</p>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                        <h2 className="text-sm font-semibold text-gray-900">Students List</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Click on a student to assign grade level and section
                        </p>
                    </div>

                    <div className="p-4 border-b border-gray-200">
                        <p className="text-sm text-gray-600">
                            Showing {students.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, students.length)} of {students.length} entries
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Student Name</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">LRN</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Gender</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Age</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Grade Level</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Section</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {paginatedStudents.length > 0 ? (
                                    paginatedStudents.map((student) => (
                                        <tr key={student.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-900">{student.studentName}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{student.lrn}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{student.gender}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{student.age || '-'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{student.gradeLevel || '-'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{student.section || '-'}</td>
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
                                        <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                                            No students found. Students will appear here after registration.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {students.length > 0 && (
                        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Show</span>
                                <Select 
                                    value={itemsPerPage.toString()} 
                                    onValueChange={(value) => setItemsPerPage(Number(value))}
                                >
                                    <SelectTrigger className="w-20">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="25">25</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                    </SelectContent>
                                </Select>
                                <span className="text-sm text-gray-600">entries</span>
                            </div>
                            <p className="text-sm text-gray-600">
                                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, students.length)} of {students.length} entries
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            
                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map((page) => {
                                    if (
                                        page === 1 ||
                                        page === totalPages ||
                                        (page >= currentPage - 1 && page <= currentPage + 1)
                                    ) {
                                        return (
                                            <Button
                                                key={page}
                                                variant={currentPage === page ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setCurrentPage(page)}
                                                className={currentPage === page ? "bg-blue-600 hover:bg-blue-700" : ""}
                                            >
                                                {page}
                                            </Button>
                                        )
                                    } else if (
                                        page === currentPage - 2 ||
                                        page === currentPage + 2
                                    ) {
                                        return <span key={page} className="px-2">...</span>
                                    }
                                    return null
                                })}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    )
}
