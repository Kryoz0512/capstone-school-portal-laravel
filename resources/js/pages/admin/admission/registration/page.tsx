import { Head } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'

type Props = {
    auth?: {
        user: {
            id: number
            name: string
            email: string
            role: string
        }
    }
}

export default function StudentRegistration({ auth }: Props) {
    const [studentStatus, setStudentStatus] = useState('')
    const [gender, setGender] = useState('')

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

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Student Status <span className="text-red-500">*</span>
                            </label>
                            <Select value={studentStatus} onValueChange={setStudentStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select student status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="new">New Student</SelectItem>
                                    <SelectItem value="transferee">Transferee</SelectItem>
                                    <SelectItem value="returning">Returning Student</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Student LRN <span className="text-red-500">*</span>
                                </label>
                                <Input type="text" placeholder="Enter 12-digit LRN" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    School Year <span className="text-red-500">*</span>
                                </label>
                                <Input type="text" placeholder="e.g. SY 2025-2026" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Gender <span className="text-red-500">*</span>
                                </label>
                                <Select value={gender} onValueChange={setGender}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date of Birth <span className="text-red-500">*</span>
                                </label>
                                <Input type="date" placeholder="dd/mm/yyyy" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Last Name <span className="text-red-500">*</span>
                                </label>
                                <Input type="text" placeholder="Enter last name" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    First Name <span className="text-red-500">*</span>
                                </label>
                                <Input type="text" placeholder="Enter first name" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Middle Name
                                </label>
                                <Input type="text" placeholder="Enter middle name (optional)" />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button variant="outline">Cancel</Button>
                            <Button className="bg-green-600 hover:bg-green-700 text-white">
                                Register Student
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
