import { Head } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AddAdminModal from '@/components/modals/add-admin-modal'
import EditAdminModal from '@/components/modals/edit-admin-modal'
import DeleteAdminModal from '@/components/modals/delete-admin-modal'
import { Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useMemo } from 'react'

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
    updated_by: string | null
    updated_at: string | null
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
        admin?: {
            role: string
            position: string
        }
    }
}

export default function AdminManagement({ admins, auth }: Props) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null)
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)

    const totalAdmins = admins.length

    // Paginate admins
    const paginatedAdmins = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        return admins.slice(startIndex, endIndex)
    }, [admins, currentPage, itemsPerPage])

    const totalPages = Math.ceil(admins.length / itemsPerPage)

    // Reset to page 1 when itemsPerPage changes
    useMemo(() => {
        setCurrentPage(1)
    }, [itemsPerPage])

    const handleEdit = (admin: Admin) => {
        setSelectedAdmin(admin)
        setIsEditModalOpen(true)
    }

    const handleDelete = (admin: Admin) => {
        setSelectedAdmin(admin)
        setIsDeleteModalOpen(true)
    }

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
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-green-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Employee Number</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Username</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Position</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Last Updated</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {paginatedAdmins.length > 0 ? (
                                    paginatedAdmins.map((admin) => (
                                        <tr key={admin.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-mono text-gray-900">{admin.employee_number}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{admin.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{admin.email}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{admin.position}</td>
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
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                                            No admin accounts found. Click "+ New Admin" to add one.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {admins.length > 0 && (
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
                                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalAdmins)} of {totalAdmins} entries
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
