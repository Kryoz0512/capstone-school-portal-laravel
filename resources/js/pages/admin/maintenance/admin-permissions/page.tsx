import { Head, router } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, ShieldOff, User } from 'lucide-react'
import ConfirmDialog from '@/components/modals/confirm-dialog'
import { useState } from 'react'

type Admin = {
    id: number
    user_id: number
    name: string
    email: string
    role: string
    position: string
    can_add_teacher: boolean
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
    admins: Admin[]
}

export default function AdminPermissions({ auth, admins }: Props) {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null)

    const handleToggleClick = (admin: Admin) => {
        setSelectedAdmin(admin)
        setIsConfirmOpen(true)
    }

    const handleConfirmToggle = () => {
        if (selectedAdmin) {
            router.post(`/admin/maintenance/admin-permissions/${selectedAdmin.id}/toggle`, {}, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedAdmin(null)
                }
            })
        }
    }

    return (
        <AdminLayout user={auth?.user} admin={auth?.admin}>
            <Head title="Admin Permissions" />
            
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Admin Permissions</h1>
                    <p className="text-gray-500 mt-2">
                        Manage which administrators can add new teachers to the system
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Teacher Creation Permissions</CardTitle>
                        <CardDescription>
                            Toggle the ability for specific admins to create new teacher accounts
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {admins.map((admin) => (
                                <div
                                    key={admin.id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                            <User className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{admin.name}</h3>
                                            <p className="text-sm text-gray-500">{admin.email}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                                                    {admin.role}
                                                </span>
                                                {admin.position && (
                                                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                                        {admin.position}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            {admin.can_add_teacher ? (
                                                <div className="flex items-center gap-2 text-green-600">
                                                    <Shield className="w-5 h-5" />
                                                    <span className="text-sm font-medium">Can Add Teachers</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-red-600">
                                                    <ShieldOff className="w-5 h-5" />
                                                    <span className="text-sm font-medium">Cannot Add Teachers</span>
                                                </div>
                                            )}
                                        </div>

                                        {admin.role !== 'Super Admin' && (
                                            <Button
                                                onClick={() => handleToggleClick(admin)}
                                                variant={admin.can_add_teacher ? 'destructive' : 'default'}
                                                size="sm"
                                            >
                                                {admin.can_add_teacher ? 'Disable' : 'Enable'}
                                            </Button>
                                        )}

                                        {admin.role === 'Super Admin' && (
                                            <span className="text-xs text-gray-400 px-3 py-2 bg-gray-100 rounded">
                                                Protected
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {admins.length === 0 && (
                                <div className="text-center py-12 text-gray-500">
                                    <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No administrators found</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <ConfirmDialog
                    open={isConfirmOpen}
                    onOpenChange={setIsConfirmOpen}
                    title={selectedAdmin?.can_add_teacher ? 'Disable Teacher Creation' : 'Enable Teacher Creation'}
                    description={
                        selectedAdmin?.can_add_teacher
                            ? `Are you sure you want to disable ${selectedAdmin?.name}'s ability to add new teachers? They will no longer be able to create teacher accounts.`
                            : `Are you sure you want to enable ${selectedAdmin?.name}'s ability to add new teachers? They will be able to create teacher accounts.`
                    }
                    onConfirm={handleConfirmToggle}
                    confirmText={selectedAdmin?.can_add_teacher ? 'Disable' : 'Enable'}
                    variant={selectedAdmin?.can_add_teacher ? 'destructive' : 'default'}
                />
            </div>
        </AdminLayout>
    )
}
