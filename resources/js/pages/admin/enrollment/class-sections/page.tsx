import { Head } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Button } from '@/components/ui/button'
import CreateSectionModal from '@/components/modals/create-section-modal'
import EditSectionModal from '@/components/modals/edit-section-modal'
import DeleteSectionModal from '@/components/modals/delete-section-modal'
import { Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'

type Section = {
    id: number
    section_name: string
    grade_level_id: number
    grade_level: string
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
    sections: Section[]
    gradeLevels: GradeLevel[]
}

export default function ClassSections({ auth, sections = [], gradeLevels = [] }: Props) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [selectedSection, setSelectedSection] = useState<Section | null>(null)

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
                />

                <EditSectionModal 
                    open={isEditModalOpen} 
                    onOpenChange={setIsEditModalOpen}
                    section={selectedSection}
                    gradeLevels={gradeLevels}
                />

                <DeleteSectionModal 
                    open={isDeleteModalOpen} 
                    onOpenChange={setIsDeleteModalOpen}
                    section={selectedSection}
                />

                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                        <h2 className="text-sm font-semibold text-gray-900">Sections</h2>
                    </div>

                    <div className="p-4 border-b border-gray-200">
                        <p className="text-sm text-gray-600">
                            Showing 1 to {sections.length} of {sections.length} entries
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                                        Section Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                                        Grade Level
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {sections.length > 0 ? (
                                    sections.map((section) => (
                                        <tr key={section.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {section.section_name}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {section.grade_level}
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
                                            No sections found. Click "+ Create Section" to add one.
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
