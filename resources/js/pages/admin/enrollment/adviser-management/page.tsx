import { Head } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import AssignAdviserModal from '@/components/modals/assign-adviser-modal'
import { useState } from 'react'

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
    }
    sections: Section[]
    teachers: Teacher[]
    schoolYear: string
}

export default function AdviserManagement({ auth, sections = [], teachers = [], schoolYear = '' }: Props) {
    const [searchTerm, setSearchTerm] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedSection, setSelectedSection] = useState<Section | null>(null)

    // Fallback for school year if not provided
    const displaySchoolYear = schoolYear || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`

    const filteredSections = sections.filter(section =>
        section.section_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        section.current_adviser.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const totalSections = sections.length
    const assignedAdvisers = sections.filter(s => s.adviser_id !== null).length

    const handleAssign = (section: Section) => {
        setSelectedSection(section)
        setIsModalOpen(true)
    }

    return (
        <AdminLayout user={auth?.user}>
            <Head title="Adviser Assignment" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Adviser Assignment</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Assign and manage section advisers for school year {displaySchoolYear}
                        </p>
                    </div>
                    <Button 
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => {
                            setSelectedSection(null)
                            setIsModalOpen(true)
                        }}
                        disabled={sections.length === 0 || teachers.length === 0}
                    >
                        + Assign Adviser
                    </Button>
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

                {/* Search */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-sm font-semibold text-gray-900 mb-4">Search</h2>
                    <Input
                        type="text"
                        placeholder="Search by section or adviser name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-md"
                    />
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                        <h2 className="text-sm font-semibold text-gray-900">Section Advisers</h2>
                    </div>

                    <div className="p-4 border-b border-gray-200">
                        <p className="text-sm text-gray-600">
                            Showing {filteredSections.length} of {sections.length} sections
                        </p>
                    </div>

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
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Section</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Grade Level</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Current Adviser</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredSections.length > 0 ? (
                                        filteredSections.map((section) => (
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
                                                        className="bg-blue-600 hover:bg-blue-700 text-white"
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
                </div>
            </div>
        </AdminLayout>
    )
}
