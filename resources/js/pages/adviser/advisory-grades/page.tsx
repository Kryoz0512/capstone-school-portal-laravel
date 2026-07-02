import { Head, router } from '@inertiajs/react'
import AdviserLayout from '@/layouts/adviser-layout'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { DataTablePagination, teacherTableHeaderCellClass, teacherTableHeaderCellCenterClass, teacherTableHeaderClass } from '@/components/data-table-pagination'

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
    remarks: string | null
}
type Subject = { id: number; name: string; subject_code?: string }
type AdvisorySection = { id: number; name: string; grade_level_id: number; grade_level_name: string }
type SchoolYear = { value: string; label: string }
type Pagination = { current_page: number; last_page: number; per_page: number; total: number } | null
type Props = {
    advisorySection: AdvisorySection
    subjects: Subject[]
    schoolYears: SchoolYear[]
    students: Student[]
    pagination: Pagination
    filters: { subject_id: number | null; school_year: string; per_page?: number }
    auth?: { user: { id: number; name: string; email: string; role: string } }
}

export default function AdvisoryGrades({ advisorySection, subjects, schoolYears, students, pagination, filters, auth }: Props) {
    const [subject, setSubject] = useState(filters.subject_id?.toString() || '')
    const [schoolYear, setSchoolYear] = useState(filters.school_year || '')
    const [entriesPerPage, setEntriesPerPage] = useState(filters.per_page || 10)
    const isFirstRender = useRef(true)

    const selectedSubject = subjects.find(s => s.id.toString() === subject)

    const navigate = (page: number, perPage: number = entriesPerPage) => {
        const params = new URLSearchParams()
        if (subject) params.set('subject_id', subject)
        if (schoolYear) params.set('school_year', schoolYear)
        params.set('per_page', String(perPage))
        params.set('page', String(page))
        router.get(`/adviser/advisory-grades?${params.toString()}`, {}, { preserveState: true, preserveScroll: true })
    }

    useEffect(() => {
        if (isFirstRender.current) { isFirstRender.current = false; return }
        navigate(1)
    }, [subject, schoolYear])

    return (
        <AdviserLayout user={auth?.user}>
            <Head title="Advisory Grades" />
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
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Advisory Grades</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        View grades for {advisorySection.grade_level_name} - {advisorySection.name}
                    </p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 shadow-sm no-print">
                    <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <h2 className="text-base font-semibold text-gray-900">Filter Options</h2>
                    </div>
                    <div className="p-4 sm:p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Advisory Section</label>
                                <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-sm">
                                    {advisorySection.grade_level_name} - {advisorySection.name}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">School Year</label>
                                <Select value={schoolYear} onValueChange={setSchoolYear}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {schoolYears.map(y => <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Subject</label>
                                <Select value={subject} onValueChange={setSubject}>
                                    <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                                    <SelectContent>
                                        {subjects.map(s => (
                                            <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="printable-area">
                    {subject ? (
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                            <div className="p-4 border-b border-gray-200 flex items-center justify-between no-print">
                                <p className="text-sm text-gray-600">
                                    {selectedSubject?.name} — {advisorySection.grade_level_name} - {advisorySection.name}
                                </p>
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
                                            <th className={teacherTableHeaderCellCenterClass}>Q1</th>
                                            <th className={teacherTableHeaderCellCenterClass}>Q2</th>
                                            <th className={teacherTableHeaderCellCenterClass}>Q3</th>
                                            <th className={teacherTableHeaderCellCenterClass}>Q4</th>
                                            <th className={teacherTableHeaderCellCenterClass}>Final</th>
                                            <th className={teacherTableHeaderCellCenterClass}>Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {students.length > 0 ? students.map((student, index) => (
                                            <tr key={student.id} className="hover:bg-gray-50">
                                                <td className="px-3 sm:px-6 py-3 text-sm">
                                                    {((pagination?.current_page ?? 1) - 1) * (pagination?.per_page ?? entriesPerPage) + index + 1}
                                                </td>
                                                <td className="px-3 sm:px-6 py-3 text-sm">{student.lrn}</td>
                                                <td className="px-3 sm:px-6 py-3 text-sm">{student.studentName}</td>
                                                <td className="px-3 sm:px-6 py-3 text-sm text-center">{student.quarter1 ?? '—'}</td>
                                                <td className="px-3 sm:px-6 py-3 text-sm text-center">{student.quarter2 ?? '—'}</td>
                                                <td className="px-3 sm:px-6 py-3 text-sm text-center">{student.quarter3 ?? '—'}</td>
                                                <td className="px-3 sm:px-6 py-3 text-sm text-center">{student.quarter4 ?? '—'}</td>
                                                <td className="px-3 sm:px-6 py-3 text-sm text-center font-medium">{student.finalAverage ?? '—'}</td>
                                                <td className="px-3 sm:px-6 py-3 text-sm text-center">{student.remarks ?? '—'}</td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan={9} className="px-6 py-8 text-center text-sm text-gray-500">No grade records found</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <DataTablePagination
                                totalItems={pagination?.total ?? 0}
                                currentPage={pagination?.current_page ?? 1}
                                entriesPerPage={entriesPerPage}
                                totalPages={pagination?.last_page ?? 1}
                                onPageChange={(page) => navigate(page)}
                                onEntriesPerPageChange={(perPage) => { setEntriesPerPage(perPage); navigate(1, perPage) }}
                                variant="teacher"
                            />
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center no-print">
                            <p className="text-gray-500">Please select a subject to view advisory grades</p>
                        </div>
                    )}
                </div>
            </div>
        </AdviserLayout>
    )
}
