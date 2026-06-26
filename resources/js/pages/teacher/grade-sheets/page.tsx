import { Head, router } from '@inertiajs/react'
import TeacherLayout from '@/layouts/teacher-layout'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Pencil } from 'lucide-react'
import { useState, useEffect } from 'react'
import EditGradeModal from '@/components/modals/edit-grade-modal'
import { DataTablePagination, teacherTableHeaderCellClass, teacherTableHeaderClass } from '@/components/data-table-pagination'
import { useClientPagination } from '@/hooks/use-client-pagination'

type Student = {
    id: number
    lrn: string
    studentName: string
    grade: number | null
    remarks: 'Passed' | 'Failed' | 'Incomplete' | 'Dropped' | null
    gradeId: number | null
}
type GradeLevel = { id: number; name: string }
type Section = { id: number; name: string; grade_level_id: number }
type Subject = { id: number; name: string }
type SchoolYear = { value: string; label: string }
type Props = {
    gradeLevels: GradeLevel[]
    sections: Section[]
    subjects: Subject[]
    students: Student[]
    schoolYears: SchoolYear[]
    filters: { grade_level_id: number | null; section_id: number | null; subject_id: number | null; quarter: string; school_year: string }
    auth?: { user: { id: number; name: string; email: string; role: string } }
}

export default function GradeSheets({ gradeLevels, sections, subjects, students, schoolYears, filters, auth }: Props) {
    const [gradeLevel, setGradeLevel] = useState(filters.grade_level_id?.toString() || '')
    const [section, setSection] = useState(filters.section_id?.toString() || '')
    const [subject, setSubject] = useState(filters.subject_id?.toString() || '')
    const [quarter, setQuarter] = useState(filters.quarter || '1')
    const [schoolYear, setSchoolYear] = useState(filters.school_year || '')
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

    const { currentPage, setCurrentPage, entriesPerPage, setEntriesPerPage, totalPages, paginatedItems: paginatedStudents, totalItems } = useClientPagination(students)

    const handleEditClick = (student: Student) => { setSelectedStudent(student); setEditModalOpen(true) }

    useEffect(() => {
        const params = new URLSearchParams()
        if (gradeLevel) params.set('grade_level_id', gradeLevel)
        if (section) params.set('section_id', section)
        if (subject) params.set('subject_id', subject)
        if (quarter) params.set('quarter', quarter)
        if (schoolYear) params.set('school_year', schoolYear)
        router.get(`/teacher/grade-sheets?${params.toString()}`, {}, { preserveState: true, preserveScroll: true })
    }, [gradeLevel, section, subject, quarter, schoolYear])

    return (
        <TeacherLayout user={auth?.user}>
            <Head title="Grade Sheets" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Grade Sheets</h1>
                    <p className="text-sm text-gray-500 mt-1">Enter and manage student grades</p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <h2 className="text-base font-semibold text-gray-900">Filter Options</h2>
                        <p className="text-sm text-gray-500 mt-1">Select criteria to view student grades</p>
                    </div>
                    <div className="p-4 sm:p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
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
                                <label className="block text-sm font-medium text-gray-700">Quarter <span className="text-red-500">*</span></label>
                                <Select value={quarter} onValueChange={setQuarter}>
                                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">1st Quarter</SelectItem>
                                        <SelectItem value="2">2nd Quarter</SelectItem>
                                        <SelectItem value="3">3rd Quarter</SelectItem>
                                        <SelectItem value="4">4th Quarter</SelectItem>
                                    </SelectContent>
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

                {/* Table */}
                {section && subject ? (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[500px]">
                                <thead className={teacherTableHeaderClass}>
                                    <tr>
                                        <th className={teacherTableHeaderCellClass}>Student LRN</th>
                                        <th className={teacherTableHeaderCellClass}>Student Name</th>
                                        <th className={teacherTableHeaderCellClass}>Grade</th>
                                        <th className={teacherTableHeaderCellClass}>Remarks</th>
                                        <th className={`${teacherTableHeaderCellClass} text-center`}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {paginatedStudents.length > 0 ? paginatedStudents.map(student => (
                                        <tr key={student.id} className="hover:bg-gray-50">
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-900">{student.lrn}</td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-900">{student.studentName}</td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-900">{student.grade !== null ? student.grade : '-'}</td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4">
                                                {student.remarks ? (
                                                    <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                                                        student.remarks === 'Passed' ? 'bg-green-100 text-green-800'
                                                        : student.remarks === 'Failed' ? 'bg-red-100 text-red-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                    }`}>{student.remarks}</span>
                                                ) : <span className="text-gray-400">-</span>}
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                                                <button onClick={() => handleEditClick(student)} className="text-gray-600 hover:text-blue-600">
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">No students found in this section</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <DataTablePagination totalItems={totalItems} currentPage={currentPage} entriesPerPage={entriesPerPage} totalPages={totalPages} onPageChange={setCurrentPage} onEntriesPerPageChange={setEntriesPerPage} variant="teacher" />
                    </div>
                ) : (
                    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                        <p className="text-gray-500">Please select a section and subject to view students</p>
                    </div>
                )}
            </div>
            <EditGradeModal open={editModalOpen} onOpenChange={setEditModalOpen} student={selectedStudent} filters={{ section_id: section ? parseInt(section) : null, subject_id: subject ? parseInt(subject) : null, quarter, school_year: schoolYear }} />
        </TeacherLayout>
    )
}