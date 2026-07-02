import { Head, router } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Pagination } from '@/components/pagination'
import { ChevronRight, Search } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

type Teacher = {
    id: number
    name: string
    employee_number: string
    subject: string
    position: string
    schedules_count: number
}

type PaginationLink = { url: string | null; label: string; active: boolean }

type Props = {
    auth?: {
        user: { id: number; name: string; email: string; role: string }
        admin?: { role: string; position: string }
    }
    teachers: {
        data: Teacher[]
        current_page: number
        last_page: number
        per_page: number
        total: number
        links: PaginationLink[]
    }
    specializations: string[]
    positions: string[]
    filters?: { search?: string; specialization?: string; position?: string }
}

export default function LoadScheduling({ auth, teachers, specializations = [], positions = [], filters = {} }: Props) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '')
    const [specializationFilter, setSpecializationFilter] = useState(filters.specialization || 'all')
    const [positionFilter, setPositionFilter] = useState(filters.position || 'all')
    const [perPage, setPerPage] = useState(teachers.per_page || 10)

    // Guards the filters effect below from firing on mount (including
    // remounts triggered by pagination navigation). Without this, paginating
    // to page 2+ would trigger a re-request with no `page` param, bouncing
    // the user back to page 1.
    const isFirstRender = useRef(true)

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false
            return
        }

        const timer = setTimeout(() => {
            router.get('/admin/enrollment/load-scheduling', {
                search: searchQuery || undefined,
                specialization: specializationFilter !== 'all' ? specializationFilter : undefined,
                position: positionFilter !== 'all' ? positionFilter : undefined,
                per_page: perPage,
            }, { preserveState: true, preserveScroll: true, replace: true })
        }, 300)
        return () => clearTimeout(timer)
    }, [searchQuery, specializationFilter, positionFilter, perPage])

    const handleTeacherClick = (teacherId: number) => {
        router.visit(`/admin/enrollment/load-scheduling/${teacherId}`)
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
            <Head title="Load Scheduling" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Load Scheduling</h1>
                        <p className="text-sm text-gray-500 mt-1">Select a teacher to view and manage their class schedules</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-600 font-medium">Total Teachers</p>
                        <p className="text-3xl font-bold text-blue-900 mt-2">{teachers.total}</p>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <p className="text-sm text-purple-600 font-medium">Filtered View</p>
                        <p className="text-3xl font-bold text-purple-900 mt-2">{teachers.total}</p>
                    </div>
                </div>

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
                                <SelectTrigger><SelectValue /></SelectTrigger>
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
                                <SelectTrigger><SelectValue /></SelectTrigger>
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

                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    {teachers.data.length === 0 ? (
                        <div className="p-8 text-center">
                            <p className="text-lg font-medium text-gray-900 mb-2">No Teachers Found</p>
                            <p className="text-sm text-gray-500">No teachers match your search criteria.</p>
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
                                        {teachers.data.map((teacher) => (
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

                            <Pagination
                                currentPage={teachers.current_page}
                                lastPage={teachers.last_page}
                                perPage={teachers.per_page}
                                total={teachers.total}
                                links={teachers.links}
                                onPageChange={handlePageChange}
                                onPerPageChange={setPerPage}
                            />
                        </>
                    )}
                </div>
            </div>
        </AdminLayout>
    )
}