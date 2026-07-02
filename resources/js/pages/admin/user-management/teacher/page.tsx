import { Head, Link, router } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import DeleteTeacherModal from '@/components/modals/delete-teacher-modal'
import { Pencil, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

type Teacher = {
    id: number
    employee_no: string
    name: string
    email: string
    subject: string
    position: string
    updated_by: string | null
    updated_at: string | null
}

type GradeLevel = { id: number; name: string }
type Subject = { id: number; name: string; grade_level_id: number }

type PaginatedTeachers = {
    data: Teacher[]
    current_page: number
    last_page: number
    per_page: number
    total: number
    from: number | null
    to: number | null
}

type Props = {
    auth?: {
        user: { id: number; name: string; email: string; role: string }
        admin?: { role: string; position: string }
    }
    teachers: PaginatedTeachers
    gradeLevels: GradeLevel[]
    subjects: Subject[]
    uniqueSubjects: string[]
    uniquePositions: string[]
    canAddTeacher?: boolean
    filters: {
        search: string
        subject: string
        position: string
        per_page: number
    }
}

export default function TeacherManagement({
    auth,
    teachers,
    canAddTeacher = true,
    filters,
    uniqueSubjects = [],
    uniquePositions = [],
}: Props) {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)

    const [searchQuery, setSearchQuery] = useState(filters.search)
    const [subjectFilter, setSubjectFilter] = useState(filters.subject)
    const [positionFilter, setPositionFilter] = useState(filters.position)
    const [itemsPerPage, setItemsPerPage] = useState(filters.per_page)

    const isFirstRun = useRef(true)
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const applyFilters = (overrides: Partial<{
        search: string
        subject: string
        position: string
        per_page: number
        page: number
    }> = {}) => {
        router.get(
            window.location.pathname,
            {
                search: overrides.search ?? searchQuery,
                subject: overrides.subject ?? subjectFilter,
                position: overrides.position ?? positionFilter,
                per_page: overrides.per_page ?? itemsPerPage,
                page: overrides.page ?? 1,
            },
            { preserveState: true, preserveScroll: true, replace: true }
        )
    }

    // Debounce the search box so we don't hit the server on every keystroke
    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false
            return
        }
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => applyFilters({ search: searchQuery, page: 1 }), 400)
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery])

    const handleSubjectChange = (value: string) => {
        setSubjectFilter(value)
        applyFilters({ subject: value, page: 1 })
    }

    const handlePositionChange = (value: string) => {
        setPositionFilter(value)
        applyFilters({ position: value, page: 1 })
    }

    const handlePerPageChange = (value: string) => {
        const newPerPage = Number(value)
        setItemsPerPage(newPerPage)
        applyFilters({ per_page: newPerPage, page: 1 })
    }

    const goToPage = (page: number) => applyFilters({ page })

    const handleDelete = (teacher: Teacher) => {
        setSelectedTeacher(teacher)
        setIsDeleteModalOpen(true)
    }

    const { data: teacherRows, current_page: currentPage, last_page: totalPages, total, from, to } = teachers

    return (
        <AdminLayout user={auth?.user} admin={auth?.admin}>
            <Head title="Teacher Management" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Teacher Management</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Create and manage teacher accounts with assignment tracking
                        </p>
                    </div>
                    <Link href={canAddTeacher ? '/admin/user-management/teacher/create' : '#'}>
                        <Button
                            className="bg-green-600 hover:bg-green-700 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!canAddTeacher}
                            title={!canAddTeacher ? 'You do not have permission to add teachers' : ''}
                        >
                            + New Teacher
                        </Button>
                    </Link>
                </div>

                {!canAddTeacher && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-yellow-800">
                            <strong>Note:</strong> You do not have permission to add new teachers. Please contact the Super Admin if you need this access.
                        </p>
                    </div>
                )}
                <DeleteTeacherModal
                    open={isDeleteModalOpen}
                    onOpenChange={setIsDeleteModalOpen}
                    teacher={selectedTeacher}
                />

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-600 font-medium">Total Teachers</p>
                        <p className="text-3xl font-bold text-blue-900 mt-2">{total}</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-600 font-medium">Active Accounts</p>
                        <p className="text-3xl font-bold text-green-900 mt-2">{total}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                    <h2 className="text-sm font-semibold text-gray-900 mb-4">Filter Options</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Search by name or employee number..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                            <Select value={subjectFilter} onValueChange={handleSubjectChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Subjects" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Subjects</SelectItem>
                                    {uniqueSubjects.map((subject) => (
                                        <SelectItem key={subject} value={subject}>
                                            {subject}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                            <Select value={positionFilter} onValueChange={handlePositionChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Positions" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Positions</SelectItem>
                                    {uniquePositions.map((position) => (
                                        <SelectItem key={position} value={position}>
                                            {position}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-green-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Employee No.</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Username</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Subject</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Position</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Last Modified</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {teacherRows.length > 0 ? (
                                    teacherRows.map((teacher) => (
                                        <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                    {teacher.employee_no}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{teacher.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{teacher.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {teacher.subject}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{teacher.position}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {teacher.updated_by && teacher.updated_at ? (
                                                    <div className="space-y-0.5">
                                                        <div className="text-xs font-medium text-gray-700">By: {teacher.updated_by}</div>
                                                        <div className="text-xs text-gray-500">{teacher.updated_at}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">No updates</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Link
                                                        href={`/admin/user-management/teacher/${teacher.id}/edit`}
                                                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                                                        title="Edit teacher"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                        onClick={() => handleDelete(teacher)}
                                                        title="Delete teacher"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                                <p className="text-sm font-medium text-gray-900 mb-1">
                                                    {searchQuery || subjectFilter !== 'all' || positionFilter !== 'all' ? 'No teachers found' : 'No teachers yet'}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {searchQuery || subjectFilter !== 'all' || positionFilter !== 'all'
                                                        ? "Try adjusting your filters to find what you're looking for."
                                                        : 'Click "+ New Teacher" to add your first teacher.'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {total > 0 && (
                        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">Show</span>
                                    <Select value={itemsPerPage.toString()} onValueChange={handlePerPageChange}>
                                        <SelectTrigger className="w-20">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="10">10</SelectItem>
                                            <SelectItem value="25">25</SelectItem>
                                            <SelectItem value="50">50</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <span className="text-sm text-gray-600">entries</span>
                                </div>
                                <p className="text-sm text-gray-600">
                                    Showing {from ?? 0} to {to ?? 0} of {total} entries
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => goToPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>

                                <div className="flex items-center gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                        if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                                            return (
                                                <Button
                                                    key={page}
                                                    variant={currentPage === page ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => goToPage(page)}
                                                    className={currentPage === page ? 'bg-green-600 hover:bg-green-700' : ''}
                                                >
                                                    {page}
                                                </Button>
                                            )
                                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                                            return <span key={page} className="px-2">...</span>
                                        }
                                        return null
                                    })}
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    )
}