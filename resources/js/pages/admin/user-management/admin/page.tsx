import { Head } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Button } from '@/components/ui/button'
import AddAdminModal from '@/components/modals/add-admin-modal'
import EditAdminModal from '@/components/modals/edit-admin-modal'
import DeleteAdminModal from '@/components/modals/delete-admin-modal'
import { Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'

type Admin = {
    id: number
    user_id: number
    first_name: string
    last_name: string
    name: string
    email: string
    position: string
    role: 'Admin' | 'Staff'
}

type Props = {
    admins: Admin[]
    auth?: {
        user: {
            id: number
            name: string
            email: string
            role: string
        }
    }
}

export default function AdminManagement({ admins, auth }: Props) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null)

    const totalAdmins = admins.length

    const handleEdit = (admin: Admin) => {
        setSelectedAdmin(admin)
        setIsEditModalOpen(true)
    }

    const handleDelete = (admin: Admin) => {
        setSelectedAdmin(admin)
        setIsDeleteModalOpen(true)
    }

    return (
        <AdminLayout user={auth?.user}>
            <Head title="Admin Management" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Admin Management</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Create and manage admin accounts with role-based access control
                        </p>
                    </div>
                    <Button 
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        + New Admin
                    </Button>
                </div>

                <AddAdminModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
                <EditAdminModal 
                    open={isEditModalOpen} 
                    onOpenChange={setIsEditModalOpen}
                    admin={selectedAdmin}
                />
                <DeleteAdminModal 
                    open={isDeleteModalOpen} 
                    onOpenChange={setIsDeleteModalOpen}
                    admin={selectedAdmin}
                />

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-600 font-medium">Total Admins</p>
                        <p className="text-3xl font-bold text-blue-900 mt-2">{totalAdmins}</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-600 font-medium">Active Accounts</p>
                        <p className="text-3xl font-bold text-green-900 mt-2">{totalAdmins}</p>
                    </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                        <div className="text-blue-600 mt-0.5">ℹ️</div>
                        <div>
                            <p className="text-sm font-medium text-blue-900">Admin Access:</p>
                            <p className="text-sm text-blue-700 mt-2">
                                All admin accounts have full system access including user management, enrollment, registration, scheduling, and reports.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                        <h2 className="text-sm font-semibold text-gray-900">Admin Accounts</h2>
                        <p className="text-sm text-gray-500 mt-1">Total: {totalAdmins} admin(s)</p>
                    </div>

                    <div className="p-4 border-b border-gray-200">
                        <p className="text-sm text-gray-600">
                            Showing 1 to {admins.length} of {admins.length} entries
                        </p>
                    </div>

                    {admins.length === 0 ? (
                        <div className="p-8 text-center">
                            <p className="text-gray-500">No admin accounts found. Click "New Admin" to create one.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Position</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {admins.map((admin) => (
                                        <tr key={admin.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-900">{admin.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{admin.email}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{admin.position}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        className="text-gray-600 hover:text-green-600"
                                                        onClick={() => handleEdit(admin)}
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        className="text-gray-600 hover:text-red-600"
                                                        onClick={() => handleDelete(admin)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    )
}
