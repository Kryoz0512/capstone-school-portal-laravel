import { Head, router } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Pencil, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type Student = {
    id: number
    studentName: string
    lrn: string
    gradeLevel: string
    section: string
}

type GradeLevel = { id: number; name: string }

type StudentsPagination = {
    data: Student[]
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
    students: StudentsPagination | null
    gradeLevels?: GradeLevel[]
    filters: {
        grade: string
        name: string
        lrn: string
        section: string
        per_page: number
    }
}

export default function ViewEditStudent({ auth, students, gradeLevels = [], filters }: Props) {
    const [nameSearch, setNameSearch] = useState(filters.name)
    const [lrnSearch, setLrnSearch] = useState(filters.lrn)
    const [sectionFilter, setSectionFilter] = useState(filters.section)

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const visit = (params: Record<string, any>) => {
        router.get(
            '/admin/admission/view-edit-student',
            {
                grade: filters.grade,
                name: filters.name,
                lrn: filters.lrn,
                section: filters.section,
                per_page: filters.per_page,
                ...params,
            },
            { preserveState: true, preserveScroll: true, replace: true }
        )
    }

    const debouncedVisit = (params: Record<string, any>) => {
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => visit({ ...params, page: 1 }), 400)
    }

    const handleGradeChange = (value: string) => {
        setSectionFilter('')
        visit({ grade: value, section: '', page: 1 })
    }

    const handleNameChange = (value: string) => {
        setNameSearch(value)
        debouncedVisit({ name: value })
    }

    const handleLrnChange = (value: string) => {
        setLrnSearch(value)
        debouncedVisit({ lrn: value })
    }

    const handleSectionChange = (value: string) => {
        setSectionFilter(value)
        debouncedVisit({ section: value })
    }

    const handlePerPageChange = (value: string) => {
        visit({ per_page: Number(value), page: 1 })
    }

    const handlePageChange = (page: number) => {
        if (!students) return
        if (page < 1 || page > students.last_page) return
        visit({ page })
    }

    const handleEdit = (student: Student) => {
        router.visit(`/admin/admission/view-edit-student/${student.id}/edit?grade=${encodeURIComponent(filters.grade)}`)
    }

    // keep local inputs in sync if navigated via back/forward
    useEffect(() => {
        setNameSearch(filters.name)
        setLrnSearch(filters.lrn)
        setSectionFilter(filters.section)
    }, [filters.name, filters.lrn, filters.section])

    return (
        <AdminLayout user={auth?.user} admin={auth?.admin}>
            <Head title="View & Edit Student Information" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">View & Edit Student Information</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Search and manage student records
                    </p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Filter Students</h2>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Student Name
                            </label>
                            <Input
                                type="text"
                                placeholder="Search by name"
                                value={nameSearch}
                                onChange={(e) => handleNameChange(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                LRN
                            </label>
                            <Input
                                type="text"
                                placeholder="Search by LRN"
                                value={lrnSearch}
                                onChange={(e) => handleLrnChange(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Grade Level
                            </label>
                            <Select value={filters.grade} onValueChange={handleGradeChange}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Grades</SelectItem>
                                    {gradeLevels.map((grade) => (
                                        <SelectItem key={grade.id} value={grade.name}>
                                            {grade.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Section
                            </label>
                            <Input
                                type="text"
                                placeholder={filters.grade === 'all' ? "Select a grade level first" : "Search by section"}
                                value={sectionFilter}
                                onChange={(e) => handleSectionChange(e.target.value)}
                                disabled={filters.grade === 'all'}
                                className={filters.grade === 'all' ? "bg-gray-100" : ""}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-green-700">
                                <tr>
                                    <th className="px-6 py-5 text-left text-base font-semibold text-white uppercase tracking-wider">Student Name</th>
                                    <th className="px-6 py-5 text-left text-base font-semibold text-white uppercase tracking-wider">LRN</th>
                                    <th className="px-6 py-5 text-left text-base font-semibold text-white uppercase tracking-wider">Grade Level</th>
                                    <th className="px-6 py-5 text-left text-base font-semibold text-white uppercase tracking-wider">Section</th>
                                    <th className="px-6 py-5 text-left text-base font-semibold text-white uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {students && students.data.length > 0 ? (
                                    students.data.map((student) => (
                                        <tr key={student.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-900">{student.studentName}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{student.lrn}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{student.gradeLevel}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {student.section || <span className="text-gray-400 italic">Not Assigned</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    className="text-gray-600 hover:text-green-600"
                                                    onClick={() => handleEdit(student)}
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                                            {filters.grade === 'all'
                                                ? 'Please select a grade level to view students.'
                                                : 'No students match your search criteria.'
                                            }
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {students && students.total > 0 && (
                        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-700">Entries:</span>
                                    <Select value={students.per_page.toString()} onValueChange={handlePerPageChange}>
                                        <SelectTrigger className="w-[80px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="10">10</SelectItem>
                                            <SelectItem value="25">25</SelectItem>
                                            <SelectItem value="50">50</SelectItem>
                                            <SelectItem value="100">100</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center gap-1">
                                    <Button
                                        onClick={() => handlePageChange(students.current_page - 1)}
                                        disabled={students.current_page === 1}
                                        variant="outline"
                                        size="sm"
                                        className="relative inline-flex items-center px-3 py-2"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    {Array.from({ length: students.last_page }, (_, i) => i + 1).map((page) => (
                                        <Button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            variant={students.current_page === page ? "default" : "outline"}
                                            size="sm"
                                            className={`px-3 py-2 min-w-[40px] ${students.current_page === page ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
                                        >
                                            {page}
                                        </Button>
                                    ))}
                                    <Button
                                        onClick={() => handlePageChange(students.current_page + 1)}
                                        disabled={students.current_page === students.last_page}
                                        variant="outline"
                                        size="sm"
                                        className="relative inline-flex items-center px-3 py-2"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    )
}