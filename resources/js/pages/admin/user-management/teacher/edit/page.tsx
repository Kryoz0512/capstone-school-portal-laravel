import { Head, router, useForm } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Button } from '@/components/ui/button'
import {
    AccountAssignmentSection,
    PersonalInfoSection,
    SecuritySection,
} from '@/components/forms/teacher-form-sections'
import { update } from '@/routes/admin/user-management/teachers'
import axios from 'axios'
import { ArrowLeft, Pencil } from 'lucide-react'
import { useEffect, useState } from 'react'

type Subject = { name: string }

type Teacher = {
    id: number
    employee_no: string
    name: string
    email: string
    subject: string
    position: string
    phone?: string | null
    address?: string | null
    hire_date?: string | null
    updated_by?: string | null
    updated_at?: string | null
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
    const [employeeNumberError, setEmployeeNumberError] = useState('')
    const [checkingEmployeeNumber, setCheckingEmployeeNumber] = useState(false)
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])

    const nameParts = teacher.name.split(' ')
    const initialFirstName = nameParts[0] || ''
    const initialLastName = nameParts.slice(1).join(' ') || ''
    const initialSubjects = teacher.subject
        ? teacher.subject.split(',').map((s) => s.trim()).filter(Boolean)
        : []

    const { data, setData, put, processing, errors } = useForm({
        firstName: initialFirstName,
        lastName: initialLastName,
        email: teacher.email,
        employeeNumber: teacher.employee_no,
        subject: teacher.subject || '',
        position: teacher.position,
        phone: teacher.phone || '',
        address: teacher.address || '',
        hireDate: teacher.hire_date || '',
        password: '',
    })

    useEffect(() => {
        setSelectedSubjects(initialSubjects)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [teacher.id])

    useEffect(() => {
        setData('subject', selectedSubjects.join(','))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSubjects])

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
                    teacher_id: teacher.id,
                })
                setEmployeeNumberError(response.data.exists ? 'This employee number is already registered' : '')
            } catch {
                // silent
            } finally {
                setCheckingEmployeeNumber(false)
            }
        }, 500)
        return () => clearTimeout(timeoutId)
    }, [data.employeeNumber, teacher.id])

    const handleBack = () => router.visit('/admin/user-management/teacher')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        put(update.url({ teacher: teacher.id }), {
            onSuccess: () => router.visit('/admin/user-management/teacher'),
        })
    }

    const isSubmitDisabled = processing || !!employeeNumberError || checkingEmployeeNumber || selectedSubjects.length === 0

    return (
        <AdminLayout user={auth?.user} admin={auth?.admin}>
            <Head title={`Edit Teacher — ${teacher.name}`} />

            <div className="max-w-3xl mx-auto space-y-6">
                <Button variant="outline" size="sm" onClick={handleBack} className="hover:bg-gray-100">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Teachers
                </Button>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-green-600 rounded-lg shrink-0">
                            <Pencil className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl font-bold text-gray-900">Edit Teacher</h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Update information and assignment details for{' '}
                                <span className="font-medium text-gray-800">{teacher.name}</span>.
                            </p>
                            {(teacher.updated_by || teacher.updated_at) && (
                                <p className="text-xs text-gray-400 mt-2">
                                    Last modified
                                    {teacher.updated_by ? ` by ${teacher.updated_by}` : ''}
                                    {teacher.updated_at ? ` · ${teacher.updated_at}` : ''}
                                </p>
                            )}
                        </div>
                        <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 shrink-0">
                            #{teacher.employee_no}
                        </span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <PersonalInfoSection data={data} setData={setData} errors={errors} />

                    <AccountAssignmentSection
                        data={data}
                        setData={setData}
                        errors={errors}
                        subjects={subjects}
                        selectedSubjects={selectedSubjects}
                        onSubjectsChange={setSelectedSubjects}
                        employeeNumberError={employeeNumberError}
                        checkingEmployeeNumber={checkingEmployeeNumber}
                        teacherId={teacher.id}
                    />

                    <SecuritySection data={data} setData={setData} errors={errors} mode="edit" />

                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <p className="text-sm text-gray-500">
                                Changes will be logged in the activity history.
                            </p>
                            <div className="flex items-center gap-3 shrink-0">
                                <Button type="button" variant="outline" onClick={handleBack} disabled={processing}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-green-600 hover:bg-green-700 text-white px-8 shadow-sm"
                                    disabled={isSubmitDisabled}
                                >
                                    {processing ? 'Saving…' : 'Save Changes'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    )
}
