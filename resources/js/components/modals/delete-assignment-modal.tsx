import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useForm } from '@inertiajs/react'
import { destroy } from '@/routes/admin/enrollment/teacher-subjects'
import { AlertTriangle } from 'lucide-react'

type Assignment = {
    id: number
    subject_code: string
    subject_name: string
    grade_level: string
    teacher_name: string
}

type DeleteAssignmentModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    assignment: Assignment | null
}

export default function DeleteAssignmentModal({ open, onOpenChange, assignment }: DeleteAssignmentModalProps) {
    const { delete: deleteMethod, processing } = useForm()

    const handleDelete = () => {
        if (assignment) {
            deleteMethod(destroy.url({ id: assignment.id }), {
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
                            <DialogTitle>Remove Assignment</DialogTitle>
                            <DialogDescription>
                                This action cannot be undone
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {assignment && (
                    <div className="space-y-4 mt-4">
                        <p className="text-sm text-gray-600">
                            Are you sure you want to remove this subject assignment?
                        </p>
                        
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subject:</span>
                                <span className="font-medium text-gray-900">{assignment.subject_name}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Code:</span>
                                <span className="font-medium text-gray-900">{assignment.subject_code}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Grade Level:</span>
                                <span className="font-medium text-gray-900">{assignment.grade_level}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Teacher:</span>
                                <span className="font-medium text-gray-900">{assignment.teacher_name}</span>
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
                                {processing ? 'Removing...' : 'Remove Assignment'}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
