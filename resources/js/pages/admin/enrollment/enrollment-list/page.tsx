import { Head, router } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState, useMemo, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type Student = {
    id: number
    student_name: string
    lrn: string
    section: string
    section_id: number
    grade_level: string
    grade_level_id: number
    adviser: string
}

type GradeLevel = {
    id: number
    name: string
}

type Section = {
    id: number
    section_name: string
    grade_level: string
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
    students: Student[]
    gradeLevels: GradeLevel[]
    sections: Section[]
    filters: {
        grade_level?: number
        section?: number
        search?: string
    }
}

export default function EnrollmentList({ auth, students = [], gradeLevels = [], sections = [], filters }: Props) {
    const [gradeLevelFilter, setGradeLevelFilter] = useState<string>(filters.grade_level?.toString() || 'all')
    const [sectionInput, setSectionInput] = useState('')
    const [selectedSectionId, setSelectedSectionId] = useState<number | null>(filters.section || null)
    const [searchTerm, setSearchTerm] = useState(filters.search || '')
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const sectionInputRef = useRef<HTMLDivElement>(null)

    // Initialize section input with selected section name
    useEffect(() => {
        if (filters.section) {
            const section = sections.find(s => s.id === filters.section)
            if (section) {
                setSectionInput(section.section_name)
            }
        }
    }, [filters.section, sections])

    // Filter sections based on selected grade level and input
    const filteredSections = useMemo(() => {
        let filtered = sections
        
        // Filter by grade level
        if (gradeLevelFilter !== 'all') {
            const selectedGrade = gradeLevels.find(g => g.id.toString() === gradeLevelFilter)
            filtered = filtered.filter(s => s.grade_level === selectedGrade?.name)
        }
        
        // Filter by input text
        if (sectionInput.trim()) {
            filtered = filtered.filter(s => 
                s.section_name.toLowerCase().includes(sectionInput.toLowerCase())
            )
        }
        
        return filtered
    }, [gradeLevelFilter, sectionInput, sections, gradeLevels])

    // Auto-apply filters when they change
    useEffect(() => {
        const params: any = {}
        
        if (gradeLevelFilter !== 'all') {
            params.grade_level = gradeLevelFilter
        }
        
        if (selectedSectionId) {
            params.section = selectedSectionId
        }
        
        if (searchTerm.trim()) {
            params.search = searchTerm.trim()
        }

        const timeoutId = setTimeout(() => {
            router.get('/admin/enrollment/enrollment-list', params, {
                preserveState: true,
                preserveScroll: true,
            })
        }, 300) // Debounce for 300ms

        return () => clearTimeout(timeoutId)
    }, [gradeLevelFilter, selectedSectionId, searchTerm])

    // Handle click outside to close suggestions
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sectionInputRef.current && !sectionInputRef.current.contains(event.target as Node)) {
                setShowSuggestions(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSectionSelect = (section: Section) => {
        setSectionInput(section.section_name)
        setSelectedSectionId(section.id)
        setShowSuggestions(false)
    }

    const handleSectionInputChange = (value: string) => {
        setSectionInput(value)
        if (!value.trim()) {
            setSelectedSectionId(null)
        }
        setShowSuggestions(true)
    }

    const handleClearFilters = () => {
        setGradeLevelFilter('all')
        setSectionInput('')
        setSelectedSectionId(null)
        setSearchTerm('')
    }

    // Pagination
    const totalPages = Math.ceil(students.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedStudents = students.slice(startIndex, endIndex)

    // Reset to page 1 when filters change
    useMemo(() => {
        setCurrentPage(1)
    }, [students])

    const hasActiveFilters = gradeLevelFilter !== 'all' || selectedSectionId !== null || searchTerm.trim() !== ''

    return (
        <AdminLayout user={auth?.user}>
            <Head title="Enrollment List" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Enrollment List</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        View enrolled students by section and adviser
                    </p>
                </div>

                {/* Stats Card */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-600 font-medium">Total Enrolled Students</p>
                    <p className="text-3xl font-bold text-blue-900 mt-2">{students.length}</p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold text-gray-900">Filters</h2>
                        {hasActiveFilters && (
                            <Button 
                                onClick={handleClearFilters}
                                variant="outline"
                                size="sm"
                            >
                                Clear All Filters
                            </Button>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Grade Level</label>
                            <Select value={gradeLevelFilter} onValueChange={(value) => {
                                setGradeLevelFilter(value)
                                setSectionInput('')
                                setSelectedSectionId(null)
                            }}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Grade Levels</SelectItem>
                                    {gradeLevels.map((level) => (
                                        <SelectItem key={level.id} value={level.id.toString()}>
                                            {level.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div ref={sectionInputRef} className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
                            <Input
                                type="text"
                                placeholder="Type to search sections..."
                                value={sectionInput}
                                onChange={(e) => handleSectionInputChange(e.target.value)}
                                onFocus={() => setShowSuggestions(true)}
                            />
                            {showSuggestions && filteredSections.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                    {filteredSections.map((section) => (
                                        <button
                                            key={section.id}
                                            onClick={() => handleSectionSelect(section)}
                                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                                        >
                                            <span className="text-sm text-gray-900">{section.section_name}</span>
                                            <span className="text-xs text-gray-500">{section.grade_level}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                            <Input
                                type="text"
                                placeholder="Search student name or adviser..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    {students.length === 0 ? (
                        <div className="p-8 text-center">
                            <p className="text-lg font-medium text-gray-900 mb-2">No Enrolled Students</p>
                            <p className="text-sm text-gray-500">
                                {hasActiveFilters 
                                    ? 'No students match your filter criteria.'
                                    : 'No students have been assigned to sections yet.'}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-green-700">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Student Name</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">LRN</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Section</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Grade Level</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Adviser</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {paginatedStudents.map((student) => (
                                            <tr key={student.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm text-gray-900">{student.student_name}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{student.lrn}</td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {student.section}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                        {student.grade_level}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {student.adviser === 'Not Assigned' ? (
                                                        <span className="text-gray-400 italic">{student.adviser}</span>
                                                    ) : (
                                                        student.adviser
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
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
                        </>
                    )}
                </div>
            </div>
        </AdminLayout>
    )
}
