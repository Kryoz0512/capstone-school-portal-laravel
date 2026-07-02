import { Head, router } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AddSubjectModal from '@/components/modals/add-subject-modal'
import EditSubjectModal from '@/components/modals/edit-subject-modal'
import DeleteSubjectModal from '@/components/modals/delete-subject-modal'
import { Pagination } from '@/components/pagination'
import { Pencil, Trash2 } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

type Subject = {
    id: number
    code: string
    name: string
    description: string
    grade_level: string
    grade_level_id: number
}

type GradeLevel = {
    id: number
    name: string
}

type PaginationLink = { url: string | null; label: string; active: boolean }

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
    subjects: {
        data: Subject[]
        current_page: number
        last_page: number
        per_page: number
        total: number
        links: PaginationLink[]
    }
    gradeLevels: GradeLevel[]
    uniqueGradeLevels: string[]
    uniqueSubjectNames: string[]
    filters?: { grade_level?: string; subject_name?: string; per_page?: number }
}

export default function SubjectListings({
    auth,
    subjects,
    gradeLevels = [],
    uniqueGradeLevels = [],
    uniqueSubjectNames = [],
    filters = {},
}: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)

    // Filter and pagination state — now driven by the backend instead of a
    // client-side slice of a fully-loaded subjects array.
    const [gradeLevelFilter, setGradeLevelFilter] = useState(filters.grade_level || 'all')
    const [subjectNameFilter, setSubjectNameFilter] = useState(filters.subject_name || 'all')
    const [perPage, setPerPage] = useState(subjects.per_page || 10)

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
            router.get('/admin/registrar/subject-listings', {
                grade_level: gradeLevelFilter !== 'all' ? gradeLevelFilter : undefined,
                subject_name: subjectNameFilter !== 'all' ? subjectNameFilter : undefined,
                per_page: perPage,
            }, { preserveState: true, preserveScroll: true, replace: true })
        }, 300)
        return () => clearTimeout(timer)
    }, [gradeLevelFilter, subjectNameFilter, perPage])

    const handleEdit = (subject: Subject) => {
        setSelectedSubject(subject)
        setIsEditModalOpen(true)
    }

    const handleDelete = (subject: Subject) => {
        setSelectedSubject(subject)
        setIsDeleteModalOpen(true)
    }

    const handlePageChange = (url: string | null) => {
        // preserveState is required here so the component instance (and its
        // isFirstRender ref) survives the navigation instead of remounting,
        // which would otherwise cause the filters effect above to re-fire
        // and silently strip the `page` param, sending the user back to page 1.
        if (url) router.visit(url, { preserveScroll: true, preserveState: true })
    }

    return (
        <AdminLayout user={auth?.user} admin={auth?.admin}>
            <Head title="Subject Listings" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Subject Listings</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Manage school subjects by grade level
                        </p>
                    </div>
                    <Button
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => setIsModalOpen(true)}
                    >
                        + Add Subject
                    </Button>
                </div>

                <AddSubjectModal
                    open={isModalOpen}
                    onOpenChange={setIsModalOpen}
                    gradeLevels={gradeLevels}
                />

                <EditSubjectModal
                    open={isEditModalOpen}
                    onOpenChange={setIsEditModalOpen}
                    subject={selectedSubject}
                    gradeLevels={gradeLevels}
                />

                <DeleteSubjectModal
                    open={isDeleteModalOpen}
                    onOpenChange={setIsDeleteModalOpen}
                    subject={selectedSubject}
                />

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-4">
                            <label className="text-sm font-medium text-gray-700">
                                Subject Name:
                            </label>
                            <Select value={subjectNameFilter} onValueChange={setSubjectNameFilter}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="All Subjects" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Subjects</SelectItem>
                                    {uniqueSubjectNames.map((name) => (
                                        <SelectItem key={name} value={name}>
                                            {name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-4">
                            <label className="text-sm font-medium text-gray-700">
                                Grade Level:
                            </label>
                            <Select value={gradeLevelFilter} onValueChange={setGradeLevelFilter}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="All Grade Levels" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Grade Levels</SelectItem>
                                    {uniqueGradeLevels.map((level) => (
                                        <SelectItem key={level} value={level}>
                                            {level}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-green-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-white">Subject Code</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-white">Subject Name</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-white">Description</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-white">Grade Level</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-white">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {subjects.data.length > 0 ? (
                                    subjects.data.map((subject) => (
                                        <tr key={subject.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-900">{subject.code}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{subject.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{subject.description}</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    {subject.grade_level}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        className="text-gray-600 hover:text-green-600"
                                                        onClick={() => handleEdit(subject)}
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        className="text-gray-600 hover:text-red-600"
                                                        onClick={() => handleDelete(subject)}
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
                                            {gradeLevelFilter !== 'all' || subjectNameFilter !== 'all'
                                                ? 'No subjects found matching your filters.'
                                                : 'No subjects found. Click "+ Add Subject" to add one.'
                                            }
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {subjects.data.length > 0 && (
                        <Pagination
                            currentPage={subjects.current_page}
                            lastPage={subjects.last_page}
                            perPage={subjects.per_page}
                            total={subjects.total}
                            links={subjects.links}
                            onPageChange={handlePageChange}
                            onPerPageChange={setPerPage}
                        />
                    )}
                </div>
            </div>
        </AdminLayout>
    )
}