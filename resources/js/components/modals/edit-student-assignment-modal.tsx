import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useState, useEffect } from 'react'
import { useForm } from '@inertiajs/react'
import { assignSection } from '@/routes/admin/enrollment/students'

type Student = {
    id: number
    studentName: string
    lrn: string
    gender: string
    age: number
    gradeLevel: string
    gradeLevelId: number | null
    section: string
    studentStatus: string
}

type GradeLevel = {
    id: number
    name: string
}

type Section = {
    id: number
    name: string
    grade_level_id: number
}

type EditStudentAssignmentModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    student: Student | null
    gradeLevels: GradeLevel[]
    sections: Section[]
}

export default function EditStudentAssignmentModal({ 
    open, 
    onOpenChange, 
    student,
    gradeLevels = [],
    sections = []
}: EditStudentAssignmentModalProps) {
    const [selectedGradeLevel, setSelectedGradeLevel] = useState('')
    const [selectedSection, setSelectedSection] = useState('')

    const { data, setData, put, processing, reset } = useForm({
        grade_level_id: '',
        section_id: '',
    })

    // Check if student is a new student (Grade 7 is locked)
    const isNewStudent = student?.studentStatus === 'new'

    // Reset form when modal opens with new student
    useEffect(() => {
        if (student && open) {
            // Pre-fill grade level if student already has one
            if (student.gradeLevelId) {
                const gradeLevelIdStr = student.gradeLevelId.toString()
                setSelectedGradeLevel(gradeLevelIdStr)
                setData('grade_level_id', gradeLevelIdStr)
            } else {
                setSelectedGradeLevel('')
                setData('grade_level_id', '')
            }
            setSelectedSection('')
            setData('section_id', '')
        }
    }, [student, open])

    // Filter sections based on selected grade level
    const filteredSections = selectedGradeLevel 
        ? sections.filter(s => s.grade_level_id.toString() === selectedGradeLevel)
        : []

    const handleSave = () => {
        if (!student) return

        put(assignSection.url({ student: student.id }), {
            onSuccess: () => {
                handleClose()
            },
        })
    }

    const handleClose = () => {
        setSelectedGradeLevel('')
        setSelectedSection('')
        reset()
        onOpenChange(false)
    }

    const handleGradeLevelChange = (value: string) => {
        setSelectedGradeLevel(value)
        setData('grade_level_id', value)
        // Reset section when grade level changes
        setSelectedSection('')
        setData('section_id', '')
    }

    const handleSectionChange = (value: string) => {
        setSelectedSection(value)
        setData('section_id', value)
    }

    if (!student) return null

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Edit Student Assignment</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    {/* Student Info Display */}
                    <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Student Name</p>
                            <p className="font-medium text-gray-900">{student.studentName}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">LRN</p>
                            <p className="font-medium text-gray-900">{student.lrn}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Gender</p>
                            <p className="font-medium text-gray-900">{student.gender}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Age</p>
                            <p className="font-medium text-gray-900">{student.age}</p>
                        </div>
                    </div>

                    {/* Grade Level Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Grade Level <span className="text-red-500">*</span>
                        </label>
                        <Select 
                            value={selectedGradeLevel} 
                            onValueChange={handleGradeLevelChange}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Grade Level" />
                            </SelectTrigger>
                            <SelectContent>
                                {gradeLevels.map((grade) => (
                                    <SelectItem key={grade.id} value={grade.id.toString()}>
                                        {grade.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {isNewStudent && (
                            <p className="text-xs text-blue-600 mt-1">
                                Grade 7 is pre-selected for new students
                            </p>
                        )}
                    </div>

                    {/* Section Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Section <span className="text-red-500">*</span>
                        </label>
                        <Select 
                            value={selectedSection} 
                            onValueChange={handleSectionChange}
                            disabled={!selectedGradeLevel}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Section" />
                            </SelectTrigger>
                            <SelectContent>
                                {filteredSections.length > 0 ? (
                                    filteredSections.map((section) => (
                                        <SelectItem key={section.id} value={section.id.toString()}>
                                            {section.name}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="no-sections" disabled>
                                        {selectedGradeLevel ? 'No sections available' : 'Select grade level first'}
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Warning Message */}
                    {(!selectedGradeLevel || !selectedSection) && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                            <span className="text-yellow-600 text-lg">⚠️</span>
                            <p className="text-sm text-yellow-800">
                                Both grade level and section are required to proceed
                            </p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={handleSave}
                            disabled={!selectedGradeLevel || !selectedSection || processing}
                        >
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
