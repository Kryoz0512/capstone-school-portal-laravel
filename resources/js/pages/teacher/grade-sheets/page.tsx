import { Head, router } from '@inertiajs/react'
import TeacherLayout from '@/layouts/teacher-layout'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Printer, Check, X, Loader2 } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { DataTablePagination, teacherTableHeaderCellClass, teacherTableHeaderCellCenterClass, teacherTableHeaderClass } from '@/components/data-table-pagination'
import { toast } from 'sonner'

type Student = {
    id: number
    lrn: string
    studentName: string
    gradeLevel: string
    section: string
    quarter1: number | null
    quarter2: number | null
    quarter3: number | null
    quarter4: number | null
    finalAverage: number | null
    remarks: 'Passed' | 'Failed' | null
    gradeId: number | null
}
type GradeLevel = { id: number; name: string }
type Section = { id: number; name: string; grade_level_id: number }
type Subject = { id: number; name: string }
type SchoolYear = { value: string; label: string }
type Pagination = { current_page: number; last_page: number; per_page: number; total: number } | null
type Props = {
    gradeLevels: GradeLevel[]
    sections: Section[]
    subjects: Subject[]
    students: Student[]
    pagination: Pagination
    schoolYears: SchoolYear[]
    filters: { grade_level_id: number | null; section_id: number | null; subject_id: number | null; school_year: string; per_page?: number; search?: string }
    auth?: { user: { id: number; name: string; email: string; role: string } }
}

export default function GradeManagement({ gradeLevels, sections, subjects, students, pagination, schoolYears, filters, auth }: Props) {
    const [gradeLevel, setGradeLevel] = useState(filters.grade_level_id?.toString() || '')
    const [section, setSection] = useState(filters.section_id?.toString() || '')
    const [subject, setSubject] = useState(filters.subject_id?.toString() || '')
    const [schoolYear, setSchoolYear] = useState(filters.school_year || '')
    const [searchQuery, setSearchQuery] = useState(filters.search || '')
    const [entriesPerPage, setEntriesPerPage] = useState(filters.per_page || 10)

    // Editing states
    const [editingCell, setEditingCell] = useState<{ studentId: number; quarter: string } | null>(null)
    const [editValue, setEditValue] = useState('')
    const [savingCell, setSavingCell] = useState<{ studentId: number; quarter: string } | null>(null)
    const [localGrades, setLocalGrades] = useState<Record<number, Partial<Student>>>({})

    const isFirstRender = useRef(true)
    const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const selectedSection = sections.find(s => s.id.toString() === section)
    const selectedSubject = subjects.find(s => s.id.toString() === subject)
    const selectedGradeLevel = gradeLevels.find(g => g.id.toString() === gradeLevel)

    // Merge local grades with server data
    const getStudentGrade = (student: Student, quarter: string) => {
        const localStudent = localGrades[student.id]
        if (localStudent && quarter in localStudent) {
            return localStudent[quarter as keyof Student]
        }
        return student[quarter as keyof Student]
    }

    const navigate = (page: number, perPage: number = entriesPerPage) => {
        const params = new URLSearchParams()
        if (gradeLevel) params.set('grade_level_id', gradeLevel)
        if (section) params.set('section_id', section)
        if (subject) params.set('subject_id', subject)
        if (schoolYear) params.set('school_year', schoolYear)
        if (searchQuery) params.set('search', searchQuery)
        params.set('per_page', String(perPage))
        params.set('page', String(page))
        router.get(`/teacher/grade-sheets?${params.toString()}`, {}, { preserveState: true, preserveScroll: true })
    }

    useEffect(() => {
        if (isFirstRender.current) { isFirstRender.current = false; return }
        setLocalGrades({})
        setSearchQuery('')
        navigate(1)
    }, [gradeLevel, section, subject, schoolYear])

    useEffect(() => {
        if (searchDebounce.current) clearTimeout(searchDebounce.current)
        searchDebounce.current = setTimeout(() => {
            if (section && subject) {
                navigate(1)
            }
        }, 400)
        return () => { if (searchDebounce.current) clearTimeout(searchDebounce.current) }
    }, [searchQuery])

    useEffect(() => {
        if (editingCell && inputRef.current) {
            inputRef.current.focus()
            inputRef.current.select()
        }
    }, [editingCell])

    const handlePageChange = (page: number) => navigate(page)
    const handleEntriesPerPageChange = (perPage: number) => {
        setEntriesPerPage(perPage)
        navigate(1, perPage)
    }

    const handleCellClick = (student: Student, quarter: string) => {
        const currentValue = getStudentGrade(student, quarter)
        setEditingCell({ studentId: student.id, quarter })
        setEditValue(currentValue !== null ? String(currentValue) : '')
    }

    const handleCellSave = async (student: Student, quarter: string) => {
        const numericValue = parseFloat(editValue)

        // Validate - check if empty or not a number
        if (editValue === '' || isNaN(numericValue)) {
            setEditingCell(null)
            setEditValue('')
            toast.error('Please enter a valid grade')
            return
        }

        // Check if grade is below 75
        if (numericValue < 75) {
            toast.error('Grade cannot be below 75', {
                description: 'The minimum passing grade is 75. Please enter a grade of 75 or above.',
                duration: 4000,
            })
            return // Don't clear the editing state, let user correct the value
        }

        // Check if grade is above 100
        if (numericValue > 100) {
            toast.error('Grade cannot exceed 100', {
                description: 'Please enter a grade between 75 and 100.',
                duration: 4000,
            })
            return
        }

        // Round the grade: 0.50+ rounds up, 0.49 and below rounds down
        const roundedValue = Math.round(numericValue)

        setSavingCell({ studentId: student.id, quarter })
        setEditingCell(null)

        // Optimistic update with rounded value
        const updatedStudent = { ...student, [quarter]: roundedValue }
        setLocalGrades(prev => ({ ...prev, [student.id]: { ...prev[student.id], [quarter]: roundedValue } }))

        // Calculate new final average locally
        const quarters = [
            getStudentGrade(updatedStudent, 'quarter1'),
            getStudentGrade(updatedStudent, 'quarter2'),
            getStudentGrade(updatedStudent, 'quarter3'),
            getStudentGrade(updatedStudent, 'quarter4'),
        ].filter(q => q !== null) as number[]

        if (quarters.length > 0) {
            const avg = quarters.reduce((a, b) => a + b, 0) / quarters.length
            const finalAverage = Math.round(avg) // Round the final average
            const remarks = finalAverage >= 75 ? 'Passed' : 'Failed'
            setLocalGrades(prev => ({
                ...prev,
                [student.id]: { ...prev[student.id], finalAverage, remarks }
            }))
        }

        // Submit to backend with rounded value
        const quarterNum = quarter.replace('quarter', '')
        router.post('/teacher/grade-sheets', {
            student_id: student.id,
            class_section_id: parseInt(section),
            subject_id: parseInt(subject),
            quarter: quarterNum,
            school_year: schoolYear,
            grade: roundedValue,
        }, {
            preserveState: false,  // Changed to false to reload data from server
            preserveScroll: true,
            onSuccess: () => {
                setSavingCell(null)
                setLocalGrades({})  // Clear local grades cache to use server data
                toast.success('Grade saved successfully', {
                    description: numericValue !== roundedValue 
                        ? `Grade rounded from ${numericValue} to ${roundedValue}`
                        : undefined
                })
            },
            onError: (errors) => {
                // Revert on error
                setLocalGrades(prev => {
                    const updated = { ...prev }
                    delete updated[student.id]
                    return updated
                })
                setSavingCell(null)
                
                // Show error message
                const errorMessage = errors?.grade?.[0] || 'Failed to save grade. Please try again.'
                toast.error('Error saving grade', {
                    description: errorMessage,
                })
            }
        })
    }

    const handleCellCancel = () => {
        setEditingCell(null)
        setEditValue('')
    }

    const handleKeyDown = (e: React.KeyboardEvent, student: Student, quarter: string) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleCellSave(student, quarter)
        } else if (e.key === 'Escape') {
            e.preventDefault()
            handleCellCancel()
        }
    }

    const renderGradeCell = (student: Student, quarter: string) => {
        const isEditing = editingCell?.studentId === student.id && editingCell?.quarter === quarter
        const isSaving = savingCell?.studentId === student.id && savingCell?.quarter === quarter
        const value = getStudentGrade(student, quarter) as number | null

        if (isEditing) {
            return (
                <div className="inline-flex items-center gap-1 rounded-lg border border-blue-300 bg-blue-50/60 p-1 shadow-sm ring-1 ring-blue-100">
                    <Input
                        ref={inputRef}
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, student, quarter)}
                        onBlur={() => handleCellSave(student, quarter)}
                        className="h-8 w-16 border-0 bg-white text-center text-sm font-semibold shadow-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    />
                    <button
                        onClick={() => handleCellSave(student, quarter)}
                        title="Save"
                        className="flex h-7 w-7 items-center justify-center rounded-md text-green-600 transition-colors hover:bg-green-100 hover:text-green-700"
                    >
                        <Check className="h-4 w-4" strokeWidth={2.5} />
                    </button>
                    <button
                        onClick={handleCellCancel}
                        title="Cancel"
                        className="flex h-7 w-7 items-center justify-center rounded-md text-red-500 transition-colors hover:bg-red-100 hover:text-red-600"
                    >
                        <X className="h-4 w-4" strokeWidth={2.5} />
                    </button>
                </div>
            )
        }

        if (isSaving) {
            return (
                <div className="flex items-center justify-center gap-1.5 text-blue-600">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span className="text-xs font-medium">Saving</span>
                </div>
            )
        }

        const hasValue = value !== null
        const isPassing = hasValue && value >= 75

        return (
            <button
                onClick={() => handleCellClick(student, quarter)}
                title="Click to edit grade"
                className={`group inline-flex h-8 min-w-12 items-center justify-center rounded-md border px-3 text-sm font-semibold tabular-nums transition-all cursor-pointer
                    ${hasValue
                        ? isPassing
                            ? 'border-green-200 bg-green-50 text-green-700 hover:border-green-300 hover:bg-green-100'
                            : 'border-red-200 bg-red-50 text-red-700 hover:border-red-300 hover:bg-red-100'
                        : 'border-dashed border-gray-300 bg-gray-50 text-gray-400 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-500'
                    }`}
            >
                {hasValue ? Number(value.toFixed(2)).toString() : '—'}
            </button>
        )
    }

    return (
        <TeacherLayout user={auth?.user}>
            <Head title="Grade Management" />
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #printable-area, #printable-area * { visibility: visible; }
                    #printable-area { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
                    .no-print { display: none !important; }
                    table { border-collapse: collapse; width: 100%; }
                    th, td { border: 1px solid #000; padding: 8px; text-align: left; color: black; }
                    th { background-color: #f3f4f6 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
            `}</style>

            <div className="space-y-6">
                <div className="no-print">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Grade Management</h1>
                    <p className="text-sm text-gray-500 mt-1">View all quarters and final grades in one place. Click on any grade cell to edit.</p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm no-print">
                    <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <h2 className="text-base font-semibold text-gray-900">Filter Options</h2>
                        <p className="text-sm text-gray-500 mt-1">Select criteria to view student grades</p>
                    </div>
                    <div className="p-4 sm:p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Grade Level <span className="text-red-500">*</span></label>
                                <Select value={gradeLevel} onValueChange={setGradeLevel}>
                                    <SelectTrigger className="w-full"><SelectValue placeholder="Select grade level" /></SelectTrigger>
                                    <SelectContent>{gradeLevels.map(l => <SelectItem key={l.id} value={l.id.toString()}>{l.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Section <span className="text-red-500">*</span></label>
                                <Select value={section} onValueChange={setSection} disabled={!gradeLevel || sections.length === 0}>
                                    <SelectTrigger className="w-full"><SelectValue placeholder={gradeLevel ? 'Select section' : 'Select grade first'} /></SelectTrigger>
                                    <SelectContent>{sections.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Subject <span className="text-red-500">*</span></label>
                                <Select value={subject} onValueChange={setSubject} disabled={subjects.length === 0}>
                                    <SelectTrigger className="w-full"><SelectValue placeholder="Select subject" /></SelectTrigger>
                                    <SelectContent>{subjects.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">School Year <span className="text-red-500">*</span></label>
                                <Select value={schoolYear} onValueChange={setSchoolYear}>
                                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                    <SelectContent>{schoolYears.map(y => <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                        </div>
                        {(!section || !subject) && (
                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800"><span className="font-medium">Note:</span> Please select all required fields to view student grades.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div id="printable-area">
                    <div className="hidden print:block mb-6 text-center">
                        <h1 className="text-2xl font-bold mb-2">Santor National High School</h1>
                        <h2 className="text-xl font-semibold mb-4">Grade Report</h2>
                        <div className="text-sm space-y-1 mb-4">
                            {selectedGradeLevel && <p><span className="font-medium">Grade Level:</span> {selectedGradeLevel.name}</p>}
                            {selectedSection && <p><span className="font-medium">Section:</span> {selectedSection.name}</p>}
                            {selectedSubject && <p><span className="font-medium">Subject:</span> {selectedSubject.name}</p>}
                            <p><span className="font-medium">School Year:</span> {schoolYear}</p>
                            <p><span className="font-medium">Teacher:</span> {auth?.user?.name}</p>
                        </div>
                    </div>

                    {section && subject ? (
                        <>
                            {/* Search Bar */}
                            <div className="bg-white rounded-lg border border-gray-200 p-4 no-print">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        type="text"
                                        placeholder="Search by student name or LRN..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 w-full"
                                    />
                                </div>
                            </div>

                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                                <div className="p-4 border-b border-gray-200 flex items-center justify-between no-print">
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium text-blue-600">Tip:</span> Click on any quarter cell to input or edit grades
                                    </p>
                                    <Button variant="outline" size="sm" onClick={() => window.print()}>
                                        <Printer className="w-4 h-4 mr-2" /> Print
                                    </Button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[900px]">
                                        <thead className={teacherTableHeaderClass}>
                                            <tr>
                                                <th className={teacherTableHeaderCellClass}>No.</th>
                                                <th className={teacherTableHeaderCellClass}>LRN</th>
                                                <th className={teacherTableHeaderCellClass}>Student Name</th>
                                                <th className={teacherTableHeaderCellClass}>Grade</th>
                                                <th className={teacherTableHeaderCellClass}>Section</th>
                                                <th className={teacherTableHeaderCellCenterClass}>Q1</th>
                                                <th className={teacherTableHeaderCellCenterClass}>Q2</th>
                                                <th className={teacherTableHeaderCellCenterClass}>Q3</th>
                                                <th className={teacherTableHeaderCellCenterClass}>Q4</th>
                                                <th className={teacherTableHeaderCellCenterClass}>Final</th>
                                                <th className={teacherTableHeaderCellClass}>Remarks</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {students.length > 0 ? students.map((student, index) => {
                                                const finalAverage = getStudentGrade(student, 'finalAverage')
                                                const remarks = getStudentGrade(student, 'remarks')

                                                return (
                                                    <tr key={student.id} className="hover:bg-gray-50">
                                                        <td className="px-2 sm:px-4 py-3 sm:py-4 text-sm text-gray-900">
                                                            {((pagination?.current_page ?? 1) - 1) * (pagination?.per_page ?? entriesPerPage) + index + 1}
                                                        </td>
                                                        <td className="px-2 sm:px-4 py-3 sm:py-4 text-sm text-gray-900">{student.lrn}</td>
                                                        <td className="px-2 sm:px-4 py-3 sm:py-4 text-sm text-gray-900">{student.studentName}</td>
                                                        <td className="px-2 sm:px-4 py-3 sm:py-4 text-sm text-gray-900">{student.gradeLevel}</td>
                                                        <td className="px-2 sm:px-4 py-3 sm:py-4 text-sm text-gray-900">{student.section}</td>
                                                        <td className="px-2 sm:px-4 py-3 sm:py-4 text-center">{renderGradeCell(student, 'quarter1')}</td>
                                                        <td className="px-2 sm:px-4 py-3 sm:py-4 text-center">{renderGradeCell(student, 'quarter2')}</td>
                                                        <td className="px-2 sm:px-4 py-3 sm:py-4 text-center">{renderGradeCell(student, 'quarter3')}</td>
                                                        <td className="px-2 sm:px-4 py-3 sm:py-4 text-center">{renderGradeCell(student, 'quarter4')}</td>
                                                        <td className="px-2 sm:px-4 py-3 sm:py-4 text-sm font-bold text-gray-900 text-center">
                                                            {finalAverage !== null ? finalAverage : <span className="text-gray-400">-</span>}
                                                        </td>
                                                        <td className="px-2 sm:px-4 py-3 sm:py-4">
                                                            {remarks ? (
                                                                <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                                                                    remarks === 'Passed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                                }`}>{remarks}</span>
                                                            ) : <span className="text-gray-400">-</span>}
                                                        </td>
                                                    </tr>
                                                )
                                            }) : (
                                                <tr><td colSpan={11} className="px-6 py-8 text-center text-sm text-gray-500">No students found in this section</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <DataTablePagination
                                    totalItems={pagination?.total ?? 0}
                                    currentPage={pagination?.current_page ?? 1}
                                    entriesPerPage={entriesPerPage}
                                    totalPages={pagination?.last_page ?? 1}
                                    onPageChange={handlePageChange}
                                    onEntriesPerPageChange={handleEntriesPerPageChange}
                                    variant="teacher"
                                />
                                <div className="hidden print:block mt-12 pt-8 border-t border-gray-300">
                                    <div className="grid grid-cols-2 gap-8">
                                        <div>
                                            <p className="text-sm mb-8">Prepared by:</p>
                                            <div className="border-t border-black pt-1">
                                                <p className="text-sm font-medium">{auth?.user?.name}</p>
                                                <p className="text-xs text-gray-600">Teacher</p>
                                            </div>
                                        </div>
                                        <div><p className="text-sm mb-8">Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center no-print">
                            <p className="text-gray-500">Please select section and subject to view grades</p>
                        </div>
                    )}
                </div>
            </div>
        </TeacherLayout>
    )
}