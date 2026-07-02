import { Head, router } from '@inertiajs/react'
import TeacherLayout from '@/layouts/teacher-layout'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { DataTablePagination, teacherTableHeaderCellClass, teacherTableHeaderCellCenterClass, teacherTableHeaderClass } from '@/components/data-table-pagination'

type Student = {
    id: number; lrn: string; studentName: string; gradeLevel: string; section: string
    quarter1: number | null; quarter2: number | null; quarter3: number | null; quarter4: number | null
    finalAverage: number | null; remarks: 'Passed' | 'Failed' | null; readyToGraduate: boolean
}
type GradeLevel = { id: number; name: string }
type Section = { id: number; name: string; grade_level_id: number; grade_level_name: string }
type Subject = { id: number; name: string }
type SchoolYear = { value: string; label: string }
type Pagination = { current_page: number; last_page: number; per_page: number; total: number } | null
type Props = {
    gradeLevels: GradeLevel[]; sections: Section[]; subjects: Subject[]; schoolYears: SchoolYear[]; students: Student[]
    pagination: Pagination
    filters: { grade_level_id: number | null; section_id: number | null; subject_id: number | null; school_year: string; per_page?: number }
    auth?: { user: { id: number; name: string; email: string; role: string } }
}

export default function FinalReport({ gradeLevels, sections, subjects, schoolYears, students, pagination, filters, auth }: Props) {
    const [gradeLevel, setGradeLevel] = useState(filters.grade_level_id?.toString() || '')
    const [section, setSection] = useState(filters.section_id?.toString() || '')
    const [subject, setSubject] = useState(filters.subject_id?.toString() || '')
    const [schoolYear, setSchoolYear] = useState(filters.school_year || '')
    const [entriesPerPage, setEntriesPerPage] = useState(filters.per_page || 10)
    const isFirstRender = useRef(true)

    const selectedSection = sections.find(s => s.id.toString() === section)
    const selectedSubject = subjects.find(s => s.id.toString() === subject)
    const selectedGradeLevel = gradeLevels.find(g => g.id.toString() === gradeLevel)

    const navigate = (page: number, perPage: number = entriesPerPage) => {
        const params = new URLSearchParams()
        if (gradeLevel) params.set('grade_level_id', gradeLevel)
        if (section) params.set('section_id', section)
        if (subject) params.set('subject_id', subject)
        if (schoolYear) params.set('school_year', schoolYear)
        params.set('per_page', String(perPage))
        params.set('page', String(page))
        router.get(`/teacher/final-report?${params.toString()}`, {}, { preserveState: true, preserveScroll: true })
    }

    useEffect(() => {
        if (isFirstRender.current) { isFirstRender.current = false; return }
        navigate(1)
    }, [gradeLevel, section, subject, schoolYear])

    const handlePageChange = (page: number) => navigate(page)
    const handleEntriesPerPageChange = (perPage: number) => {
        setEntriesPerPage(perPage)
        navigate(1, perPage)
    }

    return (
        <TeacherLayout user={auth?.user}>
            <Head title="Final Grade Report" />
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #printable-area, #printable-area * { visibility: visible; }
                    #printable-area { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
                    .no-print { display: none !important; }
                    table { border-collapse: collapse; width: 100%; }
                    th, td { border: 1px solid #000; padding: 8px; text-align: left; }
                    th { background-color: #f3f4f6 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
            `}</style>

            <div className="space-y-6">
                <div className="no-print">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Final Grade Report</h1>
                    <p className="text-sm text-gray-500 mt-1">Read-only final grades summary</p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm no-print">
                    <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <h2 className="text-base font-semibold text-gray-900">Filter Options</h2>
                        <p className="text-sm text-gray-500 mt-1">Select criteria to view final grades</p>
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
                                <p className="text-sm text-blue-800"><span className="font-medium">Note:</span> Please select all required fields to view final grades.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div id="printable-area">
                    <div className="hidden print:block mb-6 text-center">
                        <h1 className="text-2xl font-bold mb-2">Santor National High School</h1>
                        <h2 className="text-xl font-semibold mb-4">Final Grade Report</h2>
                        <div className="text-sm space-y-1 mb-4">
                            {selectedGradeLevel && <p><span className="font-medium">Grade Level:</span> {selectedGradeLevel.name}</p>}
                            {selectedSection && <p><span className="font-medium">Section:</span> {selectedSection.name}</p>}
                            {selectedSubject && <p><span className="font-medium">Subject:</span> {selectedSubject.name}</p>}
                            <p><span className="font-medium">School Year:</span> {schoolYear}</p>
                            <p><span className="font-medium">Teacher:</span> {auth?.user?.name}</p>
                            <p><span className="font-medium">Students on this page:</span> {students.length} of {pagination?.total ?? students.length}</p>
                        </div>
                    </div>

                    {section && subject ? (
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                            <div className="p-4 border-b border-gray-200 flex items-center justify-end no-print">
                                <Button variant="outline" size="sm" onClick={() => window.print()}>
                                    <Printer className="w-4 h-4 mr-2" /> Print
                                </Button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[700px]">
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
                                        {students.length > 0 ? students.map((student, index) => (
                                            <tr key={student.id} className="hover:bg-gray-50">
                                                <td className="px-2 sm:px-4 py-3 sm:py-4 text-sm text-gray-900">
                                                    {((pagination?.current_page ?? 1) - 1) * (pagination?.per_page ?? entriesPerPage) + index + 1}
                                                </td>
                                                <td className="px-2 sm:px-4 py-3 sm:py-4 text-sm text-gray-900">{student.lrn}</td>
                                                <td className="px-2 sm:px-4 py-3 sm:py-4 text-sm text-gray-900">{student.studentName}</td>
                                                <td className="px-2 sm:px-4 py-3 sm:py-4 text-sm text-gray-900">{student.gradeLevel}</td>
                                                <td className="px-2 sm:px-4 py-3 sm:py-4 text-sm text-gray-900">{student.section}</td>
                                                <td className="px-2 sm:px-4 py-3 sm:py-4 text-sm text-gray-900 text-center">{student.quarter1 ?? '-'}</td>
                                                <td className="px-2 sm:px-4 py-3 sm:py-4 text-sm text-gray-900 text-center">{student.quarter2 ?? '-'}</td>
                                                <td className="px-2 sm:px-4 py-3 sm:py-4 text-sm text-gray-900 text-center">{student.quarter3 ?? '-'}</td>
                                                <td className="px-2 sm:px-4 py-3 sm:py-4 text-sm text-gray-900 text-center">{student.quarter4 ?? '-'}</td>
                                                <td className="px-2 sm:px-4 py-3 sm:py-4 text-sm font-medium text-gray-900 text-center">{student.finalAverage ?? '-'}</td>
                                                <td className="px-2 sm:px-4 py-3 sm:py-4">
                                                    {student.remarks ? (
                                                        <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${student.remarks === 'Passed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{student.remarks}</span>
                                                    ) : <span className="text-gray-400">-</span>}
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan={11} className="px-6 py-8 text-center text-sm text-gray-500">No students found or no final grades available</td></tr>
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
                    ) : (
                        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center no-print">
                            <p className="text-gray-500">Please select section and subject to view final grades</p>
                        </div>
                    )}
                </div>
            </div>
        </TeacherLayout>
    )
}