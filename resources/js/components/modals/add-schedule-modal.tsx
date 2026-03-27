import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useForm } from '@inertiajs/react'
import { useEffect, useState, useMemo } from 'react'

type ClassSection = {
    id: number
    name: string
    grade_level: string
    grade_level_id: number
    room_id: number | null
}

type Subject = {
    id: number
    name: string
    grade_level_id: number
}

type Room = {
    id: number
    name: string
}

type GradeLevel = {
    id: number
    name: string
}

type AddScheduleModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    teacherId: number
    classSections: ClassSection[]
    gradeLevels: GradeLevel[]
    subjects: Subject[]
    rooms: Room[]
}

export default function AddScheduleModal({ 
    open, 
    onOpenChange, 
    teacherId,
    classSections = [], 
    gradeLevels = [],
    subjects = [], 
    rooms = [] 
}: AddScheduleModalProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        teacher_id: teacherId.toString(),
        grade_level_id: undefined,
        class_section_id: undefined,
        subject_id: undefined,
        room_id: undefined,
        day_of_week: undefined,
        start_time: '',
        end_time: '',
    })

    const [selectedGradeLevel, setSelectedGradeLevel] = useState('')

    // Filter sections by selected grade level
    const filteredSections = useMemo(() => {
        if (!selectedGradeLevel) return []
        return classSections.filter(s => s.grade_level_id.toString() === selectedGradeLevel)
    }, [classSections, selectedGradeLevel])

    // Filter subjects by selected grade level
    const filteredSubjects = useMemo(() => {
        if (!selectedGradeLevel) return []
        return subjects.filter(s => s.grade_level_id.toString() === selectedGradeLevel)
    }, [subjects, selectedGradeLevel])

    // Auto-select room when section is selected
    useEffect(() => {
        if (data.class_section_id) {
            const selectedSection = classSections.find(s => s.id.toString() === data.class_section_id)
            if (selectedSection && selectedSection.room_id) {
                setData('room_id', selectedSection.room_id.toString())
            }
        }
    }, [data.class_section_id])

    useEffect(() => {
        if (open) {
            reset()
            setSelectedGradeLevel('')
            setData('teacher_id', teacherId.toString())
        }
    }, [open])

    const handleGradeLevelChange = (value: string) => {
        setSelectedGradeLevel(value)
        setData({
            ...data,
            grade_level_id: value,
            class_section_id: undefined,
            subject_id: undefined,
            room_id: undefined,
        })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        post('/admin/enrollment/schedules', {
            onSuccess: () => {
                onOpenChange(false)
                reset()
            }
        })
    }

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Add Schedule</DialogTitle>
                    <DialogDescription className="text-gray-600">
                        Create a new class schedule for this teacher
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-2">
                    {/* Grade Level & Section */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Class Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Grade Level <span className="text-red-500">*</span>
                                </label>
                                <Select value={selectedGradeLevel} onValueChange={handleGradeLevelChange}>
                                    <SelectTrigger className="bg-white">
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

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Section <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    value={data.class_section_id?.toString()}
                                    onValueChange={(value) => setData('class_section_id', value)}
                                    disabled={!selectedGradeLevel}
                                >
                                    <SelectTrigger className="bg-white">
                                        <SelectValue placeholder={selectedGradeLevel ? "Select section" : "Select grade level first"} />
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
                        </div>
                    </div>

                    {/* Subject & Room */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Subject & Location</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Subject <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    value={data.subject_id?.toString()}
                                    onValueChange={(value) => setData('subject_id', value)}
                                    disabled={!selectedGradeLevel}
                                >
                                    <SelectTrigger className="bg-white">
                                        <SelectValue placeholder={selectedGradeLevel ? "Select subject" : "Select grade level first"} />
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

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Room <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    value={data.room_id?.toString()}
                                    onValueChange={(value) => setData('room_id', value)}
                                    disabled={true}
                                >
                                    <SelectTrigger className="bg-gray-100">
                                        <SelectValue placeholder="Auto-assigned from section" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {rooms.map((room) => (
                                            <SelectItem key={room.id} value={room.id.toString()}>
                                                {room.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    Auto-assigned from selected section
                                </p>
                                {errors.room_id && <p className="text-xs text-red-500 mt-1">{errors.room_id}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Schedule Time */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Schedule Time</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Day <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    value={data.day_of_week?.toString()}
                                    onValueChange={(value) => setData('day_of_week', value)}
                                >
                                    <SelectTrigger className="bg-white">
                                        <SelectValue placeholder="Select day" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {days.map((day) => (
                                            <SelectItem key={day} value={day}>
                                                {day}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.day_of_week && <p className="text-xs text-red-500 mt-1">{errors.day_of_week}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Start Time <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="time"
                                    value={data.start_time}
                                    onChange={(e) => setData('start_time', e.target.value)}
                                    className="bg-white"
                                />
                                {errors.start_time && <p className="text-xs text-red-500 mt-1">{errors.start_time}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    End Time <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="time"
                                    value={data.end_time}
                                    onChange={(e) => setData('end_time', e.target.value)}
                                    className="bg-white"
                                />
                                {errors.end_time && <p className="text-xs text-red-500 mt-1">{errors.end_time}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
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
                            {processing ? 'Adding...' : 'Add Schedule'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
