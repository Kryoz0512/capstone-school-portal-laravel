import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useForm } from '@inertiajs/react'
import { update } from '@/routes/admin/enrollment/schedules'
import { useEffect } from 'react'

type ClassSection = {
    id: number
    name: string
    grade_level: string
}

type Subject = {
    id: number
    name: string
}

type Teacher = {
    id: number
    name: string
}

type Room = {
    id: number
    name: string
}

type Schedule = {
    id: number
    class_section_id: number
    subject_id: number
    teacher_id: number
    room_id: number | null
    day: string
    start_time: string
    end_time: string
}

type EditScheduleModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    schedule: Schedule | null
    classSections: ClassSection[]
    subjects: Subject[]
    teachers?: Teacher[]
    rooms: Room[]
}

export default function EditScheduleModal({ 
    open, 
    onOpenChange, 
    schedule,
    classSections = [], 
    subjects = [], 
    teachers = [], 
    rooms = [] 
}: EditScheduleModalProps) {
    const { data, setData, put, processing, errors, reset } = useForm({
        class_section_id: undefined,
        subject_id: undefined,
        teacher_id: undefined,
        room_id: undefined,
        day_of_week: undefined,
        start_time: '',
        end_time: ''
    })

    useEffect(() => {
        if (schedule) {
            setData({
                class_section_id: schedule.class_section_id.toString(),
                subject_id: schedule.subject_id.toString(),
                teacher_id: schedule.teacher_id.toString(),
                room_id: schedule.room_id ? schedule.room_id.toString() : '',
                day_of_week: schedule.day,
                start_time: schedule.start_time,
                end_time: schedule.end_time
            })
        }
    }, [schedule])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (schedule) {
            put(update.url({ schedule: schedule.id }), {
                onSuccess: () => {
                    onOpenChange(false)
                    reset()
                }
            })
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Edit Schedule</DialogTitle>
                    <DialogDescription className="text-gray-600">
                        Update the class schedule information
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 mt-2">
                    {/* Class Information */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Class Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Section <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    value={data.class_section_id?.toString()}
                                    onValueChange={(value) => setData('class_section_id', value)}
                                >
                                    <SelectTrigger className="bg-white">
                                        <SelectValue placeholder="Select section" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classSections.map((section) => (
                                            <SelectItem key={section.id} value={section.id.toString()}>
                                                {section.name} - {section.grade_level}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.class_section_id && <p className="text-xs text-red-500 mt-1">{errors.class_section_id}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Subject <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    value={data.subject_id?.toString()}
                                    onValueChange={(value) => setData('subject_id', value)}
                                >
                                    <SelectTrigger className="bg-white">
                                        <SelectValue placeholder="Select subject" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subjects.map((subject) => (
                                            <SelectItem key={subject.id} value={subject.id.toString()}>
                                                {subject.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.subject_id && <p className="text-xs text-red-500 mt-1">{errors.subject_id}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Teacher & Location */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Teacher & Location</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {teachers.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Teacher <span className="text-red-500">*</span>
                                    </label>
                                    <Select
                                        value={data.teacher_id?.toString()}
                                        onValueChange={(value) => setData('teacher_id', value)}
                                    >
                                        <SelectTrigger className="bg-white">
                                            <SelectValue placeholder="Select teacher" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {teachers.map((teacher) => (
                                                <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                                    {teacher.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.teacher_id && <p className="text-xs text-red-500 mt-1">{errors.teacher_id}</p>}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Room
                                </label>
                                <Select
                                    value={data.room_id?.toString()}
                                    onValueChange={(value) => setData('room_id', value)}
                                >
                                    <SelectTrigger className="bg-white">
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
                    </div>

                    {/* Schedule Time */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Schedule Time</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Day of Week <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    value={data.day_of_week?.toString()}
                                    onValueChange={(value) => setData('day_of_week', value)}
                                >
                                    <SelectTrigger className="bg-white">
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

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Start Time <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="time"
                                    required
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
                                    required
                                    value={data.end_time}
                                    onChange={(e) => setData('end_time', e.target.value)}
                                    className="bg-white"
                                />
                                {errors.end_time && <p className="text-xs text-red-500 mt-1">{errors.end_time}</p>}
                            </div>
                        </div>
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
                            {processing ? 'Updating...' : 'Update Schedule'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
