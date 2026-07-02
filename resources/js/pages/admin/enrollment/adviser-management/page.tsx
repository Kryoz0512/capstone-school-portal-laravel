import { Head, router } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AssignAdviserModal from '@/components/modals/assign-adviser-modal'
import { Pagination } from '@/components/pagination'
import { useState, useEffect, useRef } from 'react'

type Section = {
    id: number
    section_name: string
    grade_level: string
    grade_level_id: number
    current_adviser: string
    adviser_id: number | null
    adviser_section_id: number | null
}

type Teacher = { id: number; name: string; is_assigned: boolean }
type GradeLevel = { id: number; name: string }
type PaginationLink = { url: string | null; label: string; active: boolean }

type Props = {
    auth?: {
        user: { id: number; name: string; email: string; role: string }
        admin?: { role: string; position: string }
    }
    sections: {
        data: Section[]
        current_page: number
        last_page: number
        per_page: number
        total: number
        links: PaginationLink[]
    }
    teachers: Teacher[]
    gradeLevels: GradeLevel[]
    schoolYear: string
    filters?: { search?: string; grade_level?: string }
}

export default function AdviserManagement({ auth, sections, teachers = [], gradeLevels = [], schoolYear = '', filters = {} }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '')
    const [gradeLevelFilter, setGradeLevelFilter] = useState(filters.grade_level || 'all')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedSection, setSelectedSection] = useState<Section | null>(null)
    const [perPage, setPerPage] = useState(sections.per_page || 10)

    // Guards the search/filter effect below from firing on mount (including
    // remounts triggered by pagination navigation). Without this, paginating
    // to page 2+ would trigger a re-request with no `page` param, bouncing
    // the user back to page 1.
    const isFirstRender = useRef(true)

    const displaySchoolYear = schoolYear || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false
            return
        }

        const timer = setTimeout(() => {
            router.get('/admin/enrollment/adviser-management', {
                search: searchTerm || undefined,
                grade_level: gradeLevelFilter !== 'all' ? gradeLevelFilter : undefined,
                per_page: perPage,
            }, { preserveState: true, preserveScroll: true, replace: true })
        }, 300)
        return () => clearTimeout(timer)
    }, [searchTerm, gradeLevelFilter, perPage])

    const totalSections = sections.total
    const assignedAdvisers = sections.data.filter(s => s.adviser_id !== null).length // page-local only; see note below

    const handleAssign = (section: Section) => {
        setSelectedSection(section)
        setIsModalOpen(true)
    }

    const handlePageChange = (url: string | null) => {
        // preserveState is required here so the component instance (and its
        // isFirstRender ref) survives the navigation instead of remounting,
        // which previously caused the search/filter effect above to re-fire
        // and silently strip the `page` param, sending the user back to page 1.
        if (url) router.visit(url, { preserveScroll: true, preserveState: true })
    }

    return (
        <AdminLayout user={auth?.user} admin={auth?.admin}>
            <Head title="Adviser Assignment" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Adviser Assignment</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Assign and manage section advisers for school year {displaySchoolYear}
                    </p>
                </div>

                <AssignAdviserModal
                    open={isModalOpen}
                    onOpenChange={setIsModalOpen}
                    section={selectedSection}
                    teachers={teachers}
                    sections={sections.data}
                    schoolYear={displaySchoolYear}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-600 font-medium">Total Sections</p>
                        <p className="text-3xl font-bold text-blue-900 mt-2">{totalSections}</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-600 font-medium">Assigned Advisers (this page)</p>
                        <p className="text-3xl font-bold text-green-900 mt-2">{assignedAdvisers}</p>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <p className="text-sm text-purple-600 font-medium">Unassigned (this page)</p>
                        <p className="text-3xl font-bold text-purple-900 mt-2">{sections.data.length - assignedAdvisers}</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-sm font-semibold text-gray-900 mb-4">Search & Filters</h2>
                    <div className="flex flex-col md:flex-row gap-4">
                        <Input
                            type="text"
                            placeholder="Search by section or adviser name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1"
                        />
                        <Select value={gradeLevelFilter} onValueChange={setGradeLevelFilter}>
                            <SelectTrigger className="w-full md:w-64">
                                <SelectValue placeholder="Filter by grade level" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Grade Levels</SelectItem>
                                {gradeLevels.map((level) => (
                                    <SelectItem key={level.id} value={level.id.toString()}>{level.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    {sections.total === 0 && !searchTerm && gradeLevelFilter === 'all' ? (
                        <div className="p-8 text-center">
                            <p className="text-lg font-medium text-gray-900 mb-2">No Data Found</p>
                            <p className="text-sm text-gray-500">No sections available. Please create class sections first.</p>
                        </div>
                    ) : teachers.length === 0 ? (
                        <div className="p-8 text-center">
                            <p className="text-lg font-medium text-gray-900 mb-2">No Teachers Available</p>
                            <p className="text-sm text-gray-500">Please create teachers first before assigning advisers.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-green-700">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Grade Level</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Section</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Current Adviser</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {sections.data.length > 0 ? (
                                        sections.data.map((section) => (
                                            <tr key={section.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {section.grade_level}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{section.section_name}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {section.current_adviser === 'Not Assigned' ? (
                                                        <span className="text-gray-400 italic">{section.current_adviser}</span>
                                                    ) : (
                                                        section.current_adviser
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Button
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700 text-white"
                                                        onClick={() => handleAssign(section)}
                                                    >
                                                        {section.adviser_id ? 'Update' : 'Assign'}
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                                                No sections found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {sections.data.length > 0 && (
                        <Pagination
                            currentPage={sections.current_page}
                            lastPage={sections.last_page}
                            perPage={sections.per_page}
                            total={sections.total}
                            links={sections.links}
                            onPageChange={handlePageChange}
                            onPerPageChange={setPerPage}
                        />
                    )}
                </div>
            </div>
        </AdminLayout>
    )
}