import { Head, router, useForm } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useState, useMemo, useEffect, useRef } from 'react'
import { ArrowLeft, CheckCircle2, XCircle, Save, Edit, Eye } from 'lucide-react'

type Student = {
    id: number
    lrn: string
    student_name: string
    gender: string
    section: string
    section_id: number
    grade_level: string
    grade_level_id: number
    adviser: string
    has_psa_birth_certificate: boolean
    has_sf9: boolean
    has_report_card: boolean
    has_good_moral: boolean
}

type GradeLevel = {
    id: number
    name: string
}

type Section = {
    id: number
    section_name: string
    grade_level: string
}

type Props = {
    auth?: {
        user: {
            id: number
            name: string
            email: string
            role: string
        }
        admin?: {
            role: string
            position: string
        }
    }
    student: Student
    gradeLevels: GradeLevel[]
    sections: Section[]
}

export default function StudentDetail({ auth, student, gradeLevels = [], sections = [] }: Props) {
    const [sectionInput, setSectionInput] = useState(student.section)
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)
    const sectionInputRef = useRef<HTMLDivElement>(null)

    const { data, setData, put, processing, errors } = useForm({
        grade_level_id: student.grade_level_id.toString(),
        section_id: student.section_id.toString(),
        has_psa_birth_certificate: student.has_psa_birth_certificate,
        has_sf9: student.has_sf9,
        has_report_card: student.has_report_card,
        has_good_moral: student.has_good_moral,
    })

    // Filter sections based on selected grade level and input
    const filteredSections = useMemo(() => {
        if (!data.grade_level_id) return []
        const selectedGrade = gradeLevels.find(g => g.id.toString() === data.grade_level_id)
        let filtered = sections.filter(s => s.grade_level === selectedGrade?.name)

        // Filter by input text
        if (sectionInput.trim()) {
            filtered = filtered.filter(s =>
                s.section_name.toLowerCase().includes(sectionInput.toLowerCase())
            )
        }

        return filtered
    }, [data.grade_level_id, sectionInput, gradeLevels, sections])

    const handleSectionSelect = (section: Section) => {
        setSectionInput(section.section_name)
        setData('section_id', section.id.toString())
        setShowSuggestions(false)
    }

    const handleSectionInputChange = (value: string) => {
        setSectionInput(value)
        if (!value.trim()) {
            setData('section_id', '')
        }
        setShowSuggestions(true)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        put(`/admin/enrollment/students/${student.id}/update-enrollment`, {
            onSuccess: () => {
                setIsEditMode(false)
            }
        })
    }

    const handleEditToggle = () => {
        if (isEditMode) {
            // Cancel editing - reset form to original values
            setData({
                grade_level_id: student.grade_level_id.toString(),
                section_id: student.section_id.toString(),
                has_psa_birth_certificate: student.has_psa_birth_certificate,
                has_sf9: student.has_sf9,
                has_report_card: student.has_report_card,
                has_good_moral: student.has_good_moral,
            })
            setSectionInput(student.section)
        }
        setIsEditMode(!isEditMode)
    }

    const handleBack = () => {
        router.visit(`/admin/enrollment/enrollment-list?grade_level=${student.grade_level_id}`)
    }

    // Handle click outside to close suggestions
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sectionInputRef.current && !sectionInputRef.current.contains(event.target as Node)) {
                setShowSuggestions(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <AdminLayout user={auth?.user} admin={auth?.admin}>
            <Head title={`Student Details - ${student.student_name}`} />

            <div className="space-y-6">
                {/* Header with Back Button and Edit Toggle */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            onClick={handleBack}
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to List
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Student Details</h1>
                            <p className="text-sm text-gray-500 mt-1">
                                {isEditMode ? 'Edit student enrollment information' : 'View student enrollment information'}
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={handleEditToggle}
                        variant={isEditMode ? "outline" : "default"}
                        className={`flex items-center gap-2 ${!isEditMode ? 'bg-green-600 hover:bg-green-700' : ''}`}
                    >
                        {isEditMode ? (
                            <>
                                <Eye className="w-4 h-4" />
                                Cancel Edit
                            </>
                        ) : (
                            <>
                                <Edit className="w-4 h-4" />
                                Edit Mode
                            </>
                        )}
                    </Button>
                </div>

                {/* Student Information Card */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Student Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Student Name</label>
                            <p className="text-base text-gray-900 font-medium">{student.student_name}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">LRN</label>
                            <p className="text-base text-gray-900 font-medium">{student.lrn}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Gender</label>
                            <p className="text-base text-gray-900">{student.gender}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Current Adviser</label>
                            <p className="text-base text-gray-900">
                                {student.adviser === 'Not Assigned' ? (
                                    <span className="text-gray-400 italic">{student.adviser}</span>
                                ) : (
                                    student.adviser
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Enrollment Information Section */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Enrollment Information</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Grade Level <span className="text-red-500">*</span>
                                </label>
                                {isEditMode ? (
                                    <Select
                                        value={data.grade_level_id}
                                        onValueChange={(value) => {
                                            setData('grade_level_id', value)
                                            setData('section_id', '')
                                            setSectionInput('')
                                        }}
                                    >
                                        <SelectTrigger>
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
                                ) : (
                                    <p className="text-base text-gray-900 py-2">{student.grade_level}</p>
                                )}
                                {errors.grade_level_id && (
                                    <p className="text-xs text-red-500 mt-1">{errors.grade_level_id}</p>
                                )}
                            </div>

                            <div ref={sectionInputRef} className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Section <span className="text-red-500">*</span>
                                </label>
                                {isEditMode ? (
                                    <>
                                        <Input
                                            type="text"
                                            placeholder={data.grade_level_id ? "Type to search sections..." : "Select grade level first"}
                                            value={sectionInput}
                                            onChange={(e) => handleSectionInputChange(e.target.value)}
                                            onFocus={() => setShowSuggestions(true)}
                                            disabled={!data.grade_level_id}
                                        />
                                        {showSuggestions && filteredSections.length > 0 && data.grade_level_id && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                                {filteredSections.map((section) => (
                                                    <button
                                                        key={section.id}
                                                        type="button"
                                                        onClick={() => handleSectionSelect(section)}
                                                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                                                    >
                                                        <span className="text-sm text-gray-900">{section.section_name}</span>
                                                        <span className="text-xs text-gray-500">{section.grade_level}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-base text-gray-900 py-2">{student.section}</p>
                                )}
                                {errors.section_id && (
                                    <p className="text-xs text-red-500 mt-1">{errors.section_id}</p>
                                )}
                            </div>
                        </div>

                        {isEditMode && (
                            <div className="flex justify-end pt-4 border-t">
                                <Button
                                    type="submit"
                                    className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                                    disabled={processing}
                                >
                                    <Save className="w-4 h-4" />
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        )}
                    </form>
                </div>

                {/* Document Checklist Section */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Document Checklist</h2>
                    <p className="text-sm text-gray-600 mb-6">
                        Track the submission status of required documents
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">PSA Birth Certificate</p>
                                <p className="text-xs text-gray-500 mt-1">Official birth certificate from PSA</p>
                            </div>
                            <div className="flex items-center gap-3">
                                {data.has_psa_birth_certificate ? (
                                    <div className="flex items-center gap-2 text-green-600">
                                        <CheckCircle2 className="w-6 h-6" />
                                        <span className="text-sm font-medium">Submitted</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-red-500">
                                        <XCircle className="w-6 h-6" />
                                        <span className="text-sm font-medium">Missing</span>
                                    </div>
                                )}
                                {isEditMode && (
                                    <Checkbox
                                        checked={data.has_psa_birth_certificate}
                                        onCheckedChange={(checked) => setData('has_psa_birth_certificate', checked === true)}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">Form 137 (SF10)</p>
                                <p className="text-xs text-gray-500 mt-1">Permanent record/transcript</p>
                            </div>
                            <div className="flex items-center gap-3">
                                {data.has_sf9 ? (
                                    <div className="flex items-center gap-2 text-green-600">
                                        <CheckCircle2 className="w-6 h-6" />
                                        <span className="text-sm font-medium">Submitted</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-red-500">
                                        <XCircle className="w-6 h-6" />
                                        <span className="text-sm font-medium">Missing</span>
                                    </div>
                                )}
                                {isEditMode && (
                                    <Checkbox
                                        checked={data.has_sf9}
                                        onCheckedChange={(checked) => setData('has_sf9', checked === true)}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">Form 138 (SF9)</p>
                                <p className="text-xs text-gray-500 mt-1">Report card/grades</p>
                            </div>
                            <div className="flex items-center gap-3">
                                {data.has_report_card ? (
                                    <div className="flex items-center gap-2 text-green-600">
                                        <CheckCircle2 className="w-6 h-6" />
                                        <span className="text-sm font-medium">Submitted</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-red-500">
                                        <XCircle className="w-6 h-6" />
                                        <span className="text-sm font-medium">Missing</span>
                                    </div>
                                )}
                                {isEditMode && (
                                    <Checkbox
                                        checked={data.has_report_card}
                                        onCheckedChange={(checked) => setData('has_report_card', checked === true)}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">Good Moral Certificate</p>
                                <p className="text-xs text-gray-500 mt-1">Certificate of good moral character</p>
                            </div>
                            <div className="flex items-center gap-3">
                                {data.has_good_moral ? (
                                    <div className="flex items-center gap-2 text-green-600">
                                        <CheckCircle2 className="w-6 h-6" />
                                        <span className="text-sm font-medium">Submitted</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-red-500">
                                        <XCircle className="w-6 h-6" />
                                        <span className="text-sm font-medium">Missing</span>
                                    </div>
                                )}
                                {isEditMode && (
                                    <Checkbox
                                        checked={data.has_good_moral}
                                        onCheckedChange={(checked) => setData('has_good_moral', checked === true)}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Overall Status */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-900">Overall Document Status</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {[data.has_psa_birth_certificate, data.has_sf9, data.has_report_card, data.has_good_moral].filter(Boolean).length} of 4 documents submitted
                                </p>
                            </div>
                            <div>
                                {data.has_psa_birth_certificate && data.has_sf9 && data.has_report_card && data.has_good_moral ? (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                        Complete
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                                        Incomplete
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
