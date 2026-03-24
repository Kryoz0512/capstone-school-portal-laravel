import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useForm } from '@inertiajs/react'
import { destroy } from '@/routes/admin/admission/accreditations'
import { TriangleAlert } from 'lucide-react'

type Accreditation = {
    id: number
    accreditation_type: string
    accrediting_body: string
    certificate_number: string
}

type DeleteAccreditationModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    accreditation: Accreditation | null
}

export default function DeleteAccreditationModal({ open, onOpenChange, accreditation }: DeleteAccreditationModalProps) {
    const { delete: deleteMethod, processing } = useForm()

    const handleDelete = () => {
        if (accreditation) {
            deleteMethod(destroy.url({ accreditation: accreditation.id }), {
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
                            <TriangleAlert className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <DialogTitle>Delete Accreditation</DialogTitle>
                            <DialogDescription>
                                This action cannot be undone
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>
                <div className="mt-4">
                    <p className="text-sm text-gray-600">
                        Are you sure you want to delete this accreditation?
                    </p>
                    {accreditation && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-900">{accreditation.accreditation_type}</p>
                            <p className="text-xs text-gray-500 mt-1">{accreditation.accrediting_body}</p>
                            <p className="text-xs text-gray-500">Certificate: {accreditation.certificate_number}</p>
                        </div>
                    )}
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
                        {processing ? 'Deleting...' : 'Delete'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
