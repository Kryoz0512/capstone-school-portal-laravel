import { Head, router, useForm } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState, useMemo, useEffect, useRef } from 'react'
import { ArrowLeft, CheckCircle2, XCircle, Save, FileText } from 'lucide-react'

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

// Document requirements are declared once so the checklist and the
// completion seal always stay in sync.
const DOCUMENT_FIELDS = (student: Student) => [
    {
        key: 'has_psa_birth_certificate',
        label: 'PSA Birth Certificate',
        description: 'Official birth certificate from the PSA',
        submitted: student.has_psa_birth_certificate,
    },
    {
        key: 'has_sf9',
        label: 'Form 137 (SF10)',
        description: 'Permanent record / transcript',
        submitted: student.has_sf9,
    },
    {
        key: 'has_report_card',
        label: 'Form 138 (SF9)',
        description: 'Report card / grades',
        submitted: student.has_report_card,
    },
    {
        key: 'has_good_moral',
        label: 'Good Moral Certificate',
        description: 'Certificate of good moral character',
        submitted: student.has_good_moral,
    },
]

function initials(name: string) {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('')
}

export default function StudentDetail({ auth, student, gradeLevels = [], sections = [] }: Props) {
    const [sectionInput, setSectionInput] = useState(student.section)
    const [showSuggestions, setShowSuggestions] = useState(false)
    const sectionInputRef = useRef<HTMLDivElement>(null)

    const { data, setData, put, processing, errors, reset } = useForm({
        grade_level_id: student.grade_level_id.toString(),
        section_id: student.section_id.toString(),
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
        put(`/admin/enrollment/students/${student.id}/assign-section`, {
            onSuccess: () => {
                // Stay on the same page after successful update
            }
        })
    }

    const handleBack = () => {
        router.visit('/admin/enrollment/enrollment-list')
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

    const documents = DOCUMENT_FIELDS(student)
    const submittedCount = documents.filter((d) => d.submitted).length
    const isComplete = submittedCount === documents.length

    // Radial "seal" progress geometry
    const radius = 30
    const circumference = 2 * Math.PI * radius
    const progressOffset = circumference * (1 - submittedCount / documents.length)

    return (
        <AdminLayout user={auth?.user} admin={auth?.admin}>
            <Head title={`Student Details - ${student.student_name}`} />

            <div className="space-y-6 pb-12">
                {/* Back navigation */}
                <button
                    onClick={handleBack}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to enrollment list
                </button>

                {/* Record header */}
                <div className="relative overflow-hidden rounded-xl text-white shadow-sm">
                    <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_top_right,white,transparent_55%)]" />
                    <div className="relative flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between bg-white shadow-sm ring-1 ring-slate-200">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-green-700 ring-1 ring-white/25 text-lg font-semibold text-white">
                                {initials(student.student_name)}
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase tracking-widest text-slate-500">
                                    Student Record
                                </p>
                                <h1 className=" text-2xl font-semibold text-slate-900">
                                    {student.student_name}
                                </h1>
                                <p className="mt-1 text-sm text-slate-900">
                                    {student.grade_level} &middot; {student.section}
                                </p>
                            </div>
                        </div>

                        {/* LRN plate */}
                        <div className="rounded-lg bg-white/10 px-4 py-3 ring-1 ring-white/20 sm:text-right">
                            <p className="text-[11px] font-medium uppercase tracking-widest text-slate-500">
                                Learner Reference No.
                            </p>
                            <p className="font-mono text-lg tracking-[0.2em] text-slate-900">
                                {student.lrn}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Student Information Card */}
                <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                        Student Information
                    </h2>
                    <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
                        <div>
                            <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                Student Name
                            </dt>
                            <dd className="mt-1 text-sm font-medium text-slate-900">{student.student_name}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                LRN
                            </dt>
                            <dd className="mt-1 font-mono text-sm text-slate-900">{student.lrn}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                Gender
                            </dt>
                            <dd className="mt-1 text-sm text-slate-900">{student.gender}</dd>
                        </div>
                        <div>
                            <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                Current Adviser
                            </dt>
                            <dd className="mt-1 text-sm text-slate-900">
                                {student.adviser === 'Not Assigned' ? (
                                    <span className="italic text-slate-400">Not assigned</span>
                                ) : (
                                    student.adviser
                                )}
                            </dd>
                        </div>
                    </dl>
                </section>

                {/* Edit Enrollment Section */}
                <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                        Edit Enrollment
                    </h2>
                    <form onSubmit={handleSubmit} className="mt-4 space-y-5">
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Grade Level <span className="text-rose-600">*</span>
                                </label>
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
                                {errors.grade_level_id && (
                                    <p className="mt-1.5 text-xs text-rose-600">{errors.grade_level_id}</p>
                                )}
                            </div>

                            <div ref={sectionInputRef} className="relative">
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Section <span className="text-rose-600">*</span>
                                </label>
                                <Input
                                    type="text"
                                    placeholder={data.grade_level_id ? "Type to search sections..." : "Select grade level first"}
                                    value={sectionInput}
                                    onChange={(e) => handleSectionInputChange(e.target.value)}
                                    onFocus={() => setShowSuggestions(true)}
                                    disabled={!data.grade_level_id}
                                />
                                {showSuggestions && filteredSections.length > 0 && data.grade_level_id && (
                                    <div className="absolute z-10 mt-1.5 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                                        {filteredSections.map((section) => (
                                            <button
                                                key={section.id}
                                                type="button"
                                                onClick={() => handleSectionSelect(section)}
                                                className="flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-slate-50"
                                            >
                                                <span className="text-sm text-slate-900">{section.section_name}</span>
                                                <span className="text-xs text-slate-400">{section.grade_level}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {errors.section_id && (
                                    <p className="mt-1.5 text-xs text-rose-600">{errors.section_id}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end border-t border-slate-100 pt-5">
                            <Button
                                type="submit"
                                className="flex items-center gap-2 bg-green-700 text-white hover:bg-green-800"
                                disabled={processing}
                            >
                                <Save className="w-4 h-4" />
                                {processing ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </section>

                {/* Document Checklist Section */}
                <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                                Document Checklist
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Submission status of required enrollment documents
                            </p>
                        </div>

                        {/* Seal-style completion ring */}
                        <div className="flex shrink-0 items-center gap-3 self-start">
                            <div className="relative h-16 w-16">
                                <svg viewBox="0 0 72 72" className="h-16 w-16 -rotate-90">
                                    <circle cx="36" cy="36" r={radius} fill="none" stroke="#E2E8F0" strokeWidth="6" />
                                    <circle
                                        cx="36"
                                        cy="36"
                                        r={radius}
                                        fill="none"
                                        stroke={isComplete ? '#047857' : '#B45309'}
                                        strokeWidth="6"
                                        strokeLinecap="round"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={progressOffset}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center font-serif text-sm font-semibold text-slate-800">
                                    {submittedCount}/{documents.length}
                                </div>
                            </div>
                            <span
                                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ${
                                    isComplete
                                        ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                                        : 'bg-amber-50 text-amber-700 ring-amber-200'
                                }`}
                            >
                                {isComplete ? 'Complete' : 'Incomplete'}
                            </span>
                        </div>
                    </div>

                    <div className="mt-6 divide-y divide-slate-100 border-t border-slate-100">
                        {documents.map((doc) => (
                            <div key={doc.key} className="flex items-center justify-between gap-4 py-4">
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ${
                                            doc.submitted
                                                ? 'bg-emerald-50 ring-emerald-200'
                                                : 'bg-slate-50 ring-slate-200'
                                        }`}
                                    >
                                        <FileText
                                            className={`h-4 w-4 ${doc.submitted ? 'text-emerald-600' : 'text-slate-400'}`}
                                        />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">{doc.label}</p>
                                        <p className="text-xs text-slate-500">{doc.description}</p>
                                    </div>
                                </div>

                                {doc.submitted ? (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        Submitted
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 ring-1 ring-rose-200">
                                        <XCircle className="h-3.5 w-3.5" />
                                        Missing
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </AdminLayout>
    )
}