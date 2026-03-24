import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useForm } from '@inertiajs/react'
import { update } from '@/routes/admin/registrar/subjects'
import { useEffect } from 'react'

type GradeLevel = {
    id: number
    name: string
}

type Subject = {
    id: number
    code: string
    name: string
    description: string
    grade_level_id: number
}

type EditSubjectModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    subject: Subject | null
    gradeLevels: GradeLevel[]
}

export default function EditSubjectModal({ open, onOpenChange, subject, gradeLevels }: EditSubjectModalProps) {
    const { data, setData, put, processing, errors, reset } = useForm({
        code: '',
        name: '',
        description: '',
        grade_level_id: ''
    })

    useEffect(() => {
        if (subject) {
            setData({
                code: subject.code,
                name: subject.name,
                description: subject.description,
                grade_level_id: subject.grade_level_id.toString()
            })
        }
    }, [subject])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (subject) {
            put(update.url({ subject: subject.id }), {
                onSuccess: () => {
                    onOpenChange(false)
                    reset()
                }
            })
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Subject</DialogTitle>
                    <DialogDescription>
                        Update the subject information
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Subject Code <span className="text-red-500">*</span>
                        </label>
                        <Input
                            required
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value)}
                            placeholder="e.g., MATH-7"
                        />
                        {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Subject Name <span className="text-red-500">*</span>
                        </label>
                        <Input
                            required
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g., Mathematics"
                        />
                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <Textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Brief description of the subject"
                            rows={3}
                        />
                        {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Grade Level <span className="text-red-500">*</span>
                        </label>
                        <Select
                            value={data.grade_level_id}
                            onValueChange={(value) => setData('grade_level_id', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select grade level" />
                            </SelectTrigger>
                            <SelectContent>
                                {gradeLevels.map((grade) => (
                                    <SelectItem key={grade.id} value={grade.id.toString()}>
                                        {grade.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.grade_level_id && <p className="text-xs text-red-500 mt-1">{errors.grade_level_id}</p>}
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                onOpenChange(false)
                                reset()
                            }}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700"
                            disabled={processing}
                        >
                            {processing ? 'Updating...' : 'Update Subject'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
