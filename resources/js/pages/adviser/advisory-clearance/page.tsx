import { Head, router } from '@inertiajs/react'
import AdviserLayout from '@/layouts/adviser-layout'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Filter, CheckCircle2, XCircle, Clock, Users, BookOpen } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

type Student = {
    id: number
    student_id: string
    firstName: string
    lastName: string
    middleName?: string
    grade_level: string
    section: string
    clearance_status: 'cleared' | 'pending' | 'not_cleared'
    profile_picture?: string | null
}
type Subject = { id: number; subject_name: string; subject_code: string; grade_level: string; section: string; section_id: number }
type AdvisorySection = { id: number; name: string; grade_level_id: number; grade_level_name: string }
type SchoolYear = { value: string; label: string }
type Stats = { total: number; cleared: number; pending: number; not_cleared: number }
type Pagination = { current_page: number; last_page: number; per_page: number; total: number } | null
type Props = {
    advisorySection: AdvisorySection
    subjects: Subject[]
    students: Student[]
    stats: Stats
    pagination: Pagination
    schoolYears: SchoolYear[]
    filters?: { subject_id?: number | null; school_year?: string | null; search?: string; status?: string; per_page?: number }
    auth?: { user: { id: number; name: string; email: string; role: string } }
}

export default function AdvisoryClearance({ advisorySection, subjects, students, stats, pagination, schoolYears, filters, auth }: Props) {
    const [searchQuery, setSearchQuery] = useState(filters?.search || '')
    const [selectedSubject, setSelectedSubject] = useState<string>(filters?.subject_id?.toString() || '')
    const [schoolYear, setSchoolYear] = useState(filters?.school_year || '')
    const [filterStatus, setFilterStatus] = useState<'all' | 'cleared' | 'pending' | 'not_cleared'>((filters?.status as any) || 'all')
    const [entriesPerPage, setEntriesPerPage] = useState(filters?.per_page || 10)
    const [localStatuses, setLocalStatuses] = useState<Record<number, 'cleared' | 'pending' | 'not_cleared'>>({})
    const isFirstRender = useRef(true)
    const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)

    const getStatus = (s: Student) => localStatuses[s.id] ?? s.clearance_status

    const navigate = (overrides: Record<string, string | number | null> = {}) => {
        const params = new URLSearchParams()
        if (selectedSubject) params.set('subject_id', selectedSubject)
        if (schoolYear) params.set('school_year', schoolYear)
        if (searchQuery) params.set('search', searchQuery)
        if (filterStatus !== 'all') params.set('status', filterStatus)
        params.set('per_page', String(entriesPerPage))
        params.set('page', String(pagination?.current_page ?? 1))

        Object.entries(overrides).forEach(([key, value]) => {
            if (value === null || value === '') params.delete(key)
            else params.set(key, String(value))
        })

        router.get(`/adviser/advisory-clearance?${params.toString()}`, {}, { preserveState: true, preserveScroll: true })
    }

    const handleClearanceToggle = (student: Student) => {
        if (!selectedSubject) return
        const current = getStatus(student)
        const next = current === 'cleared' ? 'pending' : 'cleared'
        setLocalStatuses(prev => ({ ...prev, [student.id]: next }))
        router.post('/adviser/advisory-clearance/toggle', {
            student_id: student.id,
            subject_id: Number(selectedSubject),
            school_year: schoolYear,
            cleared: next === 'cleared',
        }, { preserveScroll: true, preserveState: true, onError: () => setLocalStatuses(prev => ({ ...prev, [student.id]: current })) })
    }

    useEffect(() => {
        if (isFirstRender.current) return
        if (searchDebounce.current) clearTimeout(searchDebounce.current)
        searchDebounce.current = setTimeout(() => navigate({ search: searchQuery || null, page: 1 }), 400)
        return () => { if (searchDebounce.current) clearTimeout(searchDebounce.current) }
    }, [searchQuery])

    useEffect(() => {
        if (isFirstRender.current) { isFirstRender.current = false; return }
        navigate({ page: 1 })
    }, [selectedSubject, schoolYear, filterStatus])

    const getStatusBadge = (status: string) => {
        if (status === 'cleared') return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"><CheckCircle2 className="w-3 h-3" /> Cleared</span>
        if (status === 'pending') return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700"><Clock className="w-3 h-3" /> Pending</span>
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700"><XCircle className="w-3 h-3" /> Not Cleared</span>
    }

    const selectedSubjectData = subjects.find(s => s.id.toString() === selectedSubject)

    return (
        <AdviserLayout user={auth?.user}>
            <Head title="Advisory Clearance" />
            <div className="space-y-4 sm:space-y-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Advisory Clearance</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage clearance for {advisorySection.grade_level_name} - {advisorySection.name}
                    </p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {[
                        { label: 'Total Students', value: stats.total, bg: 'bg-blue-50 border-blue-200 text-blue-900', Icon: Users },
                        { label: 'Cleared', value: stats.cleared, bg: 'bg-green-50 border-green-200 text-green-900', Icon: CheckCircle2 },
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
                    <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-emerald-600" />
                        <h2 className="text-base sm:text-lg font-semibold text-gray-900">Select Subject</h2>
                    </div>
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
                            <Select value={selectedSubject} onValueChange={(value) => { setSelectedSubject(value); setLocalStatuses({}) }}>
                                <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                                <SelectContent>
                                    {subjects.map(s => (
                                        <SelectItem key={s.id} value={s.id.toString()}>
                                            {s.subject_name}{s.subject_code ? ` (${s.subject_code})` : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {selectedSubject && (
                    <>
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input type="text" placeholder="Search by name or LRN..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
                                </div>
                                <div className="flex items-center gap-2 sm:w-48">
                                    <Filter className="w-4 h-4 text-gray-500 shrink-0" />
                                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                        <option value="all">All Status</option>
                                        <option value="cleared">Cleared</option>
                                        <option value="pending">Pending</option>
                                        <option value="not_cleared">Not Cleared</option>
                                    </select>
                                </div>
                            </div>
                            {selectedSubjectData && (
                                <p className="text-sm text-emerald-700 mt-3 font-medium">
                                    Subject: {selectedSubjectData.subject_name}
                                </p>
                            )}
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[500px]">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
                                            <th className="px-4 py-3 text-left text-xs font-bold uppercase">LRN</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold uppercase">Student Name</th>
                                            <th className="px-4 py-3 text-center text-xs font-bold uppercase">Status</th>
                                            <th className="px-4 py-3 text-center text-xs font-bold uppercase">Clearance</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {students.length === 0 ? (
                                            <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">No students found</td></tr>
                                        ) : students.map(student => {
                                            const status = getStatus(student)
                                            return (
                                                <tr key={student.id} className="hover:bg-emerald-50/50">
                                                    <td className="px-4 py-4 text-sm font-medium">{student.student_id}</td>
                                                    <td className="px-4 py-4 text-sm">{student.lastName}, {student.firstName}</td>
                                                    <td className="px-4 py-4 text-center">{getStatusBadge(status)}</td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center justify-center">
                                                            <Checkbox checked={status === 'cleared'} onCheckedChange={() => handleClearanceToggle(student)} className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600" />
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AdviserLayout>
    )
}
