import { Head, router } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Eye, Download, Search, ChevronLeft, ChevronRight, FileText, Users, GraduationCap, Filter } from 'lucide-react'
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

    const viewStudentRecord = (studentId: number) => {
        router.visit(`/admin/records/student-academic-record/${studentId}`)
    }

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

    useEffect(() => {
        if (gradeLevel && section) {
            const selectedSection = sections.find(s => s.id.toString() === section)
            if (selectedSection && selectedSection.grade_level_id.toString() !== gradeLevel) {
                setSection('')
            }
        }
    }, [gradeLevel])

    const filteredStudents = useMemo(() => {
        if (!searchQuery) return students

        const query = searchQuery.toLowerCase()
        return students.filter(student =>
            student.studentName.toLowerCase().includes(query) ||
            student.lrn.toLowerCase().includes(query)
        )
    }, [students, searchQuery])

    const totalPages = Math.ceil(filteredStudents.length / entriesPerPage)
    const startIndex = (currentPage - 1) * entriesPerPage
    const paginatedStudents = filteredStudents.slice(startIndex, startIndex + entriesPerPage)

    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery, section, gradeLevel, schoolYear, entriesPerPage])

    const selectedSection = sections.find(s => s.id.toString() === section)
    const selectedGradeLevel = gradeLevels.find(g => g.id.toString() === gradeLevel)
    const filtersActive = Boolean(schoolYear && gradeLevel && section)

    return (
        <AdminLayout user={auth?.user} admin={auth?.admin}>
            <Head title="Final Reports" />

            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="hidden sm:flex w-12 h-12 rounded-xl bg-gradient-to-br from-green-600 to-green-700 items-center justify-center shadow-lg shadow-green-600/20 shrink-0">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Final Reports</h1>
                            <p className="text-sm text-gray-500 mt-1">
                                View and manage student final grade reports by section
                            </p>
                        </div>
                    </div>
                    {/* <Button className="bg-green-600 hover:bg-green-700 shadow-sm" disabled={!filtersActive}>
                        <Download className="w-4 h-4 mr-2" />
                        Export Section Report
                    </Button> */}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-600">Total Students</p>
                                <p className="text-3xl font-bold text-blue-900 mt-1">{filtersActive ? filteredStudents.length : '—'}</p>
                            </div>
                            <div className="w-11 h-11 bg-blue-200/70 rounded-full flex items-center justify-center">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-600">Grade Level</p>
                                <p className="text-lg font-bold text-green-900 mt-1 truncate">
                                    {selectedGradeLevel?.name ?? 'Not selected'}
                                </p>
                            </div>
                            <div className="w-11 h-11 bg-green-200/70 rounded-full flex items-center justify-center">
                                <GraduationCap className="w-5 h-5 text-green-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-purple-600">Section</p>
                                <p className="text-lg font-bold text-purple-900 mt-1 truncate">
                                    {selectedSection?.name ?? 'Not selected'}
                                </p>
                            </div>
                            <div className="w-11 h-11 bg-purple-200/70 rounded-full flex items-center justify-center">
                                <Filter className="w-5 h-5 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-green-600" />
                            <h2 className="text-base font-semibold text-gray-900">Filter Options</h2>
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">Select school year, grade level, and section to load reports</p>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    School Year <span className="text-red-500">*</span>
                                </label>
                                <Select value={schoolYear} onValueChange={setSchoolYear}>
                                    <SelectTrigger className="w-full h-11">
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
                                    <SelectTrigger className="w-full h-11">
                                        <SelectValue placeholder={schoolYear ? 'Select grade level' : 'Select school year first'} />
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
                                    <SelectTrigger className="w-full h-11">
                                        <SelectValue placeholder={gradeLevel ? 'Select section' : 'Select grade first'} />
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
                                <label className="block text-sm font-medium text-gray-700">Search Student</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        type="text"
                                        placeholder="Name or LRN..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 h-11"
                                        disabled={!section}
                                    />
                                </div>
                            </div>
                        </div>

                        {!section && (
                            <div className="mt-4 flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                                    <Search className="w-4 h-4 text-blue-600" />
                                </div>
                                <p className="text-sm text-blue-800">
                                    <span className="font-semibold">Select filters above</span> to view student final reports for a specific section.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Table */}
                {section ? (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                                <h2 className="text-base font-semibold text-gray-900">Student List</h2>
                                <p className="text-sm text-gray-500">
                                    {selectedGradeLevel?.name} — {selectedSection?.name} · SY {schoolYear}
                                </p>
                            </div>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 w-fit">
                                {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gradient-to-r from-green-700 via-green-700 to-green-800">
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-white uppercase tracking-wider">LRN</th>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-white uppercase tracking-wider">Student Name</th>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-white uppercase tracking-wider">Grade Level</th>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-white uppercase tracking-wider">Section</th>
                                        <th className="px-6 py-3.5 text-center text-xs font-semibold text-white uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {paginatedStudents.length > 0 ? (
                                        paginatedStudents.map((student, index) => (
                                            <tr
                                                key={student.id}
                                                className={`transition-colors hover:bg-green-50/40 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                                            >
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-mono font-medium text-gray-700">{student.lrn}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {/* <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                            {student.studentName.charAt(0).toUpperCase()}
                                                        </div> */}
                                                        <span className="text-sm font-medium text-gray-900">{student.studentName}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{student.gradeLevel}</td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                                                        {student.section}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => viewStudentRecord(student.id)}
                                                            className="h-8 gap-1.5 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                            View
                                                        </Button>
                                                        {/* <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 gap-1.5 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                                                        >
                                                            <Download className="w-3.5 h-3.5" />
                                                            PDF
                                                        </Button> */}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-16 text-center">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                                        <Users className="w-7 h-7 text-gray-400" />
                                                    </div>
                                                    <p className="text-sm font-medium text-gray-700">
                                                        {searchQuery ? 'No students match your search' : 'No students found'}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {searchQuery
                                                            ? 'Try a different name or LRN.'
                                                            : 'No students are enrolled in this section for the selected school year.'}
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {filteredStudents.length > 0 && (
                            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex flex-col lg:flex-row items-center justify-between gap-4">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600">Show</span>
                                        <Select value={entriesPerPage.toString()} onValueChange={(value) => setEntriesPerPage(Number(value))}>
                                            <SelectTrigger className="w-20 h-9">
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
                                    <p className="text-sm text-gray-500">
                                        Showing <span className="font-medium text-gray-700">{startIndex + 1}</span> to{' '}
                                        <span className="font-medium text-gray-700">{Math.min(startIndex + entriesPerPage, filteredStudents.length)}</span> of{' '}
                                        <span className="font-medium text-gray-700">{filteredStudents.length}</span>
                                    </p>
                                </div>

                                <div className="flex items-center gap-1.5">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="h-9"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>

                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                        if (
                                            page === 1 ||
                                            page === totalPages ||
                                            (page >= currentPage - 1 && page <= currentPage + 1)
                                        ) {
                                            return (
                                                <Button
                                                    key={page}
                                                    variant={currentPage === page ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`h-9 min-w-9 ${currentPage === page ? 'bg-green-600 hover:bg-green-700' : ''}`}
                                                >
                                                    {page}
                                                </Button>
                                            )
                                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                                            return <span key={page} className="px-1 text-gray-400">…</span>
                                        }
                                        return null
                                    })}

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="h-9"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-dashed border-gray-300 p-14 text-center">
                        <div className="max-w-sm mx-auto">
                            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Section Selected</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Choose a school year, grade level, and section above to browse student final reports.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}
