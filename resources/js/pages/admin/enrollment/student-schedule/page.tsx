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
    filters?: {
        search?: string
    }
}

export default function StudentSchedule({ auth, students, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '')
    const [perPage, setPerPage] = useState(10)

    useEffect(() => {
        const timer = setTimeout(() => {
            router.get('/admin/enrollment/student-schedule', 
                { search: searchTerm, per_page: perPage },
                { preserveState: true, replace: true }
            )
        }, 300)

        return () => clearTimeout(timer)
    }, [searchTerm, perPage])

    const handleStudentClick = (studentId: number) => {
        router.visit(`/admin/enrollment/student-schedule/${studentId}`)
    }

    const handlePageChange = (url: string | null) => {
        if (url) {
            router.visit(url)
        }
    }

    const handlePerPageChange = (newPerPage: number) => {
        setPerPage(newPerPage)
    }

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

                {/* Search */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-sm font-semibold text-gray-900 mb-4">Search</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Student Name or LRN
                        </label>
                        <Input
                            type="text"
                            placeholder="Search student..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-md"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-green-700">
                                <tr>
                                    <th className="px-6 py-5 text-left text-base font-semibold text-white uppercase tracking-wider">Student Name</th>
                                    <th className="px-6 py-5 text-left text-base font-semibold text-white uppercase tracking-wider">LRN</th>
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
                                            <td className="px-6 py-4 text-sm text-gray-900">{student.studentName}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{student.lrn}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{student.gradeLevel}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{student.section}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                                            {searchTerm 
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
