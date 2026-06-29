import { Head, router } from '@inertiajs/react'
import TeacherLayout from '@/layouts/teacher-layout'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'
import { useState, useEffect } from 'react'
import { DataTablePagination, teacherTableHeaderCellClass, teacherTableHeaderClass } from '@/components/data-table-pagination'
import { useClientPagination } from '@/hooks/use-client-pagination'

type Student = { id: number; lrn: string; studentName: string; gradeLevel: string; section: string }
type Section = { id: number; name: string; grade_level_name: string }
type SchoolYear = { value: string; label: string }
type Props = {
    section: Section | null
    schoolYears: SchoolYear[]
    students: Student[]
    filters: { school_year: string }
    noAssignment: boolean
    readOnly?: boolean
    auth?: { user: { id: number; name: string; email: string; role: string } }
}

export default function TeacherAdvisoryClassList({ section, schoolYears, students, filters, noAssignment, readOnly, auth }: Props) {
    const [schoolYear, setSchoolYear] = useState(filters.school_year || '')

    const { currentPage, setCurrentPage, entriesPerPage, setEntriesPerPage, totalPages, totalItems, isVisibleOnScreen } = useClientPagination(students)

    useEffect(() => {
        const params = new URLSearchParams()
        if (schoolYear) params.set('school_year', schoolYear)
        router.get(`/teacher/advisory/class-list?${params.toString()}`, {}, { preserveState: true, preserveScroll: true })
    }, [schoolYear])

    return (
        <TeacherLayout user={auth?.user}>
            <Head title="Advisory Class" />
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
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Advisory Class</h1>
                    <p className="text-sm text-gray-500 mt-1">View all students in your advisory class (read-only)</p>
                </div>

                {readOnly && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 no-print">
                        <p className="text-sm text-blue-800">
                            Grade editing is not available here. This list is for viewing your advisory class only.
                        </p>
                    </div>
                )}

                {noAssignment ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 no-print">
                        <p className="text-amber-800 font-medium">No advisory class assigned</p>
                        <p className="text-sm text-amber-700 mt-1">
                            You are not currently assigned as a class adviser. Please contact the registrar's office.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm no-print">
                            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <h2 className="text-base font-semibold text-gray-900">Advisory Class Info</h2>
                            </div>
                            <div className="p-4 sm:p-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {section && (
                                        <div className="space-y-1">
                                            <p className="text-sm text-gray-500">Section</p>
                                            <p className="text-base font-semibold text-gray-900">
                                                {section.grade_level_name} - {section.name}
                                            </p>
                                        </div>
                                    )}
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
                                    {section && (
                                        <p><span className="font-medium">Section:</span> {section.grade_level_name} - {section.name}</p>
                                    )}
                                    <p><span className="font-medium">School Year:</span> {schoolYear}</p>
                                    <p><span className="font-medium">Class Adviser:</span> {auth?.user?.name}</p>
                                    <p><span className="font-medium">Total Students:</span> {students.length}</p>
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
                                        <thead className={teacherTableHeaderClass}>
                                            <tr>
                                                <th className={teacherTableHeaderCellClass}>No.</th>
                                                <th className={teacherTableHeaderCellClass}>Student LRN</th>
                                                <th className={teacherTableHeaderCellClass}>Student Name</th>
                                                <th className={teacherTableHeaderCellClass}>Grade Level</th>
                                                <th className={teacherTableHeaderCellClass}>Section</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {students.length > 0 ? students.map((student, index) => (
                                                <tr key={student.id} className={`hover:bg-gray-50 ${!isVisibleOnScreen(index) ? 'hidden print:table-row' : ''}`}>
                                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-900">{index + 1}</td>
                                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-900">{student.lrn}</td>
                                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-900">{student.studentName}</td>
                                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-900">{student.gradeLevel}</td>
                                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-900">{student.section}</td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                                                        No students found in your advisory class
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <DataTablePagination
                                    totalItems={totalItems}
                                    currentPage={currentPage}
                                    entriesPerPage={entriesPerPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                    onEntriesPerPageChange={setEntriesPerPage}
                                    variant="teacher"
                                />
                                <div className="hidden print:block mt-12 pt-8 border-t border-gray-300">
                                    <div className="grid grid-cols-2 gap-8">
                                        <div>
                                            <p className="text-sm mb-8">Prepared by:</p>
                                            <div className="border-t border-black pt-1">
                                                <p className="text-sm font-medium">{auth?.user?.name}</p>
                                                <p className="text-xs text-gray-600">Class Adviser</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm mb-8">
                                                Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </TeacherLayout>
    )
}
