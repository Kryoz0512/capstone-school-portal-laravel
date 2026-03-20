import { Head } from '@inertiajs/react'
import StudentLayout from '@/layouts/student-layout'
import { Card, CardContent } from '@/components/ui/card'
import { User, Phone, Smartphone, ChevronRight } from 'lucide-react'

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

export default function StudentDashboard({ auth }: Props) {
    const studentInfo = {
        name: 'Maria Santos',
        lrn: '123456789012',
        mobileNumber: '+63 912 345 6789',
        parentMobileNumber: '+63 987 654 3210'
    }

    const quickAccessItems = [
        {
            title: 'Enrolled Subjects',
            description: 'View all your subjects',
            href: '/student/enrolled-subjects'
        },
        {
            title: 'Class Schedule',
            description: 'Your timetable',
            href: '/student/schedule'
        },
        {
            title: 'Report Card',
            description: 'Your grades',
            href: '/student/report-card'
        }
    ]

    return (
        <StudentLayout user={auth?.user}>
            <Head title="Dashboard" />

            <div className="space-y-6">
                {/* Welcome Message */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Welcome, {studentInfo.name}!</h1>
                    <p className="text-sm text-gray-500 mt-1">Here's your academic information</p>
                </div>

                {/* Student Information Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Student Name */}
                    <Card className="border-2 border-gray-200">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500 mb-2">Student Name</p>
                                    <p className="text-lg font-semibold text-gray-900">{studentInfo.name}</p>
                                </div>
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <User className="w-5 h-5 text-green-700" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Student LRN */}
                    <Card className="border-2 border-gray-200">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500 mb-2">Student LRN</p>
                                    <p className="text-lg font-semibold text-gray-900">{studentInfo.lrn}</p>
                                </div>
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Mobile Number */}
                    <Card className="border-2 border-gray-200">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500 mb-2">Mobile Number</p>
                                    <p className="text-lg font-semibold text-gray-900">{studentInfo.mobileNumber}</p>
                                </div>
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Smartphone className="w-5 h-5 text-green-700" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Parent Mobile Number */}
                    <Card className="border-2 border-gray-200">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500 mb-2">Parent Mobile Number</p>
                                    <p className="text-lg font-semibold text-gray-900">{studentInfo.parentMobileNumber}</p>
                                </div>
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Phone className="w-5 h-5 text-green-700" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Access */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {quickAccessItems.map((item, index) => (
                            <a
                                key={index}
                                href={item.href}
                                className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-green-700 hover:shadow-md transition-all group"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                                        <p className="text-sm text-gray-500">{item.description}</p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-700 transition-colors" />
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </StudentLayout>
    )
}
