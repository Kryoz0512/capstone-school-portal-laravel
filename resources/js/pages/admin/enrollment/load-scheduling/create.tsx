import { Head, router, useForm } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft } from 'lucide-react'
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
    code: string
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

type Teacher = {
    id: number
    name: string
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
    teacher: Teacher
    classSections: ClassSection[]
    gradeLevels: GradeLevel[]
    subjects: Subject[]
    rooms: Room[]
}

export default function CreateSchedule({ 
    auth, 
    teacher,
    classSections = [], 
    gradeLevels = [],
    subjects = [], 
    rooms = [] 
}: Props) {
    const { data, setData, post, processing, errors } = useForm({
        teacher_id: teacher.id.toString(),
        grade_level_id: undefined,
        class_section_id: undefined,
        subject_id: undefined,
        room_id: undefined,
        day: undefined,
        start_time: '',
        end_time: '',
    })

    const [selectedGradeLevel, setSelectedGradeLevel] = useState('')
    const [sectionInput, setSectionInput] = useState('')
    const [subjectInput, setSubjectInput] = useState('')
    const [showSectionDropdown, setShowSectionDropdown] = useState(false)
    const [showSubjectDropdown, setShowSubjectDropdown] = useState(false)

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

    const handleGradeLevelChange = (value: string) => {
        setSelectedGradeLevel(value)
        setData({
            ...data,
            grade_level_id: value,
            class_section_id: undefined,
            subject_id: undefined,
            room_id: undefined,
        })
        setSectionInput('')
        setSubjectInput('')
        
        // Reload subjects and sections data when grade level changes
        router.reload({ only: ['subjects', 'classSections'] })
    }

    const handleSectionInputChange = (value: string) => {
        setSectionInput(value)
        setShowSectionDropdown(true)
        
        // Try to find exact match
        const section = filteredSections.find(s => s.name.toLowerCase() === value.toLowerCase().trim())
        if (section) {
            setData('class_section_id', section.id.toString())
        } else {
            setData('class_section_id', undefined)
        }
    }

    const handleSectionSelect = (section: ClassSection) => {
        setSectionInput(section.name)
        setData('class_section_id', section.id.toString())
        setShowSectionDropdown(false)
    }

    const handleSubjectInputChange = (value: string) => {
        setSubjectInput(value)
        setShowSubjectDropdown(true)
        
        // Try to find exact match
        const subject = filteredSubjects.find(s => s.name.toLowerCase() === value.toLowerCase().trim())
        if (subject) {
            setData('subject_id', subject.id.toString())
        } else {
            setData('subject_id', undefined)
        }
    }

    const handleSubjectSelect = (subject: Subject) => {
        setSubjectInput(subject.name)
        setData('subject_id', subject.id.toString())
        setShowSubjectDropdown(false)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        post('/admin/enrollment/schedules', {
            onSuccess: () => {
                router.visit(`/admin/enrollment/load-scheduling/${teacher.id}`)
            }
        })
    }

    const handleBack = () => {
        router.visit(`/admin/enrollment/load-scheduling/${teacher.id}`)
    }

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

    return (
        <AdminLayout user={auth?.user}>
            <Head title="Add Schedule" />

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
                        <h1 className="text-2xl font-bold text-gray-900">Add Schedule</h1>
                        <p className="text-sm text-gray-600 mt-1">Create a new class schedule for {teacher.name}</p>
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
                                        value={sectionInput}
                                        onChange={(e) => handleSectionInputChange(e.target.value)}
                                        onFocus={() => setShowSectionDropdown(true)}
                                        onBlur={() => setTimeout(() => setShowSectionDropdown(false), 200)}
                                        placeholder={selectedGradeLevel ? "Enter section name" : "Select grade level first"}
                                        disabled={!selectedGradeLevel}
                                        className="bg-white"
                                    />
                                    
                                    {showSectionDropdown && filteredSections.length > 0 && (() => {
                                        const matchingSections = sectionInput 
                                            ? filteredSections.filter(section => section.name.toLowerCase().includes(sectionInput.toLowerCase())).slice(0, 5)
                                            : filteredSections.slice(0, 5);
                                        
                                        return matchingSections.length > 0 ? (
                                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-auto">
                                                {matchingSections.map((section) => (
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
                                        ) : null;
                                    })()}
                                    
                                    {errors.class_section_id && <p className="text-xs text-red-500 mt-1">{errors.class_section_id}</p>}
                                    {sectionInput && !data.class_section_id && selectedGradeLevel && (
                                        <p className="text-xs text-amber-600 mt-1">Please select a section from the suggestions</p>
                                    )}
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
                                        value={subjectInput}
                                        onChange={(e) => handleSubjectInputChange(e.target.value)}
                                        onFocus={() => setShowSubjectDropdown(true)}
                                        onBlur={() => setTimeout(() => setShowSubjectDropdown(false), 200)}
                                        placeholder={selectedGradeLevel ? "Enter subject name" : "Select grade level first"}
                                        disabled={!selectedGradeLevel}
                                        className="bg-white"
                                    />
                                    
                                    {showSubjectDropdown && filteredSubjects.length > 0 && (() => {
                                        const matchingSubjects = subjectInput
                                            ? filteredSubjects.filter(subject => 
                                                subject.name.toLowerCase().includes(subjectInput.toLowerCase()) ||
                                                subject.code.toLowerCase().includes(subjectInput.toLowerCase())
                                              )
                                            : filteredSubjects;
                                        
                                        return matchingSubjects.length > 0 ? (
                                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                                                {matchingSubjects.map((subject) => {
                                                    const gradeLevel = gradeLevels.find(g => g.id === subject.grade_level_id);
                                                    return (
                                                        <button
                                                            key={subject.id}
                                                            type="button"
                                                            onClick={() => handleSubjectSelect(subject)}
                                                            className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm border-b last:border-b-0"
                                                        >
                                                            <div className="font-medium">{subject.name}</div>
                                                            <div className="text-xs text-gray-500">
                                                                {subject.code} • {gradeLevel?.name || 'N/A'}
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        ) : null;
                                    })()}
                                    
                                    {errors.subject_id && <p className="text-xs text-red-500 mt-1">{errors.subject_id}</p>}
                                    {subjectInput && !data.subject_id && selectedGradeLevel && (
                                        <p className="text-xs text-amber-600 mt-1">Please select a subject from the suggestions</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Room <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        value={data.room_id ? rooms.find(r => r.id.toString() === data.room_id)?.name || '' : ''}
                                        placeholder="Auto-assigned from section"
                                        readOnly
                                        className="bg-gray-100 cursor-not-allowed"
                                    />
                                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                        Room is automatically assigned from the selected section
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
                                        value={data.day?.toString()}
                                        onValueChange={(value) => setData('day', value)}
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
                                    {errors.day && <p className="text-xs text-red-500 mt-1">{errors.day}</p>}
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
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t">
                        {/* Error Messages */}
                        <div className="flex-1">
                            {Object.keys(errors).length > 0 && (
                                <div className="text-sm text-red-600">
                                    {Object.values(errors).map((error, index) => (
                                        <div key={index} className="flex items-start gap-2">
                                            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                            <span>{error}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        {/* Buttons */}
                        <div className="flex gap-3">
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
                                className="bg-green-600 hover:bg-green-700"
                                disabled={processing}
                            >
                                {processing ? 'Adding...' : 'Add Schedule'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    )
}
