import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useForm } from '@inertiajs/react'
import { destroy } from '@/routes/admin/user-management/teachers'
import { AlertTriangle, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import axios from 'axios'

type Teacher = {
    id: number
    employee_no: string
    name: string
    email: string
    subject: string
    position: string
}

type DeleteTeacherModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    teacher: Teacher | null
}

type Check = {
    count: number
    label: string
}

type CheckResult = {
    can_delete: boolean
    checks: {
        schedules: Check
        adviser_sections: Check
        class_sections: Check
        teacher_subjects: Check
    }
    details: {
        sections: Array<{ name: string; grade_level: string; school_year: string }>
        subjects: string[]
    }
}

export default function DeleteTeacherModal({ open, onOpenChange, teacher }: DeleteTeacherModalProps) {
    const { delete: deleteMethod, processing } = useForm()
    const [isChecking, setIsChecking] = useState(false)
    const [checkResult, setCheckResult] = useState<CheckResult | null>(null)

    useEffect(() => {
        if (open && teacher) {
            setIsChecking(true)
            axios.get(`/admin/user-management/teachers/${teacher.id}/check-deletable`)
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
    }, [open, teacher])

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
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                            <DialogTitle>Archive Teacher</DialogTitle>
                            <DialogDescription>
                                Verify deletion requirements before archiving
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>
                
                {teacher && (
                    <div className="space-y-4 mt-4">
                        {/* Teacher Information Card */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm font-semibold text-blue-900 mb-3">
                                Teacher Information
                            </p>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="font-medium text-blue-800">Name:</span>
                                    <p className="text-blue-900">{teacher.name}</p>
                                </div>
                                <div>
                                    <span className="font-medium text-blue-800">Employee No:</span>
                                    <p className="text-blue-900">{teacher.employee_no}</p>
                                </div>
                                <div>
                                    <span className="font-medium text-blue-800">Email:</span>
                                    <p className="text-blue-900">{teacher.email}</p>
                                </div>
                                <div>
                                    <span className="font-medium text-blue-800">Subject:</span>
                                    <p className="text-blue-900">{teacher.subject}</p>
                                </div>
                                <div className="col-span-2">
                                    <span className="font-medium text-blue-800">Position:</span>
                                    <p className="text-blue-900">{teacher.position}</p>
                                </div>
                            </div>
                        </div>

                        {/* Dependency Checks */}
                        {isChecking ? (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-center gap-2 text-gray-600">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="text-sm">Checking teacher dependencies...</span>
                                </div>
                            </div>
                        ) : checkResult ? (
                            <>
                                <div className={`border rounded-lg p-4 ${checkResult.can_delete ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                    <p className={`text-sm font-semibold mb-3 ${checkResult.can_delete ? 'text-green-900' : 'text-red-900'}`}>
                                        {checkResult.can_delete ? 'Safe to archive' : 'Cannot archive - Remove dependencies first'}
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
                                                    {check.count === 0 ? 'None' : check.count}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    {!checkResult.can_delete && (
                                        <p className="text-xs text-red-600 mt-3 pt-3 border-t border-red-200">
                                            Remove all dependencies before attempting to archive this teacher.
                                        </p>
                                    )}
                                </div>

                                {/* Show details if there are dependencies */}
                                {!checkResult.can_delete && (
                                    <div className="space-y-3">
                                        {checkResult.details.sections.length > 0 && (
                                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                                <p className="text-sm font-semibold text-amber-900 mb-2">
                                                    Advisory Sections ({checkResult.details.sections.length})
                                                </p>
                                                <div className="space-y-1 text-sm text-amber-800">
                                                    {checkResult.details.sections.map((section, idx) => (
                                                        <p key={idx}>
                                                            • {section.grade_level} - {section.name} ({section.school_year})
                                                        </p>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {checkResult.details.subjects.length > 0 && (
                                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                                <p className="text-sm font-semibold text-purple-900 mb-2">
                                                    Subject Assignments ({checkResult.details.subjects.length})
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {checkResult.details.subjects.map((subject, idx) => (
                                                        <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                            {subject}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        ) : null}

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
                                className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                                onClick={handleDelete}
                                disabled={processing || isChecking || (checkResult && !checkResult.can_delete)}
                            >
                                {processing ? 'Archiving...' : 'Archive Teacher'}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
