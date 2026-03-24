import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useForm } from '@inertiajs/react'
import { store, update } from '@/routes/admin/enrollment/adviser-sections'
import { useEffect } from 'react'

type Teacher = {
    id: number
    name: string
    is_assigned: boolean
}

type Section = {
    id: number
    section_name: string
    grade_level: string
    grade_level_id: number
    current_adviser: string
    adviser_id: number | null
    adviser_section_id: number | null
}

type AssignAdviserModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    section: Section | null
    teachers: Teacher[]
    sections: Section[]
    schoolYear: string
}

export default function AssignAdviserModal({ open, onOpenChange, section, teachers, sections, schoolYear }: AssignAdviserModalProps) {
    const { data, setData, post, put, processing, errors, reset, setError, clearErrors } = useForm({
        teacher_id: '',
        class_section_id: '',
        school_year: schoolYear
    })

    useEffect(() => {
        if (section) {
            // Editing existing assignment
            setData({
                teacher_id: section.adviser_id ? section.adviser_id.toString() : '',
                class_section_id: section.id.toString(),
                school_year: schoolYear
            })
        } else {
            // Creating new assignment
            setData({
                teacher_id: '',
                class_section_id: '',
                school_year: schoolYear
            })
        }
    }, [section, schoolYear])

    const handleTeacherChange = (value: string) => {
        const selectedTeacher = teachers.find(t => t.id.toString() === value)
        
        // Clear any previous errors
        clearErrors('error')
        
        // Check if teacher is already assigned (and not the current adviser being updated)
        if (selectedTeacher?.is_assigned && selectedTeacher.id !== section?.adviser_id) {
            setError('error', 'This teacher is already advising another section for the selected school year.')
        }
        
        setData('teacher_id', value)
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        
        if (section?.adviser_section_id) {
            // Update existing assignment
            put(update.url({ adviserSection: section.adviser_section_id }), {
                onSuccess: () => {
                    onOpenChange(false)
                    reset()
                }
            })
        } else {
            // Create new assignment
            post(store.url(), {
                onSuccess: () => {
                    onOpenChange(false)
                    reset()
                }
            })
        }
    }

    const selectedSectionData = section || sections.find(s => s.id.toString() === data.class_section_id)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {section ? 'Update Adviser' : 'Assign Adviser'}
                    </DialogTitle>
                    <DialogDescription>
                        {section 
                            ? 'Update the adviser for this section'
                            : 'Select a section and assign a teacher as adviser'
                        }
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    {!section && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Section <span className="text-red-500">*</span>
                            </label>
                            <Select
                                value={data.class_section_id}
                                onValueChange={(value) => setData('class_section_id', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a section" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sections.map((sec) => (
                                        <SelectItem key={sec.id} value={sec.id.toString()}>
                                            {sec.section_name} - {sec.grade_level}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.class_section_id && <p className="text-xs text-red-500 mt-1">{errors.class_section_id}</p>}
                        </div>
                    )}

                    {(section || selectedSectionData) && (
                        <>
                            {section && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Section
                                    </label>
                                    <Input
                                        value={section.section_name}
                                        readOnly
                                        className="bg-gray-50"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Grade Level
                                </label>
                                <Input
                                    value={(section || selectedSectionData)?.grade_level || ''}
                                    readOnly
                                    className="bg-gray-50"
                                />
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            School Year
                        </label>
                        <Input
                            value={data.school_year}
                            readOnly
                            className="bg-gray-50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Adviser <span className="text-red-500">*</span>
                        </label>
                        <Select
                            value={data.teacher_id}
                            onValueChange={handleTeacherChange}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a teacher" />
                            </SelectTrigger>
                            <SelectContent>
                                {teachers.map((teacher) => (
                                    <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                        {teacher.name}
                                        {teacher.is_assigned && teacher.id !== section?.adviser_id && (
                                            <span className="text-xs text-orange-600 ml-2">(Already Assigned)</span>
                                        )}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.teacher_id && <p className="text-xs text-red-500 mt-1">{errors.teacher_id}</p>}
                        {errors.error && <p className="text-xs text-red-500 mt-1">{errors.error}</p>}
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
                            disabled={processing || (!section && !data.class_section_id) || !!errors.error}
                        >
                            {processing ? 'Saving...' : section ? 'Update Adviser' : 'Assign Adviser'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
