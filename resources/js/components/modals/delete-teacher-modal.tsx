import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useForm } from '@inertiajs/react'
import { destroy } from '@/routes/admin/user-management/teachers'
import { AlertTriangle } from 'lucide-react'

type Teacher = {
    id: number
    employee_no: string
    name: string
    email: string
    subject: string
    grade: string
    position: string
}

type DeleteTeacherModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    teacher: Teacher | null
}

export default function DeleteTeacherModal({ open, onOpenChange, teacher }: DeleteTeacherModalProps) {
    const { delete: deleteMethod, processing } = useForm()

    const handleDelete = () => {
        if (!teacher) return

        deleteMethod(destroy.url({ teacher: teacher.id }), {
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
                        Delete Teacher
                    </DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete the teacher account.
                    </DialogDescription>
                </DialogHeader>
                
                {teacher && (
                    <div className="space-y-4 mt-4">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-sm font-medium text-red-900 mb-2">
                                You are about to delete:
                            </p>
                            <div className="space-y-1 text-sm text-red-800">
                                <p><span className="font-medium">Name:</span> {teacher.name}</p>
                                <p><span className="font-medium">Email:</span> {teacher.email}</p>
                                <p><span className="font-medium">Employee No:</span> {teacher.employee_no}</p>
                                <p><span className="font-medium">Subject:</span> {teacher.subject}</p>
                                <p><span className="font-medium">Position:</span> {teacher.position}</p>
                            </div>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p className="text-sm text-yellow-800">
                                <span className="font-medium">Warning:</span> This will also delete the associated user account and all related data.
                            </p>
                        </div>

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
                                className="bg-red-600 hover:bg-red-700 text-white"
                                onClick={handleDelete}
                                disabled={processing}
                            >
                                {processing ? 'Deleting...' : 'Delete Teacher'}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
