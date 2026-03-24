import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useForm } from '@inertiajs/react'
import { destroy } from '@/routes/admin/enrollment/schedules'
import { AlertTriangle } from 'lucide-react'

type Schedule = {
    id: number
    grade: string
    section: string
    day: string
    start_time: string
    end_time: string
    room: string
    subject: string
    teacher: string
}

type DeleteScheduleModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    schedule: Schedule | null
}

export default function DeleteScheduleModal({ open, onOpenChange, schedule }: DeleteScheduleModalProps) {
    const { delete: deleteMethod, processing } = useForm()

    const handleDelete = () => {
        if (schedule) {
            deleteMethod(destroy.url({ schedule: schedule.id }), {
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
                            <DialogTitle>Delete Schedule</DialogTitle>
                            <DialogDescription>
                                This action cannot be undone
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {schedule && (
                    <div className="space-y-4 mt-4">
                        <p className="text-sm text-gray-600">
                            Are you sure you want to delete this schedule?
                        </p>
                        
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Section:</span>
                                <span className="font-medium text-gray-900">{schedule.section}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subject:</span>
                                <span className="font-medium text-gray-900">{schedule.subject}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Teacher:</span>
                                <span className="font-medium text-gray-900">{schedule.teacher}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Day & Time:</span>
                                <span className="font-medium text-gray-900">
                                    {schedule.day} {schedule.start_time} - {schedule.end_time}
                                </span>
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
                                {processing ? 'Deleting...' : 'Delete Schedule'}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
