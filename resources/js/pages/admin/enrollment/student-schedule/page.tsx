import { Head, router } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Input } from '@/components/ui/input'
import { Pagination } from '@/components/pagination'
import { useState, useEffect } from 'react'

type Student = {
    id: number
    studentName: string
    lrn: string
    gradeLevel: string
    section: string
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
    students: {
        data: Student[]
        current_page: number
        last_page: number
        per_page: number
        total: number
        links: PaginationLink[]
    }
    gradeLevels: GradeLevel[]
    filters?: {
        search?: string
        grade_level?: number
    }
}

export default function StudentSchedule({ auth, students, gradeLevels, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '')
    const [gradeLevel, setGradeLevel] = useState(filters?.grade_level?.toString() || '')
    const [perPage, setPerPage] = useState(10)

    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(
                '/admin/enrollment/student-schedule',
                {
                    search: searchTerm,
                    grade_level: gradeLevel || undefined,
                    per_page: perPage,
                    page: 1,
                },
                { preserveState: true, replace: true }
            )
        }, 300)

        return () => clearTimeout(timer)
    }, [searchTerm, gradeLevel, perPage])

    const handleStudentClick = (studentId: number) => {
        router.visit(`/admin/enrollment/student-schedule/${studentId}`)
    }

    const handlePageChange = (url: string | null) => {
        if (url) {
            const urlObj = new URL(url)
            const page = urlObj.searchParams.get('page')

            router.get(
                '/admin/enrollment/student-schedule',
                {
                    search: searchTerm,
                    grade_level: gradeLevel || undefined,
                    per_page: perPage,
                    page: page,
                },
                { preserveState: true, replace: true }
            )
        }
    }

    const handlePerPageChange = (newPerPage: number) => {
        setPerPage(newPerPage)
    }

    const handleClearFilters = () => {
        setSearchTerm('')
        setGradeLevel('')
    }

    const hasActiveFilters = searchTerm || gradeLevel

    return (
        <AdminLayout user={auth?.user} admin={auth?.admin}>
            <Head title="Student Schedule" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Student Schedule</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        View student schedules
                    </p>
                </div>

                {/* Search & Filter */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-sm font-semibold text-gray-900 mb-4">Search & Filter</h2>
                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Student Name or LRN
                            </label>
                            <Input
                                type="text"
                                placeholder="Search student..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="w-full sm:w-56">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Grade Level
                            </label>
                            <select
                                value={gradeLevel}
                                onChange={(e) => setGradeLevel(e.target.value)}
                                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                                <option value="">All Grade Levels</option>
                                {gradeLevels.map((level) => (
                                    <option key={level.id} value={level.id.toString()}>
                                        {level.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {hasActiveFilters && (
                            <div className="shrink-0">
                                <button
                                    onClick={handleClearFilters}
                                    className="h-10 px-4 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-green-700">
                                <tr>
                                    <th className="px-6 py-5 text-left text-base font-semibold text-white uppercase tracking-wider">LRN</th>
                                    <th className="px-6 py-5 text-left text-base font-semibold text-white uppercase tracking-wider">Student Name</th>
                                    <th className="px-6 py-5 text-left text-base font-semibold text-white uppercase tracking-wider">Grade Level</th>
                                    <th className="px-6 py-5 text-left text-base font-semibold text-white uppercase tracking-wider">Section</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {students.data.length > 0 ? (
                                    students.data.map((student) => (
                                        <tr
                                            key={student.id}
                                            className="hover:bg-gray-50 cursor-pointer"
                                            onClick={() => handleStudentClick(student.id)}
                                        >
                                            <td className="px-6 py-4 text-sm text-gray-900">{student.lrn}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{student.studentName}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{student.gradeLevel}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{student.section}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                                            {searchTerm || gradeLevel
                                                ? 'No students match your search.'
                                                : 'No enrolled students found.'
                                            }
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {students.data.length > 0 && (
                        <Pagination
                            currentPage={students.current_page}
                            lastPage={students.last_page}
                            perPage={students.per_page}
                            total={students.total}
                            links={students.links}
                            onPageChange={handlePageChange}
                            onPerPageChange={handlePerPageChange}
                        />
                    )}
                </div>
            </div>
        </AdminLayout>
    )
}