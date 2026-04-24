import { Head, useForm, router, usePage } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useState, useRef, useEffect } from 'react'
import { store } from '@/routes/admin/admission/registration'
import { Download, Upload, FileSpreadsheet, CheckCircle2 } from 'lucide-react'

type GradeLevel = {
    id: number
    name: string
}

type ImportedStudent = {
    name: string
    lrn: string
    age: number
    date_of_birth: string
    status: string
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
    gradeLevels: GradeLevel[]
}

export default function StudentRegistration({ auth, gradeLevels = [] }: Props) {
    const [activeTab, setActiveTab] = useState('new')
    const [studentStatus, setStudentStatus] = useState('')
    const [gradeLevel, setGradeLevel] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [showImportedModal, setShowImportedModal] = useState(false)
    const [importedStudents, setImportedStudents] = useState<ImportedStudent[]>([])
    const [importErrors, setImportErrors] = useState<string[]>([])
    const [startYear, setStartYear] = useState('')
    const [endYear, setEndYear] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [selectedStudent, setSelectedStudent] = useState<any>(null)
    
    const page = usePage<any>()
    const flash = page.props.flash || {}

    // Search for returning students
    const handleSearch = async (query: string) => {
        setSearchQuery(query)
        if (query.length < 2) {
            setSearchResults([])
            return
        }

        setIsSearching(true)
        try {
            const response = await fetch(`/admin/admission/registration/search-returning?search=${encodeURIComponent(query)}`)
            const data = await response.json()
            setSearchResults(data)
        } catch (error) {
            console.error('Search error:', error)
        } finally {
            setIsSearching(false)
        }
    }

    // Select a returning student
    const handleSelectStudent = (student: any) => {
        setSelectedStudent(student)
        setSearchQuery(student.name)
        setSearchResults([])
        
        // Get next grade level
        const currentGradeNumber = parseInt(student.current_grade_level.replace('Grade ', ''))
        const nextGradeNumber = currentGradeNumber + 1
        const nextGradeLevel = gradeLevels.find(g => g.name === `Grade ${nextGradeNumber}`)
        
        // Pre-fill form with student data
        setData({
            ...data,
            lrn: student.lrn,
            grade_level_id: nextGradeLevel ? nextGradeLevel.id.toString() : '',
            birth_date: student.birth_date || '',
            gender: student.gender || '',
            student_status: 'returning',
        })
    }

    // Update school_year when start or end year changes
    useEffect(() => {
        if (startYear && endYear) {
            setData('school_year', `${startYear}-${endYear}`)
        } else {
            setData('school_year', '')
        }
    }, [startYear, endYear])

    useEffect(() => {
        console.log('Flash data:', flash)
        console.log('Imported students:', flash.imported_students)
        console.log('Import errors:', flash.import_errors)
        
        // Show modal if there are imported students OR errors
        if ((flash.imported_students && flash.imported_students.length > 0) || (flash.import_errors && flash.import_errors.length > 0)) {
            setImportedStudents(flash.imported_students || [])
            setImportErrors(flash.import_errors || [])
            setShowImportedModal(true)
        }
    }, [flash])

    const { data, setData, post, processing, errors, reset } = useForm({
        student_status: '',
        lrn: '',
        school_year: '',
        gender: '',
        birth_date: '',
        last_name: '',
        first_name: '',
        middle_name: '',
        suffix: '',
        grade_level_id: '',
        has_psa_birth_certificate: false,
        has_sf9: false,
        has_report_card: false,
        has_good_moral: false,
    })

    // Update student_status based on active tab
    useEffect(() => {
        if (activeTab === 'new') {
            setData('student_status', 'new')
            setStudentStatus('new')
        } else if (activeTab === 'old') {
            setData('student_status', 'returning')
            setStudentStatus('returning')
        } else if (activeTab === 'transferee') {
            setData('student_status', 'transferee')
            setStudentStatus('transferee')
        }
    }, [activeTab])

    // Determine if grade level dropdown should be shown
    const showGradeLevelDropdown = activeTab === 'transferee' || activeTab === 'old'

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        post(store.url(), {
            onSuccess: () => {
                reset()
                setStudentStatus('')
                setGradeLevel('')
                setStartYear('')
                setEndYear('')
                // Reset to new tab after successful submission
                setActiveTab('new')
            }
        })
    }

    const handleCancel = () => {
        reset()
        setStudentStatus('')
        setGradeLevel('')
        setStartYear('')
        setEndYear('')
        setActiveTab('new')
    }

    const handleExport = () => {
        window.location.href = '/admin/admission/registration/export'
    }

    const handleImportClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            console.log('Uploading file:', file.name)
            const formData = new FormData()
            formData.append('file', file)
            
            router.post('/admin/admission/registration/import', formData, {
                onSuccess: (page) => {
                    console.log('Import success:', page)
                    if (fileInputRef.current) {
                        fileInputRef.current.value = ''
                    }
                },
                onError: (errors) => {
                    console.log('Import errors:', errors)
                    if (fileInputRef.current) {
                        fileInputRef.current.value = ''
                    }
                }
            })
        }
    }

    const handleDownloadTemplate = () => {
        window.location.href = '/admin/admission/registration/template'
    }

    return (
        <AdminLayout user={auth?.user} admin={auth?.admin}>
            <Head title="Student Registration" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Student Registration</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Register new students with their information
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleDownloadTemplate}
                            className="flex items-center gap-2"
                        >
                            <FileSpreadsheet className="w-4 h-4" />
                            Download Template
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleImportClick}
                            className="flex items-center gap-2"
                        >
                            <Upload className="w-4 h-4" />
                            Import Students
                        </Button>
                        <div className="relative inline-block">
                            <select
                                onChange={(e) => {
                                    const format = e.target.value
                                    window.location.href = `/admin/admission/registration/export?format=${format}`
                                }}
                                className="appearance-none bg-green-600 hover:bg-green-700 text-white font-medium py-2 pl-4 pr-10 rounded-md cursor-pointer flex items-center gap-2 border-0 focus:ring-2 focus:ring-green-500"
                            >
                                <option value="">Export Students</option>
                                <option value="csv">Export as CSV</option>
                                <option value="xlsx">Export as XLSX</option>
                            </select>
                            <Download className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white" />
                        </div>
                    </div>
                </div>

                {/* Show success message */}
                {flash.success && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-800">{flash.success}</p>
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileChange}
                    className="hidden"
                />

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200 px-6 py-5">
                        <h2 className="text-xl font-bold text-gray-900">Register Student</h2>
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
                                        <span>Old Student</span>
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

                            <TabsContent value="new">
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg p-4 mb-6 shadow-sm">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-green-900 mb-1">New Student Registration</p>
                                            <p className="text-sm text-green-800">
                                                New students will be automatically registered for <strong>Grade 7</strong>. They are first-time enrollees in the school system.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="old">
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4 mb-6 shadow-sm">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-blue-900 mb-1">Returning Student Registration</p>
                                            <p className="text-sm text-blue-800">
                                                Old students are <strong>returning students</strong> who were previously enrolled in this school. Search for the student below to continue their enrollment.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Search Bar for Returning Students */}
                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Search Returning Student <span className="text-red-500">*</span>
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
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    {/* Search Results Dropdown */}
                                    {searchResults.length > 0 && (
                                        <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                                            {searchResults.map((student) => {
                                                const currentGradeNumber = parseInt(student.current_grade_level.replace('Grade ', ''))
                                                const nextGrade = `Grade ${currentGradeNumber + 1}`
                                                
                                                return (
                                                    <button
                                                        key={student.id}
                                                        type="button"
                                                        onClick={() => handleSelectStudent(student)}
                                                        className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1">
                                                                <p className="text-sm font-semibold text-gray-900">{student.name}</p>
                                                                <p className="text-xs text-gray-600">LRN: {student.lrn}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-xs font-medium text-blue-600">
                                                                    {student.current_grade_level} → {nextGrade}
                                                                </p>
                                                                <p className="text-xs text-gray-500">{student.school_year}</p>
                                                            </div>
                                                        </div>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    )}

                                    {searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
                                        <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                                            <p className="text-sm text-gray-600">No returning students found</p>
                                        </div>
                                    )}

                                    {selectedStudent && (
                                        <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                                            <div className="flex items-start gap-2">
                                                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-blue-900">Selected: {selectedStudent.name}</p>
                                                    <p className="text-xs text-blue-700">
                                                        Graduated from {selectedStudent.current_grade_level}, will be enrolled in Grade {parseInt(selectedStudent.current_grade_level.replace('Grade ', '')) + 1}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="transferee">
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 rounded-lg p-4 mb-6 shadow-sm">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-purple-900 mb-1">Transferee Student Registration</p>
                                            <p className="text-sm text-purple-800">
                                                Transferee students are <strong>coming from another school</strong>. Please select their appropriate grade level based on their previous records.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {showGradeLevelDropdown && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                        <label className="block text-sm font-semibold text-gray-900 mb-3">
                                            Grade Level <span className="text-red-500">*</span>
                                        </label>
                                        <Select value={data.grade_level_id} onValueChange={(value) => setData('grade_level_id', value)}>
                                            <SelectTrigger className="h-11">
                                                <SelectValue placeholder="Select grade level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {gradeLevels.map((grade) => (
                                                    <SelectItem key={grade.id} value={grade.id.toString()}>
                                                        {grade.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.grade_level_id && <p className="text-xs text-red-500 mt-2">{errors.grade_level_id}</p>}
                                    </div>
                                )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Student LRN <span className="text-red-500">*</span>
                                </label>
                                <Input 
                                    type="text" 
                                    placeholder="Enter 12-digit LRN"
                                    value={data.lrn}
                                    onChange={(e) => setData('lrn', e.target.value)}
                                    onInput={(e) => {
                                        const target = e.target as HTMLInputElement;
                                        target.value = target.value.replace(/[^0-9]/g, '');
                                    }}
                                    maxLength={12}
                                    className="h-11"
                                />
                                {errors.lrn && <p className="text-xs text-red-500 mt-2">{errors.lrn}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    School Year <span className="text-red-500">*</span>
                                </label>
                                <div className="flex items-center gap-3">
                                    <Input 
                                        type="text" 
                                        placeholder="Start year"
                                        value={startYear}
                                        onChange={(e) => setStartYear(e.target.value)}
                                        onInput={(e) => {
                                            const target = e.target as HTMLInputElement;
                                            target.value = target.value.replace(/[^0-9]/g, '');
                                        }}
                                        maxLength={4}
                                        className="h-11 text-center"
                                    />
                                    <span className="text-gray-500 font-semibold">-</span>
                                    <Input 
                                        type="text" 
                                        placeholder="End year"
                                        value={endYear}
                                        onChange={(e) => setEndYear(e.target.value)}
                                        onInput={(e) => {
                                            const target = e.target as HTMLInputElement;
                                            target.value = target.value.replace(/[^0-9]/g, '');
                                        }}
                                        maxLength={4}
                                        className="h-11 text-center"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Enter 4-digit years (e.g., 2026 - 2027)</p>
                                {errors.school_year && <p className="text-xs text-red-500 mt-2">{errors.school_year}</p>}
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-6">
                            <h3 className="text-base font-semibold text-gray-900 mb-4">Personal Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Last Name <span className="text-red-500">*</span>
                                    </label>
                                    <Input 
                                        type="text" 
                                        placeholder="Enter last name"
                                        value={data.last_name}
                                        onChange={(e) => setData('last_name', e.target.value)}
                                        className="h-11"
                                    />
                                    {errors.last_name && <p className="text-xs text-red-500 mt-2">{errors.last_name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        First Name <span className="text-red-500">*</span>
                                    </label>
                                    <Input 
                                        type="text" 
                                        placeholder="Enter first name"
                                        value={data.first_name}
                                        onChange={(e) => setData('first_name', e.target.value)}
                                        className="h-11"
                                    />
                                    {errors.first_name && <p className="text-xs text-red-500 mt-2">{errors.first_name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Middle Name
                                    </label>
                                    <Input 
                                        type="text" 
                                        placeholder="Enter middle name (optional)"
                                        value={data.middle_name}
                                        onChange={(e) => setData('middle_name', e.target.value)}
                                        className="h-11"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Suffix
                                    </label>
                                    <Select value={data.suffix || undefined} onValueChange={(value) => setData('suffix', value)}>
                                        <SelectTrigger className="h-11">
                                            <SelectValue placeholder="None" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Jr.">Jr.</SelectItem>
                                            <SelectItem value="Sr.">Sr.</SelectItem>
                                            <SelectItem value="II">II</SelectItem>
                                            <SelectItem value="III">III</SelectItem>
                                            <SelectItem value="IV">IV</SelectItem>
                                            <SelectItem value="V">V</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Gender <span className="text-red-500">*</span>
                                </label>
                                <Select value={data.gender} onValueChange={(value) => setData('gender', value)}>
                                    <SelectTrigger className="h-11">
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.gender && <p className="text-xs text-red-500 mt-2">{errors.gender}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Date of Birth <span className="text-red-500">*</span>
                                </label>
                                <Input 
                                    type="date"
                                    value={data.birth_date}
                                    onChange={(e) => setData('birth_date', e.target.value)}
                                    className="h-11"
                                />
                                {errors.birth_date && <p className="text-xs text-red-500 mt-2">{errors.birth_date}</p>}
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-6">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-gray-900">
                                        Student Documents
                                    </h3>
                                    <p className="text-xs text-gray-600">Check the documents that have been submitted (can be submitted as follow-up)</p>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-4 mb-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mt-0.5">
                                        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-amber-900 mb-1">Document Requirements</p>
                                        <div className="text-xs text-amber-800 space-y-1">
                                            {activeTab === 'new' && (
                                                <p>• At least one: <strong>Form 138 (SF9)</strong> or <strong>Report Card</strong></p>
                                            )}
                                            {activeTab === 'transferee' && (
                                                <>
                                                    <p>• At least one: <strong>Form 138 (SF9)</strong> or <strong>Report Card</strong></p>
                                                    <p>• <strong>Good Moral Certificate</strong> is required for transferees</p>
                                                </>
                                            )}
                                            {activeTab === 'old' && (
                                                <>
                                                    <p>• <strong>PSA Birth Certificate</strong> is required</p>
                                                    <p>• At least one: <strong>Form 138 (SF9)</strong> or <strong>Report Card</strong></p>
                                                    <p>• <strong>Good Moral Certificate</strong> is required</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* PSA Birth Certificate - Required for Returning Students */}
                                <div className={`bg-white border-2 rounded-xl p-4 transition-colors ${
                                    activeTab === 'old' 
                                        ? 'border-red-300 bg-gradient-to-br from-red-50 to-pink-50' 
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}>
                                    <div className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            id="psa_birth_certificate"
                                            checked={data.has_psa_birth_certificate}
                                            onChange={(e) => setData('has_psa_birth_certificate', e.target.checked)}
                                            className={`mt-1 h-5 w-5 rounded border-gray-300 cursor-pointer ${
                                                activeTab === 'old' ? 'text-red-600 focus:ring-red-500' : 'text-gray-600 focus:ring-gray-500'
                                            }`}
                                        />
                                        <label htmlFor="psa_birth_certificate" className="flex-1 cursor-pointer">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-semibold text-gray-900">PSA Birth Certificate</span>
                                                {activeTab === 'old' && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                        Required
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-600">Original or certified true copy from PSA</p>
                                        </label>
                                    </div>
                                    {errors.has_psa_birth_certificate && (
                                        <p className="text-xs text-red-500 mt-2 ml-8">{errors.has_psa_birth_certificate}</p>
                                    )}
                                </div>

                                {/* Academic Records Section */}
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                        <span className="text-sm font-semibold text-blue-900">Academic Records</span>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            At least one required
                                        </span>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        {/* Form 138 (SF9) */}
                                        <div className="bg-white rounded-lg p-3 border border-blue-200">
                                            <div className="flex items-start gap-3">
                                                <input
                                                    type="checkbox"
                                                    id="sf9"
                                                    checked={data.has_sf9}
                                                    onChange={(e) => setData('has_sf9', e.target.checked)}
                                                    className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                />
                                                <label htmlFor="sf9" className="flex-1 cursor-pointer">
                                                    <span className="text-sm font-medium text-gray-900">Form 138 (SF9)</span>
                                                    <p className="text-xs text-gray-600 mt-0.5">Learner's Permanent Academic Record</p>
                                                </label>
                                            </div>
                                        </div>

                                        {/* OR Divider */}
                                        <div className="flex items-center justify-center">
                                            <div className="flex-1 border-t border-blue-300"></div>
                                            <span className="px-3 text-xs font-bold text-blue-700 bg-blue-100 rounded-full py-1">OR</span>
                                            <div className="flex-1 border-t border-blue-300"></div>
                                        </div>

                                        {/* Report Card */}
                                        <div className="bg-white rounded-lg p-3 border border-blue-200">
                                            <div className="flex items-start gap-3">
                                                <input
                                                    type="checkbox"
                                                    id="report_card"
                                                    checked={data.has_report_card}
                                                    onChange={(e) => setData('has_report_card', e.target.checked)}
                                                    className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                />
                                                <label htmlFor="report_card" className="flex-1 cursor-pointer">
                                                    <span className="text-sm font-medium text-gray-900">Report Card</span>
                                                    <p className="text-xs text-gray-600 mt-0.5">Latest report card from previous school</p>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    {errors.has_sf9 && <p className="text-xs text-red-500 mt-2">{errors.has_sf9}</p>}
                                    {errors.has_report_card && <p className="text-xs text-red-500 mt-2">{errors.has_report_card}</p>}
                                </div>

                                {/* Good Moral Certificate - Required for Transferees and Returning Students */}
                                <div className={`bg-white border-2 rounded-xl p-4 transition-colors ${
                                    activeTab === 'transferee' || activeTab === 'old'
                                        ? 'border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50' 
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}>
                                    <div className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            id="good_moral"
                                            checked={data.has_good_moral}
                                            onChange={(e) => setData('has_good_moral', e.target.checked)}
                                            className={`mt-1 h-5 w-5 rounded border-gray-300 cursor-pointer ${
                                                activeTab === 'transferee' || activeTab === 'old' 
                                                    ? 'text-purple-600 focus:ring-purple-500' 
                                                    : 'text-gray-600 focus:ring-gray-500'
                                            }`}
                                        />
                                        <label htmlFor="good_moral" className="flex-1 cursor-pointer">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-semibold text-gray-900">Good Moral Certificate</span>
                                                {(activeTab === 'transferee' || activeTab === 'old') && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                        Required
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-600">Certificate of Good Moral Character from previous school</p>
                                        </label>
                                    </div>
                                    {errors.has_good_moral && (
                                        <p className="text-xs text-red-500 mt-2 ml-8">{errors.has_good_moral}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-6 border-t border-gray-200">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={handleCancel}
                                className="h-11 px-6"
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white h-11 px-8 shadow-md"
                                disabled={processing}
                            >
                                {processing ? (
                                    <div className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Registering...</span>
                                    </div>
                                ) : (
                                    'Register Student'
                                )}
                            </Button>
                        </div>
                    </form>
                </Tabs>
                    </div>
                </div>
            </div>

            {/* Imported Students Modal */}
            <Dialog open={showImportedModal} onOpenChange={setShowImportedModal}>
                <DialogContent showCloseButton={false} className="!max-w-[85vw] w-[85vw] max-h-[85vh] overflow-hidden flex flex-col">
                    <DialogHeader className="border-b pb-4 flex-shrink-0">
                        <div className="flex items-start">
                            <div className="flex-1">
                                <DialogTitle className="text-2xl font-bold text-gray-900 mb-1">
                                    {importedStudents.length === 0 && importErrors.length > 0 
                                        ? 'Import Failed' 
                                        : importErrors.length > 0 
                                            ? 'Import Completed with Warnings' 
                                            : 'Import Successful!'}
                                </DialogTitle>
                                <DialogDescription className="text-base text-gray-600">
                                    {importedStudents.length === 0 && importErrors.length > 0 ? (
                                        <>No students were imported. All {importErrors.length} record{importErrors.length !== 1 ? 's were' : ' was'} skipped.</>
                                    ) : importErrors.length > 0 ? (
                                        <>
                                            Successfully imported {importedStudents.length} student{importedStudents.length !== 1 ? 's' : ''}, 
                                            but {importErrors.length} record{importErrors.length !== 1 ? 's were' : ' was'} skipped
                                        </>
                                    ) : (
                                        <>Successfully imported {importedStudents.length} student{importedStudents.length !== 1 ? 's' : ''} into the system</>
                                    )}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto py-4">
                        {/* Show errors if any */}
                        {importErrors.length > 0 && (
                            <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-300 rounded-xl p-4 mb-6 shadow-sm">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-red-900 mb-2">
                                            {importedStudents.length === 0 
                                                ? 'Students That Could Not Be Imported:' 
                                                : 'Some Students Could Not Be Imported:'}
                                        </p>
                                        <div className="space-y-2">
                                            {importErrors.map((error, index) => (
                                                <p key={index} className="text-sm text-red-800 pl-3 py-2 border-l-2 border-red-400 bg-red-50 rounded-r">
                                                    {error}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {importedStudents.length > 0 && (
                            <>
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6 shadow-sm">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-blue-900 mb-1">Next Steps</p>
                                            <p className="text-sm text-blue-800">
                                                These students are now registered and can be found in the <span className="font-semibold">"Students Not Enrolled"</span> section. You can assign them to sections during the enrollment phase.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                        Student Name
                                                    </th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                        LRN
                                                    </th>
                                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                        Age
                                                    </th>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                        Date of Birth
                                                    </th>
                                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                        Status
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 bg-white">
                                                {importedStudents.map((student, index) => (
                                                    <tr 
                                                        key={index} 
                                                        className="hover:bg-gray-50 transition-colors duration-150"
                                                    >
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                                                                    {student.name.split(',')[0].charAt(0)}{student.name.split(',')[1]?.trim().charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-900">{student.name}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-sm font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded">
                                                                {student.lrn}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className="text-sm font-medium text-gray-900">{student.age}</span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-sm text-gray-700">{student.date_of_birth}</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                                                                student.status === 'New' 
                                                                    ? 'bg-gradient-to-r from-green-400 to-green-500 text-white' 
                                                                    : 'bg-gradient-to-r from-blue-400 to-blue-500 text-white'
                                                            }`}>
                                                                {student.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="border-t pt-4 flex items-center justify-between flex-shrink-0">
                        <div className="text-sm text-gray-600">
                            {importedStudents.length > 0 && (
                                <>
                                    <span className="font-semibold text-green-700">{importedStudents.length}</span> student{importedStudents.length !== 1 ? 's' : ''} imported successfully
                                </>
                            )}
                            {importErrors.length > 0 && (
                                <>
                                    {importedStudents.length > 0 && <span className="mx-2">•</span>}
                                    <span className="font-semibold text-red-700">{importErrors.length}</span> record{importErrors.length !== 1 ? 's' : ''} skipped
                                </>
                            )}
                        </div>
                        <Button 
                            onClick={() => setShowImportedModal(false)} 
                            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md px-6"
                        >
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    )
}
