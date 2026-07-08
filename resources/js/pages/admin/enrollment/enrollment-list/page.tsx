import { Head, router } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/pagination'
import { useState, useMemo, useEffect, useRef } from 'react'
import { ArrowRight, Users } from 'lucide-react'

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
    student_count?: number
}

type Section = {
    id: number
    section_name: string
    grade_level: string
}

type PaginationLink = {
    url: string | null
    label: string
    active: boolean
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
    students: {
        data: Student[]
        current_page: number
        last_page: number
        per_page: number
        total: number
        links: PaginationLink[]
    }
    gradeLevels: GradeLevel[]
    sections: Section[]
    filters: {
        grade_level?: number
        section?: number
        search?: string
        per_page?: number
    }
}

export default function EnrollmentList({ auth, students, gradeLevels = [], sections = [], filters }: Props) {
    const [selectedGradeLevel, setSelectedGradeLevel] = useState<number | null>(filters.grade_level || null)
    const [sectionInput, setSectionInput] = useState('')
    const [selectedSectionId, setSelectedSectionId] = useState<number | null>(filters.section || null)
    const [searchTerm, setSearchTerm] = useState(filters.search || '')
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [perPage, setPerPage] = useState(students.per_page || 10)
    const sectionInputRef = useRef<HTMLDivElement>(null)

    // Guards the filters effect below from firing on mount (including
    // remounts triggered by pagination navigation). Without this, paginating
    // to page 2+ would trigger a re-request with no `page` param, bouncing
    // the user back to page 1.
    const isFirstRender = useRef(true)

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
        if (selectedGradeLevel) {
            const selectedGrade = gradeLevels.find(g => g.id === selectedGradeLevel)
            filtered = filtered.filter(s => s.grade_level === selectedGrade?.name)
        }

        // Filter by input text
        if (sectionInput.trim()) {
            filtered = filtered.filter(s =>
                s.section_name.toLowerCase().includes(sectionInput.toLowerCase())
            )
        }

        return filtered
    }, [selectedGradeLevel, sectionInput, sections, gradeLevels])

    // Auto-apply filters when they change (only when a grade level is selected)
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false
            return
        }

        if (!selectedGradeLevel) return

        const params: any = {
            grade_level: selectedGradeLevel
        }

        if (selectedSectionId) {
            params.section = selectedSectionId
        }

        if (searchTerm.trim()) {
            params.search = searchTerm.trim()
        }

        params.per_page = perPage

        const timeoutId = setTimeout(() => {
            router.get('/admin/enrollment/enrollment-list', params, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            })
        }, 300) // Debounce for 300ms

        return () => clearTimeout(timeoutId)
    }, [selectedGradeLevel, selectedSectionId, searchTerm, perPage])

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
        setSectionInput('')
        setSelectedSectionId(null)
        setSearchTerm('')
    }

    const handleGradeCardClick = (gradeId: number) => {
        setSelectedGradeLevel(gradeId)
        setSectionInput('')
        setSelectedSectionId(null)
        setSearchTerm('')
        
        router.get('/admin/enrollment/enrollment-list', {
            grade_level: gradeId,
            per_page: perPage
        }, {
            preserveState: false,
            preserveScroll: false,
        })
    }

    const handleBackToGrades = () => {
        setSelectedGradeLevel(null)
        setSectionInput('')
        setSelectedSectionId(null)
        setSearchTerm('')
        
        router.get('/admin/enrollment/enrollment-list', {}, {
            preserveState: false,
            preserveScroll: false,
        })
    }

    const handlePageChange = (url: string | null) => {
        // preserveState is required here so the component instance (and its
        // isFirstRender ref) survives the navigation instead of remounting,
        // which previously caused the filters effect above to re-fire and
        // silently strip the `page` param, sending the user back to page 1.
        if (url) {
            router.visit(url, { preserveScroll: true, preserveState: true })
        }
    }

    const hasActiveFilters = selectedSectionId !== null || searchTerm.trim() !== ''

    return (
        <AdminLayout user={auth?.user} admin={auth?.admin}>
            <Head title="Enrollment List" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Enrollment List</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {selectedGradeLevel 
                            ? 'View enrolled students by section and adviser'
                            : 'Select a grade level to view enrolled students'
                        }
                    </p>
                </div>

                {/* Stats Card */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-600 font-medium">Total Enrolled Students</p>
                    <p className="text-3xl font-bold text-blue-900 mt-2">{students.total}</p>
                </div>

                {!selectedGradeLevel ? (
                    /* Grade Level Selection Cards */
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {gradeLevels.map((grade) => (
                            <button
                                key={grade.id}
                                onClick={() => handleGradeCardClick(grade.id)}
                                className="group relative overflow-hidden rounded-xl bg-white p-5 text-left ring-1 ring-slate-200 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:ring-[#1E3A5F]/30"
                            >
                                {/* Accent bar */}
                                <div className="absolute inset-x-0 top-0 h-1 bg-green-700 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

                                <div className="flex items-start justify-between">
                                    <div className="flex p-2 items-center justify-center rounded-lg bg-slate-50 ring-1 ring-slate-200 transition-colors duration-200 group-hover:bg-green-700 ">
                                        <span className="text-2xl font-semibold text-slate-900 transition-colors duration-200 group-hover:text-white">
                                            {grade.name}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-semibold text-slate-900">
                                            {grade.student_count || 0}
                                        </p>
                                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                            Students
                                        </p>
                                    </div>
                                </div>

                                <h3 className="mt-4 text-base font-semibold text-slate-900">
                                    {/* {grade.name} */}
                                </h3>

                                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                                    <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                                        <Users className="h-3.5 w-3.5" />
                                        Enrolled roster
                                    </span>
                                    <span className="inline-flex items-center gap-1 font-medium text-green-700 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                        View
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    /* Student Table View */
                    <>
                        {/* Back Button */}
                        <div>
                            <Button
                                onClick={handleBackToGrades}
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <span>←</span>
                                Back to Grade Levels
                            </Button>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                        placeholder="Search by name, LRN, or teacher..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            {students.data.length === 0 ? (
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
                                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">LRN</th>
                                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Student Name</th>
                                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Grade Level</th>
                                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Section</th>
                                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Adviser</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {students.data.map((student) => (
                                                    <tr 
                                                        key={student.id} 
                                                        onClick={() => router.visit(`/admin/enrollment/students/${student.id}`)}
                                                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                                                    >
                                                        <td className="px-6 py-4 text-sm text-gray-900">{student.lrn}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-900">{student.student_name}</td>
                                                        <td className="px-6 py-4">
                                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                                {student.grade_level}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                {student.section}
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
                                    <Pagination
                                        currentPage={students.current_page}
                                        lastPage={students.last_page}
                                        perPage={students.per_page}
                                        total={students.total}
                                        links={students.links}
                                        onPageChange={handlePageChange}
                                        onPerPageChange={setPerPage}
                                    />
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>
        </AdminLayout>
    )
}