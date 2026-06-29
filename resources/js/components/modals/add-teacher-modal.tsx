import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PhoneInput } from '@/components/ui/phone-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useEffect, useState } from 'react'
import { useForm } from '@inertiajs/react'
import { store } from '@/routes/admin/user-management/teachers'
import axios from 'axios'
import { UserPlus, User, IdCard, BookOpen, Lock, CalendarDays, MapPin, Phone, Check, X } from 'lucide-react'

type Subject = {
    name: string
}

type AddTeacherModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    subjects: Subject[]
}

function SectionHeading({ icon: Icon, title }: { icon: React.ComponentType<{ className?: string }>; title: string }) {
    return (
        <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-green-50 text-green-700 shrink-0">
                <Icon className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">{title}</h3>
            <div className="flex-1 h-px bg-gray-100" />
        </div>
    )
}

export default function AddTeacherModal({ open, onOpenChange, subjects = [] }: AddTeacherModalProps) {
    const [employeeNumberError, setEmployeeNumberError] = useState<string>('')
    const [checkingEmployeeNumber, setCheckingEmployeeNumber] = useState(false)
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
    const [subjectDropdownOpen, setSubjectDropdownOpen] = useState(false)

    // Deduplicate subjects by name
    const uniqueSubjects = Array.from(
        new Map(subjects.map((s) => [s.name, s])).values()
    ).sort((a, b) => a.name.localeCompare(b.name))

    const { data, setData, post, processing, errors, reset } = useForm({
        firstName: '',
        lastName: '',
        email: '',
        employeeNumber: '',
        subject: '',
        position: '',
        phone: '',
        address: '',
        hireDate: '',
        password: '',
    })

    // Sync selectedSubjects → form data
    useEffect(() => {
        setData('subject', selectedSubjects.join(','))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSubjects])

    // Auto-generate email when first or last name changes
    useEffect(() => {
        if (data.firstName && data.lastName) {
            const firstName = data.firstName.trim().replace(/\s+/g, '').toUpperCase()
            const lastName = data.lastName.trim().replace(/\s+/g, '').toUpperCase()
            setData('email', `SNHS-${lastName}-${firstName}`)
        } else {
            setData('email', '')
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.firstName, data.lastName])

    // Live validation for employee number
    useEffect(() => {
        if (!data.employeeNumber || data.employeeNumber.trim() === '') {
            setEmployeeNumberError('')
            return
        }
        const timeoutId = setTimeout(async () => {
            setCheckingEmployeeNumber(true)
            try {
                const response = await axios.post('/admin/user-management/teachers/check-employee-number', {
                    employee_number: data.employeeNumber,
                })
                setEmployeeNumberError(response.data.exists ? 'This employee number is already registered' : '')
            } catch {
                // silent
            } finally {
                setCheckingEmployeeNumber(false)
            }
        }, 500)
        return () => clearTimeout(timeoutId)
    }, [data.employeeNumber])

    const toggleSubject = (name: string) => {
        setSelectedSubjects((prev) =>
            prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
        )
    }

    const removeSubject = (name: string) => {
        setSelectedSubjects((prev) => prev.filter((s) => s !== name))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        post(store.url(), {
            onSuccess: () => {
                onOpenChange(false)
                reset()
                setSelectedSubjects([])
            },
        })
    }

    const handleClose = () => {
        onOpenChange(false)
        reset()
        setEmployeeNumberError('')
        setSelectedSubjects([])
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
                {/* Header */}
                <DialogHeader className="px-6 pt-6 pb-5 bg-gradient-to-br from-green-700 to-green-600 rounded-t-lg space-y-0">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-white/15 text-white shrink-0">
                            <UserPlus className="w-5 h-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-white text-lg font-semibold">Add New Teacher</DialogTitle>
                            <p className="text-sm text-green-50/90 mt-0.5">Create an account and set their assignment details</p>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="px-6 py-6 space-y-7">
                    {/* Personal Information */}
                    <div>
                        <SectionHeading icon={User} title="Personal Information" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    First Name <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    required
                                    value={data.firstName}
                                    onChange={(e) => {
                                        const value = e.target.value
                                            .replace(/[^a-zA-Z\s]/g, '')
                                            .replace(/\b\w/g, (c) => c.toUpperCase())
                                        setData('firstName', value)
                                    }}
                                    placeholder="Enter first name"
                                    pattern="[A-Za-z\s]+"
                                />
                                {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Last Name <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    required
                                    value={data.lastName}
                                    onChange={(e) => {
                                        const value = e.target.value
                                            .replace(/[^a-zA-Z\s]/g, '')
                                            .replace(/\b\w/g, (c) => c.toUpperCase())
                                        setData('lastName', value)
                                    }}
                                    placeholder="Enter last name"
                                    pattern="[A-Za-z\s]+"
                                />
                                {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                                    <Phone className="w-3.5 h-3.5 text-gray-400" /> Phone Number
                                </label>
                                <PhoneInput value={data.phone} onChange={(v) => setData('phone', v)} />
                                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                                    <CalendarDays className="w-3.5 h-3.5 text-gray-400" /> Hire Date
                                </label>
                                <Input
                                    type="date"
                                    value={data.hireDate}
                                    onChange={(e) => setData('hireDate', e.target.value)}
                                />
                                {errors.hireDate && <p className="text-xs text-red-500 mt-1">{errors.hireDate}</p>}
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-gray-400" /> Address
                            </label>
                            <Input
                                type="text"
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                placeholder="Enter complete address"
                            />
                            {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                        </div>
                    </div>

                    {/* Account & Assignment */}
                    <div>
                        <SectionHeading icon={IdCard} title="Account & Assignment" />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Email Address <span className="text-red-500">*</span>
                            </label>
                            <Input
                                required
                                type="email"
                                value={data.email}
                                readOnly
                                className="bg-gray-50 text-gray-500"
                                placeholder="SNHS-LASTNAME-FIRSTNAME"
                            />
                            <p className="text-xs text-gray-400 mt-1">Auto-generated as SNHS-LASTNAME-FIRSTNAME</p>
                            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
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
                                className={employeeNumberError ? 'border-red-500' : ''}
                            />
                            {checkingEmployeeNumber && <p className="text-xs text-gray-400 mt-1">Checking availability…</p>}
                            {employeeNumberError && <p className="text-xs text-red-500 mt-1">{employeeNumberError}</p>}
                            {errors.employeeNumber && <p className="text-xs text-red-500 mt-1">{errors.employeeNumber}</p>}
                        </div>

                        {/* Multi-subject picker */}
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                                <BookOpen className="w-3.5 h-3.5 text-gray-400" /> Subject(s) <span className="text-red-500">*</span>
                            </label>

                            {/* Selected tags */}
                            {selectedSubjects.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                    {selectedSubjects.map((s) => (
                                        <span
                                            key={s}
                                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                                        >
                                            {s}
                                            <button
                                                type="button"
                                                onClick={() => removeSubject(s)}
                                                className="hover:text-green-600"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Dropdown trigger */}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setSubjectDropdownOpen((v) => !v)}
                                    className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                >
                                    <span className={selectedSubjects.length === 0 ? 'text-gray-400' : 'text-gray-700'}>
                                        {selectedSubjects.length === 0
                                            ? 'Select subject(s)…'
                                            : `${selectedSubjects.length} subject${selectedSubjects.length > 1 ? 's' : ''} selected`}
                                    </span>
                                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${subjectDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </button>

                                {subjectDropdownOpen && (
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
                                                        <span className={`flex items-center justify-center w-4 h-4 rounded border transition-colors ${checked ? 'bg-green-600 border-green-600' : 'border-gray-300'}`}>
                                                            {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                                                        </span>
                                                        <span className={checked ? 'font-medium text-gray-900' : 'text-gray-700'}>{subject.name}</span>
                                                    </button>
                                                )
                                            })
                                        )}
                                    </div>
                                )}
                            </div>
                            {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject}</p>}
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Position <span className="text-red-500">*</span>
                            </label>
                            <Select value={data.position} onValueChange={(v) => setData('position', v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select position" />
                                </SelectTrigger>
                                <SelectContent>
                                    {['Teacher I', 'Teacher II', 'Teacher III', 'Master Teacher I', 'Master Teacher II'].map((p) => (
                                        <SelectItem key={p} value={p}>{p}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.position && <p className="text-xs text-red-500 mt-1">{errors.position}</p>}
                        </div>
                    </div>

                    {/* Security */}
                    <div>
                        <SectionHeading icon={Lock} title="Security" />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <Input
                                required
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Enter password"
                                minLength={8}
                            />
                            <p className="text-xs text-gray-400 mt-1">Minimum 8 characters. The teacher will be asked to change it on first login.</p>
                            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-5 border-t border-gray-100">
                        <Button type="button" variant="outline" onClick={handleClose} disabled={processing}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-green-600 hover:bg-green-700"
                            disabled={processing || !!employeeNumberError || checkingEmployeeNumber || selectedSubjects.length === 0}
                        >
                            {processing ? 'Creating…' : 'Add Teacher'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}