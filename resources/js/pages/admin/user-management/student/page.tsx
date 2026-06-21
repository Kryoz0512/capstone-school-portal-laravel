import { Head } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import ResetStudentPasswordModal from '@/components/modals/reset-student-password-modal'
import { KeyRound, Search, ChevronLeft, ChevronRight, ShieldAlert, Users } from 'lucide-react'
import { useState, useMemo } from 'react'

type Student = {
    id: number
    lrn: string
    name: string
    grade_level: string
    requires_password_change: boolean
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
        admin?: {
            role: string
            position: string
        }
    }
    students: Student[]
    gradeLevels: GradeLevel[]
}

export default function StudentUserManagement({ auth, students = [], gradeLevels = [] }: Props) {
    const [isResetModalOpen, setIsResetModalOpen] = useState(false)
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

    const [searchQuery, setSearchQuery] = useState('')
    const [gradeLevelFilter, setGradeLevelFilter] = useState('all')

    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)

    const filteredStudents = useMemo(() => {
        return students.filter(student => {
            const matchesSearch = searchQuery === '' ||
                student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                student.lrn.includes(searchQuery)

            const matchesGradeLevel = gradeLevelFilter === 'all' || student.grade_level === gradeLevelFilter

            return matchesSearch && matchesGradeLevel
        })
    }, [students, searchQuery, gradeLevelFilter])

    const paginatedStudents = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        return filteredStudents.slice(startIndex, endIndex)
    }, [filteredStudents, currentPage, itemsPerPage])

    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage)

    useMemo(() => {
        setCurrentPage(1)
    }, [searchQuery, gradeLevelFilter, itemsPerPage])

    const totalStudents = students.length
    const filteredCount = filteredStudents.length
    const pendingPasswordChange = students.filter(s => s.requires_password_change).length

    const handleResetPassword = (student: Student) => {
        setSelectedStudent(student)
        setIsResetModalOpen(true)
    }

    return (
        <AdminLayout user={auth?.user} admin={auth?.admin}>
            <Head title="Student User Management" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Student User Management</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        View student accounts and reset passwords when needed
                    </p>
                </div>

                <ResetStudentPasswordModal
                    open={isResetModalOpen}
                    onOpenChange={setIsResetModalOpen}
                    student={selectedStudent}
                />

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-600 font-medium">Total Students</p>
                            <p className="text-3xl font-bold text-blue-900 mt-2">{totalStudents}</p>
                        </div>
                        <Users className="w-10 h-10 text-blue-300" />
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-amber-600 font-medium">Pending Password Change</p>
                            <p className="text-3xl font-bold text-amber-900 mt-2">{pendingPasswordChange}</p>
                        </div>
                        <ShieldAlert className="w-10 h-10 text-amber-300" />
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                    <h2 className="text-sm font-semibold text-gray-900 mb-4">Filter Options</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Search
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Search by name or LRN..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Grade Level
                            </label>
                            <Select value={gradeLevelFilter} onValueChange={setGradeLevelFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Grade Levels" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Grade Levels</SelectItem>
                                    {gradeLevels.map((grade) => (
                                        <SelectItem key={grade.id} value={grade.name}>
                                            {grade.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-green-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">LRN</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Student Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Grade Level</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Password Status</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedStudents.length > 0 ? (
                                    paginatedStudents.map((student) => (
                                        <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 font-mono">
                                                    {student.lrn}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{student.grade_level}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {student.requires_password_change ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                                        Needs Password Change
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        Active
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-amber-700 border-amber-300 hover:bg-amber-50 hover:text-amber-800"
                                                    onClick={() => handleResetPassword(student)}
                                                >
                                                    <KeyRound className="w-4 h-4 mr-1.5" />
                                                    Reset Password
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                                <p className="text-sm font-medium text-gray-900 mb-1">
                                                    {searchQuery || gradeLevelFilter !== 'all'
                                                        ? 'No students found'
                                                        : 'No students yet'
                                                    }
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {searchQuery || gradeLevelFilter !== 'all'
                                                        ? 'Try adjusting your filters to find what you\'re looking for.'
                                                        : 'Students will appear here once they are registered.'
                                                    }
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {filteredStudents.length > 0 && (
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
                                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredCount)} of {filteredCount} entries
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
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
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
                                                    className={currentPage === page ? "bg-green-600 hover:bg-green-700" : ""}
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