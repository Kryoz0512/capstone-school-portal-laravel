import { Head, router } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import AddAccreditationModal from '@/components/modals/add-accreditation-modal'
import EditAccreditationModal from '@/components/modals/edit-accreditation-modal'
import DeleteAccreditationModal from '@/components/modals/delete-accreditation-modal'

type Accreditation = {
    id: number
    accreditation_type: string
    accrediting_body: string
    certificate_number: string
    date_issued: string
    valid_from: string
    valid_until: string
    status: string
    description: string | null
    document_path: string | null
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
    accreditations?: Accreditation[]
}

export default function AccreditationPage({ auth, accreditations = [] }: Props) {
    const [searchTerm, setSearchTerm] = useState('')
    const [showAddModal, setShowAddModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedAccreditation, setSelectedAccreditation] = useState<Accreditation | null>(null)

    const filteredAccreditations = accreditations.filter(accreditation =>
        accreditation.accreditation_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        accreditation.accrediting_body.toLowerCase().includes(searchTerm.toLowerCase()) ||
        accreditation.certificate_number.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleEdit = (accreditation: Accreditation) => {
        setSelectedAccreditation(accreditation)
        setShowEditModal(true)
    }

    const handleDelete = (accreditation: Accreditation) => {
        setSelectedAccreditation(accreditation)
        setShowDeleteModal(true)
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active':
                return 'bg-green-100 text-green-800'
            case 'Expired':
                return 'bg-red-100 text-red-800'
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800'
            case 'Suspended':
                return 'bg-gray-100 text-gray-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <AdminLayout user={auth?.user}>
            <Head title="Accreditation" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Accreditation</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Manage school accreditations and certifications
                        </p>
                    </div>
                    <Button
                        onClick={() => setShowAddModal(true)}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Accreditation
                    </Button>
                </div>

                {/* Search */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-sm font-semibold text-gray-900 mb-4">Search</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Search by Type, Body, or Certificate Number
                        </label>
                        <Input
                            type="text"
                            placeholder="Search accreditations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-md"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                        <p className="text-sm text-gray-600">
                            Showing {filteredAccreditations.length} of {accreditations.length} accreditations
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Type</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Accrediting Body</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Certificate No.</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Valid From</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Valid Until</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredAccreditations.length > 0 ? (
                                    filteredAccreditations.map((accreditation) => (
                                        <tr key={accreditation.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-900">{accreditation.accreditation_type}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{accreditation.accrediting_body}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{accreditation.certificate_number}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {new Date(accreditation.valid_from).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {new Date(accreditation.valid_until).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(accreditation.status)}`}>
                                                    {accreditation.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEdit(accreditation)}
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(accreditation)}
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-600" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                                            {accreditations.length === 0
                                                ? 'No accreditations found. Click "Add Accreditation" to create one.'
                                                : 'No accreditations match your search.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <AddAccreditationModal
                open={showAddModal}
                onOpenChange={setShowAddModal}
            />

            <EditAccreditationModal
                open={showEditModal}
                onOpenChange={setShowEditModal}
                accreditation={selectedAccreditation}
            />

            <DeleteAccreditationModal
                open={showDeleteModal}
                onOpenChange={setShowDeleteModal}
                accreditation={selectedAccreditation}
            />
        </AdminLayout>
    )
}
