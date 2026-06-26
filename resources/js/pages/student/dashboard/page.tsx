import { Head } from '@inertiajs/react'
import StudentLayout from '@/layouts/student-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Phone, Smartphone, Megaphone } from 'lucide-react'
import { useEffect, useState } from 'react'
import axios from 'axios'

type Announcement = {
    id: number
    title: string
    content: string
    created_by: string
    created_at: string
}

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
    const [announcements, setAnnouncements] = useState<Announcement[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        axios.get('/api/announcements/approved')
            .then((response) => {
                setAnnouncements(response.data)
                setLoading(false)
            })
            .catch(() => {
                setLoading(false)
            })
    }, [])

    return (
        <StudentLayout user={auth?.user}>
            <Head title="Dashboard" />

            <div className="space-y-6">
                {/* Welcome Message */}
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Welcome, {studentInfo.name}!</h1>
                    <p className="text-sm text-gray-500 mt-1">Here's your academic information</p>
                </div>

                {/* Student Information Cards */}
                {/* FIX: was md:grid-cols-2, now sm:grid-cols-2 so tablets in portrait get 2 columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {/* Student Name */}
                    <Card className="border-2 border-gray-200">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-500 mb-1">Student Name</p>
                                    <p className="text-base sm:text-lg font-semibold text-gray-900 truncate">{studentInfo.name}</p>
                                </div>
                                <div className="p-2 bg-purple-100 rounded-lg shrink-0 ml-3">
                                    <User className="w-5 h-5 text-purple-700" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Student LRN */}
                    <Card className="border-2 border-gray-200">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-500 mb-1">Student LRN</p>
                                    <p className="text-base sm:text-lg font-semibold text-gray-900">{studentInfo.lrn}</p>
                                </div>
                                <div className="w-3 h-3 bg-purple-500 rounded-full shrink-0 mt-1 ml-3"></div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Mobile Number */}
                    <Card className="border-2 border-gray-200">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-500 mb-1">Mobile Number</p>
                                    <p className="text-base sm:text-lg font-semibold text-gray-900">{studentInfo.mobileNumber}</p>
                                </div>
                                <div className="p-2 bg-purple-100 rounded-lg shrink-0 ml-3">
                                    <Smartphone className="w-5 h-5 text-purple-700" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Parent Mobile Number */}
                    <Card className="border-2 border-gray-200">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-500 mb-1">Guardian Contact Number</p>
                                    <p className="text-base sm:text-lg font-semibold text-gray-900">{studentInfo.parentMobileNumber}</p>
                                </div>
                                <div className="p-2 bg-purple-100 rounded-lg shrink-0 ml-3">
                                    <Phone className="w-5 h-5 text-purple-700" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Announcements Section */}
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <Megaphone className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Announcements</h2>
                    </div>

                    {loading ? (
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-center text-gray-500">Loading announcements...</p>
                            </CardContent>
                        </Card>
                    ) : announcements.length === 0 ? (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center py-8">
                                    <Megaphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">No announcements at this time</p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {announcements.map((announcement) => (
                                <div key={announcement.id}>
                                    <p className="text-sm text-gray-500 mb-2">
                                        Posted by {announcement.created_by} on {announcement.created_at}
                                    </p>
                                    <Card className="border-purple-200 hover:shadow-md transition-shadow">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg sm:text-xl text-purple-700">{announcement.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-gray-700 whitespace-pre-wrap text-sm sm:text-base">{announcement.content}</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </StudentLayout>
    )
}