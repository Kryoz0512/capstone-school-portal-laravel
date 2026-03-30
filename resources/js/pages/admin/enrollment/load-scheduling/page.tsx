import { Head, router } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronRight, ChevronLeft, Search } from 'lucide-react'
import { useState, useMemo } from 'react'

type Teacher = {
    id: number
    name: string
    employee_number: string
    subject: string
    position: string
    schedules_count: number
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
    teachers: Teacher[]
}

export default function LoadScheduling({ auth, teachers = [] }: Props) {
    const [searchQuery, setSearchQuery] = useState('')
    const [specializationFilter, setSpecializationFilter] = useState('all')
    const [positionFilter, setPositionFilter] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)

    // Get unique specializations
    const specializations = useMemo(() => {
        const unique = Array.from(new Set(teachers.map(t => t.subject)))
        return unique.sort()
    }, [teachers])

    // Get unique positions
    const positions = useMemo(() => {
        const unique = Array.from(new Set(teachers.map(t => t.position)))
        return unique.sort()
    }, [teachers])

    // Filter teachers
    const filteredTeachers = useMemo(() => {
        return teachers.filter(teacher => {
            const matchesSearch = 
                teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                teacher.employee_number.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesSpecialization = specializationFilter === 'all' || teacher.subject === specializationFilter
            const matchesPosition = positionFilter === 'all' || teacher.position === positionFilter
            return matchesSearch && matchesSpecialization && matchesPosition
        })
    }, [teachers, searchQuery, specializationFilter, positionFilter])

    // Paginate
    const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedTeachers = filteredTeachers.slice(startIndex, endIndex)

    // Reset to page 1 when filters or itemsPerPage change
    useMemo(() => {
        setCurrentPage(1)
    }, [searchQuery, specializationFilter, positionFilter, itemsPerPage])

    const handleTeacherClick = (teacherId: number) => {
        router.visit(`/admin/enrollment/load-scheduling/${teacherId}`)
    }

    return (
        <AdminLayout user={auth?.user}>
            <Head title="Load Scheduling" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Load Scheduling</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Select a teacher to view and manage their class schedules
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-600 font-medium">Total Teachers</p>
                        <p className="text-3xl font-bold text-blue-900 mt-2">{teachers.length}</p>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <p className="text-sm text-purple-600 font-medium">Filtered View</p>
                        <p className="text-3xl font-bold text-purple-900 mt-2">{filteredTeachers.length}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-sm font-semibold text-gray-900 mb-4">Filters</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Search className="w-4 h-4 inline mr-1" />
                                Search
                            </label>
                            <Input
                                type="text"
                                placeholder="Search by name or employee number..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                            <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Specializations</SelectItem>
                                    {specializations.map(spec => (
                                        <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                            <Select value={positionFilter} onValueChange={setPositionFilter}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Positions</SelectItem>
                                    {positions.map(pos => (
                                        <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Teachers Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    {filteredTeachers.length === 0 ? (
                        <div className="p-8 text-center">
                            <p className="text-lg font-medium text-gray-900 mb-2">No Teachers Found</p>
                            <p className="text-sm text-gray-500">
                                No teachers match your search criteria.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-green-700">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Employee Number</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Specialization</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Position</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Schedules</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {paginatedTeachers.map((teacher) => (
                                            <tr key={teacher.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm text-gray-900">{teacher.employee_number}</td>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{teacher.name}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{teacher.subject}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{teacher.position}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {teacher.schedules_count} schedule{teacher.schedules_count !== 1 ? 's' : ''}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleTeacherClick(teacher.id)}
                                                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                    >
                                                        View Schedules
                                                        <ChevronRight className="w-4 h-4 ml-1" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {filteredTeachers.length > 0 && (
                                <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-600">Show</span>
                                            <Select 
                                                value={itemsPerPage.toString()} 
                                                onValueChange={(value) => setItemsPerPage(Number(value))}
                                            >
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
                                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredTeachers.length)} of {filteredTeachers.length} entries
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </Button>
                                        
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map((page) => {
                                                if (
                                                    page === 1 ||
                                                    page === totalPages ||
                                                    (page >= currentPage - 1 && page <= currentPage + 1)
                                                ) {
                                                    return (
                                                        <Button
                                                            key={page}
                                                            variant={currentPage === page ? "default" : "outline"}
                                                            size="sm"
                                                            onClick={() => setCurrentPage(page)}
                                                            className={currentPage === page ? "bg-green-600 hover:bg-green-700" : ""}
                                                        >
                                                            {page}
                                                        </Button>
                                                    )
                                                } else if (
                                                    page === currentPage - 2 ||
                                                    page === currentPage + 2
                                                ) {
                                                    return <span key={page} className="px-2">...</span>
                                                }
                                                return null
                                            })}
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </AdminLayout>
    )
}
