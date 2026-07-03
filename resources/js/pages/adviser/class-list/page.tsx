import { Head, router } from '@inertiajs/react'
import AdviserLayout from '@/layouts/adviser-layout'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { DataTablePagination, teacherTableHeaderCellClass, teacherTableHeaderClass } from '@/components/data-table-pagination'

type Student = { id: number; lrn: string; studentName: string; gradeLevel: string; section: string }
type AdvisorySection = { id: number; name: string; grade_level_id: number; grade_level_name: string }
type SchoolYear = { value: string; label: string }
type Pagination = { current_page: number; last_page: number; per_page: number; total: number }
type Props = {
    advisorySection: AdvisorySection
    schoolYears: SchoolYear[]
    students: Student[]
    pagination: Pagination
    filters: { school_year: string; per_page?: number }
    auth?: { user: { id: number; name: string; email: string; role: string } }
}

export default function AdviserClassList({ advisorySection, schoolYears, students, pagination, filters, auth }: Props) {
    const [schoolYear, setSchoolYear] = useState(filters.school_year || '')
    const [entriesPerPage, setEntriesPerPage] = useState(filters.per_page || 10)
    const isFirstRender = useRef(true)

    const navigate = (page: number, perPage: number = entriesPerPage) => {
        const params = new URLSearchParams()
        if (schoolYear) params.set('school_year', schoolYear)
        params.set('per_page', String(perPage))
        params.set('page', String(page))
        router.get(`/adviser/class-list?${params.toString()}`, {}, { preserveState: true, preserveScroll: true })
    }

    useEffect(() => {
        if (isFirstRender.current) { isFirstRender.current = false; return }
        navigate(1)
    }, [schoolYear])

    return (
        <AdviserLayout user={auth?.user}>
            <Head title="Advisory Class List" />
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #printable-area, #printable-area * { visibility: visible; }
                    #printable-area { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
                    .no-print { display: none !important; }
                    table { border-collapse: collapse; width: 100%; }
                    th, td { border: 1px solid #000; padding: 8px; text-align: left; }
                    th {
                        background-color: #f3f4f6 !important;
                        color: #000 !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    thead {
                        background: #f3f4f6 !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }
            `}</style>

            <div className="space-y-6">
                <div className="no-print">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Advisory Class List</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Students in {advisorySection.grade_level_name} - {advisorySection.name}
                    </p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 shadow-sm no-print">
                    <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <h2 className="text-base font-semibold text-gray-900">Filter Options</h2>
                    </div>
                    <div className="p-4 sm:p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Advisory Section</label>
                                <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-sm text-gray-700">
                                    {advisorySection.grade_level_name} - {advisorySection.name}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">School Year</label>
                                <Select value={schoolYear} onValueChange={setSchoolYear}>
                                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {schoolYears.map(y => (
                                            <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="printable-area">
                    <div className="hidden print:block mb-6 text-center">
                        <h1 className="text-2xl font-bold mb-2">Santor National High School</h1>
                        <h2 className="text-xl font-semibold mb-4">Advisory Class List</h2>
                        <div className="text-sm space-y-1 mb-4">
                            <p><span className="font-medium">Section:</span> {advisorySection.grade_level_name} - {advisorySection.name}</p>
                            <p><span className="font-medium">School Year:</span> {schoolYear}</p>
                            <p><span className="font-medium">Adviser:</span> {auth?.user?.name}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-gray-200 flex items-center justify-end no-print">
                            <Button variant="outline" size="sm" onClick={() => window.print()}>
                                <Printer className="w-4 h-4 mr-2" /> Print
                            </Button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[500px]">
                                <thead className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900">
                                    <tr>
                                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-blue-100 uppercase tracking-wider">No.</th>
                                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-blue-100 uppercase tracking-wider">Student LRN</th>
                                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-blue-100 uppercase tracking-wider">Student Name</th>
                                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-blue-100 uppercase tracking-wider">Grade Level</th>
                                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-blue-100 uppercase tracking-wider">Section</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {students.length > 0 ? students.map((student, index) => (
                                        <tr key={student.id} className="hover:bg-gray-50">
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-900">
                                                {((pagination?.current_page ?? 1) - 1) * (pagination?.per_page ?? entriesPerPage) + index + 1}
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-900">{student.lrn}</td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-900">{student.studentName}</td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-900">{student.gradeLevel}</td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-900">{student.section}</td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">No students found in your advisory class</td></tr>
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
                </div>
            </div>
        </AdviserLayout>
    )
}
