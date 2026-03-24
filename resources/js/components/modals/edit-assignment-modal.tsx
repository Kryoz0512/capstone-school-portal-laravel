import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useForm } from '@inertiajs/react'
import { update } from '@/routes/admin/enrollment/teacher-subjects'
import { useState, useEffect } from 'react'

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
    grade_level: string
}

type Teacher = {
    id: number
    name: string
    subject: string
}

type Assignment = {
    id: number
    subject_id: number
    teacher_id: number
}

type EditAssignmentModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    assignment: Assignment | null
    gradeLevels: GradeLevel[]
    subjects: Subject[]
    teachers: Teacher[]
}

export default function EditAssignmentModal({ 
    open, 
    onOpenChange, 
    assignment,
    gradeLevels,
    subjects, 
    teachers 
}: EditAssignmentModalProps) {
    const { data, setData, put, processing, errors, reset } = useForm({
        subject_id: '',
        teacher_id: ''
    })

    const [selectedGradeLevel, setSelectedGradeLevel] = useState('')
    const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([])
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
    const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([])
    const [validationMessage, setValidationMessage] = useState('')

    // Populate form when assignment changes
    useEffect(() => {
        if (assignment) {
            setData({
                subject_id: assignment.subject_id.toString(),
                teacher_id: assignment.teacher_id.toString()
            })
            
            // Find the subject and set grade level
            const subject = subjects.find(s => s.id === assignment.subject_id)
            if (subject) {
                setSelectedGradeLevel(subject.grade_level_id.toString())
                setSelectedSubject(subject)
            }
        }
    }, [assignment, subjects])

    // Filter subjects when grade level changes
    useEffect(() => {
        if (selectedGradeLevel) {
            const gradeId = parseInt(selectedGradeLevel)
            setFilteredSubjects(subjects.filter(s => s.grade_level_id === gradeId))
        } else {
            setFilteredSubjects([])
        }
    }, [selectedGradeLevel, subjects])

    // Update selected subject and filter teachers
    useEffect(() => {
        if (data.subject_id) {
            const subject = subjects.find(s => s.id.toString() === data.subject_id)
            setSelectedSubject(subject || null)
            
            if (subject) {
                const matchingTeachers = teachers.filter(t => 
                    t.subject.toLowerCase() === subject.name.toLowerCase()
                )
                setFilteredTeachers(matchingTeachers)
                
                if (matchingTeachers.length === 0) {
                    setValidationMessage(`No teachers with ${subject.name} specialization available`)
                } else {
                    setValidationMessage('')
                }
            }
        } else {
            setSelectedSubject(null)
            setFilteredTeachers([])
            setValidationMessage('')
        }
    }, [data.subject_id, subjects, teachers])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (assignment) {
            put(update.url({ id: assignment.id }), {
                onSuccess: () => {
                    onOpenChange(false)
                    reset()
                }
            })
        }
    }

    const handleClose = () => {
        onOpenChange(false)
        reset()
        setSelectedGradeLevel('')
        setSelectedSubject(null)
        setFilteredTeachers([])
        setValidationMessage('')
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Edit Assignment</DialogTitle>
                    <DialogDescription>
                        Update the subject assignment for this teacher
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Grade Level <span className="text-red-500">*</span>
                        </label>
                        <Select
                            value={selectedGradeLevel}
                            onValueChange={setSelectedGradeLevel}
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
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Subject Name <span className="text-red-500">*</span>
                        </label>
                        <Select
                            value={data.subject_id}
                            onValueChange={(value) => setData('subject_id', value)}
                            disabled={!selectedGradeLevel}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={selectedGradeLevel ? "Select subject" : "Select grade first"} />
                            </SelectTrigger>
                            <SelectContent>
                                {filteredSubjects.map((subject) => (
                                    <SelectItem key={subject.id} value={subject.id.toString()}>
                                        {subject.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.subject_id && <p className="text-xs text-red-500 mt-1">{errors.subject_id}</p>}
                    </div>

                    {selectedSubject && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Subject Code
                                </label>
                                <Input
                                    value={selectedSubject.code}
                                    readOnly
                                    className="bg-gray-50"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <Textarea
                                    value={selectedSubject.description || ''}
                                    readOnly
                                    className="bg-gray-50"
                                    placeholder="No description available"
                                    rows={3}
                                />
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Assign Teacher <span className="text-red-500">*</span>
                        </label>
                        <Select
                            value={data.teacher_id}
                            onValueChange={(value) => setData('teacher_id', value)}
                            disabled={!selectedSubject}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={selectedSubject ? "Select a teacher" : "Select subject first"} />
                            </SelectTrigger>
                            <SelectContent>
                                {filteredTeachers.length > 0 ? (
                                    filteredTeachers.map((teacher) => (
                                        <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                            {teacher.name} ({teacher.subject})
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="no-teachers" disabled>
                                        No matching teachers
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                        {validationMessage && (
                            <p className="text-xs text-amber-600 mt-1">⚠️ {validationMessage}</p>
                        )}
                        {selectedSubject && filteredTeachers.length > 0 && (
                            <p className="text-xs text-green-600 mt-1">
                                ✓ Showing teachers with {selectedSubject.name} specialization
                            </p>
                        )}
                        {errors.teacher_id && <p className="text-xs text-red-500 mt-1">{errors.teacher_id}</p>}
                    </div>

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
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700"
                            disabled={processing}
                        >
                            {processing ? 'Updating...' : 'Update Assignment'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
