import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useForm } from '@inertiajs/react'
import { store } from '@/routes/admin/enrollment/schedules'
import { useState, useEffect } from 'react'

type GradeLevel = {
    id: number
    name: string
}

type ClassSection = {
    id: number
    name: string
    grade_level: string
    grade_level_id: number
}

type Subject = {
    id: number
    name: string
    grade_level_id: number
}

type Teacher = {
    id: number
    name: string
}

type TeacherSubject = {
    subject_id: number
    subject_name: string
    grade_level_id: number
}

type TeacherSubjectData = {
    grade_levels: number[]
    subjects: TeacherSubject[]
}

type Room = {
    id: number
    name: string
}

type AddScheduleModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    gradeLevels: GradeLevel[]
    classSections: ClassSection[]
    subjects: Subject[]
    teachers: Teacher[]
    teacherSubjects: Record<number, TeacherSubjectData>
    rooms: Room[]
}

export default function AddScheduleModal({ 
    open, 
    onOpenChange, 
    gradeLevels,
    classSections, 
    subjects, 
    teachers,
    teacherSubjects,
    rooms 
}: AddScheduleModalProps) {
    const [selectedGradeLevel, setSelectedGradeLevel] = useState('')
    const [filteredSections, setFilteredSections] = useState<ClassSection[]>([])
    const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([])
    const [teacherAssignedSubjects, setTeacherAssignedSubjects] = useState<TeacherSubject[]>([])

    const { data, setData, post, processing, errors, reset } = useForm({
        class_section_id: '',
        subject_id: '',
        teacher_id: '',
        room_id: '',
        day_of_week: '',
        start_time: '',
        end_time: ''
    })

    // Filter sections and teachers when grade level changes
    useEffect(() => {
        if (selectedGradeLevel) {
            const gradeId = parseInt(selectedGradeLevel)
            
            setFilteredSections(classSections.filter(s => s.grade_level_id === gradeId))
            
            // Filter teachers who have assignments for this grade level
            const teachersForGrade = teachers.filter(t => {
                const teacherData = teacherSubjects[t.id]
                return teacherData && teacherData.grade_levels.includes(gradeId)
            })
            setFilteredTeachers(teachersForGrade)
            
            // Reset dependent fields
            setData(prev => ({ 
                ...prev, 
                class_section_id: '', 
                teacher_id: '',
                subject_id: ''
            }))
            setTeacherAssignedSubjects([])
        } else {
            setFilteredSections([])
            setFilteredTeachers([])
            setTeacherAssignedSubjects([])
        }
    }, [selectedGradeLevel, classSections, teachers, gradeLevels, teacherSubjects])

    // Update assigned subjects when teacher changes
    useEffect(() => {
        if (data.teacher_id) {
            const teacherId = parseInt(data.teacher_id)
            const teacherData = teacherSubjects[teacherId]
            
            if (teacherData) {
                // Filter subjects for the selected grade level
                const gradeId = parseInt(selectedGradeLevel)
                const subjectsForGrade = teacherData.subjects.filter(s => s.grade_level_id === gradeId)
                setTeacherAssignedSubjects(subjectsForGrade)
            } else {
                setTeacherAssignedSubjects([])
            }
            
            // Reset subject when teacher changes
            setData(prev => ({ ...prev, subject_id: '' }))
        } else {
            setTeacherAssignedSubjects([])
        }
    }, [data.teacher_id, teacherSubjects, selectedGradeLevel])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        post(store.url(), {
            onSuccess: () => {
                onOpenChange(false)
                reset()
                setSelectedGradeLevel('')
            }
        })
    }

    const handleClose = () => {
        onOpenChange(false)
        reset()
        setSelectedGradeLevel('')
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New Schedule</DialogTitle>
                    <DialogDescription>
                        Create a new class schedule with teacher and room assignment
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
                                <SelectValue placeholder="Select grade level first" />
                            </SelectTrigger>
                            <SelectContent>
                                {gradeLevels.map((grade) => (
                                    <SelectItem key={grade.id} value={grade.id.toString()}>
                                        {grade.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500 mt-1">Select grade level to filter teachers and sections</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Teacher <span className="text-red-500">*</span>
                        </label>
                        <Select
                            value={data.teacher_id}
                            onValueChange={(value) => setData('teacher_id', value)}
                            disabled={!selectedGradeLevel}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={selectedGradeLevel ? "Select teacher" : "Select grade first"} />
                            </SelectTrigger>
                            <SelectContent>
                                {filteredTeachers.length > 0 ? (
                                    filteredTeachers.map((teacher) => (
                                        <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                            {teacher.name}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="no-teachers" disabled>
                                        No teachers available
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                        {errors.teacher_id && <p className="text-xs text-red-500 mt-1">{errors.teacher_id}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Subject <span className="text-red-500">*</span>
                        </label>
                        <Select
                            value={data.subject_id}
                            onValueChange={(value) => setData('subject_id', value)}
                            disabled={!data.teacher_id}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={data.teacher_id ? "Select subject" : "Select teacher first"} />
                            </SelectTrigger>
                            <SelectContent>
                                {teacherAssignedSubjects.length > 0 ? (
                                    teacherAssignedSubjects.map((subject) => (
                                        <SelectItem key={subject.subject_id} value={subject.subject_id.toString()}>
                                            {subject.subject_name}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="no-subjects" disabled>
                                        No assigned subjects
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                        {data.teacher_id && teacherAssignedSubjects.length > 0 && (
                            <p className="text-xs text-green-600 mt-1">
                                ✓ Showing subjects assigned to this teacher
                            </p>
                        )}
                        {errors.subject_id && <p className="text-xs text-red-500 mt-1">{errors.subject_id}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Section <span className="text-red-500">*</span>
                            </label>
                            <Select
                                value={data.class_section_id}
                                onValueChange={(value) => setData('class_section_id', value)}
                                disabled={!selectedGradeLevel}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={selectedGradeLevel ? "Select section" : "Select grade first"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {filteredSections.map((section) => (
                                        <SelectItem key={section.id} value={section.id.toString()}>
                                            {section.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.class_section_id && <p className="text-xs text-red-500 mt-1">{errors.class_section_id}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Room
                            </label>
                            <Select
                                value={data.room_id}
                                onValueChange={(value) => setData('room_id', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select room" />
                                </SelectTrigger>
                                <SelectContent>
                                    {rooms.map((room) => (
                                        <SelectItem key={room.id} value={room.id.toString()}>
                                            {room.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.room_id && <p className="text-xs text-red-500 mt-1">{errors.room_id}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Day of Week <span className="text-red-500">*</span>
                        </label>
                        <Select
                            value={data.day_of_week}
                            onValueChange={(value) => setData('day_of_week', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select day" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Monday">Monday</SelectItem>
                                <SelectItem value="Tuesday">Tuesday</SelectItem>
                                <SelectItem value="Wednesday">Wednesday</SelectItem>
                                <SelectItem value="Thursday">Thursday</SelectItem>
                                <SelectItem value="Friday">Friday</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.day_of_week && <p className="text-xs text-red-500 mt-1">{errors.day_of_week}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Start Time <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="time"
                                required
                                value={data.start_time}
                                onChange={(e) => setData('start_time', e.target.value)}
                            />
                            {errors.start_time && <p className="text-xs text-red-500 mt-1">{errors.start_time}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                End Time <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="time"
                                required
                                value={data.end_time}
                                onChange={(e) => setData('end_time', e.target.value)}
                            />
                            {errors.end_time && <p className="text-xs text-red-500 mt-1">{errors.end_time}</p>}
                        </div>
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
                            className="bg-green-600 hover:bg-green-700"
                            disabled={processing}
                        >
                            {processing ? 'Creating...' : 'Create Schedule'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
