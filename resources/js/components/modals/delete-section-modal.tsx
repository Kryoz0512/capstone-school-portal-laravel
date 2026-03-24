import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { router } from '@inertiajs/react'
import { destroy } from '@/routes/admin/enrollment/class-sections'
import { AlertTriangle } from 'lucide-react'
import { useState } from 'react'

type Section = {
    id: number
    section_name: string
    grade_level_id: number
    grade_level: string
}

type DeleteSectionModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    section: Section | null
}

export default function DeleteSectionModal({ open, onOpenChange, section }: DeleteSectionModalProps) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = () => {
        if (section) {
            setIsDeleting(true)
            router.delete(destroy.url({ classSection: section.id }), {
                onSuccess: () => {
                    onOpenChange(false)
                    setIsDeleting(false)
                },
                onError: () => {
                    setIsDeleting(false)
                }
            })
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                            <DialogTitle>Delete Section</DialogTitle>
                            <DialogDescription>
                                This action cannot be undone
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>
                <div className="mt-4">
                    <p className="text-sm text-gray-600">
                        Are you sure you want to delete <span className="font-semibold text-gray-900">{section?.section_name}</span>? 
                        This will permanently remove the section from the system.
                    </p>
                </div>
                <div className="flex items-center justify-end gap-3 mt-6">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isDeleting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        className="bg-red-600 hover:bg-red-700"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete Section'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
