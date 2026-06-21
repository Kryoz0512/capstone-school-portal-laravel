import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { router } from '@inertiajs/react'
import { useState } from 'react'
import { KeyRound, AlertTriangle } from 'lucide-react'

type StudentInfo = {
    id: number
    lrn: string
    name: string
} | null

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    student: StudentInfo
}

export default function ResetStudentPasswordModal({ open, onOpenChange, student }: Props) {
    const [processing, setProcessing] = useState(false)

    if (!student) return null

    const handleConfirm = () => {
        setProcessing(true)
        router.put(`/admin/user-management/students/${student.id}/reset-password`, {}, {
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
            onFinish: () => setProcessing(false),
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                            <KeyRound className="w-5 h-5 text-amber-600" />
                        </div>
                        <DialogTitle>Reset Student Password</DialogTitle>
                    </div>
                    <DialogDescription>
                        Are you sure you want to reset the password for <strong>{student.name}</strong> (LRN: {student.lrn})?
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800">
                        <p className="font-medium mb-1">This will:</p>
                        <ul className="list-disc list-inside space-y-0.5">
                            <li>Reset the password to the student's LRN ({student.lrn})</li>
                            <li>Require the student to set a new password on their next login</li>
                        </ul>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={processing}>
                        Cancel
                    </Button>
                    <Button
                        className="bg-amber-600 hover:bg-amber-700 text-white"
                        onClick={handleConfirm}
                        disabled={processing}
                    >
                        {processing ? 'Resetting...' : 'Reset Password'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}