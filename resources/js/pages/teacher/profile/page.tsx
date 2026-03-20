import { Head } from '@inertiajs/react'
import TeacherLayout from '@/layouts/teacher-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Phone, MapPin, Calendar, Award, BookOpen } from 'lucide-react'

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

export default function Profile({ auth }: Props) {
    const teacher = {
        name: auth?.user?.name || 'Teacher Name',
        email: auth?.user?.email || 'teacher@example.com',
        phone: '+63 912 345 6789',
        address: 'Santor, Philippines',
        employeeNumber: 'EMP-2024-001',
        department: 'English Department',
        position: 'Senior High School Teacher',
        dateHired: 'August 15, 2020',
        specialization: 'English Language & Literature'
    }

    const assignedClasses = [
        { gradeLevel: 'Grade 10', section: 'Section A', subject: 'English', students: 35 },
        { gradeLevel: 'Grade 10', section: 'Section B', subject: 'English', students: 32 },
        { gradeLevel: 'Grade 9', section: 'Section A', subject: 'English', students: 38 },
        { gradeLevel: 'Grade 9', section: 'Section B', subject: 'English', students: 36 }
    ]

    const certifications = [
        'Licensed Professional Teacher (LPT)',
        'TESOL Certification',
        'Master of Arts in Education',
        'DepEd Training on K-12 Curriculum'
    ]

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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

                    {/* Professional Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Professional Information</CardTitle>
                            <CardDescription>Your employment details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <BookOpen className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Department</p>
                                    <p className="text-sm font-medium">{teacher.department}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Date Hired</p>
                                    <p className="text-sm font-medium">{teacher.dateHired}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Award className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Specialization</p>
                                    <p className="text-sm font-medium">{teacher.specialization}</p>
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
                    </CardContent>
                </Card>

                {/* Certifications */}
                <Card>
                    <CardHeader>
                        <CardTitle>Certifications & Qualifications</CardTitle>
                        <CardDescription>Your professional credentials</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {certifications.map((cert, index) => (
                                <li key={index} className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-700"></div>
                                    <span className="text-sm text-gray-900">{cert}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </TeacherLayout>
    )
}
