import { Head, router, useForm } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft } from 'lucide-react'
import { useState, useMemo } from 'react'
import { update } from '@/routes/admin/enrollment/schedules'

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

type GradeLevel = {
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
    class_section_name: string
    subject_id: number
    subject_name: string
    teacher_id: number
    room_id: number | null
    room_name: string
    grade_level_id: number | null
    day: string
    start_time: string
    end_time: string
}

type Props = {
    auth?: {
        user: {
            id: number
            name: string
            email: string
            role: string
        }
    }
    schedule: Schedule
    teacher: Teacher
    classSections: ClassSection[]
    gradeLevels: GradeLevel[]
    subjects: Subject[]
    rooms: Room[]
}

export default function EditSchedule({ 
    auth, 
    schedule,
    teacher,
    classSections = [],
    gradeLevels = [],
    subjects = [], 
    rooms = [] 
}: Props) {
    // Debug: Log the schedule data
    console.log('Schedule data:', schedule)
    console.log('Start time:', schedule?.start_time)
    console.log('End time:', schedule?.end_time)
    
    // Format time from HH:MM:SS to HH:MM for time input
    const formatTime = (time: string | null | undefined): string => {
        if (!time) return ''
        // If already in HH:MM format, return as is
        if (time.length === 5) return time
        // If in HH:MM:SS format, extract HH:MM
        if (time.length >= 5) return time.substring(0, 5)
        return time
    }

    const { data, setData, put, processing, errors } = useForm({
        grade_level_id: schedule?.grade_level_id?.toString() || '',
        class_section_id: schedule?.class_section_id?.toString() || '',
        section_search: schedule?.class_section_name || '',
        subject_id: schedule?.subject_id?.toString() || '',
        subject_search: schedule?.subject_name || '',
        teacher_id: schedule?.teacher_id?.toString() || '',
        room_id: schedule?.room_id?.toString() || '',
        room_search: schedule?.room_name || '',
        day_of_week: schedule?.day || '',
        start_time: formatTime(schedule?.start_time),
        end_time: formatTime(schedule?.end_time)
    })
    
    console.log('Form data:', data)

    const [selectedGradeLevel, setSelectedGradeLevel] = useState(schedule?.grade_level_id?.toString() || '')
    const [isSearchingSection, setIsSearchingSection] = useState(false)
    const [isSearchingSubject, setIsSearchingSubject] = useState(false)
    const [isSearchingRoom, setIsSearchingRoom] = useState(false)

    // Filter sections by selected grade level and search
    const filteredSections = useMemo(() => {
        if (!selectedGradeLevel || !isSearchingSection || !data.section_search) return []
        let sections = classSections.filter(s => s.grade_level_id.toString() === selectedGradeLevel)
        sections = sections.filter(s => 
            s.name.toLowerCase().includes(data.section_search.toLowerCase())
        )
        return sections.slice(0, 5)
    }, [classSections, selectedGradeLevel, data.section_search, isSearchingSection])

    // Filter subjects by selected grade level and search
    const filteredSubjects = useMemo(() => {
        if (!selectedGradeLevel || !isSearchingSubject || !data.subject_search) return []
        let subjs = subjects.filter(s => s.grade_level_id.toString() === selectedGradeLevel)
        subjs = subjs.filter(s => 
            s.name.toLowerCase().includes(data.subject_search.toLowerCase())
        )
        return subjs.slice(0, 5)
    }, [subjects, selectedGradeLevel, data.subject_search, isSearchingSubject])

    // Filter rooms by search
    const filteredRooms = useMemo(() => {
        if (!isSearchingRoom || !data.room_search) return []
        return rooms.filter(r => 
            r.name.toLowerCase().includes(data.room_search.toLowerCase())
        ).slice(0, 5)
    }, [rooms, data.room_search, isSearchingRoom])

    const handleGradeLevelChange = (value: string) => {
        setSelectedGradeLevel(value)
        setData({
            ...data,
            grade_level_id: value,
            class_section_id: '',
            section_search: '',
            subject_id: '',
            subject_search: '',
        })
        setIsSearchingSection(false)
        setIsSearchingSubject(false)
    }

    const handleSectionSelect = (section: ClassSection) => {
        setData({
            ...data,
            class_section_id: section.id.toString(),
            section_search: section.name
        })
        setIsSearchingSection(false)
    }

    const handleSubjectSelect = (subject: Subject) => {
        setData({
            ...data,
            subject_id: subject.id.toString(),
            subject_search: subject.name
        })
        setIsSearchingSubject(false)
    }

    const handleRoomSelect = (room: Room) => {
        setData({
            ...data,
            room_id: room.id.toString(),
            room_search: room.name
        })
        setIsSearchingRoom(false)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        
        // Prepare data for submission (remove search fields)
        const submitData = {
            class_section_id: data.class_section_id,
            subject_id: data.subject_id,
            teacher_id: data.teacher_id,
            room_id: data.room_id,
            day_of_week: data.day_of_week,
            start_time: data.start_time,
            end_time: data.end_time
        }
        
        put(update.url({ schedule: schedule.id }), {
            data: submitData,
            onSuccess: () => {
                router.visit(`/admin/enrollment/load-scheduling/${teacher.id}`)
            }
        })
    }

    const handleBack = () => {
        router.visit(`/admin/enrollment/load-scheduling/${teacher.id}`)
    }

    return (
        <AdminLayout user={auth?.user}>
            <Head title="Edit Schedule" />

            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBack}
                        className="hover:bg-gray-100"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Edit Schedule</h1>
                        <p className="text-sm text-gray-600 mt-1">Update the class schedule for {teacher.name}</p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="p-6 space-y-6">
                        {/* Class Information */}
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

                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Section <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        value={data.section_search}
                                        onChange={(e) => {
                                            setData('section_search', e.target.value)
                                            setIsSearchingSection(true)
                                        }}
                                        onFocus={() => setIsSearchingSection(true)}
                                        onBlur={() => setTimeout(() => setIsSearchingSection(false), 200)}
                                        placeholder={selectedGradeLevel ? "Search section..." : "Select grade level first"}
                                        disabled={!selectedGradeLevel}
                                        className="bg-white"
                                    />
                                    
                                    {filteredSections.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-auto">
                                            {filteredSections.map((section) => (
                                                <button
                                                    key={section.id}
                                                    type="button"
                                                    onClick={() => handleSectionSelect(section)}
                                                    className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm border-b last:border-b-0"
                                                >
                                                    <div className="font-medium">{section.name}</div>
                                                    <div className="text-xs text-gray-500">{section.grade_level}</div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    
                                    {errors.class_section_id && <p className="text-xs text-red-500 mt-1">{errors.class_section_id}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Subject & Location */}
                        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Subject & Location</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Subject <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        value={data.subject_search}
                                        onChange={(e) => {
                                            setData('subject_search', e.target.value)
                                            setIsSearchingSubject(true)
                                        }}
                                        onFocus={() => setIsSearchingSubject(true)}
                                        onBlur={() => setTimeout(() => setIsSearchingSubject(false), 200)}
                                        placeholder={selectedGradeLevel ? "Search subject..." : "Select grade level first"}
                                        disabled={!selectedGradeLevel}
                                        className="bg-white"
                                    />
                                    
                                    {filteredSubjects.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-auto">
                                            {filteredSubjects.map((subject) => (
                                                <button
                                                    key={subject.id}
                                                    type="button"
                                                    onClick={() => handleSubjectSelect(subject)}
                                                    className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm border-b last:border-b-0"
                                                >
                                                    {subject.name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    
                                    {errors.subject_id && <p className="text-xs text-red-500 mt-1">{errors.subject_id}</p>}
                                </div>

                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Room
                                    </label>
                                    <Input
                                        value={data.room_search}
                                        onChange={(e) => {
                                            setData('room_search', e.target.value)
                                            setIsSearchingRoom(true)
                                        }}
                                        onFocus={() => setIsSearchingRoom(true)}
                                        onBlur={() => setTimeout(() => setIsSearchingRoom(false), 200)}
                                        placeholder="Search room..."
                                        className="bg-white"
                                    />
                                    
                                    {filteredRooms.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-auto">
                                            {filteredRooms.map((room) => (
                                                <button
                                                    key={room.id}
                                                    type="button"
                                                    onClick={() => handleRoomSelect(room)}
                                                    className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm border-b last:border-b-0"
                                                >
                                                    {room.name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    
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
                                        value={data.day_of_week}
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
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleBack}
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
            </div>
        </AdminLayout>
    )
}
