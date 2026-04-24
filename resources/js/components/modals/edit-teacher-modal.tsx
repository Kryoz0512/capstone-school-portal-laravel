import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useEffect } from 'react'
import { useForm } from '@inertiajs/react'
import { update } from '@/routes/admin/user-management/teachers'

type GradeLevel = {
    id: number
    name: string
}

type Subject = {
    id: number
    name: string
    grade_level_id: number
}

type Teacher = {
    id: number
    employee_no: string
    employee_number: string
    name: string
    email: string
    subject: string
    position: string
}

type EditTeacherModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    teacher: Teacher | null
    gradeLevels: GradeLevel[]
    subjects: Subject[]
}

export default function EditTeacherModal({ open, onOpenChange, teacher, gradeLevels = [], subjects = [] }: EditTeacherModalProps) {
    const { data, setData, put, processing, errors, reset } = useForm({
        firstName: '',
        lastName: '',
        email: '',
        employeeNumber: '',
        subject: '',
        position: '',
        password: ''
    })

    // Populate form when teacher changes
    useEffect(() => {
        if (teacher) {
            const nameParts = teacher.name.split(' ')
            const firstName = nameParts[0] || ''
            const lastName = nameParts.slice(1).join(' ') || ''
            
            setData({
                firstName: firstName,
                lastName: lastName,
                email: teacher.email, // Use the actual email from database
                employeeNumber: teacher.employee_number || teacher.employee_no || '',
                subject: teacher.subject,
                position: teacher.position,
                password: ''
            })
        }
    }, [teacher])

    // Don't auto-generate email when editing - keep the original email from database

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!teacher) return

        put(update.url({ teacher: teacher.id }), {
            onSuccess: () => {
                onOpenChange(false)
                reset()
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Teacher</DialogTitle>
                    <DialogDescription>
                        Update teacher information and assignment
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
                            placeholder="lastname.firstname@snhs.edu.ph"
                        />
                        <p className="text-xs text-gray-500 mt-1">Auto-generated from first and last name</p>
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
                                setData('employeeNumber', value)
                            }}
                            placeholder="e.g., 1000001"
                            pattern="[0-9]+"
                            title="Only numbers are allowed"
                        />
                        {errors.employeeNumber && <p className="text-xs text-red-500 mt-1">{errors.employeeNumber}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                        subjects.map((subject) => (
                                            <SelectItem key={subject.id} value={subject.name}>
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
                            New Password
                        </label>
                        <Input
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Leave blank to keep current password"
                            minLength={8}
                        />
                        <p className="text-xs text-gray-500 mt-1">Leave blank to keep current password. Minimum 8 characters if changing.</p>
                        {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-green-600 hover:bg-green-700"
                            disabled={processing}
                        >
                            {processing ? 'Updating...' : 'Update Teacher'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
