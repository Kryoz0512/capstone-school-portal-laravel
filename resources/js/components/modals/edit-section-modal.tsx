import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useForm, router } from '@inertiajs/react'
import { update } from '@/routes/admin/enrollment/class-sections'
import { useEffect, useState } from 'react'
import axios from 'axios'

type GradeLevel = {
    id: number
    name: string
}

type Room = {
    id: number
    room_name: string
    capacity: number
}

type Section = {
    id: number
    section_name: string
    grade_level_id: number
    grade_level: string
    room_id: number | null
}

type EditSectionModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    section: Section | null
    gradeLevels: GradeLevel[]
    rooms: Room[]
}

export default function EditSectionModal({ open, onOpenChange, section, gradeLevels, rooms = [] }: EditSectionModalProps) {
    const { data, setData, put, processing, errors, reset } = useForm<{
        section_name: string
        grade_level_id: string | undefined
    }>({
        section_name: '',
        grade_level_id: undefined,
    })

    const [sectionNameError, setSectionNameError] = useState('')
    const [isCheckingSectionName, setIsCheckingSectionName] = useState(false)
    const [initialSectionName, setInitialSectionName] = useState('')
    const [initialGradeLevelId, setInitialGradeLevelId] = useState('')

    // Reload page data when modal opens to get fresh data
    useEffect(() => {
        if (open) {
            router.reload({ only: ['sections'] })
        }
    }, [open])

    useEffect(() => {
        if (section) {
            setData({
                section_name: section.section_name,
                grade_level_id: section.grade_level_id.toString(),
            })
            setInitialSectionName(section.section_name)
            setInitialGradeLevelId(section.grade_level_id.toString())
            setSectionNameError('')
        }
    }, [section])

    // Check section name availability (only if changed from initial)
    useEffect(() => {
        if (!data.section_name) {
            setSectionNameError('')
            return
        }

        // Don't check if name is unchanged
        if (data.section_name.toLowerCase() === initialSectionName.toLowerCase()) {
            setSectionNameError('')
            return
        }

        const timeoutId = setTimeout(async () => {
            setIsCheckingSectionName(true)
            try {
                const response = await axios.post('/admin/enrollment/class-sections/check-section-name', {
                    section_name: data.section_name,
                    section_id: section?.id
                })
                
                if (!response.data.available) {
                    setSectionNameError(response.data.message)
                } else {
                    setSectionNameError('')
                }
            } catch (error) {
                console.error('Error checking section name:', error)
            } finally {
                setIsCheckingSectionName(false)
            }
        }, 500)

        return () => clearTimeout(timeoutId)
    }, [data.section_name, initialSectionName, section?.id])

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!section) return

        if (sectionNameError || isCheckingSectionName) {
            return
        }

        put(update.url({ classSection: section.id }), {
            data: {
                section_name: data.section_name,
                grade_level_id: data.grade_level_id,
            },
            onSuccess: () => {
                onOpenChange(false)
                reset()
                setSectionNameError('')
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit Section</DialogTitle>
                    <DialogDescription>
                        Update the section name and grade level
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
                        {isCheckingSectionName && (
                            <p className="text-xs text-blue-500 mt-1">Checking availability...</p>
                        )}
                        {sectionNameError && (
                            <p className="text-xs text-red-500 mt-1">{sectionNameError}</p>
                        )}
                        {errors.section_name && <p className="text-xs text-red-500 mt-1">{errors.section_name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Grade Level <span className="text-red-500">*</span>
                        </label>
                        <Select
                            value={data.grade_level_id?.toString()}
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
                            disabled={processing || isCheckingSectionName || !!sectionNameError}
                        >
                            {processing ? 'Updating...' : 'Update Section'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
