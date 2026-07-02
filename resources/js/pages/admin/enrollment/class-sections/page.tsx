import { Head, router } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import CreateSectionModal from '@/components/modals/create-section-modal'
import EditSectionModal from '@/components/modals/edit-section-modal'
import DeleteSectionModal from '@/components/modals/delete-section-modal'
import { Pagination } from '@/components/pagination'
import { Pencil, Trash2, Search } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

type Section = {
    id: number
    section_name: string
    grade_level_id: number
    grade_level: string
    room_id: number | null
    room: string | null
}

type GradeLevel = { id: number; name: string }
type Room = { id: number; room_name: string; capacity: number }
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
    gradeLevels: GradeLevel[]
    rooms: Room[]
    filters?: { search?: string; grade_level?: string }
}

export default function ClassSections({ auth, sections, gradeLevels = [], rooms = [], filters = {} }: Props) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [selectedSection, setSelectedSection] = useState<Section | null>(null)

    const [searchQuery, setSearchQuery] = useState(filters.search || '')
    const [gradeLevelFilter, setGradeLevelFilter] = useState(filters.grade_level || 'all')
    const [perPage, setPerPage] = useState(sections.per_page || 10)

    // Guards the search/filter effect below from firing on mount (including
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
            router.get('/admin/enrollment/class-sections', {
                search: searchQuery || undefined,
                grade_level: gradeLevelFilter !== 'all' ? gradeLevelFilter : undefined,
                per_page: perPage,
            }, { preserveState: true, preserveScroll: true, replace: true })
        }, 300)
        return () => clearTimeout(timer)
    }, [searchQuery, gradeLevelFilter, perPage])

    const handleEdit = (section: Section) => {
        setSelectedSection(section)
        setIsEditModalOpen(true)
    }

    const handleDelete = (section: Section) => {
        setSelectedSection(section)
        setIsDeleteModalOpen(true)
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
            <Head title="Class Sections" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Class Sections</h1>
                        <p className="text-sm text-gray-500 mt-1">Create and manage class sections</p>
                    </div>
                    <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => setIsCreateModalOpen(true)}>
                        + Create Section
                    </Button>
                </div>

                <CreateSectionModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} gradeLevels={gradeLevels} rooms={rooms} />
                <EditSectionModal open={isEditModalOpen} onOpenChange={setIsEditModalOpen} section={selectedSection} gradeLevels={gradeLevels} rooms={rooms} />
                <DeleteSectionModal open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen} section={selectedSection} />

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                type="text"
                                placeholder="Search by section name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={gradeLevelFilter} onValueChange={setGradeLevelFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by Grade Level" />
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
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-green-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Grade Level</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Section Name</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Assigned Room</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {sections.data.length > 0 ? (
                                    sections.data.map((section) => (
                                        <tr key={section.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-900">{section.grade_level}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{section.section_name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {section.room ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {section.room}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 italic">No room assigned</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button className="text-gray-600 hover:text-green-600" onClick={() => handleEdit(section)}>
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button className="text-gray-600 hover:text-red-600" onClick={() => handleDelete(section)}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                                            {searchQuery || gradeLevelFilter !== 'all'
                                                ? 'No sections found matching your filters.'
                                                : 'No sections found. Click "+ Create Section" to add one.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

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