import { Head, router, useForm } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronRight, ChevronLeft, Search, Upload, Trash2, Image, X } from 'lucide-react'
import { useState, useMemo, useRef } from 'react'

type Teacher = {
    id: number
    name: string
    employee_number: string
    subject: string
    position: string
    schedules_count: number
}

type SchedulePicture = {
    id: number
    url: string
    label: string | null
    file_name: string
    uploaded_by: string | null
    uploaded_at: string
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
    teachers: Teacher[]
    schedulePictures: SchedulePicture[]
}

export default function LoadScheduling({ auth, teachers = [], schedulePictures = [] }: Props) {
    const [searchQuery, setSearchQuery] = useState('')
    const [specializationFilter, setSpecializationFilter] = useState('all')
    const [positionFilter, setPositionFilter] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [showUploadPanel, setShowUploadPanel] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const { data, setData, post, processing, reset, errors } = useForm<{
        schedule_picture: File | null
        label: string
    }>({
        schedule_picture: null,
        label: '',
    })

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

    useMemo(() => {
        setCurrentPage(1)
    }, [searchQuery, specializationFilter, positionFilter, itemsPerPage])

    const handleTeacherClick = (teacherId: number) => {
        router.visit(`/admin/enrollment/load-scheduling/${teacherId}`)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setData('schedule_picture', file)
        const reader = new FileReader()
        reader.onloadend = () => setPreviewUrl(reader.result as string)
        reader.readAsDataURL(file)
    }

    const handleUploadSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const formData = new FormData()
        if (data.schedule_picture) formData.append('schedule_picture', data.schedule_picture)
        formData.append('label', data.label)

        post('/admin/enrollment/schedule-pictures', {
            forceFormData: true,
            onSuccess: () => {
                reset()
                setPreviewUrl(null)
                if (fileInputRef.current) fileInputRef.current.value = ''
                setShowUploadPanel(false)
            },
        })
    }

    const handleDelete = (pictureId: number) => {
        if (!confirm('Are you sure you want to delete this schedule picture?')) return
        router.delete(`/admin/enrollment/schedule-pictures/${pictureId}`, {
            preserveScroll: true,
        })
    }

    const clearPreview = () => {
        setData('schedule_picture', null)
        setPreviewUrl(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    return (
        <AdminLayout user={auth?.user} admin={auth?.admin}>
            <Head title="Load Scheduling" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Load Scheduling</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Select a teacher to view and manage their class schedules
                        </p>
                    </div>
                    {/* Upload Schedule Picture button */}
                    <Button
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => setShowUploadPanel(prev => !prev)}
                    >
                        <Image className="w-4 h-4 mr-2" />
                        {showUploadPanel ? 'Hide Upload Panel' : 'Upload Schedule Picture'}
                    </Button>
                </div>

                {/* ── Schedule Picture Upload Panel ── */}
                {showUploadPanel && (
                    <div className="bg-white rounded-lg border border-green-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-white border-b border-green-200 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Image className="w-5 h-5 text-green-600" />
                                <h2 className="text-lg font-semibold text-gray-900">Schedule Pictures</h2>
                            </div>
                            <button onClick={() => setShowUploadPanel(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Upload Form */}
                            <form onSubmit={handleUploadSubmit} className="space-y-4">
                                <p className="text-sm text-gray-600">
                                    Upload a schedule picture that all teachers will be able to view on their Schedule page under the <strong>Photo</strong> tab.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                                    {/* File picker */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Picture <span className="text-red-500">*</span>
                                        </label>
                                        <div
                                            className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-green-400 transition-colors"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            {previewUrl ? (
                                                <div className="relative">
                                                    <img
                                                        src={previewUrl}
                                                        alt="Preview"
                                                        className="max-h-48 mx-auto rounded object-contain"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={e => { e.stopPropagation(); clearPreview() }}
                                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="py-4">
                                                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                    <p className="text-sm text-gray-500">Click to select image</p>
                                                    <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP · max 5 MB</p>
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png,image/webp"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                        {errors.schedule_picture && (
                                            <p className="text-xs text-red-500 mt-1">{errors.schedule_picture}</p>
                                        )}
                                    </div>

                                    {/* Label */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Label <span className="text-gray-400">(optional)</span>
                                            </label>
                                            <Input
                                                value={data.label}
                                                onChange={e => setData('label', e.target.value)}
                                                placeholder="e.g. SY 2025-2026 Schedule"
                                                className="h-11"
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full bg-green-600 hover:bg-green-700 text-white h-11"
                                            disabled={processing || !data.schedule_picture}
                                        >
                                            {processing ? (
                                                <>
                                                    <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                    </svg>
                                                    Uploading...
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="w-4 h-4 mr-2" />
                                                    Upload Picture
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </form>

                            {/* Existing Pictures */}
                            {schedulePictures.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                                        Uploaded Pictures ({schedulePictures.length})
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {schedulePictures.map(pic => (
                                            <div
                                                key={pic.id}
                                                className="border border-gray-200 rounded-lg overflow-hidden group relative"
                                            >
                                                <img
                                                    src={pic.url}
                                                    alt={pic.label ?? pic.file_name}
                                                    className="w-full h-40 object-cover"
                                                />
                                                <div className="p-2 bg-white">
                                                    <p className="text-xs font-medium text-gray-800 truncate">
                                                        {pic.label || pic.file_name}
                                                    </p>
                                                    <p className="text-xs text-gray-400">{pic.uploaded_at}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleDelete(pic.id)}
                                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {schedulePictures.length === 0 && (
                                <p className="text-sm text-gray-400 text-center py-4">
                                    No schedule pictures uploaded yet.
                                </p>
                            )}
                        </div>
                    </div>
                )}

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
                                                            variant={currentPage === page ? 'default' : 'outline'}
                                                            size="sm"
                                                            onClick={() => setCurrentPage(page)}
                                                            className={currentPage === page ? 'bg-green-600 hover:bg-green-700' : ''}
                                                        >
                                                            {page}
                                                        </Button>
                                                    )
                                                } else if (page === currentPage - 2 || page === currentPage + 2) {
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