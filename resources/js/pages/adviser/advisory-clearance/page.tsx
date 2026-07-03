import { Head, router } from '@inertiajs/react'
import AdviserLayout from '@/layouts/adviser-layout'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, CheckCircle2, XCircle, Clock, Users, ArrowLeft, User } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { DataTablePagination } from '@/components/data-table-pagination'

type ClearanceStatus = 'cleared' | 'pending' | 'not_cleared'

type StudentListItem = {
    id: number
    student_id: string
    firstName: string
    lastName: string
    middleName?: string | null
    profile_picture?: string | null
    overall_status: ClearanceStatus
}
type SubjectClearance = {
    subject_id: number
    subject_name: string
    subject_code: string
    status: ClearanceStatus
}
type SelectedStudent = {
    id: number
    student_id: string
    firstName: string
    lastName: string
    middleName?: string | null
} | null
type AdvisorySection = { id: number; name: string; grade_level_id: number; grade_level_name: string } | null
type SchoolYear = { value: string; label: string }
type Stats = { total: number; cleared: number; pending: number; not_cleared: number }
type Pagination = { current_page: number; last_page: number; per_page: number; total: number } | null
type Props = {
    advisorySection: AdvisorySection
    students: StudentListItem[]
    pagination: Pagination
    stats: Stats
    schoolYears: SchoolYear[]
    selectedStudent: SelectedStudent
    subjectClearances: SubjectClearance[]
    filters?: { school_year?: string | null; search?: string; student_id?: number | null; per_page?: number }
    auth?: { user: { id: number; name: string; email: string; role: string } }
    noAssignment?: boolean
}

export default function AdvisoryClearance({
    advisorySection, students, pagination, stats, schoolYears,
    selectedStudent, subjectClearances, filters, auth, noAssignment,
}: Props) {
    const [searchQuery, setSearchQuery] = useState(filters?.search || '')
    const [schoolYear, setSchoolYear] = useState(filters?.school_year || '')
    const [entriesPerPage, setEntriesPerPage] = useState(filters?.per_page || 10)
    const isFirstRender = useRef(true)
    const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)

    const navigate = (overrides: Record<string, string | number | null> = {}) => {
        const params = new URLSearchParams()
        if (schoolYear) params.set('school_year', schoolYear)
        if (searchQuery) params.set('search', searchQuery)
        if (filters?.student_id) params.set('student_id', String(filters.student_id))
        params.set('per_page', String(entriesPerPage))
        params.set('page', String(pagination?.current_page ?? 1))

        Object.entries(overrides).forEach(([key, value]) => {
            if (value === null || value === '') params.delete(key)
            else params.set(key, String(value))
        })

        router.get(`/adviser/advisory-clearance?${params.toString()}`, {}, { preserveState: true, preserveScroll: true })
    }

    const selectStudent = (id: number) => navigate({ student_id: id, page: null })
    const clearStudent = () => navigate({ student_id: null })

    useEffect(() => {
        if (isFirstRender.current) return
        if (searchDebounce.current) clearTimeout(searchDebounce.current)
        searchDebounce.current = setTimeout(() => navigate({ search: searchQuery || null, page: 1 }), 400)
        return () => { if (searchDebounce.current) clearTimeout(searchDebounce.current) }
    }, [searchQuery])

    useEffect(() => {
        if (isFirstRender.current) { isFirstRender.current = false; return }
        navigate({ page: 1 })
    }, [schoolYear])

    const getStatusBadge = (status: ClearanceStatus) => {
        if (status === 'cleared') return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"><CheckCircle2 className="w-3 h-3" /> Cleared</span>
        if (status === 'pending') return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700"><Clock className="w-3 h-3" /> Pending</span>
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700"><XCircle className="w-3 h-3" /> Not Cleared</span>
    }

    return (
        <AdviserLayout user={auth?.user}>
            <Head title="Advisory Clearance" />
            <div className="space-y-4 sm:space-y-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Advisory Clearance</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        View clearance status{advisorySection ? ` for ${advisorySection.grade_level_name} - ${advisorySection.name}` : ''}
                    </p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {[
                        { label: 'Total Students', value: stats.total, bg: 'bg-blue-50 border-blue-200 text-blue-900', Icon: Users },
                        { label: 'Fully Cleared', value: stats.cleared, bg: 'bg-green-50 border-green-200 text-green-900', Icon: CheckCircle2 },
                        { label: 'Pending', value: stats.pending, bg: 'bg-yellow-50 border-yellow-200 text-yellow-900', Icon: Clock },
                        { label: 'Not Cleared', value: stats.not_cleared, bg: 'bg-red-50 border-red-200 text-red-900', Icon: XCircle },
                    ].map(({ label, value, bg, Icon }) => (
                        <div key={label} className={`rounded-lg border p-3 sm:p-4 ${bg}`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm font-medium opacity-80">{label}</p>
                                    <p className="text-xl sm:text-2xl font-bold mt-1">{value}</p>
                                </div>
                                <Icon className="w-5 h-5 sm:w-6 sm:h-6 opacity-70" />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Advisory Section</label>
                            <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-sm">
                                {advisorySection ? `${advisorySection.grade_level_name} - ${advisorySection.name}` : 'Not assigned this year'}
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
                    </div>
                </div>

                {noAssignment ? (
                    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                        <Users className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                        <p className="text-gray-600 font-medium">No advisory class for this school year</p>
                        <p className="text-sm text-gray-500 mt-1">
                            You weren't assigned as a class adviser for {schoolYear || 'the selected'} school year.
                        </p>
                    </div>
                ) : !selectedStudent ? (
                    <>
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input type="text" placeholder="Search by name or LRN..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[500px]">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white">
                                            <th className="px-4 py-3 text-left text-xs font-bold uppercase text-blue-100">LRN</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold uppercase text-blue-100">Student Name</th>
                                            <th className="px-4 py-3 text-center text-xs font-bold uppercase text-blue-100">Overall Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {students.length === 0 ? (
                                            <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-500">No students found</td></tr>
                                        ) : students.map(student => (
                                            <tr
                                                key={student.id}
                                                onClick={() => selectStudent(student.id)}
                                                className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                                            >
                                                <td className="px-4 py-4 text-sm font-medium">{student.student_id}</td>
                                                <td className="px-4 py-4 text-sm">
                                                    <div className="flex items-center gap-3">
                                                        {student.profile_picture ? (
                                                            <img src={student.profile_picture} alt="" className="w-8 h-8 rounded-full object-cover" />
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                                <User className="w-4 h-4 text-blue-600" />
                                                            </div>
                                                        )}
                                                        <span>{student.lastName}, {student.firstName}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-center">{getStatusBadge(student.overall_status)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <DataTablePagination
                                totalItems={pagination?.total ?? 0}
                                currentPage={pagination?.current_page ?? 1}
                                entriesPerPage={entriesPerPage}
                                totalPages={pagination?.last_page ?? 1}
                                onPageChange={(page) => navigate({ page })}
                                onEntriesPerPageChange={(perPage) => { setEntriesPerPage(perPage); navigate({ per_page: perPage, page: 1 }) }}
                                variant="teacher"
                            />
                        </div>
                    </>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={clearStudent}
                                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
                                    aria-label="Back to student list"
                                >
                                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                                </button>
                                <div>
                                    <p className="font-semibold text-gray-900">
                                        {selectedStudent.lastName}, {selectedStudent.firstName}
                                    </p>
                                    <p className="text-sm text-gray-500">LRN: {selectedStudent.student_id}</p>
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[500px]">
                                <thead>
                                    <tr className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white">
                                        <th className="px-4 py-3 text-left text-xs font-bold uppercase text-blue-100">Subject</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold uppercase text-blue-100">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {subjectClearances.length === 0 ? (
                                        <tr><td colSpan={2} className="px-6 py-12 text-center text-gray-500">No subjects scheduled for this section</td></tr>
                                    ) : subjectClearances.map(sc => (
                                        <tr key={sc.subject_id} className="hover:bg-blue-50/50">
                                            <td className="px-4 py-4 text-sm">
                                                {sc.subject_name}{sc.subject_code ? ` (${sc.subject_code})` : ''}
                                            </td>
                                            <td className="px-4 py-4 text-center">{getStatusBadge(sc.status)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AdviserLayout>
    )
}