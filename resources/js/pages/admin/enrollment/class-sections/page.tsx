import { Head } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import CreateSectionModal from '@/components/modals/create-section-modal'
import EditSectionModal from '@/components/modals/edit-section-modal'
import DeleteSectionModal from '@/components/modals/delete-section-modal'
import { Pencil, Trash2, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { useState, useMemo } from 'react'

type Section = {
    id: number
    section_name: string
    grade_level_id: number
    grade_level: string
    room_id: number | null
    room: string | null
}

type GradeLevel = {
    id: number
    name: string
}

type Room = {
    id: number
    room_number: string
    capacity: number
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
    sections: Section[]
    gradeLevels: GradeLevel[]
    rooms: Room[]
}

export default function ClassSections({ auth, sections = [], gradeLevels = [], rooms = [] }: Props) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [selectedSection, setSelectedSection] = useState<Section | null>(null)
    
    // Filter states
    const [searchQuery, setSearchQuery] = useState('')
    const [gradeLevelFilter, setGradeLevelFilter] = useState('all')
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)

    // Filter sections
    const filteredSections = useMemo(() => {
        return sections.filter(section => {
            const matchesSearch = section.section_name.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesGradeLevel = gradeLevelFilter === 'all' || section.grade_level_id.toString() === gradeLevelFilter
            return matchesSearch && matchesGradeLevel
        })
    }, [sections, searchQuery, gradeLevelFilter])

    // Paginate filtered sections
    const paginatedSections = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        return filteredSections.slice(startIndex, endIndex)
    }, [filteredSections, currentPage, itemsPerPage])

    const totalPages = Math.ceil(filteredSections.length / itemsPerPage)

    // Reset to page 1 when filters or itemsPerPage change
    useMemo(() => {
        setCurrentPage(1)
    }, [itemsPerPage, searchQuery, gradeLevelFilter])

    const handleEdit = (section: Section) => {
        setSelectedSection(section)
        setIsEditModalOpen(true)
    }

    const handleDelete = (section: Section) => {
        setSelectedSection(section)
        setIsDeleteModalOpen(true)
    }

    return (
        <AdminLayout user={auth?.user}>
            <Head title="Class Sections" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Class Sections</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Create and manage class sections
                        </p>
                    </div>
                    <Button 
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        + Create Section
                    </Button>
                </div>

                <CreateSectionModal 
                    open={isCreateModalOpen} 
                    onOpenChange={setIsCreateModalOpen}
                    gradeLevels={gradeLevels}
                    rooms={rooms}
                />

                <EditSectionModal 
                    open={isEditModalOpen} 
                    onOpenChange={setIsEditModalOpen}
                    section={selectedSection}
                    gradeLevels={gradeLevels}
                    rooms={rooms}
                />

                <DeleteSectionModal 
                    open={isDeleteModalOpen} 
                    onOpenChange={setIsDeleteModalOpen}
                    section={selectedSection}
                />

                {/* Filters */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Search */}
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

                        {/* Grade Level Filter */}
                        <Select value={gradeLevelFilter} onValueChange={setGradeLevelFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by Grade Level" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Grade Levels</SelectItem>
                                {gradeLevels.map((level) => (
                                    <SelectItem key={level.id} value={level.id.toString()}>
                                        {level.name}
                                    </SelectItem>
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
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                                        Grade Level
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                                        Section Name
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                                        Assigned Room
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {paginatedSections.length > 0 ? (
                                    paginatedSections.map((section) => (
                                        <tr key={section.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {section.grade_level}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {section.section_name}
                                            </td>
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
                                                    <button 
                                                        className="text-gray-600 hover:text-green-600"
                                                        onClick={() => handleEdit(section)}
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        className="text-gray-600 hover:text-red-600"
                                                        onClick={() => handleDelete(section)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-500">
                                            {searchQuery || gradeLevelFilter !== 'all' 
                                                ? 'No sections found matching your filters.' 
                                                : 'No sections found. Click "+ Create Section" to add one.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {filteredSections.length > 0 && (
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
                                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredSections.length)} of {filteredSections.length} entries
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
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                        // Show first page, last page, current page, and pages around current
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
                </div>
            </div>
        </AdminLayout>
    )
}
