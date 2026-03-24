import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useForm } from '@inertiajs/react'
import { destroy } from '@/routes/admin'
import { AlertTriangle } from 'lucide-react'

type Admin = {
    id: number
    name: string
    email: string
    position: string
    role: 'Admin' | 'Staff'
}

type DeleteAdminModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    admin: Admin | null
}

export default function DeleteAdminModal({ open, onOpenChange, admin }: DeleteAdminModalProps) {
    const { delete: deleteAdmin, processing } = useForm()

    const handleDelete = () => {
        if (!admin) return

        deleteAdmin(destroy.url({ admin: admin.id }), {
            onSuccess: () => {
                onOpenChange(false)
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="w-5 h-5" />
                        Delete Admin
                    </DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete the admin account.
                    </DialogDescription>
                </DialogHeader>
                
                {admin && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                        <div>
                            <p className="text-sm font-medium text-gray-700">Name</p>
                            <p className="text-sm text-gray-900">{admin.name}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700">Email</p>
                            <p className="text-sm text-gray-900">{admin.email}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700">Position</p>
                            <p className="text-sm text-gray-900">{admin.position}</p>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={processing}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={processing}
                    >
                        {processing ? 'Deleting...' : 'Delete Admin'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
