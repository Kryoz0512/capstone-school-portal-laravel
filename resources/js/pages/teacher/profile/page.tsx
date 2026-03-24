import { Head } from '@inertiajs/react'
import TeacherLayout from '@/layouts/teacher-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Phone, MapPin } from 'lucide-react'

type Teacher = {
    name: string
    email: string
    phone: string
    address: string
    employeeNumber: string
    department: string
    position: string
    dateHired: string
    specialization: string
}

type AssignedClass = {
    gradeLevel: string
    section: string
    subject: string
    students: number
}

type Props = {
    teacher: Teacher
    assignedClasses: AssignedClass[]
    auth?: {
        user: {
            id: number
            name: string
            email: string
            role: string
        }
    }
}

export default function Profile({ teacher, assignedClasses, auth }: Props) {
    return (
        <TeacherLayout user={auth?.user}>
            <Head title="Profile" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        View your professional information
                    </p>
                </div>

                {/* Profile Card */}
                <Card className="bg-gradient-to-r from-green-700 to-green-600 text-white">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-4xl font-bold">
                                {teacher.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold">{teacher.name}</h2>
                                <p className="text-green-100 mt-1">{teacher.position}</p>
                                <p className="text-green-100 text-sm mt-1">Employee No: {teacher.employeeNumber}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 gap-6">
                    {/* Contact Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                            <CardDescription>Your contact details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="text-sm font-medium">{teacher.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Phone</p>
                                    <p className="text-sm font-medium">{teacher.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <MapPin className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Address</p>
                                    <p className="text-sm font-medium">{teacher.address}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Assigned Classes */}
                <Card>
                    <CardHeader>
                        <CardTitle>Assigned Classes</CardTitle>
                        <CardDescription>Your current teaching load</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {assignedClasses.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Grade Level</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Section</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Subject</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Students</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {assignedClasses.map((cls, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm text-gray-900">{cls.gradeLevel}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{cls.section}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{cls.subject}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{cls.students}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-4">No assigned classes found</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </TeacherLayout>
    )
}
