import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useEffect, useState } from 'react'
import { useForm } from '@inertiajs/react'
import superadmin from '@/routes/superadmin'

type Admin = {
    id: number
    user_id: number
    first_name: string
    last_name: string
    position: string
    role: 'Admin' | 'Staff'
    can_add_teacher: boolean
}

type EditAdminModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    admin: Admin | null
}

export default function EditAdminModal({ open, onOpenChange, admin }: EditAdminModalProps) {
    const { data, setData, put, processing, errors, reset } = useForm({
        first_name: '',
        last_name: '',
        position: '',
        password: '',
        can_add_teacher: true
    })

    const [generatedEmail, setGeneratedEmail] = useState('')

    // Helper function to capitalize first letter of each word
    const toTitleCase = (str: string) => {
        return str
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
    }

    useEffect(() => {
        if (admin) {
            setData({
                first_name: admin.first_name,
                last_name: admin.last_name,
                position: admin.position,
                password: '',
                can_add_teacher: admin.can_add_teacher ?? true
            })
        }
    }, [admin])

    useEffect(() => {
        if (data.first_name && data.last_name) {
            const firstName = data.first_name.toUpperCase().trim().replace(/\s+/g, '')
            const lastName = data.last_name.toUpperCase().trim().replace(/\s+/g, '')
            const email = `SNHS-${lastName}-${firstName}`
            setGeneratedEmail(email)
        } else {
            setGeneratedEmail('')
        }
    }, [data.first_name, data.last_name])

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!admin) return

        put(superadmin.admins.update.url({ admin: admin.id }), {
            onSuccess: () => {
                reset()
                setGeneratedEmail('')
                onOpenChange(false)
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Admin</DialogTitle>
                    <DialogDescription>
                        Update admin account information
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                First Name <span className="text-red-500">*</span>
                            </label>
                            <Input
                                required
                                value={data.first_name}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/[^a-zA-Z\s]/g, '')
                                    setData('first_name', toTitleCase(value))
                                }}
                                placeholder="Enter first name"
                                pattern="[A-Za-z\s]+"
                                title="Only letters are allowed"
                            />
                            {errors.first_name && (
                                <p className="text-xs text-red-500 mt-1">{errors.first_name}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Last Name <span className="text-red-500">*</span>
                            </label>
                            <Input
                                required
                                value={data.last_name}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/[^a-zA-Z\s]/g, '')
                                    setData('last_name', toTitleCase(value))
                                }}
                                placeholder="Enter last name"
                                pattern="[A-Za-z\s]+"
                                title="Only letters are allowed"
                            />
                            {errors.last_name && (
                                <p className="text-xs text-red-500 mt-1">{errors.last_name}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <Input
                            required
                            type="email"
                            value={generatedEmail}
                            readOnly
                            className="bg-gray-50"
                            placeholder="SNHS-LASTNAME-FIRSTNAME"
                        />
                        <p className="text-xs text-gray-500 mt-1">Auto-generated as SNHS-LASTNAME-FIRSTNAME</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Position <span className="text-red-500">*</span>
                        </label>
                        <Input
                            required
                            value={data.position}
                            onChange={(e) => setData('position', e.target.value)}
                            placeholder="e.g., Principal, Registrar, Admin Staff"
                        />
                        {errors.position && (
                            <p className="text-xs text-red-500 mt-1">{errors.position}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password <span className="text-gray-500">(Optional - leave blank to keep current password)</span>
                        </label>
                        <Input
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Enter new password (min. 8 characters)"
                            minLength={8}
                        />
                        {errors.password && (
                            <p className="text-xs text-red-500 mt-1">{errors.password}</p>
                        )}
                    </div>

                    {admin?.role !== 'Super Admin' && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.can_add_teacher}
                                    onChange={(e) => setData('can_add_teacher', e.target.checked)}
                                    className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                />
                                <div className="flex-1">
                                    <span className="text-sm font-medium text-gray-900">Can Add Teacher</span>
                                    <p className="text-xs text-gray-600 mt-1">
                                        Allow this admin to create and manage teacher accounts
                                    </p>
                                </div>
                            </label>
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                reset()
                                setGeneratedEmail('')
                                onOpenChange(false)
                            }}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-green-600 hover:bg-green-700"
                            disabled={processing}
                        >
                            {processing ? 'Updating...' : 'Update Admin'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
