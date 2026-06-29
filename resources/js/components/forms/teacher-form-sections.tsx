import { Input } from '@/components/ui/input'
import { PhoneInput } from '@/components/ui/phone-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BookOpen, CalendarDays, Check, IdCard, Lock, MapPin, Phone, User, X } from 'lucide-react'
import { useState } from 'react'

export const TEACHER_POSITIONS = [
    'Teacher I',
    'Teacher II',
    'Teacher III',
    'Master Teacher I',
    'Master Teacher II',
] as const

type Subject = { name: string }

export function SectionHeading({
    icon: Icon,
    title,
    description,
}: {
    icon: React.ComponentType<{ className?: string }>
    title: string
    description?: string
}) {
    return (
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
            <div className="flex items-center gap-2">
                <Icon className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            </div>
            {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
    )
}

export function SubjectMultiSelect({
    subjects,
    selectedSubjects,
    onChange,
    error,
}: {
    subjects: Subject[]
    selectedSubjects: string[]
    onChange: (subjects: string[]) => void
    error?: string
}) {
    const [dropdownOpen, setDropdownOpen] = useState(false)

    const uniqueSubjects = Array.from(new Map(subjects.map((s) => [s.name, s])).values()).sort((a, b) =>
        a.name.localeCompare(b.name),
    )

    const toggleSubject = (name: string) => {
        onChange(
            selectedSubjects.includes(name)
                ? selectedSubjects.filter((s) => s !== name)
                : [...selectedSubjects, name],
        )
    }

    const removeSubject = (name: string) => {
        onChange(selectedSubjects.filter((s) => s !== name))
    }

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-gray-400" /> Subject(s){' '}
                <span className="text-red-500">*</span>
            </label>

            {selectedSubjects.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                    {selectedSubjects.map((s) => (
                        <span
                            key={s}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                        >
                            {s}
                            <button type="button" onClick={() => removeSubject(s)} className="hover:text-green-600">
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            <div className="relative">
                <button
                    type="button"
                    onClick={() => setDropdownOpen((v) => !v)}
                    className="w-full flex items-center justify-between px-3 py-2.5 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 h-11"
                >
                    <span className={selectedSubjects.length === 0 ? 'text-gray-400' : 'text-gray-700'}>
                        {selectedSubjects.length === 0
                            ? 'Select subject(s)…'
                            : `${selectedSubjects.length} subject${selectedSubjects.length > 1 ? 's' : ''} selected`}
                    </span>
                    <svg
                        className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {dropdownOpen && (
                    <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-52 overflow-y-auto">
                        {uniqueSubjects.length === 0 ? (
                            <p className="px-3 py-2 text-sm text-gray-400">No subjects available</p>
                        ) : (
                            uniqueSubjects.map((subject) => {
                                const checked = selectedSubjects.includes(subject.name)
                                return (
                                    <button
                                        key={subject.name}
                                        type="button"
                                        onClick={() => toggleSubject(subject.name)}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors"
                                    >
                                        <span
                                            className={`flex items-center justify-center w-4 h-4 rounded border transition-colors ${checked ? 'bg-green-600 border-green-600' : 'border-gray-300'}`}
                                        >
                                            {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                                        </span>
                                        <span className={checked ? 'font-medium text-gray-900' : 'text-gray-700'}>
                                            {subject.name}
                                        </span>
                                    </button>
                                )
                            })
                        )}
                    </div>
                )}
            </div>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    )
}

type FormData = {
    firstName: string
    lastName: string
    email: string
    employeeNumber: string
    subject: string
    position: string
    phone: string
    address: string
    hireDate: string
    password: string
}

type FormErrors = Partial<Record<keyof FormData | 'error', string>>

type PersonalInfoSectionProps = {
    data: FormData
    setData: (key: keyof FormData, value: string) => void
    errors: FormErrors
}

export function PersonalInfoSection({ data, setData, errors }: PersonalInfoSectionProps) {
    const capitalizeName = (value: string) =>
        value.replace(/[^a-zA-Z\s]/g, '').replace(/\b\w/g, (c) => c.toUpperCase())

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <SectionHeading
                icon={User}
                title="Personal Information"
                description="Basic details about the teacher"
            />
            <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            First Name <span className="text-red-500">*</span>
                        </label>
                        <Input
                            required
                            value={data.firstName}
                            onChange={(e) => setData('firstName', capitalizeName(e.target.value))}
                            placeholder="Enter first name"
                            pattern="[A-Za-z\s]+"
                            className="h-11"
                        />
                        {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Last Name <span className="text-red-500">*</span>
                        </label>
                        <Input
                            required
                            value={data.lastName}
                            onChange={(e) => setData('lastName', capitalizeName(e.target.value))}
                            placeholder="Enter last name"
                            pattern="[A-Za-z\s]+"
                            className="h-11"
                        />
                        {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-gray-400" /> Phone Number
                        </label>
                        <PhoneInput value={data.phone} onChange={(v) => setData('phone', v)} />
                        {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                            <CalendarDays className="w-3.5 h-3.5 text-gray-400" /> Hire Date
                        </label>
                        <Input
                            type="date"
                            value={data.hireDate}
                            onChange={(e) => setData('hireDate', e.target.value)}
                            className="h-11"
                        />
                        {errors.hireDate && <p className="text-xs text-red-500 mt-1">{errors.hireDate}</p>}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" /> Address
                    </label>
                    <Input
                        type="text"
                        value={data.address}
                        onChange={(e) => setData('address', e.target.value)}
                        placeholder="Enter complete address"
                        className="h-11"
                    />
                    {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                </div>
            </div>
        </div>
    )
}

type AccountSectionProps = {
    data: FormData
    setData: (key: keyof FormData, value: string) => void
    errors: FormErrors
    subjects: Subject[]
    selectedSubjects: string[]
    onSubjectsChange: (subjects: string[]) => void
    employeeNumberError?: string
    checkingEmployeeNumber?: boolean
    teacherId?: number
}

export function AccountAssignmentSection({
    data,
    setData,
    errors,
    subjects,
    selectedSubjects,
    onSubjectsChange,
    employeeNumberError,
    checkingEmployeeNumber,
}: AccountSectionProps) {
    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <SectionHeading
                icon={IdCard}
                title="Account & Assignment"
                description="Login credentials and teaching assignment"
            />
            <div className="p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address <span className="text-red-500">*</span>
                    </label>
                    <Input
                        required
                        type="email"
                        value={data.email}
                        readOnly
                        className="h-11 bg-gray-50 text-gray-500"
                        placeholder="SNHS-LASTNAME-FIRSTNAME"
                    />
                    <p className="text-xs text-gray-400 mt-1">Auto-generated as SNHS-LASTNAME-FIRSTNAME</p>
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Employee Number <span className="text-red-500">*</span>
                    </label>
                    <Input
                        required
                        type="text"
                        value={data.employeeNumber}
                        onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '')
                            if (value.length <= 6) setData('employeeNumber', value)
                        }}
                        maxLength={6}
                        minLength={6}
                        placeholder="e.g., 100001"
                        pattern="[0-9]{6}"
                        className={`h-11 ${employeeNumberError ? 'border-red-500' : ''}`}
                    />
                    {checkingEmployeeNumber && <p className="text-xs text-gray-400 mt-1">Checking availability…</p>}
                    {employeeNumberError && <p className="text-xs text-red-500 mt-1">{employeeNumberError}</p>}
                    {errors.employeeNumber && <p className="text-xs text-red-500 mt-1">{errors.employeeNumber}</p>}
                </div>

                <SubjectMultiSelect
                    subjects={subjects}
                    selectedSubjects={selectedSubjects}
                    onChange={onSubjectsChange}
                    error={errors.subject}
                />

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Position <span className="text-red-500">*</span>
                    </label>
                    <Select value={data.position} onValueChange={(v) => setData('position', v)}>
                        <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                        <SelectContent>
                            {TEACHER_POSITIONS.map((p) => (
                                <SelectItem key={p} value={p}>
                                    {p}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.position && <p className="text-xs text-red-500 mt-1">{errors.position}</p>}
                </div>
            </div>
        </div>
    )
}

type SecuritySectionProps = {
    data: FormData
    setData: (key: keyof FormData, value: string) => void
    errors: FormErrors
    mode: 'create' | 'edit'
}

export function SecuritySection({ data, setData, errors, mode }: SecuritySectionProps) {
    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <SectionHeading
                icon={Lock}
                title="Security"
                description={mode === 'create' ? 'Set the initial login password' : 'Update password if needed'}
            />
            <div className="p-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {mode === 'create' ? (
                            <>
                                Password <span className="text-red-500">*</span>
                            </>
                        ) : (
                            'New Password'
                        )}
                    </label>
                    <Input
                        required={mode === 'create'}
                        type="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder={mode === 'create' ? 'Enter password' : 'Leave blank to keep current password'}
                        minLength={8}
                        className="h-11"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                        {mode === 'create'
                            ? 'Minimum 8 characters. The teacher will be asked to change it on first login.'
                            : 'Leave blank to keep current password. Minimum 8 characters if changing.'}
                    </p>
                    {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                </div>
            </div>
        </div>
    )
}
