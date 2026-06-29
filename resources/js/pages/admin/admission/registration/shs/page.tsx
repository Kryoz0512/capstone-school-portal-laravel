import { Head, router, usePage } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useState, useRef, useEffect } from 'react'
import { Download, Upload, FileSpreadsheet, Calendar, ArrowLeft } from 'lucide-react'
import { Link } from '@inertiajs/react'

// ── Types ────────────────────────────────────────────────────────────────────
type GradeLevel = { id: number; name: string }

type Strand = {
    id: number
    name: string
    track: string
    description: string | null
}

type Props = {
    auth?: {
        user: { id: number; name: string; email: string; role: string }
        admin?: { role: string; position: string }
    }
    gradeLevels: GradeLevel[]  // Already filtered to Grade 11 & 12 by the controller
    strands: Strand[]
}

const TRACKS: Record<string, { label: string; color: string }> = {
    academic: { label: 'Academic Track',                   color: 'blue'   },
    tvl:      { label: 'Technical-Vocational-Livelihood',  color: 'purple' },
    sports:   { label: 'Sports Track',                     color: 'orange' },
    arts:     { label: 'Arts and Design Track',            color: 'pink'   },
}

// ── DatePicker ────────────────────────────────────────────────────────────────
function DatePicker({ value, onChange }: { value: string; onChange: (val: string) => void }) {
    const [open, setOpen]   = useState(false)
    const [view, setView]   = useState<'days' | 'years'>('days')
    const [viewDate, setViewDate] = useState(() => {
        if (value?.length === 10) {
            const [mm, dd, yyyy] = value.split('/')
            return new Date(+yyyy, +mm - 1, 1)
        }
        return new Date()
    })
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const selectedDate = (() => {
        if (value?.length === 10) {
            const [mm, dd, yyyy] = value.split('/')
            return new Date(+yyyy, +mm - 1, +dd)
        }
        return null
    })()

    const year  = viewDate.getFullYear()
    const month = viewDate.getMonth()

    const monthNames = ['January','February','March','April','May','June',
                        'July','August','September','October','November','December']

    const yearGridBase  = Math.floor(year / 12) * 12
    const yearGridYears = Array.from({ length: 20 }, (_, i) => yearGridBase - 4 + i)

    const firstDay    = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const daysInPrev  = new Date(year, month, 0).getDate()

    const cells: { day: number; type: 'prev' | 'current' | 'next' }[] = []
    for (let i = firstDay - 1; i >= 0; i--)      cells.push({ day: daysInPrev - i, type: 'prev' })
    for (let d = 1; d <= daysInMonth; d++)        cells.push({ day: d,              type: 'current' })
    for (let d = 1; d <= 42 - cells.length; d++) cells.push({ day: d,              type: 'next' })

    const today = new Date()

    const selectDay = (day: number) => {
        const mm = String(month + 1).padStart(2, '0')
        const dd = String(day).padStart(2, '0')
        onChange(`${mm}/${dd}/${year}`)
        setOpen(false)
    }

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/[^0-9]/g, '')
        if (val.length >= 3) val = val.slice(0, 2) + '/' + val.slice(2)
        if (val.length >= 6) val = val.slice(0, 5) + '/' + val.slice(5, 9)
        onChange(val)
        if (val.length === 10) {
            const [mm, dd, yyyy] = val.split('/')
            const d = new Date(+yyyy, +mm - 1, 1)
            if (!isNaN(d.getTime())) setViewDate(d)
        }
    }

    return (
        <div className="relative" ref={ref}>
            <div className="relative">
                <Input
                    type="text"
                    placeholder="MM/DD/YYYY"
                    value={value}
                    onChange={handleTextChange}
                    onFocus={() => { setOpen(true); setView('days') }}
                    maxLength={10}
                    className="h-11 pr-10"
                />
                <button
                    type="button"
                    onClick={() => { setOpen(o => !o); setView('days') }}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                    <Calendar className="w-4 h-4" />
                </button>
            </div>

            {open && (
                <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-3 w-72">
                    <div className="flex items-center justify-between mb-3">
                        <button type="button" onClick={() => setViewDate(new Date(year, month - 1, 1))}
                            className="p-1 rounded hover:bg-gray-100 text-gray-600">←</button>
                        <button type="button" onClick={() => setView(v => v === 'years' ? 'days' : 'years')}
                            className="text-sm font-semibold text-gray-800 px-3 py-1 rounded hover:bg-gray-100">
                            {monthNames[month]} {year} {view === 'years' ? '▴' : '▾'}
                        </button>
                        <button type="button" onClick={() => setViewDate(new Date(year, month + 1, 1))}
                            className="p-1 rounded hover:bg-gray-100 text-gray-600">→</button>
                    </div>

                    {view === 'years' && (
                        <div className="grid grid-cols-4 gap-1 mb-3">
                            {yearGridYears.map(y => (
                                <button key={y} type="button" onClick={() => { setViewDate(new Date(y, month, 1)); setView('days') }}
                                    className={`text-sm py-1.5 rounded-lg transition-colors ${y === year ? 'bg-blue-600 text-white font-semibold' : 'hover:bg-blue-50 text-gray-700'}`}>
                                    {y}
                                </button>
                            ))}
                        </div>
                    )}

                    {view === 'days' && (
                        <>
                            <div className="grid grid-cols-7 mb-1">
                                {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                                    <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7">
                                {cells.map((cell, i) => {
                                    const isSelected = cell.type === 'current' && selectedDate &&
                                        selectedDate.getFullYear() === year && selectedDate.getMonth() === month && selectedDate.getDate() === cell.day
                                    const isToday = cell.type === 'current' && today.getFullYear() === year && today.getMonth() === month && today.getDate() === cell.day
                                    return (
                                        <button key={i} type="button" disabled={cell.type !== 'current'}
                                            onClick={() => cell.type === 'current' && selectDay(cell.day)}
                                            className={`text-center text-sm py-1.5 rounded-full mx-auto w-8 h-8 flex items-center justify-center transition-colors
                                                ${cell.type !== 'current' ? 'text-gray-300 cursor-default' : 'cursor-pointer hover:bg-blue-50'}
                                                ${isSelected ? 'bg-blue-600 text-white hover:bg-blue-700 font-semibold' : ''}
                                                ${isToday && !isSelected ? 'border border-blue-400 text-blue-600 font-semibold' : ''}`}>
                                            {cell.day}
                                        </button>
                                    )
                                })}
                            </div>
                        </>
                    )}

                    <div className="flex justify-between mt-3 pt-3 border-t border-gray-100">
                        <button type="button" onClick={() => { onChange(''); setOpen(false) }}
                            className="text-sm text-blue-600 hover:underline">Clear</button>
                        <button type="button" onClick={() => {
                            const t = new Date()
                            onChange(`${String(t.getMonth()+1).padStart(2,'0')}/${String(t.getDate()).padStart(2,'0')}/${t.getFullYear()}`)
                            setOpen(false)
                        }} className="text-sm text-blue-600 hover:underline">Today</button>
                    </div>
                </div>
            )}
        </div>
    )
}

// ── Form state type ───────────────────────────────────────────────────────────
type FormData = {
    program: string
    student_status: string
    lrn: string
    school_year: string
    gender: string
    birth_date: string
    last_name: string
    first_name: string
    middle_name: string
    suffix: string
    grade_level_id: string
    strand_id: string
    shs_year_level: string
    has_psa_birth_certificate: boolean
    has_sf9: boolean
    has_report_card: boolean
    has_good_moral: boolean
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ShsStudentRegistration({ auth, gradeLevels = [], strands = [] }: Props) {
    const [activeTab, setActiveTab]   = useState('new')
    const [startYear, setStartYear]   = useState('')
    const [endYear, setEndYear]       = useState('')
    const [searchQuery, setSearchQuery]     = useState('')
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [isSearching, setIsSearching]     = useState(false)
    const [selectedStudent, setSelectedStudent] = useState<any>(null)
    const [processing, setProcessing] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [showImportedModal, setShowImportedModal] = useState(false)
    const [importedStudents, setImportedStudents]   = useState<Array<{ lrn: string; name: string }>>([])
    const [duplicateStudents, setDuplicateStudents] = useState<Array<{ lrn: string; name: string }>>([])
    const [importErrors, setImportErrors] = useState<string[]>([])
    const [importStats, setImportStats]   = useState({ imported: 0, duplicates: 0, errors: 0 })

    const page  = usePage<any>()
    const flash = page.props.flash || {}
    // Validation errors from the server (Inertia passes these via page.props.errors)
    const serverErrors = (page.props.errors || {}) as Record<string, string>

    // ── Form state (managed manually so we can transform before submit) ──────
    const emptyForm = (): FormData => ({
        program:          'shs',
        student_status:   'new',
        lrn:              '',
        school_year:      '',
        gender:           '',
        birth_date:       '',
        last_name:        '',
        first_name:       '',
        middle_name:      '',
        suffix:           '',
        grade_level_id:   '',
        strand_id:        '',
        shs_year_level:   '',
        has_psa_birth_certificate: false,
        has_sf9:          false,
        has_report_card:  false,
        has_good_moral:   false,
    })
    const [form, setForm] = useState<FormData>(emptyForm())

    const set = (key: keyof FormData, value: any) =>
        setForm(prev => ({ ...prev, [key]: value }))

    // Group strands by track
    const strandsByTrack = strands.reduce<Record<string, Strand[]>>((acc, s) => {
        if (!acc[s.track]) acc[s.track] = []
        acc[s.track].push(s)
        return acc
    }, {})

    // ── gradeLevels comes directly from the DB (Grade 11 & Grade 12 only) ────
    // No frontend filtering needed — the controller already scopes to SHS levels.
    // We derive the shs_year_level number from the grade level name so the backend
    // receives the correct integer (11 or 12).
    const extractYearLevel = (glName: string): string => {
        const match = glName.match(/(\d+)/)
        return match ? match[1] : ''
    }

    // Sync student_status with active tab
    useEffect(() => {
        const statusMap: Record<string, string> = { new: 'new', old: 'returning', transferee: 'transferee' }
        set('student_status', statusMap[activeTab] ?? 'new')
    }, [activeTab])

    // Auto-fill school year
    useEffect(() => {
        set('school_year', startYear && endYear ? `${startYear}-${endYear}` : '')
    }, [startYear, endYear])

    // Handle import flash data
    useEffect(() => {
        const imported    = flash.imported_students   || []
        const duplicates  = flash.duplicate_students  || []
        const rowErrors   = flash.import_row_errors   || []
        const hasData     = imported.length > 0 || duplicates.length > 0 || rowErrors.length > 0
            || (flash.imported_count || 0) > 0 || (flash.duplicate_count || 0) > 0 || (flash.error_count || 0) > 0
        if (hasData) {
            setImportedStudents(imported)
            setDuplicateStudents(duplicates)
            setImportErrors(rowErrors)
            setImportStats({ imported: flash.imported_count || 0, duplicates: flash.duplicate_count || 0, errors: flash.error_count || 0 })
            setShowImportedModal(true)
        }
    }, [flash.imported_students, flash.duplicate_students, flash.import_row_errors,
        flash.imported_count, flash.duplicate_count, flash.error_count])

    const handleSearch = async (query: string) => {
        setSearchQuery(query)
        if (query.length < 2) { setSearchResults([]); return }
        setIsSearching(true)
        try {
            const res  = await fetch(`/admin/admission/registration/search-returning?search=${encodeURIComponent(query)}&program=shs`)
            const data = await res.json()
            setSearchResults(data)
        } catch { /* ignore */ }
        finally   { setIsSearching(false) }
    }

    const handleSelectStudent = (student: any) => {
        setSelectedStudent(student)
        setSearchQuery(student.name)
        setSearchResults([])

        let displayDate = ''
        if (student.birth_date) {
            const [y, m, d] = student.birth_date.split('-')
            displayDate = `${m}/${d}/${y}`
        }

        // Promote to next year level (11 → 12)
        const nextYearLevel = ((student.shs_year_level || 11) < 12) ? 12 : 12
        // Find the matching Grade 12 from the DB-sourced grade levels
        const nextGradeLevel = gradeLevels.find(g => extractYearLevel(g.name) === String(nextYearLevel))

        setForm(prev => ({
            ...prev,
            lrn:            student.lrn,
            birth_date:     displayDate,
            gender:         student.gender || '',
            strand_id:      student.strand_id ? String(student.strand_id) : '',
            grade_level_id: nextGradeLevel ? String(nextGradeLevel.id) : '',
            shs_year_level: String(nextYearLevel),
            student_status: 'returning',
            program:        'shs',
        }))
    }

    const handleGradeLevelChange = (gradeLevelId: string) => {
        const gl = gradeLevels.find(g => String(g.id) === gradeLevelId)
        const yearLevel = gl ? extractYearLevel(gl.name) : ''
        set('grade_level_id', gradeLevelId)
        set('shs_year_level', yearLevel)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setProcessing(true)

        // Convert MM/DD/YYYY → YYYY-MM-DD for Laravel
        let isoDate = form.birth_date
        if (form.birth_date?.length === 10 && form.birth_date.includes('/')) {
            const [mm, dd, yyyy] = form.birth_date.split('/')
            isoDate = `${yyyy}-${mm}-${dd}`
        }

        router.post('/admin/admission/registration/shs',
            { ...form, birth_date: isoDate },
            {
                onSuccess: () => {
                    setForm(emptyForm())
                    setStartYear('')
                    setEndYear('')
                    setActiveTab('new')
                    setSelectedStudent(null)
                    setSearchQuery('')
                },
                onFinish: () => setProcessing(false),
            }
        )
    }

    const handleCancel = () => {
        setForm(emptyForm())
        setStartYear('')
        setEndYear('')
        setActiveTab('new')
        setSelectedStudent(null)
        setSearchQuery('')
    }

    return (
        <AdminLayout user={auth?.user} admin={auth?.admin}>
            <Head title="SHS Student Registration" />

            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin/admission/registration"
                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Senior High School Registration</h1>
                            <p className="text-sm text-gray-500 mt-0.5">Register SHS students — Grades 11 &amp; 12</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button type="button" variant="outline"
                            onClick={() => window.location.href = '/admin/admission/registration/template?program=shs'}
                            className="flex items-center gap-2">
                            <FileSpreadsheet className="w-4 h-4" />
                            Download Template
                        </Button>
                        <Button type="button" variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2">
                            <Upload className="w-4 h-4" />
                            Import Students
                        </Button>
                        <div className="relative inline-block">
                            <select onChange={(e) => {
                                if (e.target.value) window.location.href = `/admin/admission/registration/export?format=${e.target.value}&program=shs`
                            }} className="appearance-none bg-green-600 hover:bg-green-700 text-white font-medium py-2 pl-4 pr-10 rounded-md cursor-pointer border-0 focus:ring-2 focus:ring-green-500">
                                <option value="">Export Students</option>
                                <option value="csv">Export as CSV</option>
                                <option value="xlsx">Export as XLSX</option>
                            </select>
                            <Download className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white" />
                        </div>
                    </div>
                </div>

                {/* ── Success flash message ── */}
                {flash.success && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                        <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm font-medium text-green-800">{flash.success}</p>
                    </div>
                )}

                {/* ── Error flash message ── */}
                {serverErrors.error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                        <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm font-medium text-red-800">{serverErrors.error}</p>
                    </div>
                )}

                <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv"
                    onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        const fd = new FormData()
                        fd.append('file', file)
                        fd.append('program', 'shs')
                        router.post('/admin/admission/registration/import', fd, {
                            onFinish: () => { if (fileInputRef.current) fileInputRef.current.value = '' },
                        })
                    }}
                    className="hidden" />

                {/* Registration Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-6 py-5">
                        <h2 className="text-xl font-bold text-gray-900">Register SHS Student</h2>
                        <p className="text-sm text-gray-600 mt-1">Fill in the student information below</p>
                    </div>

                    <div className="p-6">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-3 mb-6">
                                <TabsTrigger value="new">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                        </svg>
                                        <span>New Student</span>
                                    </div>
                                </TabsTrigger>
                                <TabsTrigger value="old">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span>Grade 11 → 12</span>
                                    </div>
                                </TabsTrigger>
                                <TabsTrigger value="transferee">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                        </svg>
                                        <span>Transferee</span>
                                    </div>
                                </TabsTrigger>
                            </TabsList>

                            {/* ── New Banner ── */}
                            <TabsContent value="new">
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4 mb-6 shadow-sm">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-blue-900 mb-1">New SHS Student (Grade 11)</p>
                                            <p className="text-sm text-blue-800">
                                                Students enrolling in SHS for the first time. They will be placed in <strong>Grade 11</strong> and must select a strand / track.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* ── Old / Returning Banner + Search ── */}
                            <TabsContent value="old">
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg p-4 mb-6 shadow-sm">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-green-900 mb-1">Grade 11 → Grade 12 Promotion</p>
                                            <p className="text-sm text-green-800">
                                                Search for an existing Grade 11 student to promote them to <strong>Grade 12</strong>. Their strand will be carried over automatically.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Search */}
                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Search Returning SHS Student <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                        <Input
                                            type="text"
                                            placeholder="Search by name or LRN..."
                                            value={searchQuery}
                                            onChange={(e) => handleSearch(e.target.value)}
                                            className="pl-10 h-11"
                                        />
                                        {isSearching && (
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                                <svg className="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    {searchResults.length > 0 && (
                                        <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                                            {searchResults.map((student) => (
                                                <button key={student.id} type="button"
                                                    onClick={() => handleSelectStudent(student)}
                                                    className="w-full text-left px-4 py-3 hover:bg-green-50 border-b border-gray-100 last:border-b-0 transition-colors">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-900">{student.name}</p>
                                                            <p className="text-xs text-gray-600">LRN: {student.lrn}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xs font-medium text-green-600">
                                                                Grade {student.shs_year_level} → Grade 12
                                                            </p>
                                                            <p className="text-xs text-gray-500">{student.strand_name}</p>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {searchQuery.length >= 2 && !searchResults.length && !isSearching && (
                                        <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                                            <p className="text-sm text-gray-600">No returning SHS students found</p>
                                        </div>
                                    )}

                                    {selectedStudent && (
                                        <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                                            <div className="flex items-start gap-2">
                                                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <div>
                                                    <p className="text-sm font-semibold text-green-900">Selected: {selectedStudent.name}</p>
                                                    <p className="text-xs text-green-700">
                                                        Currently in Grade {selectedStudent.shs_year_level} — will be promoted to Grade 12
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            {/* ── Transferee Banner ── */}
                            <TabsContent value="transferee">
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 rounded-lg p-4 mb-6 shadow-sm">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-purple-900 mb-1">Transferee SHS Student</p>
                                            <p className="text-sm text-purple-800">
                                                Students transferring from another school. Select their appropriate grade level and strand.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* ── Shared Form ── */}
                            <form onSubmit={handleSubmit} className="space-y-6">

                                {/* SHS Grade Level + Strand */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 space-y-5">
                                    <h3 className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                        SHS Program Details
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {/* 
                                            Grade Level — sourced directly from the database via props.
                                            The controller sends only Grade 11 & Grade 12 rows.
                                            Selecting a grade level also derives shs_year_level automatically.
                                        */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                                Grade Level <span className="text-red-500">*</span>
                                            </label>
                                            <Select
                                                value={form.grade_level_id}
                                                onValueChange={handleGradeLevelChange}
                                                disabled={activeTab === 'old' && !!selectedStudent}
                                            >
                                                <SelectTrigger className="h-11">
                                                    <SelectValue placeholder="Select grade level" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {gradeLevels.length === 0 ? (
                                                        <div className="px-3 py-2 text-sm text-gray-500">
                                                            No SHS grade levels found in database
                                                        </div>
                                                    ) : (
                                                        gradeLevels.map((gl) => (
                                                            <SelectItem key={gl.id} value={String(gl.id)}>
                                                                {gl.name}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            {serverErrors.grade_level_id && <p className="text-xs text-red-500 mt-1">{serverErrors.grade_level_id}</p>}
                                            {serverErrors.shs_year_level  && <p className="text-xs text-red-500 mt-1">{serverErrors.shs_year_level}</p>}
                                        </div>

                                        {/* Strand */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                                Strand <span className="text-red-500">*</span>
                                            </label>
                                            <Select
                                                value={form.strand_id}
                                                onValueChange={(v) => set('strand_id', v)}
                                                disabled={activeTab === 'old' && !!selectedStudent}
                                            >
                                                <SelectTrigger className="h-11">
                                                    <SelectValue placeholder="Select strand" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(strandsByTrack).map(([track, trackStrands]) => (
                                                        <div key={track}>
                                                            <div className="px-2 py-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                                {TRACKS[track]?.label ?? track}
                                                            </div>
                                                            {trackStrands.map((s) => (
                                                                <SelectItem key={s.id} value={String(s.id)}>
                                                                    {s.name}
                                                                    {s.description ? ` — ${s.description}` : ''}
                                                                </SelectItem>
                                                            ))}
                                                        </div>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {serverErrors.strand_id && <p className="text-xs text-red-500 mt-1">{serverErrors.strand_id}</p>}
                                            {activeTab === 'old' && selectedStudent && (
                                                <p className="text-xs text-green-700 mt-1">Strand carried over from Grade 11 record</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* LRN + School Year */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                                            Student LRN <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            type="text"
                                            placeholder="Enter 12-digit LRN"
                                            value={form.lrn}
                                            onChange={(e) => set('lrn', e.target.value.replace(/[^0-9]/g, ''))}
                                            maxLength={12}
                                            className="h-11"
                                        />
                                        {serverErrors.lrn && <p className="text-xs text-red-500 mt-1">{serverErrors.lrn}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                                            School Year <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <Input type="text" placeholder="Start year" value={startYear}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/[^0-9]/g, '')
                                                    setStartYear(val)
                                                    if (val.length === 4) setEndYear(String(parseInt(val) + 1))
                                                }}
                                                maxLength={4} className="h-11 text-center" />
                                            <span className="text-gray-500 font-semibold">-</span>
                                            <Input type="text" placeholder="End year" value={endYear}
                                                onChange={(e) => setEndYear(e.target.value.replace(/[^0-9]/g, ''))}
                                                maxLength={4} className="h-11 text-center" disabled />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Enter 4-digit start year (e.g., 2026 → auto-fills 2027)</p>
                                        {serverErrors.school_year && <p className="text-xs text-red-500 mt-1">{serverErrors.school_year}</p>}
                                    </div>
                                </div>

                                {/* Personal Information */}
                                <div className="border-t border-gray-200 pt-6">
                                    <h3 className="text-base font-semibold text-gray-900 mb-4">Personal Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-900 mb-2">Last Name <span className="text-red-500">*</span></label>
                                            <Input type="text" placeholder="Enter last name" value={form.last_name}
                                                onChange={(e) => set('last_name', e.target.value)} className="h-11" />
                                            {serverErrors.last_name && <p className="text-xs text-red-500 mt-1">{serverErrors.last_name}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-900 mb-2">First Name <span className="text-red-500">*</span></label>
                                            <Input type="text" placeholder="Enter first name" value={form.first_name}
                                                onChange={(e) => set('first_name', e.target.value)} className="h-11" />
                                            {serverErrors.first_name && <p className="text-xs text-red-500 mt-1">{serverErrors.first_name}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-900 mb-2">Middle Name</label>
                                            <Input type="text" placeholder="Optional" value={form.middle_name}
                                                onChange={(e) => set('middle_name', e.target.value)} className="h-11" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-900 mb-2">Suffix</label>
                                            <Select value={form.suffix || undefined} onValueChange={(v) => set('suffix', v)}>
                                                <SelectTrigger className="h-11"><SelectValue placeholder="None" /></SelectTrigger>
                                                <SelectContent>
                                                    {['Jr.', 'Sr.', 'II', 'III', 'IV', 'V'].map(s => (
                                                        <SelectItem key={s} value={s}>{s}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                {/* Gender + Birth Date */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">Gender <span className="text-red-500">*</span></label>
                                        <Select value={form.gender} onValueChange={(v) => set('gender', v)}>
                                            <SelectTrigger className="h-11"><SelectValue placeholder="Select gender" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="male">Male</SelectItem>
                                                <SelectItem value="female">Female</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {serverErrors.gender && <p className="text-xs text-red-500 mt-1">{serverErrors.gender}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">Date of Birth <span className="text-red-500">*</span></label>
                                        <DatePicker value={form.birth_date} onChange={(v) => set('birth_date', v)} />
                                        {serverErrors.birth_date && <p className="text-xs text-red-500 mt-1">{serverErrors.birth_date}</p>}
                                    </div>
                                </div>

                                {/* Documents */}
                                <div className="border-t border-gray-200 pt-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-base font-semibold text-gray-900">Student Documents</h3>
                                            <p className="text-xs text-gray-600">Check documents that have been submitted</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {[
                                            { key: 'has_psa_birth_certificate' as keyof FormData, label: 'PSA Birth Certificate',     desc: 'Original or certified true copy from PSA' },
                                            { key: 'has_sf9'                  as keyof FormData, label: 'Form 137 (SF9)',             desc: "Learner's Permanent Academic Record" },
                                            { key: 'has_report_card'          as keyof FormData, label: 'Form 138 (Report Card)',     desc: "Official learner's report card" },
                                            { key: 'has_good_moral'           as keyof FormData, label: 'Good Moral Certificate',     desc: 'Certificate of Good Moral Character from previous school' },
                                        ].map(({ key, label, desc }) => (
                                            <div key={key} className="bg-white border-2 border-gray-200 hover:border-gray-300 rounded-xl p-4 transition-colors">
                                                <div className="flex items-start gap-3">
                                                    <input type="checkbox" id={key}
                                                        checked={form[key] as boolean}
                                                        onChange={(e) => set(key, e.target.checked)}
                                                        className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                                                    <label htmlFor={key} className="flex-1 cursor-pointer">
                                                        <span className="text-sm font-semibold text-gray-900 block mb-1">{label}</span>
                                                        <span className="text-xs text-gray-600">{desc}</span>
                                                    </label>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-6 border-t border-gray-200">
                                    <Button type="button" variant="outline" onClick={handleCancel} className="h-11 px-6">
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing}
                                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white h-11 px-8 shadow-md">
                                        {processing ? (
                                            <div className="flex items-center gap-2">
                                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Registering...
                                            </div>
                                        ) : 'Register SHS Student'}
                                    </Button>
                                </div>
                            </form>
                        </Tabs>
                    </div>
                </div>
            </div>

            {/* Import Results Modal */}
            <Dialog open={showImportedModal} onOpenChange={setShowImportedModal}>
                <DialogContent showCloseButton={false} className="!max-w-[85vw] w-[85vw] max-h-[85vh] overflow-hidden flex flex-col">
                    <DialogHeader className="border-b pb-4 flex-shrink-0">
                        <DialogTitle className="text-2xl font-bold text-gray-900">
                            {importStats.imported === 0 && importStats.errors > 0 ? 'Import Failed'
                                : importStats.duplicates > 0 || importStats.errors > 0 ? 'Import Completed with Warnings'
                                : 'Import Successful!'}
                        </DialogTitle>
                        <DialogDescription className="text-base text-gray-600">
                            {importStats.imported} student{importStats.imported !== 1 ? 's' : ''} imported
                            {importStats.duplicates > 0 && `, ${importStats.duplicates} duplicate${importStats.duplicates !== 1 ? 's' : ''} skipped`}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto py-4 space-y-4">
                        {importedStudents.length > 0 && (
                            <div className="bg-green-50 border border-green-300 rounded-xl p-4">
                                <p className="text-sm font-semibold text-green-900 mb-3">Successfully Imported ({importedStudents.length})</p>
                                <div className="space-y-2">
                                    {importedStudents.map((s, i) => (
                                        <div key={i} className="flex items-center justify-between px-4 py-3 bg-green-100 rounded-lg">
                                            <div><p className="text-sm font-semibold text-green-900">{s.name}</p><p className="text-xs text-green-700 font-mono">LRN: {s.lrn}</p></div>
                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {duplicateStudents.length > 0 && (
                            <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4">
                                <p className="text-sm font-semibold text-yellow-900 mb-3">Duplicates Skipped ({duplicateStudents.length})</p>
                                <div className="space-y-2">
                                    {duplicateStudents.map((s, i) => (
                                        <div key={i} className="px-4 py-3 bg-yellow-100 rounded-lg">
                                            <p className="text-sm font-semibold text-yellow-900">{s.name}</p>
                                            <p className="text-xs text-yellow-700 font-mono">LRN: {s.lrn}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {importErrors.length > 0 && (
                            <div className="bg-red-50 border border-red-300 rounded-xl p-4">
                                <p className="text-sm font-semibold text-red-900 mb-2">Errors ({importErrors.length})</p>
                                <div className="space-y-1 max-h-48 overflow-y-auto">
                                    {importErrors.map((err, i) => (
                                        <p key={i} className="text-sm text-red-800 pl-3 py-1 border-l-2 border-red-400">{err}</p>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="border-t pt-4 flex justify-end flex-shrink-0">
                        <Button onClick={() => setShowImportedModal(false)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6">
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    )
}