import { Head } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AddSubjectModal from '@/components/modals/add-subject-modal'
import EditSubjectModal from '@/components/modals/edit-subject-modal'
import DeleteSubjectModal from '@/components/modals/delete-subject-modal'
import { Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useMemo } from 'react'

type Subject = {
    id: number
    code: string
    name: string
    description: string
    grade_level: string
    grade_level_id: number
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
    subjects: Subject[]
    gradeLevels: GradeLevel[]
}

export default function SubjectListings({ auth, subjects = [], gradeLevels = [] }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
    
    // Filter and pagination states
    const [gradeLevelFilter, setGradeLevelFilter] = useState('all')
    const [subjectNameFilter, setSubjectNameFilter] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)

    // Filter subjects by grade level and subject name
    const filteredSubjects = useMemo(() => {
        return subjects.filter(subject => {
            const matchesGradeLevel = gradeLevelFilter === 'all' || subject.grade_level === gradeLevelFilter
            const matchesSubjectName = subjectNameFilter === 'all' || subject.name === subjectNameFilter
            return matchesGradeLevel && matchesSubjectName
        })
    }, [subjects, gradeLevelFilter, subjectNameFilter])

    // Paginate filtered subjects
    const paginatedSubjects = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        return filteredSubjects.slice(startIndex, endIndex)
    }, [filteredSubjects, currentPage, itemsPerPage])

    const totalPages = Math.ceil(filteredSubjects.length / itemsPerPage)

    // Reset to page 1 when filters change
    useMemo(() => {
        setCurrentPage(1)
    }, [gradeLevelFilter, subjectNameFilter, itemsPerPage])

    // Get unique grade levels
    const uniqueGradeLevels = useMemo(() => {
        const levels = new Set(subjects.map(s => s.grade_level))
        return Array.from(levels).sort()
    }, [subjects])

    // Get unique subject names
    const uniqueSubjectNames = useMemo(() => {
        const names = new Set(subjects.map(s => s.name))
        return Array.from(names).sort()
    }, [subjects])

    const handleEdit = (subject: Subject) => {
        setSelectedSubject(subject)
        setIsEditModalOpen(true)
    }

    const handleDelete = (subject: Subject) => {
        setSelectedSubject(subject)
        setIsDeleteModalOpen(true)
    }

    return (
        <AdminLayout user={auth?.user}>
            <Head title="Subject Listings" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Subject Listings</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Manage school subjects by grade level
                        </p>
                    </div>
                    <Button 
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => setIsModalOpen(true)}
                    >
                        + Add Subject
                    </Button>
                </div>

                <AddSubjectModal 
                    open={isModalOpen} 
                    onOpenChange={setIsModalOpen}
                    gradeLevels={gradeLevels}
                />

                <EditSubjectModal 
                    open={isEditModalOpen}
                    onOpenChange={setIsEditModalOpen}
                    subject={selectedSubject}
                    gradeLevels={gradeLevels}
                />

                <DeleteSubjectModal 
                    open={isDeleteModalOpen}
                    onOpenChange={setIsDeleteModalOpen}
                    subject={selectedSubject}
                />

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-4">
                            <label className="text-sm font-medium text-gray-700">
                                Subject Name:
                            </label>
                            <Select value={subjectNameFilter} onValueChange={setSubjectNameFilter}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="All Subjects" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Subjects</SelectItem>
                                    {uniqueSubjectNames.map((name) => (
                                        <SelectItem key={name} value={name}>
                                            {name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-4">
                            <label className="text-sm font-medium text-gray-700">
                                Grade Level:
                            </label>
                            <Select value={gradeLevelFilter} onValueChange={setGradeLevelFilter}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="All Grade Levels" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Grade Levels</SelectItem>
                                    {uniqueGradeLevels.map((level) => (
                                        <SelectItem key={level} value={level}>
                                            {level}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-green-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-white">Subject Code</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Subject Name</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Description</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Grade Level</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {paginatedSubjects.length > 0 ? (
                                    paginatedSubjects.map((subject) => (
                                        <tr key={subject.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-900">{subject.code}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{subject.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{subject.description}</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    {subject.grade_level}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        className="text-gray-600 hover:text-green-600"
                                                        onClick={() => handleEdit(subject)}
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        className="text-gray-600 hover:text-red-600"
                                                        onClick={() => handleDelete(subject)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                                            {gradeLevelFilter !== 'all' || subjectNameFilter !== 'all'
                                                ? 'No subjects found matching your filters.'
                                                : 'No subjects found. Click "+ Add Subject" to add one.'
                                            }
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {filteredSubjects.length > 0 && (
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
                                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredSubjects.length)} of {filteredSubjects.length} entries
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
