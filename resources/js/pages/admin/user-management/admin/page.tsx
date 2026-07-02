import { Head, router } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AddAdminModal from '@/components/modals/add-admin-modal'
import EditAdminModal from '@/components/modals/edit-admin-modal'
import DeleteAdminModal from '@/components/modals/delete-admin-modal'
import { Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

type Admin = {
    id: number
    user_id: number
    employee_number: string
    first_name: string
    last_name: string
    name: string
    email: string
    position: string
    role: 'Admin' | 'Staff'
    can_add_teacher: boolean
    updated_by: string | null
    updated_at: string | null
}

type PaginatedAdmins = {
    data: Admin[]
    current_page: number
    last_page: number
    per_page: number
    total: number
    from: number | null
    to: number | null
}

type Props = {
    admins: PaginatedAdmins
    totalAdmins: number
    filters: { per_page: number }
    auth?: {
        user: { id: number; name: string; email: string; role: string }
        admin?: { role: string; position: string }
    }
}

export default function AdminManagement({ admins, totalAdmins, filters, auth }: Props) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null)
    const [itemsPerPage, setItemsPerPage] = useState(filters.per_page)

    const goToPage = (page: number, perPage = itemsPerPage) => {
        router.get(
            window.location.pathname,
            { per_page: perPage, page },
            { preserveState: true, preserveScroll: true, replace: true }
        )
    }

    const handlePerPageChange = (value: string) => {
        const newPerPage = Number(value)
        setItemsPerPage(newPerPage)
        goToPage(1, newPerPage)
    }

    const handleEdit = (admin: Admin) => {
        setSelectedAdmin(admin)
        setIsEditModalOpen(true)
    }

    const handleDelete = (admin: Admin) => {
        setSelectedAdmin(admin)
        setIsDeleteModalOpen(true)
    }

    const { data: adminRows, current_page: currentPage, last_page: totalPages, from, to } = admins

    return (
        <AdminLayout user={auth?.user} admin={auth?.admin}>
            <Head title="Admin Management" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Admin Management</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Create and manage admin accounts with role-based access control
                        </p>
                    </div>
                    <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => setIsAddModalOpen(true)}>
                        + New Admin
                    </Button>
                </div>

                <AddAdminModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
                <EditAdminModal open={isEditModalOpen} onOpenChange={setIsEditModalOpen} admin={selectedAdmin} />
                <DeleteAdminModal open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen} admin={selectedAdmin} />

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
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-green-700">
                                <tr>
                                    <th className="px-6 py-5 text-left text-sm font-bold text-white uppercase tracking-wider">Employee Number</th>
                                    <th className="px-6 py-5 text-left text-sm font-bold text-white uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-5 text-left text-sm font-bold text-white uppercase tracking-wider">Username</th>
                                    <th className="px-6 py-5 text-left text-sm font-bold text-white uppercase tracking-wider">Position</th>
                                    <th className="px-6 py-5 text-center text-sm font-bold text-white uppercase tracking-wider">Can Add Teacher</th>
                                    <th className="px-6 py-5 text-left text-sm font-bold text-white uppercase tracking-wider">Last Updated</th>
                                    <th className="px-6 py-5 text-center text-sm font-bold text-white uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {adminRows.length > 0 ? (
                                    adminRows.map((admin) => (
                                        <tr key={admin.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-mono text-gray-900">{admin.employee_number}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{admin.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{admin.email}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{admin.position}</td>
                                            <td className="px-6 py-4 text-center">
                                                {admin.role === 'Super Admin' ? (
                                                    <span className="text-xs text-gray-400">N/A</span>
                                                ) : (
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            admin.can_add_teacher ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                        }`}
                                                    >
                                                        {admin.can_add_teacher ? 'Yes' : 'No'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {admin.updated_by && admin.updated_at ? (
                                                    <div>
                                                        <div className="text-xs">By: {admin.updated_by}</div>
                                                        <div className="text-xs text-gray-500">{admin.updated_at}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button className="text-gray-600 hover:text-green-600" onClick={() => handleEdit(admin)}>
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button className="text-gray-600 hover:text-red-600" onClick={() => handleDelete(admin)}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                                            No admin accounts found. Click "+ New Admin" to add one.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalAdmins > 0 && (
                        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Show</span>
                                <Select value={itemsPerPage.toString()} onValueChange={handlePerPageChange}>
                                    <SelectTrigger className="w-20">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="25">25</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                        <SelectItem value="100">100</SelectItem>
                                    </SelectContent>
                                </Select>
                                <span className="text-sm text-gray-600">entries</span>
                                <p className="text-sm text-gray-600 ml-2">
                                    Showing {from ?? 0} to {to ?? 0} of {totalAdmins} entries
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => goToPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>

                                <div className="flex items-center gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                        if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                                            return (
                                                <Button
                                                    key={page}
                                                    variant={currentPage === page ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => goToPage(page)}
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
                                    onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
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