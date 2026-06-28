import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState, useEffect, useMemo, useRef } from 'react'
import { useForm } from '@inertiajs/react'
import { assignSection } from '@/routes/admin/enrollment/students'
import { Check, AlertCircle, Users } from 'lucide-react'

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
    room_name: string
    capacity: number
    current_students: number
    available_slots: number
    is_full: boolean
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
    const [sectionInput, setSectionInput] = useState('')
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null)
    const inputRef = useRef<HTMLDivElement>(null)

    const { data, setData, put, processing, reset } = useForm({
        grade_level_id: '',
        section_id: '',
    })

    // Check if student is a new student (Grade 7 is locked)
    const isNewStudent = student?.studentStatus === 'new'

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
                setShowSuggestions(false)
            }
        }

        if (showSuggestions) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [showSuggestions])

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
            setSectionInput('')
            setSelectedSectionId(null)
            setData('section_id', '')
        }
    }, [student, open])

    // Filter sections based on selected grade level
    const filteredSections = useMemo(() => {
        if (!selectedGradeLevel) return []
        return sections
            .filter(s => s.grade_level_id.toString() === selectedGradeLevel)
            .sort((a, b) => {
                // Sort: available sections first, then by available slots (descending)
                if (a.is_full && !b.is_full) return 1
                if (!a.is_full && b.is_full) return -1
                return b.available_slots - a.available_slots
            })
    }, [selectedGradeLevel, sections])

    // Filter suggestions based on input
    const suggestions = useMemo(() => {
        if (!sectionInput) return filteredSections
        return filteredSections.filter(s => 
            s.name.toLowerCase().includes(sectionInput.toLowerCase())
        )
    }, [sectionInput, filteredSections])

    const handleSave = () => {
        if (!student || !selectedSectionId) return

        put(assignSection.url({ student: student.id }), {
            onSuccess: () => {
                handleClose()
            },
        })
    }

    const handleClose = () => {
        setSelectedGradeLevel('')
        setSectionInput('')
        setSelectedSectionId(null)
        setShowSuggestions(false)
        reset()
        onOpenChange(false)
    }

    const handleGradeLevelChange = (value: string) => {
        setSelectedGradeLevel(value)
        setData('grade_level_id', value)
        // Reset section when grade level changes
        setSectionInput('')
        setSelectedSectionId(null)
        setData('section_id', '')
    }

    const handleSectionSelect = (section: Section) => {
        if (section.is_full) return
        
        setSectionInput(section.name)
        setSelectedSectionId(section.id)
        setData('section_id', section.id.toString())
        setShowSuggestions(false)
    }

    const selectedSection = filteredSections.find(s => s.id === selectedSectionId)

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

                    {/* Section Selection with Autocomplete */}
                    <div className="relative" ref={inputRef}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Section <span className="text-red-500">*</span>
                        </label>
                        <Input
                            type="text"
                            placeholder={selectedGradeLevel ? "Type to search sections..." : "Select grade level first"}
                            value={sectionInput}
                            onChange={(e) => {
                                setSectionInput(e.target.value)
                                setShowSuggestions(true)
                                if (!e.target.value) {
                                    setSelectedSectionId(null)
                                    setData('section_id', '')
                                }
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            disabled={!selectedGradeLevel}
                            className="w-full"
                        />
                        
                        {/* Suggestions Dropdown */}
                        {showSuggestions && selectedGradeLevel && suggestions.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {suggestions.map((section) => (
                                    <button
                                        key={section.id}
                                        type="button"
                                        onClick={() => handleSectionSelect(section)}
                                        disabled={section.is_full}
                                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                                            section.is_full ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'cursor-pointer'
                                        } ${selectedSectionId === section.id ? 'bg-blue-50' : ''}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-gray-900">{section.name}</span>
                                                    {selectedSectionId === section.id && (
                                                        <Check className="w-4 h-4 text-green-600" />
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Users className="w-3 h-3" />
                                                        {section.current_students}/{section.capacity}
                                                    </span>
                                                    <span>Room: {section.room_name}</span>
                                                </div>
                                            </div>
                                            <div className="ml-3">
                                                {section.is_full ? (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                        <AlertCircle className="w-3 h-3 mr-1" />
                                                        Full
                                                    </span>
                                                ) : section.available_slots <= 5 ? (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                        {section.available_slots} slots
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        {section.available_slots} slots
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Selected Section Info */}
                        {selectedSection && (
                            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-blue-900">Selected: {selectedSection.name}</p>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-blue-700">
                                            <span className="flex items-center gap-1">
                                                <Users className="w-3 h-3" />
                                                {selectedSection.current_students + 1}/{selectedSection.capacity} (after assignment)
                                            </span>
                                            <span>Room: {selectedSection.room_name}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedGradeLevel && suggestions.length === 0 && sectionInput && (
                            <p className="text-sm text-gray-500 mt-2">No sections found matching "{sectionInput}"</p>
                        )}
                    </div>

                    {/* Warning Message */}
                    {(!selectedGradeLevel || !selectedSectionId) && (
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
                            disabled={!selectedGradeLevel || !selectedSectionId || processing}
                        >
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
