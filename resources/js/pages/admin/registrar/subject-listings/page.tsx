import { Head } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Button } from '@/components/ui/button'
import AddSubjectModal from '@/components/modals/add-subject-modal'
import EditSubjectModal from '@/components/modals/edit-subject-modal'
import DeleteSubjectModal from '@/components/modals/delete-subject-modal'
import { Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'

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

type Props = {
    auth?: {
        user: {
            id: number
            name: string
            email: string
            role: string
        }
    }
    subjects: Subject[]
    gradeLevels: GradeLevel[]
}

export default function SubjectListings({ auth, subjects = [], gradeLevels = [] }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)

    const handleEdit = (subject: Subject) => {
        setSelectedSubject(subject)
        setIsEditModalOpen(true)
    }

    const handleDelete = (subject: Subject) => {
        setSelectedSubject(subject)
        setIsDeleteModalOpen(true)
    }

    return (
        <AdminLayout user={auth?.user}>
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
                    <p className="text-sm text-gray-600">
                        Filter by Grade Level
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        Showing {subjects.length} subjects
                    </p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Subject Code</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Subject Name</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Description</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Grade Level</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {subjects.length > 0 ? (
                                    subjects.map((subject) => (
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
                                            No subjects found. Click "+ Add Subject" to add one.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
