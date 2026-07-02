import { Head, router } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Pencil, Search, X } from 'lucide-react'
import EditStudentAssignmentModal from '@/components/modals/edit-student-assignment-modal'
import { Pagination } from '@/components/pagination'
import { useState, useEffect, useRef } from 'react'

type Student = {
    id: number
    studentName: string
    lrn: string
    gender: string
    age: number
    gradeLevel: string
    gradeLevelId: number | null
    section: string
    studentStatus: string
}

type GradeLevel = { id: number; name: string }
type Section = {
    id: number
    name: string
    grade_level_id: number
    room_name: string
    capacity: number
    current_students: number
    available_slots: number
    is_full: boolean
}
type PaginationLink = { url: string | null; label: string; active: boolean }

type Props = {
    auth?: {
        user: { id: number; name: string; email: string; role: string }
        admin?: { role: string; position: string }
    }
    students: {
        data: Student[]
        current_page: number
        last_page: number
        per_page: number
        total: number
        links: PaginationLink[]
    }
    gradeLevels: GradeLevel[]
    sections: Section[]
    stats: { total: number; pendingAssignment: number; assigned: number }
    filters?: { search?: string; grade_level?: string; gender?: string; age?: string }
}

export default function StudentNotEnrolled({ auth, students, gradeLevels = [], sections = [], stats, filters = {} }: Props) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
    const [perPage, setPerPage] = useState(students.per_page || 10)

    const [search, setSearch] = useState(filters.search || '')
    const [gradeLevelFilter, setGradeLevelFilter] = useState(filters.grade_level || 'all')
    const [genderFilter, setGenderFilter] = useState(filters.gender || 'all')
    const [ageFilter, setAgeFilter] = useState(filters.age || 'all')

    // Guards the filters effect below from firing on mount (including
    // remounts triggered by pagination navigation). Without this, paginating
    // to page 2+ would trigger a re-request with no `page` param, bouncing
    // the user back to page 1.
    const isFirstRender = useRef(true)

    const uniqueAges = Array.from(new Set(students.data.map(s => s.age).filter((a): a is number => a !== null && a !== undefined))).sort((a, b) => a - b)

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false
            return
        }

        const timer = setTimeout(() => {
            router.get('/admin/enrollment/student-not-enrolled', {
                search: search || undefined,
                grade_level: gradeLevelFilter !== 'all' ? gradeLevelFilter : undefined,
                gender: genderFilter !== 'all' ? genderFilter : undefined,
                age: ageFilter !== 'all' ? ageFilter : undefined,
                per_page: perPage,
            }, { preserveState: true, preserveScroll: true, replace: true })
        }, 300)
        return () => clearTimeout(timer)
    }, [search, gradeLevelFilter, genderFilter, ageFilter, perPage])

    const handleClearFilters = () => {
        setSearch('')
        setGradeLevelFilter('all')
        setGenderFilter('all')
        setAgeFilter('all')
    }

    const hasActiveFilters = search || gradeLevelFilter !== 'all' || genderFilter !== 'all' || ageFilter !== 'all'

    const handleEdit = (student: Student) => {
        setSelectedStudent(student)
        setIsEditModalOpen(true)
    }

    const handlePageChange = (url: string | null) => {
        // preserveState is required here so the component instance (and its
        // isFirstRender ref) survives the navigation instead of remounting,
        // which previously caused the filters effect above to re-fire and
        // silently strip the `page` param, sending the user back to page 1.
        if (url) router.visit(url, { preserveScroll: true, preserveState: true })
    }

    return (
        <AdminLayout user={auth?.user} admin={auth?.admin}>
            <Head title="Students Not Enrolled" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Students Not Enrolled</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage and assign grade levels and sections to students</p>
                </div>

                <EditStudentAssignmentModal
                    open={isEditModalOpen}
                    onOpenChange={setIsEditModalOpen}
                    student={selectedStudent}
                    gradeLevels={gradeLevels}
                    sections={sections}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-600 font-medium">Total Students</p>
                        <p className="text-3xl font-bold text-blue-900 mt-2">{stats.total}</p>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-yellow-600 font-medium">Pending Assignment</p>
                        <p className="text-3xl font-bold text-yellow-900 mt-2">{stats.pendingAssignment}</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-600 font-medium">Assigned</p>
                        <p className="text-3xl font-bold text-green-900 mt-2">{stats.assigned}</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
                        {hasActiveFilters && (
                            <Button variant="ghost" size="sm" onClick={handleClearFilters} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                <X className="w-4 h-4 mr-1" />
                                Clear Filters
                            </Button>
                        )}
                    </div>

                    <div className="flex items-end gap-3">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Search by Name or LRN</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Enter student name or LRN..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="w-48">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Grade Level</label>
                            <Select value={gradeLevelFilter} onValueChange={setGradeLevelFilter}>
                                <SelectTrigger><SelectValue placeholder="All Grades" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Grades</SelectItem>
                                    {gradeLevels.map((grade) => (
                                        <SelectItem key={grade.id} value={grade.id.toString()}>{grade.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-40">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                            <Select value={genderFilter} onValueChange={setGenderFilter}>
                                <SelectTrigger><SelectValue placeholder="All Genders" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Genders</SelectItem>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-32">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                            <Select value={ageFilter} onValueChange={setAgeFilter}>
                                <SelectTrigger><SelectValue placeholder="All Ages" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Ages</SelectItem>
                                    {uniqueAges.map((age) => (
                                        <SelectItem key={age} value={age.toString()}>{age} years</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-green-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-base font-medium text-white">LRN</th>
                                    <th className="px-6 py-4 text-left text-base font-medium text-white">Student Name</th>
                                    <th className="px-6 py-4 text-left text-base font-medium text-white">Gender</th>
                                    <th className="px-6 py-4 text-left text-base font-medium text-white">Age</th>
                                    <th className="px-6 py-4 text-left text-base font-medium text-white">Grade Level</th>
                                    <th className="px-6 py-4 text-left text-base font-medium text-white">Status</th>
                                    <th className="px-6 py-4 text-left text-base font-medium text-white">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {students.data.length > 0 ? (
                                    students.data.map((student) => (
                                        <tr key={student.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-900">{student.lrn}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{student.studentName}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{student.gender}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{student.age || '-'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{student.gradeLevel || '-'}</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                    No Section Assigned
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button className="text-gray-600 hover:text-green-600" onClick={() => handleEdit(student)}>
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                                            No students found. Students will appear here after registration.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {students.data.length > 0 && (
                        <Pagination
                            currentPage={students.current_page}
                            lastPage={students.last_page}
                            perPage={students.per_page}
                            total={students.total}
                            links={students.links}
                            onPageChange={handlePageChange}
                            onPerPageChange={setPerPage}
                        />
                    )}
                </div>
            </div>
        </AdminLayout>
    )
}