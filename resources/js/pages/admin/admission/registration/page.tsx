import { Head, useForm } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'
import { store } from '@/routes/admin/admission/registration'

type GradeLevel = {
    id: number
    name: string
}

type Props = {
    auth?: {
        user: {
            id: number
            name: string
            email: string
            role: string
        }
    }
    gradeLevels: GradeLevel[]
}

export default function StudentRegistration({ auth, gradeLevels = [] }: Props) {
    const [studentStatus, setStudentStatus] = useState('')
    const [gradeLevel, setGradeLevel] = useState('')

    const { data, setData, post, processing, errors, reset } = useForm({
        student_status: '',
        lrn: '',
        school_year: '',
        gender: '',
        birth_date: '',
        last_name: '',
        first_name: '',
        middle_name: '',
        grade_level_id: '',
    })

    // Determine if grade level dropdown should be shown
    const showGradeLevelDropdown = data.student_status === 'transferee' || data.student_status === 'returning'

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        post(store.url(), {
            onSuccess: () => {
                reset()
                setStudentStatus('')
                setGradeLevel('')
            }
        })
    }

    const handleCancel = () => {
        reset()
        setStudentStatus('')
        setGradeLevel('')
    }

    return (
        <AdminLayout user={auth?.user}>
            <Head title="Student Registration" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Student Registration</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Register new students with their information
                    </p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Register Student</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Student Status <span className="text-red-500">*</span>
                                </label>
                                <Select value={data.student_status} onValueChange={(value) => {
                                    setData('student_status', value)
                                    setStudentStatus(value)
                                }}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select student status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="new">New Student</SelectItem>
                                        <SelectItem value="transferee">Transferee</SelectItem>
                                    </SelectContent>
                                </Select>
                                {data.student_status === 'new' && (
                                    <p className="text-xs text-green-600 mt-1">
                                        New students will be automatically registered for Grade 7
                                    </p>
                                )}
                                {errors.student_status && <p className="text-xs text-red-500 mt-1">{errors.student_status}</p>}
                            </div>

                            {showGradeLevelDropdown && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Grade Level <span className="text-red-500">*</span>
                                    </label>
                                    <Select value={data.grade_level_id} onValueChange={(value) => setData('grade_level_id', value)}>
                                        <SelectTrigger>
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
                                    {errors.grade_level_id && <p className="text-xs text-red-500 mt-1">{errors.grade_level_id}</p>}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Student LRN <span className="text-red-500">*</span>
                                </label>
                                <Input 
                                    type="text" 
                                    placeholder="Enter 12-digit LRN"
                                    value={data.lrn}
                                    onChange={(e) => setData('lrn', e.target.value)}
                                    maxLength={12}
                                />
                                {errors.lrn && <p className="text-xs text-red-500 mt-1">{errors.lrn}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    School Year <span className="text-red-500">*</span>
                                </label>
                                <Input 
                                    type="text" 
                                    placeholder="e.g. SY 2025-2026"
                                    value={data.school_year}
                                    onChange={(e) => setData('school_year', e.target.value)}
                                />
                                {errors.school_year && <p className="text-xs text-red-500 mt-1">{errors.school_year}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Gender <span className="text-red-500">*</span>
                                </label>
                                <Select value={data.gender} onValueChange={(value) => setData('gender', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.gender && <p className="text-xs text-red-500 mt-1">{errors.gender}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date of Birth <span className="text-red-500">*</span>
                                </label>
                                <Input 
                                    type="date"
                                    value={data.birth_date}
                                    onChange={(e) => setData('birth_date', e.target.value)}
                                />
                                {errors.birth_date && <p className="text-xs text-red-500 mt-1">{errors.birth_date}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Last Name <span className="text-red-500">*</span>
                                </label>
                                <Input 
                                    type="text" 
                                    placeholder="Enter last name"
                                    value={data.last_name}
                                    onChange={(e) => setData('last_name', e.target.value)}
                                />
                                {errors.last_name && <p className="text-xs text-red-500 mt-1">{errors.last_name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    First Name <span className="text-red-500">*</span>
                                </label>
                                <Input 
                                    type="text" 
                                    placeholder="Enter first name"
                                    value={data.first_name}
                                    onChange={(e) => setData('first_name', e.target.value)}
                                />
                                {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Middle Name
                                </label>
                                <Input 
                                    type="text" 
                                    placeholder="Enter middle name (optional)"
                                    value={data.middle_name}
                                    onChange={(e) => setData('middle_name', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
                            <Button 
                                type="submit" 
                                className="bg-green-600 hover:bg-green-700 text-white"
                                disabled={processing}
                            >
                                {processing ? 'Registering...' : 'Register Student'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    )
}
