import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useForm } from '@inertiajs/react'
import InputError from '../input-error'
import { useEffect } from 'react'

type Student = {
    id: number
    lrn: string
    studentName: string
    grade: number | null
    remarks: 'Passed' | 'Failed' | 'Incomplete' | 'Dropped' | null
    gradeId: number | null
}

type EditGradeModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    student: Student | null
    filters: {
        section_id: number | null
        subject_id: number | null
        quarter: string
        school_year: string
    }
}

export default function EditGradeModal({ open, onOpenChange, student, filters }: EditGradeModalProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        student_id: 0,
        class_section_id: 0,
        subject_id: 0,
        quarter: '',
        school_year: '',
        grade: ''
    })

    // Update form data when modal opens or student changes
    useEffect(() => {
        if (open && student && filters.section_id && filters.subject_id) {
            setData({
                student_id: student.id,
                class_section_id: filters.section_id,
                subject_id: filters.subject_id,
                quarter: filters.quarter,
                school_year: filters.school_year,
                grade: student.grade?.toString() || ''
            })
        }
    }, [open, student, filters])

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        
        console.log('Submitting grade data:', data)

        post('/teacher/grade-sheets', {
            onSuccess: () => {
                console.log('Grade saved successfully')
                onOpenChange(false)
            },
            onError: (errors) => {
                console.error('Grade save errors:', errors)
            }
        })
    }

    if (!student) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Grade</DialogTitle>
                    <DialogDescription>
                        Update grade for {student.studentName}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Student LRN
                        </label>
                        <Input
                            value={student.lrn}
                            disabled
                            className="bg-gray-50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Student Name
                        </label>
                        <Input
                            value={student.studentName}
                            disabled
                            className="bg-gray-50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Grade <span className="text-red-500">*</span>
                        </label>
                        <Input
                            type="number"
                            min="75"
                            max="100"
                            step="0.01"
                            value={data.grade}
                            onChange={(e) => setData('grade', e.target.value)}
                            placeholder="Enter grade"
                            autoFocus
                        />
                        <InputError message={errors.grade}/>
                        <p className="text-xs text-gray-500 mt-1">
                            Valid grade range: 75-100
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
                            type="submit"
                            className="bg-green-600 hover:bg-green-700"
                            disabled={processing}
                        >
                            {processing ? 'Saving...' : 'Save Grade'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
