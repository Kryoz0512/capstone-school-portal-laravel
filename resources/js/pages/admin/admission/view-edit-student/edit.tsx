import { Head, router, useForm } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PhoneInput } from '@/components/ui/phone-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRef, useState } from 'react'
import { update } from '@/routes/admin/admission/view-edit-student'
import { ArrowLeft, MapPin, Ruler, User, Users, Upload, Trash2, Camera } from 'lucide-react'
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import axios from 'axios'

type Student = {
    id: number
    studentName: string
    lrn: string
    gender: string
    age: number | null
    gradeLevel: string
    section: string
    schoolYear: string
    lastName: string
    firstName: string
    middleName: string | null
    birthDate: string
    profile_picture?: string | null
    profile?: {
        extensionName?: string
        religion?: string
        indigenousPeople?: string
        indigenousType?: string
        pwd?: string
        pwdType?: string
        nationality?: string
        placeOfBirth?: string
        mobileNumber?: string
        contactNumber?: string
        guardianName?: string
        relation?: string
        houseNo?: string
        cityMunicipality?: string
        provinceState?: string
        zipCode?: string
        country?: string
        height?: number
        weight?: number
        build?: string
        eyeColor?: string
        hairColor?: string
        fatherLastName?: string
        fatherFirstName?: string
        fatherMiddleName?: string
        fatherExtensionName?: string
        motherLastName?: string
        motherFirstName?: string
        motherMiddleName?: string
        motherExtensionName?: string
        guardianLastName?: string
        guardianFirstName?: string
        guardianMiddleName?: string
        guardianExtensionName?: string
    } | null
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
}

// Small presentational helpers kept local to this page so the redesign
// doesn't require new shared components.

function FieldLabel({ children }: { children: React.ReactNode }) {
    return (
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            {children}
        </label>
    )
}

function SectionCard({
    id,
    icon,
    eyebrow,
    title,
    children,
}: {
    id: string
    icon: React.ReactNode
    eyebrow: string
    title: string
    children: React.ReactNode
}) {
    return (
        <section id={id} className="scroll-mt-24 rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-700">
                    {icon}
                </div>
                <div>
                    <p className="text-xs font-semibold tracking-wide text-green-700">{eyebrow}</p>
                    <h2 className="text-base font-semibold text-slate-900">{title}</h2>
                </div>
            </div>
            <div className="space-y-6 p-6">{children}</div>
        </section>
    )
}

function YesNoToggle({
    value,
    onChange,
}: {
    value: string
    onChange: (value: string) => void
}) {
    return (
        <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
            {['No', 'Yes'].map((option) => (
                <button
                    key={option}
                    type="button"
                    onClick={() => onChange(option)}
                    className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                        value === option
                            ? 'bg-green-600 text-white shadow-sm'
                            : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                    {option}
                </button>
            ))}
        </div>
    )
}

const NAV_ITEMS = [
    { id: 'personal-info', label: "Personal Information", icon: User },
    { id: 'residence-data', label: 'Residence Data', icon: MapPin },
    { id: 'physical-description', label: 'Physical Description', icon: Ruler },
    { id: 'family-data', label: 'Family Data', icon: Users },
]

export default function EditStudentGSPIS({ auth, student }: Props) {
    const [showErrorModal, setShowErrorModal] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [profilePicture, setProfilePicture] = useState<string | null>(student.profile_picture || null)
    const [uploadingPicture, setUploadingPicture] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const fileInputRef = useRef<HTMLInputElement | null>(null)

    const { data, setData, put, processing, errors } = useForm({
        // Personal Information
        lastName: student.lastName || '',
        firstName: student.firstName || '',
        middleName: student.middleName || '',
        extensionName: student.profile?.extensionName || '',
        dateOfBirth: student.birthDate || '',
        age: student.age?.toString() || '',
        gender: student.gender || '',
        religion: student.profile?.religion || '',
        indigenousPeople: student.profile?.indigenousPeople || 'No',
        indigenousType: student.profile?.indigenousType || '',
        pwd: student.profile?.pwd || 'No',
        pwdType: student.profile?.pwdType || '',
        nationality: student.profile?.nationality || '',
        placeOfBirth: student.profile?.placeOfBirth || '',
        mobileNumber: student.profile?.mobileNumber || '',

        // Residence Data
        contactNumber: student.profile?.contactNumber || '',
        guardianName: student.profile?.guardianName || '',
        relation: student.profile?.relation || '',
        houseNo: student.profile?.houseNo || '',
        cityMunicipality: student.profile?.cityMunicipality || '',
        provinceState: student.profile?.provinceState || '',
        zipCode: student.profile?.zipCode || '',
        country: student.profile?.country || '',

        // Physical Description
        height: student.profile?.height?.toString() || '',
        weight: student.profile?.weight?.toString() || '',
        build: student.profile?.build || 'None',
        eyeColor: student.profile?.eyeColor || '',
        hairColor: student.profile?.hairColor || '',

        // Family Data - Father
        fatherLastName: student.profile?.fatherLastName || '',
        fatherFirstName: student.profile?.fatherFirstName || '',
        fatherMiddleName: student.profile?.fatherMiddleName || '',
        fatherExtensionName: student.profile?.fatherExtensionName || '',

        // Family Data - Mother
        motherLastName: student.profile?.motherLastName || '',
        motherFirstName: student.profile?.motherFirstName || '',
        motherMiddleName: student.profile?.motherMiddleName || '',
        motherExtensionName: student.profile?.motherExtensionName || '',

        // Family Data - Guardian
        guardianLastName: student.profile?.guardianLastName || '',
        guardianFirstName: student.profile?.guardianFirstName || '',
        guardianMiddleName: student.profile?.guardianMiddleName || '',
        guardianExtensionName: student.profile?.guardianExtensionName || '',
    })

    const handleSave = () => {
        // Remove dashes from phone numbers to get raw digits
        const mobileDigits = data.mobileNumber.replace(/-/g, '')
        const contactDigits = data.contactNumber.replace(/-/g, '')

        // Validate mobile number
        if (mobileDigits) {
            if (mobileDigits.length !== 11) {
                setErrorMessage('Mobile number must be exactly 11 digits.')
                setShowErrorModal(true)
                return
            }
            if (!mobileDigits.startsWith('09')) {
                setErrorMessage('Mobile number must start with 09.')
                setShowErrorModal(true)
                return
            }
        }

        // Validate contact number
        if (contactDigits) {
            if (contactDigits.length !== 11) {
                setErrorMessage('Guardian\'s contact number must be exactly 11 digits.')
                setShowErrorModal(true)
                return
            }
            if (!contactDigits.startsWith('09')) {
                setErrorMessage('Guardian\'s contact number must start with 09.')
                setShowErrorModal(true)
                return
            }
        }

        // Get the grade level from URL query parameter for redirect after save
        const urlParams = new URLSearchParams(window.location.search)
        const grade = urlParams.get('grade')

        put(update.url({ id: student.id }), {
            onSuccess: () => {
                // Redirect back with the grade level parameter if it exists
                if (grade) {
                    router.visit(`/admin/admission/view-edit-student?grade=${encodeURIComponent(grade)}`)
                } else {
                    router.visit('/admin/admission/view-edit-student')
                }
            },
            transform: (formData) => ({
                ...formData,
                build: formData.build === 'None' ? '' : formData.build,
            }),
        })
    }

    const handleCancel = () => {
        // Get the grade level from URL query parameter
        const urlParams = new URLSearchParams(window.location.search)
        const grade = urlParams.get('grade')

        // Navigate back with the grade level parameter if it exists
        if (grade) {
            router.visit(`/admin/admission/view-edit-student?grade=${encodeURIComponent(grade)}`)
        } else {
            router.visit('/admin/admission/view-edit-student')
        }
    }

    const [showOtherReligion, setShowOtherReligion] = useState(
        !['Roman Catholic', 'Islam', 'Iglesia ni Cristo', 'Protestant', ''].includes(student.profile?.religion || '')
    )

    const initials = student.studentName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0]?.toUpperCase())
        .join('')

    const handleFileChange = async (file: File | undefined) => {
        if (!file) return

        if (!file.type.startsWith('image/')) {
            setErrorMessage('Please select an image file')
            setShowErrorModal(true)
            return
        }
        if (file.size > 2 * 1024 * 1024) {
            setErrorMessage('File size must be less than 2MB')
            setShowErrorModal(true)
            return
        }

        setUploadingPicture(true)

        try {
            const formData = new FormData()
            formData.append('picture', file)
            formData.append('user_id', student.id.toString())
            formData.append('user_type', 'student')

            const response = await axios.post('/admin/admission/profile-picture/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })

            if (response.data.success) {
                setProfilePicture(response.data.profile_picture)
            }
        } catch (error: any) {
            setErrorMessage(error.response?.data?.message || 'Failed to upload profile picture')
            setShowErrorModal(true)
        } finally {
            setUploadingPicture(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const handleDeletePicture = async () => {
        setUploadingPicture(true)

        try {
            const response = await axios.delete('/admin/admission/profile-picture/delete', {
                data: { user_id: student.id, user_type: 'student' },
            })

            if (response.data.success) {
                setProfilePicture(null)
                setShowDeleteDialog(false)
            }
        } catch (error: any) {
            setErrorMessage(error.response?.data?.message || 'Failed to delete profile picture')
            setShowErrorModal(true)
        } finally {
            setUploadingPicture(false)
        }
    }

    return (
        <AdminLayout user={auth?.user} admin={auth?.admin}>
            <Head title="Edit General Student Personal Information Sheet (GSPIS)" />

            <div className="mx-auto max-w-6xl space-y-6 pb-28">
                {/* Back link */}
                <button
                    onClick={handleCancel}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to student list
                </button>

                {/* Student summary header */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-4 flex-1">
                            <div className="relative group">
                                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-green-700 text-xl font-semibold text-white overflow-hidden border-4 border-slate-100">
                                    {profilePicture ? (
                                        <img
                                            src={profilePicture}
                                            alt={student.studentName}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        initials || '?'
                                    )}
                                </div>
                                {/* Hover overlay with buttons */}
                                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="flex gap-1">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploadingPicture}
                                            className="p-2 bg-green-600 hover:bg-green-700 rounded-full text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            title={profilePicture ? 'Replace picture' : 'Upload picture'}
                                        >
                                            <Upload className="w-4 h-4" />
                                        </button>
                                        {profilePicture && (
                                            <button
                                                type="button"
                                                onClick={() => setShowDeleteDialog(true)}
                                                disabled={uploadingPicture}
                                                className="p-2 bg-red-600 hover:bg-red-700 rounded-full text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Delete picture"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {/* Loading indicator */}
                                {uploadingPicture && (
                                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60">
                                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/gif"
                                    className="hidden"
                                    onChange={(e) => handleFileChange(e.target.files?.[0])}
                                />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                                    General Student Personal Information Sheet
                                </p>
                                <h1 className="text-xl font-bold text-slate-900">{student.studentName}</h1>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                        LRN {student.lrn}
                                    </span>
                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                        {student.gradeLevel || 'No grade level'}
                                    </span>
                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                        {student.section || 'No section'}
                                    </span>
                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                        S.Y. {student.schoolYear}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
                    {/* Section navigation */}
                    <nav className="hidden lg:block">
                        <div className="sticky top-6 space-y-1 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                            <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Sections
                            </p>
                            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
                                <a
                                    key={id}
                                    href={`#${id}`}
                                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-green-50 hover:text-green-700"
                                >
                                    <Icon className="h-4 w-4" />
                                    {label}
                                </a>
                            ))}
                        </div>
                    </nav>

                    {/* Form sections */}
                    <div className="space-y-6">
                        {/* Grade Level and School Year */}
                        <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
                            <div>
                                <FieldLabel>Grade Level</FieldLabel>
                                <Input value={student.gradeLevel} readOnly className="bg-white" />
                            </div>
                            <div>
                                <FieldLabel>School Year</FieldLabel>
                                <Input value={student.schoolYear} readOnly className="bg-white" />
                            </div>
                        </div>

                        {/* I - Learner's Personal Information */}
                        <SectionCard
                            id="personal-info"
                            icon={<User className="h-4.5 w-4.5" />}
                            eyebrow="SECTION I"
                            title="Learner's Personal Information"
                        >
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                <div>
                                    <FieldLabel>Last Name</FieldLabel>
                                    <Input
                                        value={data.lastName}
                                        onChange={(e) => setData('lastName', e.target.value)}
                                        placeholder="Last Name"
                                    />
                                </div>
                                <div>
                                    <FieldLabel>First Name</FieldLabel>
                                    <Input
                                        value={data.firstName}
                                        onChange={(e) => setData('firstName', e.target.value)}
                                        placeholder="First Name"
                                    />
                                </div>
                                <div>
                                    <FieldLabel>Middle Name</FieldLabel>
                                    <Input
                                        value={data.middleName}
                                        onChange={(e) => setData('middleName', e.target.value)}
                                        placeholder="Middle Name"
                                    />
                                </div>
                                <div>
                                    <FieldLabel>Extn. Name if any</FieldLabel>
                                    <Input
                                        value={data.extensionName}
                                        onChange={(e) => setData('extensionName', e.target.value)}
                                        placeholder="Jr., Sr., III"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div>
                                    <FieldLabel>Date of Birth (mm/dd/yyyy)</FieldLabel>
                                    <Input
                                        type="date"
                                        value={data.dateOfBirth}
                                        onChange={(e) => setData('dateOfBirth', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <FieldLabel>Age</FieldLabel>
                                    <Input
                                        type="number"
                                        value={data.age}
                                        onChange={(e) => setData('age', e.target.value)}
                                        placeholder="Age"
                                    />
                                </div>
                                <div>
                                    <FieldLabel>Gender</FieldLabel>
                                    <Select value={data.gender} onValueChange={(value) => setData('gender', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Male">Male</SelectItem>
                                            <SelectItem value="Female">Female</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <FieldLabel>Religion</FieldLabel>
                                    <Select
                                        value={showOtherReligion ? 'Other' : data.religion}
                                        onValueChange={(value) => {
                                            if (value === 'Other') {
                                                setShowOtherReligion(true)
                                                setData('religion', '')
                                            } else {
                                                setShowOtherReligion(false)
                                                setData('religion', value)
                                            }
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select religion" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Roman Catholic">Roman Catholic</SelectItem>
                                            <SelectItem value="Islam">Islam</SelectItem>
                                            <SelectItem value="Iglesia ni Cristo">Iglesia ni Cristo</SelectItem>
                                            <SelectItem value="Protestant">Protestant</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {showOtherReligion && (
                                        <Input
                                            className="mt-2"
                                            value={data.religion}
                                            onChange={(e) => setData('religion', e.target.value)}
                                            placeholder="Please specify religion"
                                            autoFocus
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-4">
                                <p className="mb-3 text-sm font-medium text-slate-700">
                                    Belonging to any Indigenous People (IP) Community / Indigenous Cultural Community?
                                </p>
                                <div className="flex flex-wrap items-center gap-3">
                                    <YesNoToggle
                                        value={data.indigenousPeople}
                                        onChange={(value) => setData('indigenousPeople', value)}
                                    />
                                    <Input
                                        value={data.indigenousType}
                                        onChange={(e) => setData('indigenousType', e.target.value)}
                                        placeholder="If yes, please specify"
                                        disabled={data.indigenousPeople === 'No'}
                                        className="max-w-xs"
                                    />
                                </div>
                            </div>

                            <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-4">
                                <p className="mb-3 text-sm font-medium text-slate-700">
                                    Is the learner a person with disability (PWD)?
                                </p>
                                <div className="flex flex-wrap items-center gap-3">
                                    <YesNoToggle value={data.pwd} onChange={(value) => setData('pwd', value)} />
                                    <Select
                                        value={data.pwdType}
                                        onValueChange={(value) => setData('pwdType', value)}
                                        disabled={data.pwd === 'No'}
                                    >
                                        <SelectTrigger className="max-w-xs">
                                            <SelectValue placeholder="If yes, select disability type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Visual Impairment">Visual Impairment</SelectItem>
                                            <SelectItem value="Hearing Impairment">Hearing Impairment</SelectItem>
                                            <SelectItem value="Physical/Orthopedic Disability">
                                                Physical/Orthopedic Disability
                                            </SelectItem>
                                            <SelectItem value="Intellectual Disability">Intellectual Disability</SelectItem>
                                            <SelectItem value="Learning Disability">Learning Disability</SelectItem>
                                            <SelectItem value="Speech/Language Impairment">
                                                Speech/Language Impairment
                                            </SelectItem>
                                            <SelectItem value="Psychosocial Disability">Psychosocial Disability</SelectItem>
                                            <SelectItem value="Autism Spectrum Disorder">Autism Spectrum Disorder</SelectItem>
                                            <SelectItem value="Chronic Illness">Chronic Illness</SelectItem>
                                            <SelectItem value="Multiple Disabilities">Multiple Disabilities</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div>
                                    <FieldLabel>Nationality</FieldLabel>
                                    <Input
                                        value={data.nationality}
                                        onChange={(e) => setData('nationality', e.target.value)}
                                        placeholder="Nationality"
                                    />
                                </div>
                                <div>
                                    <FieldLabel>Place of Birth</FieldLabel>
                                    <Input
                                        value={data.placeOfBirth}
                                        onChange={(e) => setData('placeOfBirth', e.target.value)}
                                        placeholder="Place of Birth"
                                    />
                                </div>
                                <div>
                                    <FieldLabel>Mobile Number</FieldLabel>
                                    <PhoneInput
                                        value={data.mobileNumber}
                                        onChange={(value) => setData('mobileNumber', value)}
                                    />
                                </div>
                            </div>
                        </SectionCard>

                        {/* II - Learner's Residence Data */}
                        <SectionCard
                            id="residence-data"
                            icon={<MapPin className="h-4.5 w-4.5" />}
                            eyebrow="SECTION II"
                            title="Learner's Residence Data"
                        >
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <FieldLabel>Contact Number / Guardian Name</FieldLabel>
                                    <PhoneInput
                                        value={data.contactNumber}
                                        onChange={(value) => setData('contactNumber', value)}
                                    />
                                </div>
                                <div>
                                    <FieldLabel>Relation</FieldLabel>
                                    <Input
                                        value={data.relation}
                                        onChange={(e) => setData('relation', e.target.value)}
                                        placeholder="Relation"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <FieldLabel>House No./Street/Barangay</FieldLabel>
                                    <Input
                                        value={data.houseNo}
                                        onChange={(e) => setData('houseNo', e.target.value)}
                                        placeholder="House No./Street/Barangay"
                                    />
                                </div>
                                <div>
                                    <FieldLabel>City/Municipality</FieldLabel>
                                    <Input
                                        value={data.cityMunicipality}
                                        onChange={(e) => setData('cityMunicipality', e.target.value)}
                                        placeholder="City/Municipality"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div>
                                    <FieldLabel>Province/State</FieldLabel>
                                    <Input
                                        value={data.provinceState}
                                        onChange={(e) => setData('provinceState', e.target.value)}
                                        placeholder="Province/State"
                                    />
                                </div>
                                <div>
                                    <FieldLabel>Zip Code</FieldLabel>
                                    <Input
                                        value={data.zipCode}
                                        onChange={(e) => setData('zipCode', e.target.value)}
                                        placeholder="Zip Code"
                                    />
                                </div>
                                <div>
                                    <FieldLabel>Country</FieldLabel>
                                    <Input
                                        value={data.country}
                                        onChange={(e) => setData('country', e.target.value)}
                                        placeholder="Country"
                                    />
                                </div>
                            </div>
                        </SectionCard>

                        {/* III - Physical Description */}
                        <SectionCard
                            id="physical-description"
                            icon={<Ruler className="h-4.5 w-4.5" />}
                            eyebrow="SECTION III"
                            title="Physical Description"
                        >
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                                <div>
                                    <FieldLabel>Height (cms)</FieldLabel>
                                    <Input
                                        type="number"
                                        value={data.height}
                                        onChange={(e) => setData('height', e.target.value)}
                                        placeholder="Height"
                                    />
                                </div>
                                <div>
                                    <FieldLabel>Weight (kg)</FieldLabel>
                                    <Input
                                        type="number"
                                        value={data.weight}
                                        onChange={(e) => setData('weight', e.target.value)}
                                        placeholder="Weight"
                                    />
                                </div>
                                <div>
                                    <FieldLabel>Build</FieldLabel>
                                    <Select value={data.build} onValueChange={(value) => setData('build', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Build" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="None">None</SelectItem>
                                            <SelectItem value="Slim">Slim</SelectItem>
                                            <SelectItem value="Medium">Medium</SelectItem>
                                            <SelectItem value="Heavy">Heavy</SelectItem>
                                            <SelectItem value="Athletic">Athletic</SelectItem>
                                            <SelectItem value="Stocky">Stocky</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <FieldLabel>Eye Color</FieldLabel>
                                    <Input
                                        value={data.eyeColor}
                                        onChange={(e) => setData('eyeColor', e.target.value)}
                                        placeholder="Eye Color"
                                    />
                                </div>
                                <div>
                                    <FieldLabel>Hair Color</FieldLabel>
                                    <Input
                                        value={data.hairColor}
                                        onChange={(e) => setData('hairColor', e.target.value)}
                                        placeholder="Hair Color"
                                    />
                                </div>
                            </div>
                        </SectionCard>

                        {/* IV - Family Data */}
                        <SectionCard
                            id="family-data"
                            icon={<Users className="h-4.5 w-4.5" />}
                            eyebrow="SECTION IV"
                            title="Family Data"
                        >
                            {/* Father's Name */}
                            <div>
                                <p className="mb-2 text-sm font-medium text-slate-700">Father's Name</p>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                    <div>
                                        <FieldLabel>Last Name</FieldLabel>
                                        <Input
                                            value={data.fatherLastName}
                                            onChange={(e) => setData('fatherLastName', e.target.value)}
                                            placeholder="Last Name"
                                        />
                                    </div>
                                    <div>
                                        <FieldLabel>First Name</FieldLabel>
                                        <Input
                                            value={data.fatherFirstName}
                                            onChange={(e) => setData('fatherFirstName', e.target.value)}
                                            placeholder="First Name"
                                        />
                                    </div>
                                    <div>
                                        <FieldLabel>Middle Name</FieldLabel>
                                        <Input
                                            value={data.fatherMiddleName}
                                            onChange={(e) => setData('fatherMiddleName', e.target.value)}
                                            placeholder="Middle Name"
                                        />
                                    </div>
                                    <div>
                                        <FieldLabel>Extn. Name</FieldLabel>
                                        <Input
                                            value={data.fatherExtensionName}
                                            onChange={(e) => setData('fatherExtensionName', e.target.value)}
                                            placeholder="Extn. Name"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-slate-100" />

                            {/* Mother's Name */}
                            <div>
                                <p className="mb-2 text-sm font-medium text-slate-700">Mother's Name</p>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                    <div>
                                        <FieldLabel>Last Name</FieldLabel>
                                        <Input
                                            value={data.motherLastName}
                                            onChange={(e) => setData('motherLastName', e.target.value)}
                                            placeholder="Last Name"
                                        />
                                    </div>
                                    <div>
                                        <FieldLabel>First Name</FieldLabel>
                                        <Input
                                            value={data.motherFirstName}
                                            onChange={(e) => setData('motherFirstName', e.target.value)}
                                            placeholder="First Name"
                                        />
                                    </div>
                                    <div>
                                        <FieldLabel>Middle Name</FieldLabel>
                                        <Input
                                            value={data.motherMiddleName}
                                            onChange={(e) => setData('motherMiddleName', e.target.value)}
                                            placeholder="Middle Name"
                                        />
                                    </div>
                                    <div>
                                        <FieldLabel>Extn. Name</FieldLabel>
                                        <Input
                                            value={data.motherExtensionName}
                                            onChange={(e) => setData('motherExtensionName', e.target.value)}
                                            placeholder="Extn. Name"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-slate-100" />

                            {/* Legal Guardian's Name */}
                            <div>
                                <p className="mb-2 text-sm font-medium text-slate-700">Legal Guardian's Name</p>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                    <div>
                                        <FieldLabel>Last Name</FieldLabel>
                                        <Input
                                            value={data.guardianLastName}
                                            onChange={(e) => setData('guardianLastName', e.target.value)}
                                            placeholder="Last Name"
                                        />
                                    </div>
                                    <div>
                                        <FieldLabel>First Name</FieldLabel>
                                        <Input
                                            value={data.guardianFirstName}
                                            onChange={(e) => setData('guardianFirstName', e.target.value)}
                                            placeholder="First Name"
                                        />
                                    </div>
                                    <div>
                                        <FieldLabel>Middle Name</FieldLabel>
                                        <Input
                                            value={data.guardianMiddleName}
                                            onChange={(e) => setData('guardianMiddleName', e.target.value)}
                                            placeholder="Middle Name"
                                        />
                                    </div>
                                    <div>
                                        <FieldLabel>Extn. Name</FieldLabel>
                                        <Input
                                            value={data.guardianExtensionName}
                                            onChange={(e) => setData('guardianExtensionName', e.target.value)}
                                            placeholder="Extn. Name"
                                        />
                                    </div>
                                </div>
                            </div>
                        </SectionCard>
                    </div>
                </div>
            </div>

            {/* Sticky action bar */}
            <div className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <p className="text-sm text-slate-500">
                        Editing <span className="font-medium text-slate-700">{student.studentName}</span>
                    </p>
                    <div className="flex items-center gap-3">
                        <Button type="button" variant="outline" onClick={handleCancel} disabled={processing}>
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={handleSave}
                            disabled={processing}
                        >
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Error Modal */}
            <AlertDialog open={showErrorModal} onOpenChange={setShowErrorModal}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Error</AlertDialogTitle>
                        <AlertDialogDescription className="text-base text-gray-900">
                            {errorMessage}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <Button onClick={() => setShowErrorModal(false)}>OK</Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center justify-center mb-2">
                            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                        <DialogTitle className="text-center">Delete Profile Picture</DialogTitle>
                        <DialogDescription className="text-center">
                            Remove the profile picture for <strong>{student.studentName}</strong>? This action
                            cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteDialog(false)}
                            disabled={uploadingPicture}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={handleDeletePicture}
                            disabled={uploadingPicture}
                        >
                            {uploadingPicture ? 'Deleting...' : 'Delete Picture'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    )
}