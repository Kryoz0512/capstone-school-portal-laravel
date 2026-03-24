import { Head } from '@inertiajs/react'
import StudentLayout from '@/layouts/student-layout'
import { Card, CardContent } from '@/components/ui/card'
import { User, Phone, Smartphone } from 'lucide-react'

type StudentInfo = {
    name: string
    lrn: string
    mobileNumber: string
    parentMobileNumber: string
}

type Props = {
    studentInfo: StudentInfo
    auth?: {
        user: {
            id: number
            name: string
            email: string
            role: string
        }
    }
}

export default function StudentDashboard({ studentInfo, auth }: Props) {
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
                                    <p className="text-sm text-gray-500 mb-2">Guardian Contact Number</p>
                                    <p className="text-lg font-semibold text-gray-900">{studentInfo.parentMobileNumber}</p>
                                </div>
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Phone className="w-5 h-5 text-green-700" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </StudentLayout>
    )
}
