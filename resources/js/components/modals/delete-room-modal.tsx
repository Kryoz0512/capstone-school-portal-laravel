import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { router } from '@inertiajs/react'
import { AlertTriangle } from 'lucide-react'
import { useState } from 'react'

type DeleteRoomModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    roomId: number | null
    roomNumber: string
}

export default function DeleteRoomModal({ open, onOpenChange, roomId, roomNumber }: DeleteRoomModalProps) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = () => {
        if (!roomId) return

        setIsDeleting(true)
        router.delete(`/admin/enrollment/rooms/${roomId}`, {
            onSuccess: () => {
                setIsDeleting(false)
                onOpenChange(false)
            },
            onError: () => {
                setIsDeleting(false)
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-full">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <DialogTitle>Delete Room</DialogTitle>
                            <DialogDescription>
                                This action cannot be undone
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>
                
                <div className="py-4">
                    <p className="text-sm text-gray-700">
                        Are you sure you want to delete room <span className="font-semibold">{roomNumber}</span>? 
                        This will permanently remove the room from the system.
                    </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t">
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
                        {isDeleting ? 'Deleting...' : 'Delete Room'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
