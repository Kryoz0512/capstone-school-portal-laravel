import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useForm } from '@inertiajs/react'
import { destroy } from '@/routes/admin/registrar/subjects'
import { AlertTriangle } from 'lucide-react'

type Subject = {
    id: number
    code: string
    name: string
    description: string
    grade_level: string
}

type DeleteSubjectModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    subject: Subject | null
}

export default function DeleteSubjectModal({ open, onOpenChange, subject }: DeleteSubjectModalProps) {
    const { delete: deleteMethod, processing } = useForm()

    const handleDelete = () => {
        if (subject) {
            deleteMethod(destroy.url({ subject: subject.id }), {
                onSuccess: () => {
                    onOpenChange(false)
                }
            })
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <DialogTitle>Delete Subject</DialogTitle>
                            <DialogDescription>
                                This action cannot be undone
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {subject && (
                    <div className="space-y-4 mt-4">
                        <p className="text-sm text-gray-600">
                            Are you sure you want to delete this subject?
                        </p>
                        
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Code:</span>
                                <span className="font-medium text-gray-900">{subject.code}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Name:</span>
                                <span className="font-medium text-gray-900">{subject.name}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Grade Level:</span>
                                <span className="font-medium text-gray-900">{subject.grade_level}</span>
                            </div>
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
                                className="bg-red-600 hover:bg-red-700"
                                onClick={handleDelete}
                                disabled={processing}
                            >
                                {processing ? 'Deleting...' : 'Delete Subject'}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
