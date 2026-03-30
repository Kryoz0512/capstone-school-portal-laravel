import { Head, router } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

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

    useEffect(() => {
        const timer = setTimeout(() => {
            router.get('/admin/enrollment/student-schedule', 
                { search: searchTerm },
                { preserveState: true, replace: true }
            )
        }, 300)

        return () => clearTimeout(timer)
    }, [searchTerm])

    const handleStudentClick = (studentId: number) => {
        router.visit(`/admin/enrollment/student-schedule/${studentId}`)
    }

    const handlePageChange = (url: string | null) => {
        if (url) {
            router.visit(url)
        }
    }

    return (
        <AdminLayout user={auth?.user}>
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
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Student Name</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">LRN</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Grade Level</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Section</th>
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
                        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    <Button
                                        onClick={() => handlePageChange(students.links[0]?.url)}
                                        disabled={students.current_page === 1}
                                        variant="outline"
                                        size="sm"
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        onClick={() => handlePageChange(students.links[students.links.length - 1]?.url)}
                                        disabled={students.current_page === students.last_page}
                                        variant="outline"
                                        size="sm"
                                    >
                                        Next
                                    </Button>
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            Showing <span className="font-medium">{(students.current_page - 1) * students.per_page + 1}</span> to{' '}
                                            <span className="font-medium">
                                                {Math.min(students.current_page * students.per_page, students.total)}
                                            </span> of{' '}
                                            <span className="font-medium">{students.total}</span> results
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                            <Button
                                                onClick={() => handlePageChange(students.links[0]?.url)}
                                                disabled={students.current_page === 1}
                                                variant="outline"
                                                size="sm"
                                                className="relative inline-flex items-center px-2 py-2 rounded-l-md"
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                            {students.links.slice(1, -1).map((link, index) => (
                                                <Button
                                                    key={index}
                                                    onClick={() => handlePageChange(link.url)}
                                                    variant={link.active ? "default" : "outline"}
                                                    size="sm"
                                                    className={link.active ? "bg-green-600 hover:bg-green-700" : ""}
                                                >
                                                    {link.label}
                                                </Button>
                                            ))}
                                            <Button
                                                onClick={() => handlePageChange(students.links[students.links.length - 1]?.url)}
                                                disabled={students.current_page === students.last_page}
                                                variant="outline"
                                                size="sm"
                                                className="relative inline-flex items-center px-2 py-2 rounded-r-md"
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    )
}
