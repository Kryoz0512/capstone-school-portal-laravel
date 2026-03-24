import { Head } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AddTeacherModal from '@/components/modals/add-teacher-modal'
import EditTeacherModal from '@/components/modals/edit-teacher-modal'
import DeleteTeacherModal from '@/components/modals/delete-teacher-modal'
import { Pencil, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useMemo } from 'react'

type Teacher = {
    id: number
    employee_no: string
    name: string
    email: string
    subject: string
    position: string
    updated_by: string | null
    updated_at: string | null
}

type GradeLevel = {
    id: number
    name: string
}

type Subject = {
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
    teachers: Teacher[]
    gradeLevels: GradeLevel[]
    subjects: Subject[]
}

export default function TeacherManagement({ auth, teachers = [], gradeLevels = [], subjects = [] }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
    
    // Filter states
    const [searchQuery, setSearchQuery] = useState('')
    const [subjectFilter, setSubjectFilter] = useState('all')
    const [positionFilter, setPositionFilter] = useState('all')
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)

    // Get unique subjects and positions
    const uniqueSubjects = useMemo(() => {
        const subjectSet = new Set(teachers.map(t => t.subject))
        return Array.from(subjectSet).sort()
    }, [teachers])

    const uniquePositions = useMemo(() => {
        const positionSet = new Set(teachers.map(t => t.position))
        return Array.from(positionSet).sort()
    }, [teachers])

    // Filter teachers
    const filteredTeachers = useMemo(() => {
        return teachers.filter(teacher => {
            const matchesSearch = searchQuery === '' || 
                teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                teacher.employee_no.toLowerCase().includes(searchQuery.toLowerCase())
            
            const matchesSubject = subjectFilter === 'all' || teacher.subject === subjectFilter
            const matchesPosition = positionFilter === 'all' || teacher.position === positionFilter

            return matchesSearch && matchesSubject && matchesPosition
        })
    }, [teachers, searchQuery, subjectFilter, positionFilter])

    // Paginate filtered teachers
    const paginatedTeachers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        return filteredTeachers.slice(startIndex, endIndex)
    }, [filteredTeachers, currentPage, itemsPerPage])

    const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage)

    // Reset to page 1 when filters change
    useMemo(() => {
        setCurrentPage(1)
    }, [searchQuery, subjectFilter, positionFilter, itemsPerPage])

    const totalTeachers = teachers.length
    const filteredCount = filteredTeachers.length

    const handleEdit = (teacher: Teacher) => {
        setSelectedTeacher(teacher)
        setIsEditModalOpen(true)
    }

    const handleDelete = (teacher: Teacher) => {
        setSelectedTeacher(teacher)
        setIsDeleteModalOpen(true)
    }

    return (
        <AdminLayout user={auth?.user}>
            <Head title="Teacher Management" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Teacher Management</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Create and manage teacher accounts with assignment tracking
                        </p>
                    </div>
                    <Button 
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => setIsModalOpen(true)}
                    >
                        + New Teacher
                    </Button>
                </div>

                <AddTeacherModal 
                    open={isModalOpen} 
                    onOpenChange={setIsModalOpen} 
                    gradeLevels={gradeLevels}
                    subjects={subjects} 
                />
                <EditTeacherModal 
                    open={isEditModalOpen} 
                    onOpenChange={setIsEditModalOpen} 
                    teacher={selectedTeacher}
                    gradeLevels={gradeLevels}
                    subjects={subjects}
                />
                <DeleteTeacherModal
                    open={isDeleteModalOpen}
                    onOpenChange={setIsDeleteModalOpen}
                    teacher={selectedTeacher}
                />

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-600 font-medium">Total Teachers</p>
                        <p className="text-3xl font-bold text-blue-900 mt-2">{totalTeachers}</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-600 font-medium">Active Accounts</p>
                        <p className="text-3xl font-bold text-green-900 mt-2">{totalTeachers}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Search
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Search by name or employee number..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Subject
                            </label>
                            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Subjects" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Subjects</SelectItem>
                                    {uniqueSubjects.map((subject) => (
                                        <SelectItem key={subject} value={subject}>
                                            {subject}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Position
                            </label>
                            <Select value={positionFilter} onValueChange={setPositionFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Positions" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Positions</SelectItem>
                                    {uniquePositions.map((position) => (
                                        <SelectItem key={position} value={position}>
                                            {position}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Employee No.</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Subject</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Position</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Last Updated</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {paginatedTeachers.length > 0 ? (
                                    paginatedTeachers.map((teacher) => (
                                        <tr key={teacher.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-900">{teacher.employee_no}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{teacher.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{teacher.email}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{teacher.subject}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{teacher.position}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {teacher.updated_by && teacher.updated_at ? (
                                                    <div>
                                                        <div className="text-xs">By: {teacher.updated_by}</div>
                                                        <div className="text-xs text-gray-500">{teacher.updated_at}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        className="text-gray-600 hover:text-green-600"
                                                        onClick={() => handleEdit(teacher)}
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        className="text-gray-600 hover:text-red-600"
                                                        onClick={() => handleDelete(teacher)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                                            {searchQuery || subjectFilter !== 'all' || positionFilter !== 'all' 
                                                ? 'No teachers found matching your filters.'
                                                : 'No teachers found. Click "+ New Teacher" to add one.'
                                            }
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {filteredTeachers.length > 0 && (
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
                                        // Show first page, last page, current page, and pages around current
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
