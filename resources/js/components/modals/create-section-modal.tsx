import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useForm } from '@inertiajs/react'
import { store } from '@/routes/admin/enrollment/class-sections'

type GradeLevel = {
    id: number
    name: string
}

type CreateSectionModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    gradeLevels: GradeLevel[]
}

export default function CreateSectionModal({ open, onOpenChange, gradeLevels }: CreateSectionModalProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        section_name: '',
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
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Create Section</DialogTitle>
                    <DialogDescription>
                        Create a new class section with grade level assignment
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Section Name <span className="text-red-500">*</span>
                        </label>
                        <Input
                            required
                            value={data.section_name}
                            onChange={(e) => setData('section_name', e.target.value)}
                            placeholder="e.g., Section A, Section B"
                        />
                        {errors.section_name && <p className="text-xs text-red-500 mt-1">{errors.section_name}</p>}
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
                            className="bg-green-600 hover:bg-green-700"
                            disabled={processing}
                        >
                            {processing ? 'Creating...' : 'Create Section'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
