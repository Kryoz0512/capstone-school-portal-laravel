import { Head } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Upload,
    Trash2,
    User,
    GraduationCap,
    Users,
    Search,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react'
import { useRef, useState } from 'react'
import axios from 'axios'

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
    students: PersonRow[]
    teachers: PersonRow[]
    staffAdmins: PersonRow[]
}

type PersonRow = {
    id: number
    name: string
    identifier: string
    type: 'student' | 'teacher' | 'staff_admin'
    profile_picture: string | null
    grade_level?: string | null
    section?: string | null
}

type TabKey = 'student' | 'teacher' | 'staff_admin'

const TAB_CONFIG: Record<TabKey, { label: string; icon: typeof GraduationCap; identifierLabel: string; accent: string }> = {
    student: {
        label: 'Student',
        icon: GraduationCap,
        identifierLabel: 'LRN',
        accent: 'blue',
    },
    teacher: {
        label: 'Teacher',
        icon: User,
        identifierLabel: 'Employee No.',
        accent: 'green',
    },
    staff_admin: {
        label: 'Staff & Admin',
        icon: Users,
        identifierLabel: 'Employee No.',
        accent: 'purple',
    },
}

export default function UploadDeletePicturePage({ auth, students, teachers, staffAdmins }: Props) {
    const [activeTab, setActiveTab] = useState<TabKey>('student')
    const [search, setSearch] = useState('')
    const [rows, setRows] = useState<{ student: PersonRow[]; teacher: PersonRow[]; staff_admin: PersonRow[] }>({
        student: students,
        teacher: teachers,
        staff_admin: staffAdmins,
    })
    const [busyId, setBusyId] = useState<number | null>(null)
    const [pendingDelete, setPendingDelete] = useState<PersonRow | null>(null)
    const [pageSize, setPageSize] = useState(10)
    const [page, setPage] = useState(1)

    const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({})

    const filteredRows = rows[activeTab].filter((row) => {
        if (!search.trim()) return true
        const term = search.toLowerCase()
        return (
            row.name.toLowerCase().includes(term) ||
            row.identifier.toLowerCase().includes(term)
        )
    })

    const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize))
    const safePage = Math.min(page, totalPages)
    const currentRows = filteredRows.slice((safePage - 1) * pageSize, safePage * pageSize)
    const rangeStart = filteredRows.length === 0 ? 0 : (safePage - 1) * pageSize + 1
    const rangeEnd = Math.min(safePage * pageSize, filteredRows.length)

    const updateRow = (type: TabKey, id: number, updates: Partial<PersonRow>) => {
        setRows((prev) => ({
            ...prev,
            [type]: prev[type].map((row) => (row.id === id ? { ...row, ...updates } : row)),
        }))
    }

    const handleTabChange = (tab: TabKey) => {
        setActiveTab(tab)
        setSearch('')
        setPage(1)
    }

    const triggerFilePicker = (id: number) => {
        fileInputRefs.current[id]?.click()
    }

    const handleFileChange = async (row: PersonRow, file: File | undefined) => {
        if (!file) return

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file')
            return
        }
        if (file.size > 2 * 1024 * 1024) {
            alert('File size must be less than 2MB')
            return
        }

        setBusyId(row.id)

        try {
            const formData = new FormData()
            formData.append('picture', file)
            formData.append('user_id', row.id.toString())
            formData.append('user_type', row.type)

            const response = await axios.post('/admin/admission/profile-picture/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })

            if (response.data.success) {
                updateRow(row.type, row.id, { profile_picture: response.data.profile_picture })
            }
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to upload profile picture')
        } finally {
            setBusyId(null)
            const input = fileInputRefs.current[row.id]
            if (input) input.value = ''
        }
    }

    const requestDelete = (row: PersonRow) => {
        setPendingDelete(row)
    }

    const confirmDelete = async () => {
        if (!pendingDelete) return
        const row = pendingDelete

        setBusyId(row.id)

        try {
            const response = await axios.delete('/admin/admission/profile-picture/delete', {
                data: { user_id: row.id, user_type: row.type },
            })

            if (response.data.success) {
                updateRow(row.type, row.id, { profile_picture: null })
            }
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to delete profile picture')
        } finally {
            setBusyId(null)
            setPendingDelete(null)
        }
    }

    return (
        <AdminLayout user={auth?.user} admin={auth?.admin}>
            <Head title="Upload or Delete Picture" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Upload or Delete Picture</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage profile pictures for students, teachers, and staff
                    </p>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg border border-gray-200">
                    <div className="flex border-b border-gray-200">
                        {(Object.keys(TAB_CONFIG) as TabKey[]).map((tab) => {
                            const config = TAB_CONFIG[tab]
                            const Icon = config.icon
                            const isActive = activeTab === tab
                            return (
                                <button
                                    key={tab}
                                    onClick={() => handleTabChange(tab)}
                                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                                        isActive
                                            ? tab === 'student'
                                                ? 'border-blue-600 text-blue-600'
                                                : tab === 'teacher'
                                                ? 'border-green-600 text-green-600'
                                                : 'border-purple-600 text-purple-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {config.label}
                                    <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">
                                        {rows[tab].length}
                                    </span>
                                </button>
                            )
                        })}
                    </div>

                    <div className="p-6 space-y-4">
                        {/* Search */}
                        <div className="relative max-w-sm">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <Input
                                type="text"
                                placeholder={`Search by name or ${TAB_CONFIG[activeTab].identifierLabel}`}
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value)
                                    setPage(1)
                                }}
                                className="pl-9"
                            />
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto border border-gray-200 rounded-lg">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left font-medium text-gray-600 px-4 py-3 w-20">Photo</th>
                                        <th className="text-left font-medium text-gray-600 px-4 py-3">Name</th>
                                        <th className="text-left font-medium text-gray-600 px-4 py-3">
                                            {TAB_CONFIG[activeTab].identifierLabel}
                                        </th>
                                        {activeTab === 'student' && (
                                            <>
                                                <th className="text-left font-medium text-gray-600 px-4 py-3">Grade Level</th>
                                                <th className="text-left font-medium text-gray-600 px-4 py-3">Section</th>
                                            </>
                                        )}
                                        <th className="text-right font-medium text-gray-600 px-4 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {currentRows.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={activeTab === 'student' ? 6 : 4}
                                                className="px-4 py-10 text-center text-gray-500"
                                            >
                                                {search ? 'No matching records found.' : 'No records found.'}
                                            </td>
                                        </tr>
                                    )}
                                    {currentRows.map((row) => (
                                        <tr key={row.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                                                    {row.profile_picture ? (
                                                        <img
                                                            src={row.profile_picture}
                                                            alt={row.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <User className="w-5 h-5 text-gray-400" />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 font-medium text-gray-900">{row.name}</td>
                                            <td className="px-4 py-3 text-gray-600">{row.identifier}</td>
                                            {activeTab === 'student' && (
                                                <>
                                                    <td className="px-4 py-3 text-gray-600">{row.grade_level || 'N/A'}</td>
                                                    <td className="px-4 py-3 text-gray-600">{row.section || 'N/A'}</td>
                                                </>
                                            )}
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2">
                                                    <input
                                                        ref={(el) => {
                                                            fileInputRefs.current[row.id] = el
                                                        }}
                                                        type="file"
                                                        accept="image/jpeg,image/jpg,image/png,image/gif"
                                                        className="hidden"
                                                        onChange={(e) => handleFileChange(row, e.target.files?.[0])}
                                                    />
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="border-green-600 text-green-700 hover:bg-green-50"
                                                        disabled={busyId === row.id}
                                                        onClick={() => triggerFilePicker(row.id)}
                                                    >
                                                        <Upload className="w-3.5 h-3.5 mr-1.5" />
                                                        {busyId === row.id ? 'Uploading...' : row.profile_picture ? 'Replace' : 'Upload'}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="border-red-600 text-red-600 hover:bg-red-50"
                                                        disabled={busyId === row.id || !row.profile_picture}
                                                        onClick={() => requestDelete(row)}
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                                                        Delete
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span>Show</span>
                                <Select
                                    value={pageSize.toString()}
                                    onValueChange={(value) => {
                                        setPageSize(Number(value))
                                        setPage(1)
                                    }}
                                >
                                    <SelectTrigger className="w-20 h-8">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                        <SelectItem value="75">75</SelectItem>
                                        <SelectItem value="100">100</SelectItem>
                                    </SelectContent>
                                </Select>
                                <span>entries</span>
                            </div>

                            <div className="flex items-center gap-4 sm:ml-auto">
                                <span className="text-sm text-gray-500">
                                    {filteredRows.length === 0
                                        ? 'No entries'
                                        : `Showing ${rangeStart}-${rangeEnd} of ${filteredRows.length}`}
                                </span>
                                <div className="flex items-center gap-1">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 w-8 p-0"
                                        disabled={safePage <= 1}
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    <span className="text-sm text-gray-600 px-2 min-w-[5.5rem] text-center">
                                        Page {safePage} of {totalPages}
                                    </span>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 w-8 p-0"
                                        disabled={safePage >= totalPages}
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete confirmation modal */}
            <Dialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center justify-center mb-2">
                            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                        <DialogTitle className="text-center">Delete Profile Picture</DialogTitle>
                        <DialogDescription className="text-center">
                            Remove the profile picture for <strong>{pendingDelete?.name}</strong>? This action
                            cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setPendingDelete(null)}
                            disabled={busyId === pendingDelete?.id}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={confirmDelete}
                            disabled={busyId === pendingDelete?.id}
                        >
                            {busyId === pendingDelete?.id ? 'Deleting...' : 'Delete Picture'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    )
}