import { Head, router } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Pagination } from '@/components/pagination'
import { Pencil, Trash2, ArrowLeft, Plus, Search } from 'lucide-react'
import { useState, useMemo, useEffect, useRef } from 'react'
import axios from 'axios'

type Teacher = {
    id: number
    name: string
    employee_number: string
    subject: string
    position: string
    assigned_subjects_count: number
}

type Assignment = {
    id: number
    subject_code: string
    subject_name: string
    grade_level: string
    description: string
    subject_id: number
}

type Subject = {
    id: number
    code: string
    name: string
    description: string
    grade_level_id: number
    grade_level: string
}

type GradeLevel = {
    id: number
    name: string
}

type PaginationLink = {
    url: string | null
    label: string
    active: boolean
}

type Paginated<T> = {
    data: T[]
    current_page: number
    last_page: number
    per_page: number
    total: number
    links: PaginationLink[]
}

type Props = {
    auth?: {
        user: {
            id: number
            name: string
            email: string
            role: string
        }
        admin?: {
            role: string
            position: string
        }
    }
    teachers: Paginated<Teacher>
    gradeLevels: GradeLevel[]
    subjects: Subject[]
    specializations: string[]
    positions: string[]
    filters?: {
        search?: string
        specialization?: string
        position?: string
    }
}

export default function FacultySubjects({
    auth,
    teachers,
    gradeLevels = [],
    subjects = [],
    specializations = [],
    positions = [],
    filters = {},
}: Props) {
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
    const [assignments, setAssignments] = useState<Paginated<Assignment> | null>(null)
    const [loading, setLoading] = useState(false)

    // Filter states for teachers list
    const [searchQuery, setSearchQuery] = useState(filters.search || '')
    const [specializationFilter, setSpecializationFilter] = useState(filters.specialization || 'all')
    const [positionFilter, setPositionFilter] = useState(filters.position || 'all')

    // Pagination for teachers list
    const [perPage, setPerPage] = useState(teachers.per_page || 10)

    // Pagination for assignments
    const [assignmentsPerPage, setAssignmentsPerPage] = useState(10)

    // Assignment modal state
    const [showAssignModal, setShowAssignModal] = useState(false)
    const [selectedSubjectId, setSelectedSubjectId] = useState('')
    const [selectedGradeLevel, setSelectedGradeLevel] = useState('')

    // Delete confirmation modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [assignmentToDelete, setAssignmentToDelete] = useState<Assignment | null>(null)

    // Guards the teachers filter effect below from firing on mount (including
    // remounts triggered by pagination navigation). Without this, paginating
    // the teachers list to page 2+ would trigger a re-request with no `page`
    // param, bouncing the user back to page 1.
    const isFirstRender = useRef(true)

    // Debounced backend filter/pagination for teachers list
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false
            return
        }

        const timer = setTimeout(() => {
            router.get('/admin/enrollment/faculty-subjects', {
                search: searchQuery || undefined,
                specialization: specializationFilter !== 'all' ? specializationFilter : undefined,
                position: positionFilter !== 'all' ? positionFilter : undefined,
                per_page: perPage,
            }, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            })
        }, 300)

        return () => clearTimeout(timer)
    }, [searchQuery, specializationFilter, positionFilter, perPage])

    // Fetch teacher assignments (paginated) when a teacher is selected
    const fetchAssignments = async (teacherId: number, page = 1, perPageParam = assignmentsPerPage) => {
        setLoading(true)
        try {
            const response = await axios.get(`/admin/enrollment/teacher-subjects/${teacherId}`, {
                params: { page, per_page: perPageParam },
            })
            setAssignments(response.data)
        } catch (error) {
            console.error('Error fetching teacher assignments:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleTeacherClick = async (teacher: Teacher) => {
        setSelectedTeacher(teacher)
        await fetchAssignments(teacher.id, 1, assignmentsPerPage)
    }

    const handleBackToTeachers = () => {
        setSelectedTeacher(null)
        setAssignments(null)
    }

    // Filter subjects based on selected grade level
    const filteredSubjects = useMemo(() => {
        if (!selectedGradeLevel) return subjects
        return subjects.filter(s => s.grade_level_id.toString() === selectedGradeLevel)
    }, [subjects, selectedGradeLevel])

    const handleAssignSubject = async () => {
        if (!selectedTeacher || !selectedSubjectId) return

        try {
            await axios.post('/admin/enrollment/teacher-subjects', {
                teacher_id: selectedTeacher.id,
                subject_id: selectedSubjectId,
            })

            // Refresh assignments (stay on current page)
            await fetchAssignments(selectedTeacher.id, assignments?.current_page ?? 1)

            // Close modal and reset
            setShowAssignModal(false)
            setSelectedSubjectId('')
            setSelectedGradeLevel('')

            // Refresh page to update counts
            router.reload({ only: ['teachers'] })
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error assigning subject')
        }
    }

    const handleDeleteAssignment = async (assignmentId: number) => {
        try {
            await axios.delete(`/admin/enrollment/teacher-subjects/${assignmentId}`)

            // Refresh assignments — if the deleted row was the last one on the
            // current page, fall back to page 1
            const nextPage =
                assignments && assignments.data.length === 1 && assignments.current_page > 1
                    ? assignments.current_page - 1
                    : assignments?.current_page ?? 1

            await fetchAssignments(selectedTeacher!.id, nextPage)

            // Refresh page to update counts
            router.reload({ only: ['teachers'] })

            // Close modal
            setShowDeleteModal(false)
            setAssignmentToDelete(null)
        } catch (error) {
            alert('Error removing assignment')
        }
    }

    const handleDeleteClick = (assignment: Assignment) => {
        setAssignmentToDelete(assignment)
        setShowDeleteModal(true)
    }

    const handleTeachersPageChange = (url: string | null) => {
        // preserveState is required here so the component instance (and its
        // isFirstRender ref) survives the navigation instead of remounting,
        // which previously caused the teachers filter effect above to re-fire
        // and silently strip the `page` param, sending the user back to page 1.
        if (url) router.visit(url, { preserveScroll: true, preserveState: true })
    }

    const handleAssignmentsPageChange = (url: string | null) => {
        if (!url || !selectedTeacher) return
        const page = new URL(url, window.location.origin).searchParams.get('page')
        fetchAssignments(selectedTeacher.id, page ? Number(page) : 1, assignmentsPerPage)
    }

    const handleAssignmentsPerPageChange = (value: number) => {
        setAssignmentsPerPage(value)
        if (selectedTeacher) {
            fetchAssignments(selectedTeacher.id, 1, value)
        }
    }

    return (
        <AdminLayout user={auth?.user} admin={auth?.admin}>
            <Head title="Faculty & Subjects" />

            <div className="space-y-6">
                {!selectedTeacher ? (
                    <>
                        {/* Teachers List View */}
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Faculty & Subjects</h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Select a teacher to view and manage their subject assignments
                            </p>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-600 font-medium">Total Teachers</p>
                                <p className="text-3xl font-bold text-blue-900 mt-2">{teachers.total}</p>
                            </div>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-sm text-green-600 font-medium">Total Subjects</p>
                                <p className="text-3xl font-bold text-green-900 mt-2">{subjects.length}</p>
                            </div>
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                <p className="text-sm text-purple-600 font-medium">Total Assignments (this page)</p>
                                <p className="text-3xl font-bold text-purple-900 mt-2">
                                    {teachers.data.reduce((sum, t) => sum + t.assigned_subjects_count, 0)}
                                </p>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        type="text"
                                        placeholder="Search by employee number or teacher name..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>

                                {/* Specialization Filter */}
                                <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by Specialization" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Specializations</SelectItem>
                                        {specializations.map((spec) => (
                                            <SelectItem key={spec} value={spec}>
                                                {spec}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Position Filter */}
                                <Select value={positionFilter} onValueChange={setPositionFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by Position" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Positions</SelectItem>
                                        {positions.map((pos) => (
                                            <SelectItem key={pos} value={pos}>
                                                {pos}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Teachers Table */}
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-green-700">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Employee No.</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Teacher Name</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Specialization</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Position</th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold text-white uppercase tracking-wider">Assigned Subjects</th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold text-white uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {teachers.data.length > 0 ? (
                                            teachers.data.map((teacher) => (
                                                <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{teacher.employee_number}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{teacher.name}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            {teacher.subject}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{teacher.position}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            {teacher.assigned_subjects_count} {teacher.assigned_subjects_count === 1 ? 'subject' : 'subjects'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleTeacherClick(teacher)}
                                                            className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
                                                        >
                                                            View Subjects
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                                                    {searchQuery || specializationFilter !== 'all' || positionFilter !== 'all'
                                                        ? 'No teachers found matching your filters.'
                                                        : 'No teachers available.'}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {teachers.data.length > 0 && (
                                <Pagination
                                    currentPage={teachers.current_page}
                                    lastPage={teachers.last_page}
                                    perPage={teachers.per_page}
                                    total={teachers.total}
                                    links={teachers.links}
                                    onPageChange={handleTeachersPageChange}
                                    onPerPageChange={setPerPage}
                                />
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        {/* Teacher Assignments View */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleBackToTeachers}
                                    className="hover:bg-gray-100"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Teachers
                                </Button>
                                <div className="border-l border-gray-300 pl-4">
                                    <h1 className="text-2xl font-bold text-gray-900">{selectedTeacher.name}</h1>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {selectedTeacher.position} • Specialization: {selectedTeacher.subject}
                                    </p>
                                </div>
                            </div>
                            <Button
                                className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
                                onClick={() => setShowAssignModal(true)}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Assign Subject
                            </Button>
                        </div>

                        {/* Info Card */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <div className="text-blue-600 mt-0.5">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-blue-900">Subject Assignment Management</p>
                                    <p className="text-sm text-blue-700 mt-1">
                                        Assign subjects to this teacher based on their specialization and grade level requirements. Each teacher can handle multiple subjects across different grade levels.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Assignments Table */}
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-base font-semibold text-gray-900">Assigned Subjects</h2>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {assignments?.total ?? 0} subject{(assignments?.total ?? 0) !== 1 ? 's' : ''} currently assigned
                                        </p>
                                    </div>
                                    {(assignments?.total ?? 0) > 0 && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Active
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {loading ? (
                                <div className="p-8 text-center">
                                    <p className="text-gray-500">Loading assignments...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-green-700">
                                                <tr>
                                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Subject Code</th>
                                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Subject Name</th>
                                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Grade Level</th>
                                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Description</th>
                                                    <th className="px-6 py-4 text-center text-sm font-semibold text-white uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {assignments && assignments.data.length > 0 ? (
                                                    assignments.data.map((assignment) => (
                                                        <tr key={assignment.id} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                                    {assignment.subject_code}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{assignment.subject_name}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                    {assignment.grade_level}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-gray-600">{assignment.description}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                                <button
                                                                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                                    onClick={() => handleDeleteClick(assignment)}
                                                                    title="Remove assignment"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={5} className="px-6 py-12 text-center">
                                                            <div className="flex flex-col items-center justify-center">
                                                                <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                                </svg>
                                                                <p className="text-sm font-medium text-gray-900 mb-1">No subjects assigned yet</p>
                                                                <p className="text-sm text-gray-500">Click "Assign Subject" to add subjects to this teacher</p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Assignments Pagination */}
                                    {assignments && assignments.data.length > 0 && (
                                        <Pagination
                                            currentPage={assignments.current_page}
                                            lastPage={assignments.last_page}
                                            perPage={assignments.per_page}
                                            total={assignments.total}
                                            links={assignments.links}
                                            onPageChange={handleAssignmentsPageChange}
                                            onPerPageChange={handleAssignmentsPerPageChange}
                                        />
                                    )}
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Assign Subject Modal */}
            <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Assign Subject to {selectedTeacher?.name}</DialogTitle>
                        <DialogDescription>
                            Select a subject to assign to this teacher
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Grade Level <span className="text-red-500">*</span>
                            </label>
                            <Select value={selectedGradeLevel} onValueChange={setSelectedGradeLevel}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select grade level" />
                                </SelectTrigger>
                                <SelectContent>
                                    {gradeLevels.map((level) => (
                                        <SelectItem key={level.id} value={level.id.toString()}>
                                            {level.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500 mt-1">Choose the grade level for this subject</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Subject <span className="text-red-500">*</span>
                            </label>
                            <Select
                                value={selectedSubjectId}
                                onValueChange={setSelectedSubjectId}
                                disabled={!selectedGradeLevel}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={selectedGradeLevel ? "Select subject" : "Select grade level first"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {filteredSubjects.map((subject) => (
                                        <SelectItem key={subject.id} value={subject.id.toString()}>
                                            {subject.code} - {subject.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {!selectedGradeLevel && (
                                <p className="text-xs text-gray-500 mt-1">Please select a grade level first</p>
                            )}
                            {selectedGradeLevel && filteredSubjects.length === 0 && (
                                <p className="text-xs text-red-500 mt-1">No subjects available for the selected grade level</p>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setShowAssignModal(false)
                                    setSelectedSubjectId('')
                                    setSelectedGradeLevel('')
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleAssignSubject}
                                disabled={!selectedSubjectId}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                Assign Subject
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Remove Subject Assignment</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to remove this assignment?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-gray-700">
                                <span className="font-medium">Subject:</span> {assignmentToDelete?.subject_code} - {assignmentToDelete?.subject_name}
                            </p>
                            <p className="text-sm text-gray-700 mt-1">
                                <span className="font-medium">Grade Level:</span> {assignmentToDelete?.grade_level}
                            </p>
                            <p className="text-sm text-gray-700 mt-1">
                                <span className="font-medium">Teacher:</span> {selectedTeacher?.name}
                            </p>
                        </div>
                        <p className="text-sm text-gray-600">
                            This action cannot be undone.
                        </p>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setShowDeleteModal(false)
                                    setAssignmentToDelete(null)
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => assignmentToDelete && handleDeleteAssignment(assignmentToDelete.id)}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                Remove Assignment
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    )
}