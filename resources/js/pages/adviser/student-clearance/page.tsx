import { Head, router } from '@inertiajs/react'
import AdviserLayout from '@/layouts/adviser-layout'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { CheckCircle2, XCircle, Clock, Users, BookOpen, Search } from 'lucide-react'
import { useState, useEffect } from 'react'

type Student = {
    id: number
    student_id: string
    firstName: string
    lastName: string
    middleName?: string | null
    grade_level: string
    section: string
    clearance_status: 'cleared' | 'pending' | 'not_cleared'
}
type Subject = { id: number; subject_name: string; subject_code: string | null; teacher_name: string }
type Section = { id: number; name: string; grade_level_name: string }
type SchoolYear = { value: string; label: string }
type Props = {
    section: Section | null
    schoolYears: SchoolYear[]
    subjects: Subject[]
    students: Student[]
    filters: { school_year: string; subject_id: number | null }
    noAssignment: boolean
    auth?: { user: { id: number; name: string; email: string; role: string } }
}

export default function AdviserStudentClearance({ section, schoolYears, subjects, students, filters, noAssignment, auth }: Props) {
    const [schoolYear, setSchoolYear] = useState(filters.school_year || '')
    const [subjectId, setSubjectId] = useState(filters.subject_id?.toString() || '')
    const [searchQuery, setSearchQuery] = useState('')
    const [filterStatus, setFilterStatus] = useState<'all' | 'cleared' | 'pending' | 'not_cleared'>('all')

    useEffect(() => {
        const params = new URLSearchParams()
        if (schoolYear) params.set('school_year', schoolYear)
        if (subjectId) params.set('subject_id', subjectId)
        router.get(`/adviser/student-clearance?${params.toString()}`, {}, { preserveState: true, preserveScroll: true })
    }, [schoolYear, subjectId])

    const filteredStudents = students.filter(s => {
        const q = searchQuery.toLowerCase()
        const matchesSearch = !q
            || s.firstName.toLowerCase().includes(q)
            || s.lastName.toLowerCase().includes(q)
            || s.student_id.toLowerCase().includes(q)
        return matchesSearch && (filterStatus === 'all' || s.clearance_status === filterStatus)
    })

    const stats = {
        total: filteredStudents.length,
        cleared: filteredStudents.filter(s => s.clearance_status === 'cleared').length,
        pending: filteredStudents.filter(s => s.clearance_status === 'pending').length,
        notCleared: filteredStudents.filter(s => s.clearance_status === 'not_cleared').length,
    }

    const selectedSubject = subjects.find(s => s.id.toString() === subjectId)

    const getStatusBadge = (status: string) => {
        if (status === 'cleared') return <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"><CheckCircle2 className="w-3 h-3" /> Cleared</span>
        if (status === 'pending') return <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700"><Clock className="w-3 h-3" /> Pending</span>
        return <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700"><XCircle className="w-3 h-3" /> Not Cleared</span>
    }

    return (
        <AdviserLayout user={auth?.user}>
            <Head title="Student Clearance" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Student Clearance</h1>
                    <p className="text-sm text-gray-500 mt-1">View clearance status for your advisory class (read-only)</p>
                </div>

                {noAssignment ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                        <p className="text-amber-800 font-medium">No advisory class assigned</p>
                    </div>
                ) : (
                    <>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-800">View only — you cannot update clearance status from the Adviser Portal.</p>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {section && (
                                    <div>
                                        <p className="text-sm text-gray-500">Advisory Section</p>
                                        <p className="text-base font-semibold text-gray-900">{section.grade_level_name} - {section.name}</p>
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">School Year</label>
                                    <Select value={schoolYear} onValueChange={setSchoolYear}>
                                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {schoolYears.map(y => <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
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
                        </div>

                        {subjectId && (
                            <>
                                {selectedSubject && (
                                    <p className="text-sm text-gray-600">
                                        Showing clearance for <span className="font-medium">{selectedSubject.subject_name}</span>
                                        {' '}(Teacher: {selectedSubject.teacher_name})
                                    </p>
                                )}

                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div><p className="text-xs font-medium text-blue-600">Total</p><p className="text-xl font-bold text-blue-900">{stats.total}</p></div>
                                            <Users className="w-5 h-5 text-blue-600" />
                                        </div>
                                    </div>
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div><p className="text-xs font-medium text-green-600">Cleared</p><p className="text-xl font-bold text-green-900">{stats.cleared}</p></div>
                                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                                        </div>
                                    </div>
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div><p className="text-xs font-medium text-yellow-600">Pending</p><p className="text-xl font-bold text-yellow-900">{stats.pending}</p></div>
                                            <Clock className="w-5 h-5 text-yellow-600" />
                                        </div>
                                    </div>
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div><p className="text-xs font-medium text-red-600">Not Cleared</p><p className="text-xl font-bold text-red-900">{stats.notCleared}</p></div>
                                            <XCircle className="w-5 h-5 text-red-600" />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col sm:flex-row gap-3">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input type="text" placeholder="Search students..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
                                    </div>
                                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as typeof filterStatus)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                        <option value="all">All Status</option>
                                        <option value="cleared">Cleared</option>
                                        <option value="pending">Pending</option>
                                        <option value="not_cleared">Not Cleared</option>
                                    </select>
                                </div>

                                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[500px]">
                                            <thead>
                                                <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                                                    <th className="px-4 py-3 text-left text-xs font-bold uppercase">LRN</th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold uppercase">Student Name</th>
                                                    <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-bold uppercase">Grade & Section</th>
                                                    <th className="px-4 py-3 text-center text-xs font-bold uppercase">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {filteredStudents.length > 0 ? filteredStudents.map(student => (
                                                    <tr key={student.id} className="hover:bg-gray-50">
                                                        <td className="px-4 py-4 text-sm font-medium">{student.student_id}</td>
                                                        <td className="px-4 py-4 text-sm">
                                                            {student.lastName}, {student.firstName}
                                                            {student.middleName ? ` ${student.middleName.charAt(0)}.` : ''}
                                                        </td>
                                                        <td className="hidden sm:table-cell px-4 py-4 text-sm text-gray-600">
                                                            <div className="flex items-center gap-2">
                                                                <BookOpen className="w-4 h-4 text-blue-500" />
                                                                {student.grade_level} — {student.section}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4 text-center">{getStatusBadge(student.clearance_status)}</td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                                            <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                                            <p className="text-sm">No students found</p>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}

                        {!subjectId && (
                            <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500">
                                <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm">Select a subject to view clearance status</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </AdviserLayout>
    )
}
