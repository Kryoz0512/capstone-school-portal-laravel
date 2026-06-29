import { Head, router, useForm } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Button } from '@/components/ui/button'
import {
    AccountAssignmentSection,
    PersonalInfoSection,
    SecuritySection,
} from '@/components/forms/teacher-form-sections'
import { store } from '@/routes/admin/user-management/teachers'
import axios from 'axios'
import { ArrowLeft, UserPlus } from 'lucide-react'
import { useEffect, useState } from 'react'

type Subject = { name: string }

type Props = {
    auth?: {
        user: { id: number; name: string; email: string; role: string }
        admin?: { role: string; position: string }
    }
    subjects: Subject[]
    canAddTeacher: boolean
}

export default function CreateTeacher({ auth, subjects = [], canAddTeacher = true }: Props) {
    const [employeeNumberError, setEmployeeNumberError] = useState('')
    const [checkingEmployeeNumber, setCheckingEmployeeNumber] = useState(false)
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])

    const { data, setData, post, processing, errors } = useForm({
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

    useEffect(() => {
        if (!canAddTeacher) {
            router.visit('/admin/user-management/teacher')
        }
    }, [canAddTeacher])

    useEffect(() => {
        setData('subject', selectedSubjects.join(','))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSubjects])

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

    const handleBack = () => router.visit('/admin/user-management/teacher')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        post(store.url(), {
            onSuccess: () => router.visit('/admin/user-management/teacher'),
        })
    }

    const isSubmitDisabled =
        processing || !!employeeNumberError || checkingEmployeeNumber || selectedSubjects.length === 0

    return (
        <AdminLayout user={auth?.user} admin={auth?.admin}>
            <Head title="Add New Teacher" />

            <div className="max-w-3xl mx-auto space-y-6">
                <Button variant="outline" size="sm" onClick={handleBack} className="hover:bg-gray-100">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Teachers
                </Button>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-green-600 rounded-lg shrink-0">
                            <UserPlus className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Add New Teacher</h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Create a teacher account and set their assignment details. Fields marked with{' '}
                                <span className="text-red-500">*</span> are required.
                            </p>
                        </div>
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
                    />

                    <SecuritySection data={data} setData={setData} errors={errors} mode="create" />

                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <p className="text-sm text-gray-500">
                                Review all information before creating the teacher account.
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
                                    {processing ? 'Creating…' : 'Add Teacher'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    )
}
