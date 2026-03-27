import { Head, router, useForm } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Calendar, Clock, MapPin, BookOpen, User, Users } from 'lucide-react'
import { useState, useMemo } from 'react'

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

type Room = {
    id: number
    name: string
}

type GradeLevel = {
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

type Props = {
    auth?: {
        user: {
            id: number
            name: string
            email: string
            role: string
        }
    }
    gradeLevels: GradeLevel[]
    classSections: ClassSection[]
    subjects: Subject[]
    teachers: Teacher[]
    teacherSubjects: Record<number, TeacherSubjectData>
    rooms: Room[]
}

export default function AddSchedule({ 
    auth, 
    gradeLevels = [],
    classSections = [], 
    subjects = [], 
    teachers = [],
    teacherSubjects = {},
    rooms = [] 
}: Props) {
    const { data, setData, post, processing, errors } = useForm({
        grade_level_id: '',
        class_section_id: '',
        day: '',
        start_time: '',
        end_time: '',
        room_id: '',
        subject_id: '',
        teacher_id: '',
    })

    const [selectedGradeLevel, setSelectedGradeLevel] = useState('')
    const [selectedTeacher, setSelectedTeacher] = useState('')
    const [sectionSearch, setSectionSearch] = useState('')
    const [showSectionSuggestions, setShowSectionSuggestions] = useState(false)
    const [selectedSectionName, setSelectedSectionName] = useState('')
    const [roomSearch, setRoomSearch] = useState('')
    const [showRoomSuggestions, setShowRoomSuggestions] = useState(false)
    const [selectedRoomName, setSelectedRoomName] = useState('')
    const [subjectSearch, setSubjectSearch] = useState('')
    const [showSubjectSuggestions, setShowSubjectSuggestions] = useState(false)
    const [selectedSubjectName, setSelectedSubjectName] = useState('')
    const [teacherSearch, setTeacherSearch] = useState('')
    const [showTeacherSuggestions, setShowTeacherSuggestions] = useState(false)
    const [selectedTeacherName, setSelectedTeacherName] = useState('')

    // Filter sections by selected grade level
    const filteredSections = useMemo(() => {
        if (!selectedGradeLevel) return []
        if (!classSections || classSections.length === 0) return []
        return classSections.filter(s => s.grade_level_id.toString() === selectedGradeLevel)
    }, [classSections, selectedGradeLevel])

    // Filter subjects by selected grade level
    const filteredSubjects = useMemo(() => {
        if (!selectedGradeLevel) return []
        return subjects.filter(s => s.grade_level_id.toString() === selectedGradeLevel)
    }, [subjects, selectedGradeLevel])

    // Filter teachers by selected subject
    const filteredTeachers = useMemo(() => {
        if (!data.subject_id) return teachers
        
        return teachers.filter(teacher => {
            const teacherData = teacherSubjects[teacher.id]
            if (!teacherData) return false
            
            return teacherData.subjects.some(s => s.subject_id.toString() === data.subject_id)
        })
    }, [teachers, teacherSubjects, data.subject_id])

    // Filter sections by search query - show all if no search, filter if searching
    const searchedSections = useMemo(() => {
        if (!sectionSearch.trim()) return filteredSections
        return filteredSections.filter(s => 
            s.name.toLowerCase().includes(sectionSearch.toLowerCase())
        )
    }, [filteredSections, sectionSearch])

    // Filter rooms by search query
    const searchedRooms = useMemo(() => {
        if (!roomSearch.trim()) return rooms
        return rooms.filter(r => 
            r.name.toLowerCase().includes(roomSearch.toLowerCase())
        )
    }, [rooms, roomSearch])

    // Filter subjects by search query
    const searchedSubjects = useMemo(() => {
        if (!subjectSearch.trim()) return filteredSubjects
        return filteredSubjects.filter(s => 
            s.name.toLowerCase().includes(subjectSearch.toLowerCase())
        )
    }, [filteredSubjects, subjectSearch])

    // Filter teachers by search query
    const searchedTeachers = useMemo(() => {
        if (!teacherSearch.trim()) return filteredTeachers
        return filteredTeachers.filter(t => 
            t.name.toLowerCase().includes(teacherSearch.toLowerCase())
        )
    }, [filteredTeachers, teacherSearch])

    const handleGradeLevelChange = (value: string) => {
        setSelectedGradeLevel(value)
        setSectionSearch('')
        setSelectedSectionName('')
        setSubjectSearch('')
        setSelectedSubjectName('')
        setTeacherSearch('')
        setSelectedTeacherName('')
        setData({
            ...data,
            grade_level_id: value,
            class_section_id: '',
            subject_id: '',
            teacher_id: '',
        })
    }

    const handleSectionSelect = (section: ClassSection) => {
        setData('class_section_id', section.id.toString())
        setSectionSearch(section.name)
        setSelectedSectionName(section.name)
        setShowSectionSuggestions(false)
    }

    const handleSectionInputChange = (value: string) => {
        setSectionSearch(value)
        setShowSectionSuggestions(true)
        
        // Clear selection if input doesn't match
        if (value !== selectedSectionName) {
            setData('class_section_id', '')
            setSelectedSectionName('')
        }
    }

    const handleRoomSelect = (room: Room) => {
        setData('room_id', room.id.toString())
        setRoomSearch(room.name)
        setSelectedRoomName(room.name)
        setShowRoomSuggestions(false)
    }

    const handleRoomInputChange = (value: string) => {
        setRoomSearch(value)
        setShowRoomSuggestions(true)
        
        // Clear selection if input doesn't match
        if (value !== selectedRoomName) {
            setData('room_id', '')
            setSelectedRoomName('')
        }
    }

    const handleSubjectSelect = (subject: Subject) => {
        setData('subject_id', subject.id.toString())
        setSubjectSearch(subject.name)
        setSelectedSubjectName(subject.name)
        setShowSubjectSuggestions(false)
        setTeacherSearch('')
        setSelectedTeacherName('')
        setData('teacher_id', '')
    }

    const handleSubjectInputChange = (value: string) => {
        setSubjectSearch(value)
        setShowSubjectSuggestions(true)
        
        // Clear selection if input doesn't match
        if (value !== selectedSubjectName) {
            setData('subject_id', '')
            setSelectedSubjectName('')
            setTeacherSearch('')
            setSelectedTeacherName('')
            setData('teacher_id', '')
        }
    }

    const handleTeacherSelect = (teacher: Teacher) => {
        setData('teacher_id', teacher.id.toString())
        setTeacherSearch(teacher.name)
        setSelectedTeacherName(teacher.name)
        setShowTeacherSuggestions(false)
    }

    const handleTeacherInputChange = (value: string) => {
        setTeacherSearch(value)
        setShowTeacherSuggestions(true)
        
        // Clear selection if input doesn't match
        if (value !== selectedTeacherName) {
            setData('teacher_id', '')
            setSelectedTeacherName('')
        }
    }

    const handleSubjectChange = (value: string) => {
        setData({
            ...data,
            subject_id: value,
            teacher_id: '',
        })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        post('/admin/enrollment/schedules', {
            onSuccess: () => {
                router.visit('/admin/enrollment/load-scheduling')
            }
        })
    }

    const handleBack = () => {
        router.visit('/admin/enrollment/load-scheduling')
    }

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

    return (
        <AdminLayout user={auth?.user}>
            <Head title="Add Schedule" />

            <div className="space-y-6">
                {/* Header with Back Button */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBack}
                        className="hover:bg-gray-100"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Schedules
                    </Button>
                </div>

                {/* Page Title Card */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-green-600 rounded-lg">
                            <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-gray-900">Create New Schedule</h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Fill in the details below to create a new class schedule. All fields marked with an asterisk (*) are required.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Class Information Section */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-visible">
                        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-green-600" />
                                <h2 className="text-lg font-semibold text-gray-900">Class Information</h2>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">Select the grade level and section for this schedule</p>
                        </div>
                        <div className="p-6 overflow-visible">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Grade Level */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Grade Level <span className="text-red-500">*</span>
                                    </label>
                                    <Select value={selectedGradeLevel} onValueChange={handleGradeLevelChange}>
                                        <SelectTrigger className="h-11">
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

                                {/* Section */}
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Section <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="text"
                                        value={sectionSearch}
                                        onChange={(e) => handleSectionInputChange(e.target.value)}
                                        onFocus={() => setShowSectionSuggestions(true)}
                                        onBlur={() => {
                                            // Delay to allow click on suggestion
                                            setTimeout(() => setShowSectionSuggestions(false), 200)
                                        }}
                                        placeholder={selectedGradeLevel ? "Type to search section..." : "Select grade level first"}
                                        disabled={!selectedGradeLevel}
                                        className="h-11"
                                    />
                                    
                                    {/* Suggestions Dropdown - show when focused and grade level selected */}
                                    {showSectionSuggestions && selectedGradeLevel && filteredSections.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                                            {searchedSections.length > 0 ? (
                                                searchedSections.map((section) => (
                                                    <div
                                                        key={section.id}
                                                        onClick={() => handleSectionSelect(section)}
                                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                                    >
                                                        {section.name}
                                                    </div>
                                                ))
                                            ) : sectionSearch.trim() ? (
                                                <div className="px-4 py-2 text-sm text-gray-500">
                                                    No sections found matching "{sectionSearch}"
                                                </div>
                                            ) : null}
                                        </div>
                                    )}
                                    
                                    {errors.class_section_id && <p className="text-xs text-red-500 mt-1">{errors.class_section_id}</p>}
                                    {!selectedGradeLevel && (
                                        <p className="text-xs text-gray-500 mt-1">Please select a grade level first</p>
                                    )}
                                    {selectedGradeLevel && filteredSections.length === 0 && (
                                        <p className="text-xs text-yellow-600 mt-1">No sections found for this grade level</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Schedule Details Section */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-visible">
                        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-blue-600" />
                                <h2 className="text-lg font-semibold text-gray-900">Schedule Details</h2>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">Set the day, time, and location for this class</p>
                        </div>
                        <div className="p-6 overflow-visible">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Day */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Calendar className="w-4 h-4 inline mr-1" />
                                        Day <span className="text-red-500">*</span>
                                    </label>
                                    <Select value={data.day} onValueChange={(value) => setData('day', value)}>
                                        <SelectTrigger className="h-11">
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
                                    {errors.day && <p className="text-xs text-red-500 mt-1">{errors.day}</p>}
                                </div>

                                {/* Room */}
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <MapPin className="w-4 h-4 inline mr-1" />
                                        Room <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="text"
                                        value={roomSearch}
                                        onChange={(e) => handleRoomInputChange(e.target.value)}
                                        onFocus={() => setShowRoomSuggestions(true)}
                                        onBlur={() => {
                                            // Delay to allow click on suggestion
                                            setTimeout(() => setShowRoomSuggestions(false), 200)
                                        }}
                                        placeholder="Type to search room..."
                                        className="h-11"
                                    />
                                    
                                    {/* Suggestions Dropdown */}
                                    {showRoomSuggestions && rooms.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                                            {searchedRooms.length > 0 ? (
                                                searchedRooms.map((room) => (
                                                    <div
                                                        key={room.id}
                                                        onClick={() => handleRoomSelect(room)}
                                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                                    >
                                                        {room.name}
                                                    </div>
                                                ))
                                            ) : roomSearch.trim() ? (
                                                <div className="px-4 py-2 text-sm text-gray-500">
                                                    No rooms found matching "{roomSearch}"
                                                </div>
                                            ) : null}
                                        </div>
                                    )}
                                    
                                    {errors.room_id && <p className="text-xs text-red-500 mt-1">{errors.room_id}</p>}
                                </div>

                                {/* Start Time */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Clock className="w-4 h-4 inline mr-1" />
                                        Start Time <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="time"
                                        value={data.start_time}
                                        onChange={(e) => setData('start_time', e.target.value)}
                                        className="h-11"
                                    />
                                    {errors.start_time && <p className="text-xs text-red-500 mt-1">{errors.start_time}</p>}
                                </div>

                                {/* End Time */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Clock className="w-4 h-4 inline mr-1" />
                                        End Time <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="time"
                                        value={data.end_time}
                                        onChange={(e) => setData('end_time', e.target.value)}
                                        className="h-11"
                                    />
                                    {errors.end_time && <p className="text-xs text-red-500 mt-1">{errors.end_time}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Subject & Teacher Section */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-visible">
                        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                            <div className="flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-purple-600" />
                                <h2 className="text-lg font-semibold text-gray-900">Subject & Teacher Assignment</h2>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">Choose the subject and assign a qualified teacher</p>
                        </div>
                        <div className="p-6 overflow-visible">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Subject */}
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <BookOpen className="w-4 h-4 inline mr-1" />
                                        Subject <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="text"
                                        value={subjectSearch}
                                        onChange={(e) => handleSubjectInputChange(e.target.value)}
                                        onFocus={() => setShowSubjectSuggestions(true)}
                                        onBlur={() => {
                                            // Delay to allow click on suggestion
                                            setTimeout(() => setShowSubjectSuggestions(false), 200)
                                        }}
                                        placeholder={selectedGradeLevel ? "Type to search subject..." : "Select grade level first"}
                                        disabled={!selectedGradeLevel}
                                        className="h-11"
                                    />
                                    
                                    {/* Suggestions Dropdown */}
                                    {showSubjectSuggestions && selectedGradeLevel && filteredSubjects.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                                            {searchedSubjects.length > 0 ? (
                                                searchedSubjects.map((subject) => (
                                                    <div
                                                        key={subject.id}
                                                        onClick={() => handleSubjectSelect(subject)}
                                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                                    >
                                                        {subject.name}
                                                    </div>
                                                ))
                                            ) : subjectSearch.trim() ? (
                                                <div className="px-4 py-2 text-sm text-gray-500">
                                                    No subjects found matching "{subjectSearch}"
                                                </div>
                                            ) : null}
                                        </div>
                                    )}
                                    
                                    {errors.subject_id && <p className="text-xs text-red-500 mt-1">{errors.subject_id}</p>}
                                    {!selectedGradeLevel && (
                                        <p className="text-xs text-gray-500 mt-1">Please select a grade level first</p>
                                    )}
                                    {selectedGradeLevel && filteredSubjects.length === 0 && (
                                        <p className="text-xs text-yellow-600 mt-1">No subjects found for this grade level</p>
                                    )}
                                </div>

                                {/* Teacher */}
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <User className="w-4 h-4 inline mr-1" />
                                        Teacher <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="text"
                                        value={teacherSearch}
                                        onChange={(e) => handleTeacherInputChange(e.target.value)}
                                        onFocus={() => setShowTeacherSuggestions(true)}
                                        onBlur={() => {
                                            // Delay to allow click on suggestion
                                            setTimeout(() => setShowTeacherSuggestions(false), 200)
                                        }}
                                        placeholder={data.subject_id ? "Type to search teacher..." : "Select subject first"}
                                        disabled={!data.subject_id}
                                        className="h-11"
                                    />
                                    
                                    {/* Suggestions Dropdown */}
                                    {showTeacherSuggestions && data.subject_id && filteredTeachers.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                                            {searchedTeachers.length > 0 ? (
                                                searchedTeachers.map((teacher) => (
                                                    <div
                                                        key={teacher.id}
                                                        onClick={() => handleTeacherSelect(teacher)}
                                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                                    >
                                                        {teacher.name}
                                                    </div>
                                                ))
                                            ) : teacherSearch.trim() ? (
                                                <div className="px-4 py-2 text-sm text-gray-500">
                                                    No teachers found matching "{teacherSearch}"
                                                </div>
                                            ) : null}
                                        </div>
                                    )}
                                    
                                    {errors.teacher_id && <p className="text-xs text-red-500 mt-1">{errors.teacher_id}</p>}
                                    {data.subject_id && filteredTeachers.length === 0 && (
                                        <p className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            No teachers assigned to this subject
                                        </p>
                                    )}
                                    {!data.subject_id && (
                                        <p className="text-xs text-gray-500 mt-1">Please select a subject first</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500">
                                Make sure all information is correct before creating the schedule.
                            </p>
                            <div className="flex items-center gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleBack}
                                    disabled={processing}
                                    className="px-6"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-green-600 hover:bg-green-700 text-white px-8 shadow-sm"
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Calendar className="w-4 h-4 mr-2" />
                                            Create Schedule
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    )
}
