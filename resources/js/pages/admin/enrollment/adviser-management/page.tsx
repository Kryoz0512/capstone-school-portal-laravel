import { Head } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AssignAdviserModal from '@/components/modals/assign-adviser-modal'
import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type Section = {
    id: number
    section_name: string
    grade_level: string
    grade_level_id: number
    current_adviser: string
    adviser_id: number | null
    adviser_section_id: number | null
}

type Teacher = {
    id: number
    name: string
    is_assigned: boolean
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
    sections: Section[]
    teachers: Teacher[]
    schoolYear: string
}

export default function AdviserManagement({ auth, sections = [], teachers = [], schoolYear = '' }: Props) {
    const [searchTerm, setSearchTerm] = useState('')
    const [gradeLevelFilter, setGradeLevelFilter] = useState<string>('all')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedSection, setSelectedSection] = useState<Section | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)

    // Fallback for school year if not provided
    const displaySchoolYear = schoolYear || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`

    // Get unique grade levels for filter
    const gradeLevels = useMemo(() => {
        const levels = Array.from(new Set(sections.map(s => s.grade_level)))
        return levels.sort()
    }, [sections])

    // Filter sections
    const filteredSections = useMemo(() => {
        return sections.filter(section => {
            const matchesSearch = 
                section.section_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                section.current_adviser.toLowerCase().includes(searchTerm.toLowerCase())
            
            const matchesGradeLevel = gradeLevelFilter === 'all' || section.grade_level === gradeLevelFilter
            
            return matchesSearch && matchesGradeLevel
        })
    }, [sections, searchTerm, gradeLevelFilter])

    // Pagination
    const totalPages = Math.ceil(filteredSections.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedSections = filteredSections.slice(startIndex, endIndex)

    // Reset to page 1 when filters change
    useMemo(() => {
        setCurrentPage(1)
    }, [searchTerm, gradeLevelFilter, itemsPerPage])

    const totalSections = sections.length
    const assignedAdvisers = sections.filter(s => s.adviser_id !== null).length

    const handleAssign = (section: Section) => {
        setSelectedSection(section)
        setIsModalOpen(true)
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
                    sections={sections}
                    schoolYear={displaySchoolYear}
                />

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-600 font-medium">Total Sections</p>
                        <p className="text-3xl font-bold text-blue-900 mt-2">{totalSections}</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-600 font-medium">Assigned Advisers</p>
                        <p className="text-3xl font-bold text-green-900 mt-2">{assignedAdvisers}</p>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <p className="text-sm text-purple-600 font-medium">Unassigned Sections</p>
                        <p className="text-3xl font-bold text-purple-900 mt-2">{totalSections - assignedAdvisers}</p>
                    </div>
                </div>

                {/* Search and Filters */}
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
                                    <SelectItem key={level} value={level}>
                                        {level}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    {sections.length === 0 ? (
                        <div className="p-8 text-center">
                            <p className="text-lg font-medium text-gray-900 mb-2">No Data Found</p>
                            <p className="text-sm text-gray-500">
                                No sections available. Please create class sections first.
                            </p>
                        </div>
                    ) : teachers.length === 0 ? (
                        <div className="p-8 text-center">
                            <p className="text-lg font-medium text-gray-900 mb-2">No Teachers Available</p>
                            <p className="text-sm text-gray-500">
                                Please create teachers first before assigning advisers.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-green-700">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Section</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Grade Level</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Current Adviser</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {paginatedSections.length > 0 ? (
                                        paginatedSections.map((section) => (
                                            <tr key={section.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm text-gray-900">{section.section_name}</td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {section.grade_level}
                                                    </span>
                                                </td>
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
                </div>
            </div>
        </AdminLayout>
    )
}
