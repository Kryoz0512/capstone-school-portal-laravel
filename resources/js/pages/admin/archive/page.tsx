import { Head, router } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RotateCcw, Trash2, Archive as ArchiveIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useMemo } from 'react'

type ArchiveItem = {
    id: number
    type: string
    name: string
    email: string
    archived_by: string
    archived_at: string
    reason: string | null
    data: any
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
    archives: ArchiveItem[]
    currentType: string
}

export default function ArchivePage({ auth, archives = [], currentType = 'all' }: Props) {
    const [typeFilter, setTypeFilter] = useState(currentType)
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)

    const handleTypeChange = (value: string) => {
        setTypeFilter(value)
        router.get(route('admin.archive'), { type: value }, { preserveState: true })
    }

    // Filter archives
    const filteredArchives = useMemo(() => {
        if (typeFilter === 'all') {
            return archives
        }
        return archives.filter(archive => {
            const archiveType = `App\\Models\\${archive.type}`
            return archiveType === typeFilter
        })
    }, [archives, typeFilter])

    // Paginate filtered archives
    const paginatedArchives = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        return filteredArchives.slice(startIndex, endIndex)
    }, [filteredArchives, currentPage, itemsPerPage])

    const totalPages = Math.ceil(filteredArchives.length / itemsPerPage)

    // Reset to page 1 when filters change
    useMemo(() => {
        setCurrentPage(1)
    }, [typeFilter, itemsPerPage])

    const handleRestore = (id: number) => {
        if (confirm('Are you sure you want to restore this record?')) {
            router.post(route('admin.archive.restore', id))
        }
    }

    const handlePermanentDelete = (id: number) => {
        if (confirm('Are you sure you want to permanently delete this record? This action cannot be undone.')) {
            router.delete(route('admin.archive.destroy', id))
        }
    }

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Teacher':
                return 'bg-blue-100 text-blue-800'
            case 'Admin':
                return 'bg-purple-100 text-purple-800'
            case 'Student':
                return 'bg-green-100 text-green-800'
            case 'Subject':
                return 'bg-orange-100 text-orange-800'
            case 'Room':
                return 'bg-cyan-100 text-cyan-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <AdminLayout user={auth?.user}>
            <Head title="Archive" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Archive</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            View and restore deleted records
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <ArchiveIcon className="w-5 h-5 text-gray-600" />
                        <span className="text-sm font-medium text-gray-600">
                            {filteredArchives.length} archived item(s)
                        </span>
                    </div>
                </div>

                {/* Filter */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center gap-4">
                        <label className="text-sm font-medium text-gray-700">
                            Filter by Type:
                        </label>
                        <Select value={typeFilter} onValueChange={handleTypeChange}>
                            <SelectTrigger className="w-48">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="App\Models\Teacher">Teachers</SelectItem>
                                <SelectItem value="App\Models\Admin">Admins</SelectItem>
                                <SelectItem value="App\Models\Student">Students</SelectItem>
                                <SelectItem value="App\Models\Subject">Subjects</SelectItem>
                                <SelectItem value="App\Models\Room">Rooms</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-green-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-white">Type</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Deleted Item</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Archived By</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Archived At</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {paginatedArchives.length > 0 ? (
                                    paginatedArchives.map((archive) => (
                                        <tr key={archive.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(archive.type)}`}>
                                                    {archive.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{archive.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{archive.archived_by}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{archive.archived_at}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        className="text-gray-600 hover:text-green-600"
                                                        onClick={() => handleRestore(archive.id)}
                                                        title="Restore"
                                                    >
                                                        <RotateCcw className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        className="text-gray-600 hover:text-red-600"
                                                        onClick={() => handlePermanentDelete(archive.id)}
                                                        title="Permanently Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                                            No archived records found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {filteredArchives.length > 0 && (
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
                                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredArchives.length)} of {filteredArchives.length} entries
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
