import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { router } from '@inertiajs/react'
import { destroy } from '@/routes/admin/enrollment/class-sections'
import { AlertTriangle, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import axios from 'axios'

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

type Check = {
    count: number
    label: string
}

type CheckResult = {
    can_delete: boolean
    checks: {
        students: Check
        schedules: Check
        adviser: Check
    }
}

export default function DeleteSectionModal({ open, onOpenChange, section }: DeleteSectionModalProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [isChecking, setIsChecking] = useState(false)
    const [checkResult, setCheckResult] = useState<CheckResult | null>(null)

    useEffect(() => {
        if (open && section) {
            setIsChecking(true)
            axios.get(`/admin/enrollment/class-sections/${section.id}/check-deletable`)
                .then(response => {
                    setCheckResult(response.data)
                })
                .catch(error => {
                    console.error('Error checking deletable:', error)
                })
                .finally(() => {
                    setIsChecking(false)
                })
        } else {
            setCheckResult(null)
        }
    }, [open, section])

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
                                Verify deletion requirements
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>
                <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-4">
                        Are you sure you want to delete <span className="font-semibold text-gray-900">{section?.section_name}</span>?
                    </p>

                    {isChecking ? (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-center gap-2 text-gray-600">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm">Checking section status...</span>
                            </div>
                        </div>
                    ) : checkResult ? (
                        <div className={`border rounded-lg p-4 ${checkResult.can_delete ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            <p className="text-sm font-semibold mb-3 ${checkResult.can_delete ? 'text-green-900' : 'text-red-900'}">
                                {checkResult.can_delete ? 'Safe to delete' : 'Cannot delete - Remove dependencies first'}
                            </p>
                            <div className="space-y-2">
                                {Object.entries(checkResult.checks).map(([key, check]) => (
                                    <div key={key} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            {check.count === 0 ? (
                                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                            ) : (
                                                <XCircle className="w-4 h-4 text-red-600" />
                                            )}
                                            <span className={check.count === 0 ? 'text-gray-700' : 'text-gray-900 font-medium'}>
                                                {check.label}
                                            </span>
                                        </div>
                                        <span className={`font-medium ${check.count === 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {key === 'adviser' 
                                                ? (check.count === 0 ? 'Not Assigned' : 'Assigned')
                                                : (check.count === 0 ? 'None' : check.count)
                                            }
                                        </span>
                                    </div>
                                ))}
                            </div>
                            {!checkResult.can_delete && (
                                <p className="text-xs text-red-600 mt-3 pt-3 border-t border-red-200">
                                    Remove all dependencies before attempting to delete this section.
                                </p>
                            )}
                        </div>
                    ) : null}
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
                        className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
                        onClick={handleDelete}
                        disabled={isDeleting || isChecking || (checkResult && !checkResult.can_delete)}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete Section'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
