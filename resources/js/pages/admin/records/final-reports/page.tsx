import { Head, router } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Eye, Download, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'

type Student = {
    id: number
    lrn: string
    studentName: string
    gradeLevel: string
    section: string
}

type GradeLevel = {
    id: number
    name: string
}

type Section = {
    id: number
    name: string
    grade_level_id: number
    grade_level_name: string
}

type SchoolYear = {
    value: string
    label: string
}

type Props = {
    schoolYears: SchoolYear[]
    gradeLevels: GradeLevel[]
    sections: Section[]
    students: Student[]
    filters: {
        school_year: string
        grade_level_id: number | null
        section_id: number | null
    }
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
}

export default function FinalReports({ schoolYears, gradeLevels, sections, students, filters, auth }: Props) {
    const [schoolYear, setSchoolYear] = useState(filters.school_year || '')
    const [gradeLevel, setGradeLevel] = useState(filters.grade_level_id?.toString() || '')
    const [section, setSection] = useState(filters.section_id?.toString() || '')
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [entriesPerPage, setEntriesPerPage] = useState(10)

    // View student's complete academic record
    const viewStudentRecord = (studentId: number) => {
        router.visit(`/admin/records/student-academic-record/${studentId}`)
    }

    // Update filters when selections change
    useEffect(() => {
        const params = new URLSearchParams()
        if (schoolYear) params.set('school_year', schoolYear)
        if (gradeLevel) params.set('grade_level_id', gradeLevel)
        if (section) params.set('section_id', section)

        router.get(`/admin/records/final-reports?${params.toString()}`, {}, {
            preserveState: true,
            preserveScroll: true,
        })
    }, [schoolYear, gradeLevel, section])

    // Reset section when grade level changes
    useEffect(() => {
        if (gradeLevel && section) {
            const selectedSection = sections.find(s => s.id.toString() === section)
            if (selectedSection && selectedSection.grade_level_id.toString() !== gradeLevel) {
                setSection('')
            }
        }
    }, [gradeLevel])

    // Filter students by search query (name or LRN)
    const filteredStudents = useMemo(() => {
        if (!searchQuery) return students
        
        const query = searchQuery.toLowerCase()
        return students.filter(student => 
            student.studentName.toLowerCase().includes(query) ||
            student.lrn.toLowerCase().includes(query)
        )
    }, [students, searchQuery])

    // Pagination calculations
    const totalPages = Math.ceil(filteredStudents.length / entriesPerPage)
    const startIndex = (currentPage - 1) * entriesPerPage
    const endIndex = startIndex + entriesPerPage
    const paginatedStudents = filteredStudents.slice(startIndex, endIndex)

    // Reset to page 1 when filters or search changes
    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery, section, gradeLevel, schoolYear, entriesPerPage])

    // Get selected details
    const selectedSection = sections.find(s => s.id.toString() === section)
    const selectedGradeLevel = gradeLevels.find(g => g.id.toString() === gradeLevel)

    return (
        <AdminLayout user={auth?.user} admin={auth?.admin}>
            <Head title="Final Reports" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Final Reports</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        View and manage student final grade reports
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-xs">
                    <p className="text-sm text-blue-600 font-medium">Total Students</p>
                    <p className="text-3xl font-bold text-blue-900 mt-2">{filteredStudents.length}</p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <h2 className="text-base font-semibold text-gray-900">Filter Options</h2>
                        <p className="text-sm text-gray-500 mt-1">Select criteria to view final reports</p>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    School Year <span className="text-red-500">*</span>
                                </label>
                                <Select value={schoolYear} onValueChange={setSchoolYear}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select school year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {schoolYears.map((year) => (
                                            <SelectItem key={year.value} value={year.value}>
                                                {year.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Grade Level <span className="text-red-500">*</span>
                                </label>
                                <Select value={gradeLevel} onValueChange={setGradeLevel} disabled={!schoolYear}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder={schoolYear ? "Select grade level" : "Select school year first"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {gradeLevels.map((level) => (
                                            <SelectItem key={level.id} value={level.id.toString()}>
                                                {level.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Section <span className="text-red-500">*</span>
                                </label>
                                <Select value={section} onValueChange={setSection} disabled={!gradeLevel || sections.length === 0}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder={gradeLevel ? "Select section" : "Select grade first"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sections
                                            .filter(s => !gradeLevel || s.grade_level_id.toString() === gradeLevel)
                                            .map((sec) => (
                                                <SelectItem key={sec.id} value={sec.id.toString()}>
                                                    {sec.name}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Search Student
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        type="text"
                                        placeholder="Name or LRN..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                        disabled={!section}
                                    />
                                </div>
                            </div>
                        </div>
                        
                        {!section ? (
                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    <span className="font-medium">Note:</span> Please select school year, grade level, and section to view final reports.
                                </p>
                            </div>
                        ) : null}
                    </div>
                </div>

                {/* Table */}
                {section ? (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-green-700">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-base font-semibold text-white">No.</th>
                                        <th className="px-6 py-4 text-left text-base font-semibold text-white">LRN</th>
                                        <th className="px-6 py-4 text-left text-base font-semibold text-white">Student Name</th>
                                        <th className="px-6 py-4 text-left text-base font-semibold text-white">Grade Level</th>
                                        <th className="px-6 py-4 text-left text-base font-semibold text-white">Section</th>
                                        <th className="px-6 py-4 text-center text-base font-semibold text-white">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {paginatedStudents.length > 0 ? (
                                        paginatedStudents.map((student, index) => (
                                            <tr key={student.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm text-gray-900">{startIndex + index + 1}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900 font-medium">{student.lrn}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{student.studentName}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{student.gradeLevel}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{student.section}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button 
                                                            onClick={() => viewStudentRecord(student.id)}
                                                            className="text-gray-600 hover:text-blue-600" 
                                                            title="View Complete Academic Record"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button className="text-gray-600 hover:text-green-600" title="Download Report">
                                                            <Download className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                                                {searchQuery 
                                                    ? 'No students found matching your search.'
                                                    : 'No students found or no final grades available for this section.'
                                                }
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        {filteredStudents.length > 0 && (
                            <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600">Show</span>
                                        <Select value={entriesPerPage.toString()} onValueChange={(value) => setEntriesPerPage(Number(value))}>
                                            <SelectTrigger className="w-20">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="10">10</SelectItem>
                                                <SelectItem value="25">25</SelectItem>
                                                <SelectItem value="50">50</SelectItem>
                                                <SelectItem value="100">100</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <span className="text-sm text-gray-600">entries</span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Showing {((currentPage - 1) * entriesPerPage) + 1} to {Math.min(currentPage * entriesPerPage, filteredStudents.length)} of {filteredStudents.length} entries
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
                ) : (
                    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                        <div className="max-w-md mx-auto">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Section Selected</h3>
                            <p className="text-sm text-gray-500">
                                Please select school year, grade level, and section from the filters above to view student final reports.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}
