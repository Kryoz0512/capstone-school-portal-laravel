import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useState, useEffect, useRef } from 'react'
import { useForm } from '@inertiajs/react'
import superadmin from '@/routes/superadmin'

type AddAdminModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
}

type TeacherSuggestion = {
    employee_number: string
    first_name: string
    last_name: string
    position: string
    email: string
}

export default function AddAdminModal({ open, onOpenChange }: AddAdminModalProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        employee_number: '',
        first_name: '',
        last_name: '',
        position: '',
        password: ''
    })

    const [generatedEmail, setGeneratedEmail] = useState('')
    const [isCheckingEmployee, setIsCheckingEmployee] = useState(false)
    const [employeeMessage, setEmployeeMessage] = useState('')
    const [isTeacher, setIsTeacher] = useState(false)
    const [fieldsLocked, setFieldsLocked] = useState(false)
    const [teacherSuggestions, setTeacherSuggestions] = useState<TeacherSuggestion[]>([])
    const [showDropdown, setShowDropdown] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Helper function to capitalize first letter of each word
    const toTitleCase = (str: string) => {
        return str
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
    }

    // Search for teachers by employee number
    const searchTeachers = async (searchTerm: string) => {
        if (!searchTerm || searchTerm.length < 3) {
            setTeacherSuggestions([])
            setShowDropdown(false)
            return
        }

        setIsCheckingEmployee(true)

        try {
            const response = await fetch(`/api/search-teachers?employee_number=${searchTerm}`)
            const result = await response.json()

            if (result.teachers && result.teachers.length > 0) {
                setTeacherSuggestions(result.teachers)
                setShowDropdown(true)
            } else {
                setTeacherSuggestions([])
                setShowDropdown(false)
            }
        } catch (error) {
            console.error('Error searching teachers:', error)
            setTeacherSuggestions([])
            setShowDropdown(false)
        } finally {
            setIsCheckingEmployee(false)
        }
    }

    // Handle teacher selection from dropdown
    const selectTeacher = (teacher: TeacherSuggestion) => {
        setData({
            ...data,
            employee_number: teacher.employee_number,
            first_name: teacher.first_name,
            last_name: teacher.last_name,
            position: teacher.position,
        })
        setEmployeeMessage('Teacher selected! Fields auto-filled.')
        setIsTeacher(true)
        setFieldsLocked(true)
        setShowDropdown(false)
        setTeacherSuggestions([])
    }

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        if (data.first_name && data.last_name) {
            const firstName = data.first_name.toUpperCase().trim().replace(/\s+/g, '')
            const lastName = data.last_name.toUpperCase().trim().replace(/\s+/g, '')
            const email = `SNHS-${lastName}-${firstName}`
            setGeneratedEmail(email)
        } else {
            setGeneratedEmail('')
        }
    }, [data.first_name, data.last_name])

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        post(superadmin.admins.store.url(), {
            onSuccess: () => {
                reset()
                setGeneratedEmail('')
                setEmployeeMessage('')
                setIsTeacher(false)
                setFieldsLocked(false)
                setTeacherSuggestions([])
                setShowDropdown(false)
                onOpenChange(false)
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New Admin</DialogTitle>
                    <DialogDescription>
                        Create a new admin account with role-based access control
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="relative" ref={dropdownRef}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Employee Number <span className="text-red-500">*</span>
                        </label>
                        <Input
                            required
                            value={data.employee_number}
                            onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 7)
                                setData('employee_number', value)
                                
                                // Reset fields if user changes employee number after selection
                                if (fieldsLocked) {
                                    setFieldsLocked(false)
                                    setIsTeacher(false)
                                    setEmployeeMessage('')
                                    setData({
                                        ...data,
                                        employee_number: value,
                                        first_name: '',
                                        last_name: '',
                                        position: '',
                                    })
                                }
                                
                                // Search for teachers as user types
                                searchTeachers(value)
                            }}
                            placeholder="Type employee number to search teachers"
                            maxLength={7}
                            pattern="[0-9]{7}"
                            autoComplete="off"
                        />
                        
                        {/* Dropdown for teacher suggestions */}
                        {showDropdown && teacherSuggestions.length > 0 && (
                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                {teacherSuggestions.map((teacher, index) => (
                                    <div
                                        key={index}
                                        onClick={() => selectTeacher(teacher)}
                                        className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {teacher.first_name} {teacher.last_name}
                                                </p>
                                                <p className="text-sm text-gray-600">{teacher.position}</p>
                                            </div>
                                            <span className="text-sm font-mono text-gray-500">
                                                {teacher.employee_number}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {isCheckingEmployee && (
                            <p className="text-xs text-blue-500 mt-1">Searching teachers...</p>
                        )}
                        {employeeMessage && (
                            <p className={`text-xs mt-1 ${isTeacher ? 'text-green-600' : 'text-gray-600'}`}>
                                {employeeMessage}
                            </p>
                        )}
                        {errors.employee_number && (
                            <p className="text-xs text-red-500 mt-1">{errors.employee_number}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                First Name <span className="text-red-500">*</span>
                            </label>
                            <Input
                                required
                                value={data.first_name}
                                onChange={(e) => {
                                    if (!fieldsLocked) {
                                        const value = e.target.value.replace(/[^a-zA-Z\s]/g, '')
                                        setData('first_name', toTitleCase(value))
                                    }
                                }}
                                placeholder="Enter first name"
                                pattern="[A-Za-z\s]+"
                                title="Only letters are allowed"
                                readOnly={fieldsLocked}
                                className={fieldsLocked ? 'bg-gray-100' : ''}
                            />
                            {errors.first_name && (
                                <p className="text-xs text-red-500 mt-1">{errors.first_name}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Last Name <span className="text-red-500">*</span>
                            </label>
                            <Input
                                required
                                value={data.last_name}
                                onChange={(e) => {
                                    if (!fieldsLocked) {
                                        const value = e.target.value.replace(/[^a-zA-Z\s]/g, '')
                                        setData('last_name', toTitleCase(value))
                                    }
                                }}
                                placeholder="Enter last name"
                                pattern="[A-Za-z\s]+"
                                title="Only letters are allowed"
                                readOnly={fieldsLocked}
                                className={fieldsLocked ? 'bg-gray-100' : ''}
                            />
                            {errors.last_name && (
                                <p className="text-xs text-red-500 mt-1">{errors.last_name}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <Input
                            required
                            type="email"
                            value={generatedEmail}
                            readOnly
                            className="bg-gray-50"
                            placeholder="SNHS-LASTNAME-FIRSTNAME"
                        />
                        <p className="text-xs text-gray-500 mt-1">Auto-generated as SNHS-LASTNAME-FIRSTNAME</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Position <span className="text-red-500">*</span>
                        </label>
                        <Input
                            required
                            value={data.position}
                            onChange={(e) => {
                                if (!fieldsLocked) {
                                    setData('position', e.target.value)
                                }
                            }}
                            placeholder="e.g., Principal, Registrar, Admin Staff"
                            readOnly={fieldsLocked}
                            className={fieldsLocked ? 'bg-gray-100' : ''}
                        />
                        {errors.position && (
                            <p className="text-xs text-red-500 mt-1">{errors.position}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
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
                        <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                        {errors.password && (
                            <p className="text-xs text-red-500 mt-1">{errors.password}</p>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                reset()
                                setGeneratedEmail('')
                                setEmployeeMessage('')
                                setIsTeacher(false)
                                setFieldsLocked(false)
                                setTeacherSuggestions([])
                                setShowDropdown(false)
                                onOpenChange(false)
                            }}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-green-600 hover:bg-green-700"
                            disabled={processing}
                        >
                            {processing ? 'Creating...' : 'Create Admin'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
