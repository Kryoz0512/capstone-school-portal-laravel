import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useEffect, useState } from 'react'
import { useForm } from '@inertiajs/react'
import { store } from '@/routes/admin/user-management/teachers'
import axios from 'axios'

type Subject = {
    name: string
}

type AddTeacherModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    subjects: Subject[]
}

export default function AddTeacherModal({ open, onOpenChange, subjects = [] }: AddTeacherModalProps) {
    const [employeeNumberError, setEmployeeNumberError] = useState<string>('')
    const [checkingEmployeeNumber, setCheckingEmployeeNumber] = useState(false)
    
    const { data, setData, post, processing, errors, reset } = useForm({
        firstName: '',
        lastName: '',
        email: '',
        employeeNumber: '',
        subject: '',
        position: '',
        password: ''
    })

    // Auto-generate email when first or last name changes
    useEffect(() => {
        if (data.firstName && data.lastName) {
            const firstName = data.firstName.trim().replace(/\s+/g, '').toUpperCase()
            const lastName = data.lastName.trim().replace(/\s+/g, '').toUpperCase()
            const generatedEmail = `SNHS-${lastName}-${firstName}`
            setData('email', generatedEmail)
        } else {
            setData('email', '')
        }
    }, [data.firstName, data.lastName, setData])

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
                    employee_number: data.employeeNumber
                })
                
                if (response.data.exists) {
                    setEmployeeNumberError('This employee number is already taken')
                } else {
                    setEmployeeNumberError('')
                }
            } catch (error) {
                console.error('Error checking employee number:', error)
            } finally {
                setCheckingEmployeeNumber(false)
            }
        }, 500) // Debounce for 500ms

        return () => clearTimeout(timeoutId)
    }, [data.employeeNumber])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        post(store.url(), {
            onSuccess: () => {
                onOpenChange(false)
                reset()
            }
        })
    }

    const handleClose = () => {
        onOpenChange(false)
        reset()
        setEmployeeNumberError('')
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New Teacher</DialogTitle>
                    <DialogDescription>
                        Create a new teacher account with subject assignment
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                First Name <span className="text-red-500">*</span>
                            </label>
                            <Input
                                required
                                value={data.firstName}
                                onChange={(e) => {
                                    const value = e.target.value
                                        .replace(/[^a-zA-Z\s]/g, '')
                                        .replace(/\b\w/g, (char) => char.toUpperCase())
                                    setData('firstName', value)
                                }}
                                placeholder="Enter first name"
                                pattern="[A-Za-z\s]+"
                                title="Only letters are allowed"
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
                                onChange={(e) => {
                                    const value = e.target.value
                                        .replace(/[^a-zA-Z\s]/g, '')
                                        .replace(/\b\w/g, (char) => char.toUpperCase())
                                    setData('lastName', value)
                                }}
                                placeholder="Enter last name"
                                pattern="[A-Za-z\s]+"
                                title="Only letters are allowed"
                            />
                            {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <Input
                            required
                            type="email"
                            value={data.email}
                            readOnly
                            className="bg-gray-50"
                            placeholder="snhs-lastname.firstname@snhs.edu.ph"
                        />
                        <p className="text-xs text-gray-500 mt-1">Auto-generated as SNHS-LASTNAME-FIRSTNAME</p>
                        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Employee Number <span className="text-red-500">*</span>
                        </label>
                        <Input
                            required
                            value={data.employeeNumber}
                            onChange={(e) => setData('employeeNumber', e.target.value)}
                            placeholder="e.g., EMP-2024-001"
                            className={employeeNumberError ? 'border-red-500' : ''}
                        />
                        {checkingEmployeeNumber && (
                            <p className="text-xs text-gray-500 mt-1">Checking availability...</p>
                        )}
                        {employeeNumberError && (
                            <p className="text-xs text-red-500 mt-1">{employeeNumberError}</p>
                        )}
                        {errors.employeeNumber && (
                            <p className="text-xs text-red-500 mt-1">{errors.employeeNumber}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Subject <span className="text-red-500">*</span>
                        </label>
                        <Select
                            value={data.subject}
                            onValueChange={(value) => setData('subject', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select subject" />
                            </SelectTrigger>
                            <SelectContent>
                                {subjects.length > 0 ? (
                                    subjects.map((subject, index) => (
                                        <SelectItem key={index} value={subject.name}>
                                            {subject.name}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="no-subjects" disabled>
                                        No subjects available
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                        {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Position <span className="text-red-500">*</span>
                        </label>
                        <Select
                            value={data.position}
                            onValueChange={(value) => setData('position', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select position" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Teacher I">Teacher I</SelectItem>
                                <SelectItem value="Teacher II">Teacher II</SelectItem>
                                <SelectItem value="Teacher III">Teacher III</SelectItem>
                                <SelectItem value="Master Teacher I">Master Teacher I</SelectItem>
                                <SelectItem value="Master Teacher II">Master Teacher II</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.position && <p className="text-xs text-red-500 mt-1">{errors.position}</p>}
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
                        {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                    </div>

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
                            type="submit"
                            className="bg-green-600 hover:bg-green-700"
                            disabled={processing || !!employeeNumberError || checkingEmployeeNumber}
                        >
                            {processing ? 'Creating...' : 'Create Teacher'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
