import { Head, router } from '@inertiajs/react'
import AdviserLayout from '@/layouts/adviser-layout'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import { DataTablePagination, teacherTableHeaderCellClass, teacherTableHeaderCellCenterClass, teacherTableHeaderClass } from '@/components/data-table-pagination'
import { useClientPagination } from '@/hooks/use-client-pagination'

type Subject = { id: number; subject_name: string; subject_code: string | null; teacher_name: string }
type StudentOption = { id: number; lrn: string; studentName: string; gradeLevel: string; section: string }
type SubjectGradeRow = {
    id: number; lrn: string; studentName: string; gradeLevel: string; section: string
    term1: number | null; term2: number | null; term3: number | null
    finalAverage: number | null; remarks: string | null
}
type ReportCardGrade = {
    id: number; subject: string; teacher: string
    term1: number | null; term2: number | null; term3: number | null
    finalGrade: number | null; remarks: string | null
}
type Section = { id: number; name: string; grade_level_name: string }
type SchoolYear = { value: string; label: string }
type Props = {
    section: Section | null
    schoolYears: SchoolYear[]
    subjects: Subject[]
    students: StudentOption[]
    subjectGrades: SubjectGradeRow[]
    reportCardGrades: ReportCardGrade[]
    selectedStudent: StudentOption | null
    filters: { school_year: string; subject_id: number | null; student_id: number | null; view: 'subject' | 'student' }
    noAssignment: boolean
    auth?: { user: { id: number; name: string; email: string; role: string } }
}

export default function AdviserGrades({
    section, schoolYears, subjects, students, subjectGrades, reportCardGrades,
    selectedStudent, filters, noAssignment, auth,
}: Props) {
    const [schoolYear, setSchoolYear] = useState(filters.school_year || '')
    const [view, setView] = useState<'subject' | 'student'>(filters.view || 'subject')
    const [subjectId, setSubjectId] = useState(filters.subject_id?.toString() || '')
    const [studentId, setStudentId] = useState(filters.student_id?.toString() || '')
    const [searchQuery, setSearchQuery] = useState('')
    const [gradeLevelFilter, setGradeLevelFilter] = useState('all')

    const gradeLevels = useMemo(
        () => Array.from(new Set(students.map(s => s.gradeLevel).filter(Boolean))).sort(),
        [students],
    )

    const filteredStudents = useMemo(() => {
        const query = searchQuery.trim().toLowerCase()
        return students.filter(s => {
            const matchesSearch = !query
                || s.studentName.toLowerCase().includes(query)
                || s.lrn.toLowerCase().includes(query)
            const matchesGradeLevel = gradeLevelFilter === 'all' || s.gradeLevel === gradeLevelFilter
            return matchesSearch && matchesGradeLevel
        })
    }, [students, searchQuery, gradeLevelFilter])

    useEffect(() => {
        if (view !== 'student' || !studentId) {
            return
        }

        if (!filteredStudents.some(s => s.id.toString() === studentId)) {
            setStudentId('')
        }
    }, [view, studentId, filteredStudents])

    const rows = view === 'subject' ? subjectGrades : []
    const { currentPage, setCurrentPage, entriesPerPage, setEntriesPerPage, totalPages, totalItems, isVisibleOnScreen } = useClientPagination(rows)

    useEffect(() => {
        const params = new URLSearchParams()
        if (schoolYear) params.set('school_year', schoolYear)
        params.set('view', view)
        if (view === 'subject' && subjectId) params.set('subject_id', subjectId)
        if (view === 'student' && studentId) params.set('student_id', studentId)
        router.get(`/adviser/grades?${params.toString()}`, {}, { preserveState: true, preserveScroll: true })
    }, [schoolYear, view, subjectId, studentId])

    const finalAverage = reportCardGrades.length > 0
        ? (() => {
            const withFinal = reportCardGrades.filter(g => g.finalGrade !== null)
            if (withFinal.length === 0) return null
            return Math.round(withFinal.reduce((s, g) => s + (g.finalGrade as number), 0) / withFinal.length * 100) / 100
        })()
        : null

    return (
        <AdviserLayout user={auth?.user}>
            <Head title="Grades" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Grades</h1>
                    <p className="text-sm text-gray-500 mt-1">View-only grades for your advisory class</p>
                </div>

                {noAssignment ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                        <p className="text-amber-800 font-medium">No advisory class assigned</p>
                    </div>
                ) : (
                    <>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-800">View only — you cannot edit grades from the Adviser Portal.</p>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6 space-y-4">
                            {section && (
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium text-gray-900">{section.grade_level_name} - {section.name}</span>
                                </p>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">School Year</label>
                                    <Select value={schoolYear} onValueChange={setSchoolYear}>
                                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {schoolYears.map(y => <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2 sm:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700">View By</label>
                                    <div className="flex gap-2">
                                        <Button type="button" variant={view === 'subject' ? 'default' : 'outline'} onClick={() => setView('subject')}>By Subject</Button>
                                        <Button type="button" variant={view === 'student' ? 'default' : 'outline'} onClick={() => setView('student')}>By Student</Button>
                                    </div>
                                </div>
                            </div>

                            {view === 'subject' ? (
                                <div className="space-y-2 max-w-md">
                                    <label className="block text-sm font-medium text-gray-700">Subject</label>
                                    <Select value={subjectId} onValueChange={setSubjectId}>
                                        <SelectTrigger className="w-full"><SelectValue placeholder="Select subject" /></SelectTrigger>
                                        <SelectContent>
                                            {subjects.map(s => (
                                                <SelectItem key={s.id} value={s.id.toString()}>
                                                    {s.subject_name}{s.subject_code ? ` (${s.subject_code})` : ''} — {s.teacher_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Search</label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <Input
                                                type="text"
                                                placeholder="Search by name or LRN..."
                                                value={searchQuery}
                                                onChange={e => setSearchQuery(e.target.value)}
                                                className="pl-10 w-full"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Grade Level</label>
                                        <Select value={gradeLevelFilter} onValueChange={setGradeLevelFilter}>
                                            <SelectTrigger className="w-full"><SelectValue placeholder="All grade levels" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Grade Levels</SelectItem>
                                                {gradeLevels.map(level => (
                                                    <SelectItem key={level} value={level}>{level}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}
                        </div>

                        {view === 'subject' && subjectId ? (
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[700px]">
                                        <thead className={teacherTableHeaderClass}>
                                            <tr>
                                                <th className={teacherTableHeaderCellClass}>No.</th>
                                                <th className={teacherTableHeaderCellClass}>LRN</th>
                                                <th className={teacherTableHeaderCellClass}>Student Name</th>
                                                <th className={teacherTableHeaderCellCenterClass}>T1</th>
                                                <th className={teacherTableHeaderCellCenterClass}>T2</th>
                                                <th className={teacherTableHeaderCellCenterClass}>T3</th>
                                                <th className={teacherTableHeaderCellCenterClass}>Final</th>
                                                <th className={teacherTableHeaderCellClass}>Remarks</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {subjectGrades.length > 0 ? subjectGrades.map((row, index) => (
                                                <tr key={row.id} className={`hover:bg-gray-50 ${!isVisibleOnScreen(index) ? 'hidden' : ''}`}>
                                                    <td className="px-3 sm:px-6 py-3 text-sm">{index + 1}</td>
                                                    <td className="px-3 sm:px-6 py-3 text-sm">{row.lrn}</td>
                                                    <td className="px-3 sm:px-6 py-3 text-sm font-medium">{row.studentName}</td>
                                                    <td className="px-3 sm:px-6 py-3 text-sm text-center">{row.term1 ?? '—'}</td>
                                                    <td className="px-3 sm:px-6 py-3 text-sm text-center">{row.term2 ?? '—'}</td>
                                                    <td className="px-3 sm:px-6 py-3 text-sm text-center">{row.term3 ?? '—'}</td>
                                                    <td className="px-3 sm:px-6 py-3 text-sm text-center font-medium">{row.finalAverage ?? '—'}</td>
                                                    <td className="px-3 sm:px-6 py-3 text-sm">
                                                        {row.remarks ? (
                                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${row.remarks === 'Passed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{row.remarks}</span>
                                                        ) : '—'}
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-500">No grade records for this subject yet</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <DataTablePagination totalItems={totalItems} currentPage={currentPage} entriesPerPage={entriesPerPage} totalPages={totalPages} onPageChange={setCurrentPage} onEntriesPerPageChange={setEntriesPerPage} variant="teacher" />
                            </div>
                        ) : view === 'student' ? (
                            <div className="space-y-4">
                                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[500px]">
                                            <thead className={teacherTableHeaderClass}>
                                                <tr>
                                                    <th className={teacherTableHeaderCellClass}>LRN</th>
                                                    <th className={teacherTableHeaderCellClass}>Student Name</th>
                                                    <th className={teacherTableHeaderCellClass}>Grade Level</th>
                                                    <th className={teacherTableHeaderCellClass}>Section</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {filteredStudents.length > 0 ? filteredStudents.map(s => (
                                                    <tr
                                                        key={s.id}
                                                        onClick={() => setStudentId(s.id.toString())}
                                                        className={`cursor-pointer hover:bg-gray-50 ${studentId === s.id.toString() ? 'bg-blue-50' : ''}`}
                                                    >
                                                        <td className="px-3 sm:px-6 py-3 text-sm">{s.lrn}</td>
                                                        <td className="px-3 sm:px-6 py-3 text-sm font-medium">{s.studentName}</td>
                                                        <td className="px-3 sm:px-6 py-3 text-sm">{s.gradeLevel}</td>
                                                        <td className="px-3 sm:px-6 py-3 text-sm">{s.section}</td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                                                            No students match your search or grade level filter
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {studentId && selectedStudent ? (
                                    <div className="space-y-4">
                                        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div><p className="text-xs text-gray-500">Student</p><p className="font-semibold">{selectedStudent.studentName}</p></div>
                                            <div><p className="text-xs text-gray-500">LRN</p><p className="font-semibold">{selectedStudent.lrn}</p></div>
                                            <div><p className="text-xs text-gray-500">Section</p><p className="font-semibold">{selectedStudent.gradeLevel} — {selectedStudent.section}</p></div>
                                        </div>
                                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                                            <div className="overflow-x-auto">
                                                <table className="w-full min-w-[600px]">
                                                    <thead className={teacherTableHeaderClass}>
                                                        <tr>
                                                            <th className={teacherTableHeaderCellClass}>Subject</th>
                                                            <th className={teacherTableHeaderCellClass}>Teacher</th>
                                                            <th className={teacherTableHeaderCellCenterClass}>T1</th>
                                                            <th className={teacherTableHeaderCellCenterClass}>T2</th>
                                                            <th className={teacherTableHeaderCellCenterClass}>T3</th>
                                                            <th className={teacherTableHeaderCellCenterClass}>Final</th>
                                                            <th className={teacherTableHeaderCellClass}>Remarks</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200">
                                                        {reportCardGrades.length > 0 ? reportCardGrades.map(g => (
                                                            <tr key={g.id} className="hover:bg-gray-50">
                                                                <td className="px-3 sm:px-6 py-3 text-sm">{g.subject}</td>
                                                                <td className="px-3 sm:px-6 py-3 text-sm">{g.teacher}</td>
                                                                <td className="px-3 sm:px-6 py-3 text-sm text-center">{g.term1 ?? '—'}</td>
                                                                <td className="px-3 sm:px-6 py-3 text-sm text-center">{g.term2 ?? '—'}</td>
                                                                <td className="px-3 sm:px-6 py-3 text-sm text-center">{g.term3 ?? '—'}</td>
                                                                <td className="px-3 sm:px-6 py-3 text-sm text-center font-medium">{g.finalGrade ?? '—'}</td>
                                                                <td className="px-3 sm:px-6 py-3 text-sm">{g.remarks ?? '—'}</td>
                                                            </tr>
                                                        )) : (
                                                            <tr><td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">No grades found for this student</td></tr>
                                                        )}
                                                    </tbody>
                                                    {finalAverage !== null && (
                                                        <tfoot>
                                                            <tr className="bg-gray-50 border-t-2 border-gray-300">
                                                                <td colSpan={5} className="px-3 sm:px-6 py-4 text-sm font-medium text-gray-600">General Average</td>
                                                                <td className="px-3 sm:px-6 py-4 text-center text-base font-bold">{finalAverage.toFixed(2)}</td>
                                                                <td />
                                                            </tr>
                                                        </tfoot>
                                                    )}
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500">
                                <p className="text-sm">Select a subject to view grades</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </AdviserLayout>
    )
}
