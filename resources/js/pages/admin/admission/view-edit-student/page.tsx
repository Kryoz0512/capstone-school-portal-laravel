import { Head, router } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Pencil, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'

type Student = {
    id: number
    studentName: string
    lrn: string
    gradeLevel: string
    section: string
    readyToGraduate: boolean
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
    students?: Student[]
    gradeLevels?: GradeLevel[]
}

export default function ViewEditStudent({ auth, students = [], gradeLevels = [] }: Props) {
    // Get grade level from URL query parameter if it exists
    const urlParams = new URLSearchParams(window.location.search)
    const initialGrade = urlParams.get('grade') || 'all'
    
    const [nameSearch, setNameSearch] = useState('')
    const [lrnSearch, setLrnSearch] = useState('')
    const [gradeFilter, setGradeFilter] = useState(initialGrade)
    const [sectionFilter, setSectionFilter] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [perPage, setPerPage] = useState(10)

    // Filter students based on search criteria
    const filteredStudents = students.filter(student => {
        // Must select a grade level first
        if (gradeFilter === 'all') return false
        
        const matchesName = student.studentName.toLowerCase().includes(nameSearch.toLowerCase())
        const matchesLrn = student.lrn.toLowerCase().includes(lrnSearch.toLowerCase())
        const matchesGrade = student.gradeLevel === gradeFilter
        const matchesSection = sectionFilter === '' || student.section.toLowerCase().includes(sectionFilter.toLowerCase())
        
        return matchesName && matchesLrn && matchesGrade && matchesSection
    })

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [nameSearch, lrnSearch, gradeFilter, sectionFilter, perPage])

    // Reset section filter when grade level changes
    useEffect(() => {
        setSectionFilter('')
    }, [gradeFilter])

    // Calculate pagination
    const totalPages = Math.ceil(filteredStudents.length / perPage)
    const startIndex = (currentPage - 1) * perPage
    const endIndex = startIndex + perPage
    const paginatedStudents = filteredStudents.slice(startIndex, endIndex)

    const handlePerPageChange = (newPerPage: number) => {
        setPerPage(newPerPage)
        setCurrentPage(1)
    }

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page)
        }
    }

    const handleEdit = (student: Student) => {
        // Pass the current grade level as a query parameter
        router.visit(`/admin/admission/view-edit-student/${student.id}/edit?grade=${encodeURIComponent(gradeFilter)}`)
    }

    const handleGraduationReadinessChange = (studentId: number, checked: boolean) => {
        router.put(`/admin/students/${studentId}/graduation-readiness`, {
            ready_to_graduate: checked,
        }, {
            preserveState: true,
            preserveScroll: true,
        })
    }

    return (
        <AdminLayout user={auth?.user} admin={auth?.admin}>
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
                                placeholder={gradeFilter === 'all' ? "Select a grade level first" : "Search by section"}
                                value={sectionFilter}
                                onChange={(e) => setSectionFilter(e.target.value)}
                                disabled={gradeFilter === 'all'}
                                className={gradeFilter === 'all' ? "bg-gray-100" : ""}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-green-700">
                                <tr>
                                    <th className="px-6 py-5 text-left text-base font-semibold text-white uppercase tracking-wider">Student Name</th>
                                    <th className="px-6 py-5 text-left text-base font-semibold text-white uppercase tracking-wider">LRN</th>
                                    <th className="px-6 py-5 text-left text-base font-semibold text-white uppercase tracking-wider">Grade Level</th>
                                    <th className="px-6 py-5 text-left text-base font-semibold text-white uppercase tracking-wider">Section</th>
                                    <th className="px-6 py-5 text-center text-base font-semibold text-white uppercase tracking-wider">Ready to Graduate</th>
                                    <th className="px-6 py-5 text-left text-base font-semibold text-white uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {paginatedStudents.length > 0 ? (
                                    paginatedStudents.map((student) => (
                                        <tr key={student.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-900">{student.studentName}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{student.lrn}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{student.gradeLevel}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{student.section}</td>
                                            <td className="px-6 py-4 text-center">
                                                <Checkbox
                                                    checked={student.readyToGraduate}
                                                    onCheckedChange={(checked) => 
                                                        handleGraduationReadinessChange(student.id, checked as boolean)
                                                    }
                                                    className="mx-auto"
                                                />
                                            </td>
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
                                        <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                                            {gradeFilter === 'all'
                                                ? 'Please select a grade level to view students.'
                                                : students.length === 0 
                                                    ? 'No enrolled students found. Students will appear here after being assigned a section.'
                                                    : 'No students match your search criteria.'
                                            }
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {filteredStudents.length > 0 && (
                        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                            <div className="flex items-center justify-between">
                                {/* Entries per page selector */}
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-700">Entries:</span>
                                    <Select value={perPage.toString()} onValueChange={(value) => handlePerPageChange(parseInt(value))}>
                                        <SelectTrigger className="w-[80px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="10">10</SelectItem>
                                            <SelectItem value="25">25</SelectItem>
                                            <SelectItem value="50">50</SelectItem>
                                            <SelectItem value="100">100</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Pagination controls */}
                                <div className="flex items-center gap-1">
                                    <Button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        variant="outline"
                                        size="sm"
                                        className="relative inline-flex items-center px-3 py-2"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <Button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            variant={currentPage === page ? "default" : "outline"}
                                            size="sm"
                                            className={`px-3 py-2 min-w-[40px] ${currentPage === page ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
                                        >
                                            {page}
                                        </Button>
                                    ))}
                                    <Button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        variant="outline"
                                        size="sm"
                                        className="relative inline-flex items-center px-3 py-2"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    )
}
