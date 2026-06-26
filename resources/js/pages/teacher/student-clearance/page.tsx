import { Head, router } from '@inertiajs/react'
import TeacherLayout from '@/layouts/teacher-layout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Search, Filter, Download, CheckCircle2, XCircle, Clock, Users, BookOpen, ChevronRight, ChevronLeft, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { useState } from 'react'

type Student = { id: number; student_id: string; firstName: string; lastName: string; middleName?: string; grade_level: string; section: string; clearance_status: 'cleared' | 'pending' | 'not_cleared'; profile_picture?: string | null }
type Subject = { id: number; subject_name: string; subject_code: string; grade_level: string; section: string; section_id: number }
type Props = { subjects: Subject[]; students: Student[]; filters?: { subject_id?: number | null; section_id?: number | null; school_year?: string | null }; auth?: { user: { id: number; name: string; email: string; role: string } } }

export default function StudentClearance({ subjects, students, filters, auth }: Props) {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedSubject, setSelectedSubject] = useState<number | null>(filters?.subject_id ? Number(filters.subject_id) : null)
    const [selectedGradeLevel, setSelectedGradeLevel] = useState<string | null>(() => filters?.subject_id ? (subjects.find(s => s.id === Number(filters.subject_id))?.grade_level ?? null) : null)
    const [selectedSection, setSelectedSection] = useState<string | null>(() => filters?.subject_id ? (subjects.find(s => s.id === Number(filters.subject_id))?.section ?? null) : null)
    const [filterStatus, setFilterStatus] = useState<'all' | 'cleared' | 'pending' | 'not_cleared'>('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [entriesPerPage, setEntriesPerPage] = useState(10)
    const [localStatuses, setLocalStatuses] = useState<Record<number, 'cleared' | 'pending' | 'not_cleared'>>({})

    const getStatus = (s: Student) => localStatuses[s.id] ?? s.clearance_status

    const handleClearanceToggle = (student: Student) => {
        const current = getStatus(student)
        const next = current === 'cleared' ? 'pending' : 'cleared'
        setLocalStatuses(prev => ({ ...prev, [student.id]: next }))
        const subjectData = subjects.find(s => s.id === selectedSubject)
        router.post('/teacher/student-clearance/toggle', { student_id: student.id, subject_id: selectedSubject, class_section_id: subjectData?.section_id, school_year: filters?.school_year, cleared: next === 'cleared' }, { preserveScroll: true, preserveState: true, onError: () => setLocalStatuses(prev => ({ ...prev, [student.id]: current })) })
    }

    const filteredStudents = students.filter(s => {
        const matchesSearch = searchQuery === '' || s.firstName.toLowerCase().includes(searchQuery.toLowerCase()) || s.lastName.toLowerCase().includes(searchQuery.toLowerCase()) || s.student_id.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesSearch && (filterStatus === 'all' || getStatus(s) === filterStatus)
    })

    const totalPages = Math.ceil(filteredStudents.length / entriesPerPage)
    const paginatedStudents = filteredStudents.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage)
    const startEntry = filteredStudents.length === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1
    const endEntry = Math.min(currentPage * entriesPerPage, filteredStudents.length)

    const getPageNumbers = () => {
        const pages: (number | 'ellipsis')[] = []
        if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) pages.push(i) }
        else {
            pages.push(1)
            if (currentPage > 3) pages.push('ellipsis')
            for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i)
            if (currentPage < totalPages - 2) pages.push('ellipsis')
            pages.push(totalPages)
        }
        return pages
    }

    const handleSubjectSelect = (subjectId: number, sectionId: number) => {
        setSelectedSubject(subjectId); setLocalStatuses({}); setCurrentPage(1)
        router.get('/teacher/student-clearance', { subject_id: subjectId, section_id: sectionId }, { preserveState: true, preserveScroll: true })
    }

    const getStatusBadge = (status: string) => {
        if (status === 'cleared') return <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"><CheckCircle2 className="w-3 h-3" /> Cleared</span>
        if (status === 'pending') return <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700"><Clock className="w-3 h-3" /> Pending</span>
        return <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700"><XCircle className="w-3 h-3" /> Not Cleared</span>
    }

    const stats = { total: filteredStudents.length, cleared: filteredStudents.filter(s => getStatus(s) === 'cleared').length, pending: filteredStudents.filter(s => getStatus(s) === 'pending').length, notCleared: filteredStudents.filter(s => getStatus(s) === 'not_cleared').length }
    const selectedSubjectData = subjects.find(s => s.id === selectedSubject)
    const uniqueGradeLevels = [...new Map(subjects.map(s => [s.grade_level, s.grade_level])).values()]
    const filteredSections = [...new Map(subjects.filter(s => s.grade_level === selectedGradeLevel).map(s => [s.section, s.section])).values()]
    const filteredSubjects = subjects.filter(s => s.grade_level === selectedGradeLevel && s.section === selectedSection)

    return (
        <TeacherLayout user={auth?.user}>
            <Head title="Student Clearance" />
            <div className="space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Student Clearance</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage clearance status for students in your subjects</p>
                        {selectedSubjectData && (
                            <div className="flex items-center gap-1 mt-2 text-sm text-blue-600 flex-wrap">
                                <span className="text-gray-400">Subject:</span>
                                <ChevronRight className="w-3 h-3 text-gray-400" />
                                <span className="font-medium">{selectedSubjectData.subject_name} — {selectedSubjectData.grade_level} {selectedSubjectData.section}</span>
                            </div>
                        )}
                    </div>
                    <Button className="bg-green-600 hover:bg-green-700 text-white self-start sm:shrink-0">
                        <Download className="w-4 h-4 mr-2" /> Export Report
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {[
                        { label: 'Total Students', value: stats.total, color: 'blue', Icon: Users },
                        { label: 'Cleared', value: stats.cleared, color: 'green', Icon: CheckCircle2 },
                        { label: 'Pending', value: stats.pending, color: 'yellow', Icon: Clock },
                        { label: 'Not Cleared', value: stats.notCleared, color: 'red', Icon: XCircle },
                    ].map(({ label, value, color, Icon }) => (
                        <div key={label} className={`bg-gradient-to-br from-${color}-50 to-${color}-100 rounded-lg border border-${color}-200 p-3 sm:p-4`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={`text-xs sm:text-sm font-medium text-${color}-600`}>{label}</p>
                                    <p className={`text-xl sm:text-2xl font-bold text-${color}-900 mt-1`}>{value}</p>
                                </div>
                                <div className={`w-9 h-9 sm:w-12 sm:h-12 bg-${color}-500 rounded-lg flex items-center justify-center shrink-0`}>
                                    <Icon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Subject Selection */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                        <h2 className="text-base sm:text-lg font-semibold text-gray-900">Select Subject</h2>
                        {subjects.length === 0 && <span className="text-sm text-gray-400 ml-2">— No subjects assigned yet</span>}
                    </div>
                    {subjects.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                            <BookOpen className="w-10 h-10 mb-2 text-gray-300" />
                            <p className="text-sm">You have no assigned subjects.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Grade Level</label>
                                <select value={selectedGradeLevel ?? ''} onChange={e => { setSelectedGradeLevel(e.target.value || null); setSelectedSection(null); setSelectedSubject(null); setCurrentPage(1); router.get('/teacher/student-clearance', {}, { preserveState: true, preserveScroll: true }) }} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 text-sm">
                                    <option value="" disabled>Select grade level...</option>
                                    {uniqueGradeLevels.map(gl => <option key={gl} value={gl}>{gl}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Section</label>
                                    <select value={selectedSection ?? ''} disabled={!selectedGradeLevel} onChange={e => { setSelectedSection(e.target.value || null); setSelectedSubject(null); setCurrentPage(1); router.get('/teacher/student-clearance', {}, { preserveState: true, preserveScroll: true }) }} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 text-sm disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed">
                                        <option value="" disabled>Select section...</option>
                                        {filteredSections.map(sec => <option key={sec} value={sec}>{sec}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Subject</label>
                                    <select value={selectedSubject ?? ''} disabled={!selectedSection} onChange={e => { const val = e.target.value; if (val) { const s = filteredSubjects.find(x => x.id === Number(val)); if (s) handleSubjectSelect(s.id, s.section_id) } }} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 text-sm disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed">
                                        <option value="" disabled>Select subject...</option>
                                        {filteredSubjects.map(s => <option key={s.id} value={s.id}>{s.subject_name}{s.subject_code ? ` (${s.subject_code})` : ''}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {selectedSubject && (
                    <>
                        {/* Search + Filter */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <div className="flex flex-col gap-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input type="text" placeholder="Search by name or student ID..." value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1) }} className="pl-10 w-full" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Filter className="w-4 h-4 text-gray-500 shrink-0" />
                                    <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value as any); setCurrentPage(1) }} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                                        <option value="all">All Status</option>
                                        <option value="cleared">Cleared</option>
                                        <option value="pending">Pending</option>
                                        <option value="not_cleared">Not Cleared</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[500px]">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold uppercase tracking-wider">LRN</th>
                                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold uppercase tracking-wider">Student Name</th>
                                            <th className="hidden sm:table-cell px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Grade & Section</th>
                                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs font-bold uppercase tracking-wider">Status</th>
                                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs font-bold uppercase tracking-wider">Clearance</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {paginatedStudents.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-16 text-center">
                                                    <div className="flex flex-col items-center justify-center text-gray-500">
                                                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                            <Users className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                                                        </div>
                                                        <p className="text-base font-semibold text-gray-700">No students found</p>
                                                        <p className="text-sm text-gray-500 mt-2">{students.length === 0 ? "No students are enrolled in this subject's section." : 'Try adjusting your search or filters'}</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : paginatedStudents.map((student, index) => {
                                            const status = getStatus(student)
                                            const isCleared = status === 'cleared'
                                            return (
                                                <tr key={student.id} className={`hover:bg-blue-50/50 transition-all duration-200 group ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                                                    <td className="px-3 sm:px-6 py-4 sm:py-5">
                                                        <span className="text-sm font-semibold text-gray-900">{student.student_id}</span>
                                                    </td>
                                                    <td className="px-3 sm:px-6 py-4 sm:py-5">
                                                        <p className="text-sm font-semibold text-gray-900">{student.lastName}, {student.firstName}{student.middleName ? ` ${student.middleName.charAt(0)}.` : ''}</p>
                                                        <p className="text-xs text-gray-500 sm:hidden mt-0.5">{student.grade_level} — {student.section}</p>
                                                    </td>
                                                    <td className="hidden sm:table-cell px-6 py-5">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                                                                <BookOpen className="w-4 h-4 text-blue-600" />
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-700">{student.grade_level} — {student.section}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 sm:px-6 py-4 sm:py-5 text-center">{getStatusBadge(status)}</td>
                                                    <td className="px-3 sm:px-6 py-4 sm:py-5">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <Checkbox id={`clearance-${student.id}`} checked={isCleared} onCheckedChange={() => handleClearanceToggle(student)} className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600" />
                                                            <label htmlFor={`clearance-${student.id}`} className="text-sm font-medium text-gray-700 cursor-pointer hover:text-green-600 transition-colors hidden sm:inline">
                                                                {isCleared ? 'Cleared' : 'Clear'}
                                                            </label>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {filteredStudents.length > 0 && (
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50">
                                    <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
                                        <span>Show</span>
                                        <select value={entriesPerPage} onChange={e => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1) }} className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm">
                                            {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
                                        </select>
                                        <span>entries</span>
                                        <span className="text-gray-400">— {startEntry}–{endEntry} of {filteredStudents.length}</span>
                                    </div>
                                    <div className="flex items-center gap-1 flex-wrap">
                                        <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-1.5 rounded-md border border-gray-300 text-gray-500 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"><ChevronsLeft className="w-4 h-4" /></button>
                                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 rounded-md border border-gray-300 text-gray-500 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"><ChevronLeft className="w-4 h-4" /></button>
                                        {getPageNumbers().map((page, i) => page === 'ellipsis' ? (
                                            <span key={`e-${i}`} className="px-2 text-gray-400">…</span>
                                        ) : (
                                            <button key={page} onClick={() => setCurrentPage(page)} className={`min-w-[34px] h-[34px] rounded-md border text-sm font-medium transition-all ${currentPage === page ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 text-gray-600 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600'}`}>{page}</button>
                                        ))}
                                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 rounded-md border border-gray-300 text-gray-500 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"><ChevronRight className="w-4 h-4" /></button>
                                        <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="p-1.5 rounded-md border border-gray-300 text-gray-500 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"><ChevronsRight className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {!selectedSubject && subjects.length > 0 && (
                    <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 sm:p-12">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                            <BookOpen className="w-12 h-12 mb-3 text-gray-300" />
                            <p className="text-sm font-medium text-gray-500">Select a subject above</p>
                            <p className="text-xs mt-1">Students will appear here once you pick a subject</p>
                        </div>
                    </div>
                )}
            </div>
        </TeacherLayout>
    )
}