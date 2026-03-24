import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useForm } from '@inertiajs/react'
import { store } from '@/routes/admin/registrar/subjects'

type GradeLevel = {
    id: number
    name: string
}

type AddSubjectModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    gradeLevels: GradeLevel[]
}

export default function AddSubjectModal({ open, onOpenChange, gradeLevels }: AddSubjectModalProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        code: '',
        name: '',
        description: '',
        grade_level_id: ''
    })

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        post(store.url(), {
            onSuccess: () => {
                onOpenChange(false)
                reset()
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Add New Subject</DialogTitle>
                    <DialogDescription>
                        Create a new subject with code, name, and grade level assignment
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Subject Code <span className="text-red-500">*</span>
                            </label>
                            <Input
                                required
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                placeholder="e.g., ENG-01, MATH-01"
                            />
                            {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
                            <p className="text-xs text-gray-500 mt-1">Must be unique</p>
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
                                    {gradeLevels.map((level) => (
                                        <SelectItem key={level.id} value={level.id.toString()}>
                                            {level.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.grade_level_id && <p className="text-xs text-red-500 mt-1">{errors.grade_level_id}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Subject Name <span className="text-red-500">*</span>
                        </label>
                        <Input
                            required
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Enter subject name"
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
                            placeholder="Enter subject description"
                            rows={3}
                        />
                        {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
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
                            {processing ? 'Creating...' : 'Create Subject'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
