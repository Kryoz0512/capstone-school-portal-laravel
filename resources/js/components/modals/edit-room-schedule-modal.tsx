import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Pencil, Clock, BookOpen, User, Users, AlertCircle, GraduationCap } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'

type GradeLevel = { id: number; name: string }
type ClassSection = { id: number; name: string; grade_level_id: number }
type Subject = { id: number; name: string; grade_level_id: number }
type Teacher = { id: number; name: string }
type TeacherSubjectData = { subjects: { subject_id: number; subject_name: string; grade_level_id: number }[] }

type ScheduleToEdit = {
    id: number
    class_section_id: number
    grade_level_id: number | null
    subject_id: number
    teacher_id: number
    day: string
    start_time: string
    end_time: string
    section: string
    subject: string
    teacher: string
} | null

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    roomId: number
    schedule: ScheduleToEdit
    gradeLevels: GradeLevel[]
    classSections: ClassSection[]
    subjects: Subject[]
    teachers: Teacher[]
    teacherSubjects: Record<number, TeacherSubjectData>
    onSuccess: () => void
}

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

export default function EditRoomScheduleModal({
    open, onOpenChange, roomId, schedule, gradeLevels, classSections, subjects, teachers, teacherSubjects, onSuccess,
}: Props) {
    const [gradeLevelId, setGradeLevelId] = useState('')
    const [classSectionId, setClassSectionId] = useState('')
    const [sectionSearch, setSectionSearch] = useState('')
    const [showSectionSuggestions, setShowSectionSuggestions] = useState(false)

    const [subjectId, setSubjectId] = useState('')
    const [subjectSearch, setSubjectSearch] = useState('')
    const [showSubjectSuggestions, setShowSubjectSuggestions] = useState(false)

    const [teacherId, setTeacherId] = useState('')
    const [teacherSearch, setTeacherSearch] = useState('')
    const [showTeacherSuggestions, setShowTeacherSuggestions] = useState(false)

    const [day, setDay] = useState('')
    const [startTime, setStartTime] = useState('')
    const [endTime, setEndTime] = useState('')

    const [errors, setErrors] = useState<Record<string, string>>({})
    const [processing, setProcessing] = useState(false)

    useEffect(() => {
        if (schedule) {
            setGradeLevelId(schedule.grade_level_id?.toString() || '')
            setClassSectionId(schedule.class_section_id.toString())
            setSectionSearch(schedule.section)
            setSubjectId(schedule.subject_id.toString())
            setSubjectSearch(schedule.subject)
            setTeacherId(schedule.teacher_id.toString())
            setTeacherSearch(schedule.teacher)
            setDay(schedule.day)
            setStartTime(schedule.start_time)
            setEndTime(schedule.end_time)
            setErrors({})
        }
    }, [schedule])

    const filteredSections = useMemo(() => {
        if (!gradeLevelId) return []
        return classSections.filter(s => s.grade_level_id.toString() === gradeLevelId)
    }, [classSections, gradeLevelId])

    const filteredSubjects = useMemo(() => {
        if (!gradeLevelId) return []
        return subjects.filter(s => s.grade_level_id.toString() === gradeLevelId)
    }, [subjects, gradeLevelId])

    const filteredTeachers = useMemo(() => {
        if (!subjectId) return []
        return teachers.filter(t => {
            const data = teacherSubjects[t.id]
            return data && data.subjects.some(s => s.subject_id.toString() === subjectId)
        })
    }, [teachers, teacherSubjects, subjectId])

    const searchedSections = sectionSearch.trim()
        ? filteredSections.filter(s => s.name.toLowerCase().includes(sectionSearch.toLowerCase()))
        : filteredSections

    const searchedSubjects = subjectSearch.trim()
        ? filteredSubjects.filter(s => s.name.toLowerCase().includes(subjectSearch.toLowerCase()))
        : filteredSubjects

    const searchedTeachers = teacherSearch.trim()
        ? filteredTeachers.filter(t => t.name.toLowerCase().includes(teacherSearch.toLowerCase()))
        : filteredTeachers

    const handleGradeLevelChange = (value: string) => {
        setGradeLevelId(value)
        setClassSectionId('')
        setSectionSearch('')
        setSubjectId('')
        setSubjectSearch('')
        setTeacherId('')
        setTeacherSearch('')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!schedule) return
        setProcessing(true)
        setErrors({})

        try {
            await axios.put(`/admin/enrollment/schedules/${schedule.id}`, {
                class_section_id: classSectionId,
                subject_id: subjectId,
                teacher_id: teacherId,
                room_id: roomId,
                day_of_week: day,
                start_time: startTime,
                end_time: endTime,
            })
            onOpenChange(false)
            onSuccess()
        } catch (error: any) {
            if (error.response?.status === 422) {
                const raw = error.response.data.errors || {}
                const flat: Record<string, string> = {}
                Object.keys(raw).forEach(key => { flat[key] = Array.isArray(raw[key]) ? raw[key][0] : raw[key] })
                setErrors(flat)
            } else {
                setErrors({ general: 'Something went wrong. Please try again.' })
            }
        } finally {
            setProcessing(false)
        }
    }

    const conflictError = errors.start_time || errors.end_time || errors.room_id || errors.general

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl w-full max-h-[90vh] overflow-y-auto p-0 gap-0">
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
                    <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-blue-600 rounded-lg shrink-0">
                            <Pencil className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg">Edit Schedule</DialogTitle>
                            <DialogDescription className="mt-0.5">Update this class schedule</DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-5">
                        {conflictError && (
                            <div className="flex gap-2 items-start bg-red-50 border border-red-200 rounded-lg p-3">
                                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                                <p className="text-sm text-red-700">{conflictError}</p>
                            </div>
                        )}

                        {/* Class Information */}
                        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5" />
                                Class Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        <GraduationCap className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
                                        Grade Level <span className="text-red-500">*</span>
                                    </label>
                                    <Select value={gradeLevelId} onValueChange={handleGradeLevelChange}>
                                        <SelectTrigger className="h-10 bg-white"><SelectValue placeholder="Select grade level" /></SelectTrigger>
                                        <SelectContent>
                                            {gradeLevels.map(level => (
                                                <SelectItem key={level.id} value={level.id.toString()}>{level.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.grade_level_id && <p className="text-xs text-red-500 mt-1">{errors.grade_level_id}</p>}
                                </div>

                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Section <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        value={sectionSearch}
                                        onChange={(e) => { setSectionSearch(e.target.value); setClassSectionId(''); setShowSectionSuggestions(true) }}
                                        onFocus={() => setShowSectionSuggestions(true)}
                                        onBlur={() => setTimeout(() => setShowSectionSuggestions(false), 200)}
                                        placeholder={gradeLevelId ? 'Search section...' : 'Select grade level first'}
                                        disabled={!gradeLevelId}
                                        className="h-10 bg-white"
                                    />
                                    {showSectionSuggestions && searchedSections.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-auto">
                                            {searchedSections.map(section => (
                                                <div key={section.id}
                                                    onClick={() => { setClassSectionId(section.id.toString()); setSectionSearch(section.name); setShowSectionSuggestions(false) }}
                                                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                                >
                                                    {section.name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {errors.class_section_id && <p className="text-xs text-red-500 mt-1">{errors.class_section_id}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Subject & Teacher */}
                        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                                <BookOpen className="w-3.5 h-3.5" />
                                Subject & Teacher
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Subject <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        value={subjectSearch}
                                        onChange={(e) => { setSubjectSearch(e.target.value); setSubjectId(''); setTeacherId(''); setTeacherSearch(''); setShowSubjectSuggestions(true) }}
                                        onFocus={() => setShowSubjectSuggestions(true)}
                                        onBlur={() => setTimeout(() => setShowSubjectSuggestions(false), 200)}
                                        placeholder={gradeLevelId ? 'Search subject...' : 'Select grade level first'}
                                        disabled={!gradeLevelId}
                                        className="h-10 bg-white"
                                    />
                                    {showSubjectSuggestions && searchedSubjects.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-auto">
                                            {searchedSubjects.map(subject => (
                                                <div key={subject.id}
                                                    onClick={() => { setSubjectId(subject.id.toString()); setSubjectSearch(subject.name); setShowSubjectSuggestions(false); setTeacherId(''); setTeacherSearch('') }}
                                                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                                >
                                                    {subject.name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {errors.subject_id && <p className="text-xs text-red-500 mt-1">{errors.subject_id}</p>}
                                </div>

                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        <User className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
                                        Teacher <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        value={teacherSearch}
                                        onChange={(e) => { setTeacherSearch(e.target.value); setTeacherId(''); setShowTeacherSuggestions(true) }}
                                        onFocus={() => setShowTeacherSuggestions(true)}
                                        onBlur={() => setTimeout(() => setShowTeacherSuggestions(false), 200)}
                                        placeholder={subjectId ? 'Search teacher...' : 'Select subject first'}
                                        disabled={!subjectId}
                                        className="h-10 bg-white"
                                    />
                                    {showTeacherSuggestions && searchedTeachers.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-auto">
                                            {searchedTeachers.map(teacher => (
                                                <div key={teacher.id}
                                                    onClick={() => { setTeacherId(teacher.id.toString()); setTeacherSearch(teacher.name); setShowTeacherSuggestions(false) }}
                                                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                                >
                                                    {teacher.name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {errors.teacher_id && <p className="text-xs text-red-500 mt-1">{errors.teacher_id}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Schedule Time */}
                        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                Schedule Time
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Day <span className="text-red-500">*</span>
                                    </label>
                                    <Select value={day} onValueChange={setDay}>
                                        <SelectTrigger className="h-10 bg-white"><SelectValue placeholder="Day" /></SelectTrigger>
                                        <SelectContent>
                                            {days.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    {errors.day_of_week && <p className="text-xs text-red-500 mt-1">{errors.day_of_week}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Start Time <span className="text-red-500">*</span>
                                    </label>
                                    <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="h-10 bg-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        End Time <span className="text-red-500">*</span>
                                    </label>
                                    <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="h-10 bg-white" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-lg">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={processing}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 shadow-sm"
                            disabled={processing || !classSectionId || !subjectId || !teacherId || !day || !startTime || !endTime}
                        >
                            {processing ? 'Updating...' : 'Update Schedule'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}