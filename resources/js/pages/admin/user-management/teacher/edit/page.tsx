import { Head, Link, useForm } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft } from 'lucide-react'
import { useEffect } from 'react'

type Subject = {
    name: string
}

type Teacher = {
    id: number
    employee_number: string
    name: string
    email: string
    subject: string
    position: string
}

type Props = {
    auth?: {
        user: { id: number; name: string; email: string; role: string }
        admin?: { role: string; position: string }
    }
    teacher: Teacher
    subjects: Subject[]
}

export default function EditTeacher({ auth, teacher, subjects = [] }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        firstName: '',
        lastName: '',
        email: '',
        employeeNumber: '',
        subject: '',
        position: '',
        password: ''
    })

    useEffect(() => {
        const nameParts = teacher.name.split(' ')
        setData({
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            email: teacher.email,
            employeeNumber: teacher.employee_number || '',
            subject: teacher.subject,
            position: teacher.position,
            password: ''
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [teacher.id])

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        put(`/admin/user-management/teachers/${teacher.id}`)
    }

    return (
        <AdminLayout user={auth?.user} admin={auth?.admin}>
            <Head title="Edit Teacher" />

            <div className="space-y-6 max-w-3xl mx-auto">
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/user-management/teacher"
                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Edit Teacher</h1>
                        <p className="text-sm text-gray-500 mt-1">Update teacher information and assignment</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
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
                            />
                            <p className="text-xs text-gray-500 mt-1">Email stays fixed when editing</p>
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
                                title="Employee number must be exactly 6 digits"
                            />
                            {errors.employeeNumber && <p className="text-xs text-red-500 mt-1">{errors.employeeNumber}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Subject <span className="text-red-500">*</span>
                            </label>
                            <Select value={data.subject} onValueChange={(value) => setData('subject', value)}>
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
                            <Select value={data.position} onValueChange={(value) => setData('position', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select position" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Teacher I">Teacher I</SelectItem>
                                    <SelectItem value="Teacher II">Teacher II</SelectItem>
                                    <SelectItem value="Teacher III">Teacher III</SelectItem>
                                    <SelectItem value="Teacher IV">Teacher IV</SelectItem>
                                    <SelectItem value="Teacher V">Teacher V</SelectItem>
                                    <SelectItem value="Teacher VI">Teacher VI</SelectItem>
                                    <SelectItem value="Master Teacher I">Master Teacher I</SelectItem>
                                    <SelectItem value="Master Teacher II">Master Teacher II</SelectItem>
                                    <SelectItem value="Master Teacher III">Master Teacher III</SelectItem>
                                    <SelectItem value="Master Teacher IV">Master Teacher IV</SelectItem>
                                    <SelectItem value="Master Teacher V">Master Teacher V</SelectItem>
                                    <SelectItem value="Master Teacher VI">Master Teacher VI</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.position && <p className="text-xs text-red-500 mt-1">{errors.position}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                            <Input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Leave blank to keep current password"
                                minLength={8}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Leave blank to keep current password. Minimum 8 characters if changing.
                            </p>
                            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t">
                            <Link href="/admin/user-management/teacher">
                                <Button type="button" variant="outline" disabled={processing}>
                                    Cancel
                                </Button>
                            </Link>
                            <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={processing}>
                                {processing ? 'Updating...' : 'Update Teacher'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    )
}