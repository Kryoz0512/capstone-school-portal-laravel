import { Head } from '@inertiajs/react'
import StudentLayout from '@/layouts/student-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Phone, Smartphone, Megaphone, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import axios from 'axios'

type Announcement = {
    id: number
    title: string
    content: string
    image_url: string | null
    display_type: 'text' | 'banner'
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
    const [lightboxImage, setLightboxImage] = useState<string | null>(null)

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
                                    <Card className="border-purple-200 hover:shadow-md transition-shadow overflow-hidden">
                                        {announcement.display_type === 'banner' && announcement.image_url && (
                                            <img
                                                src={announcement.image_url}
                                                alt={announcement.title}
                                                onClick={() => setLightboxImage(announcement.image_url)}
                                                className="w-full max-h-72 object-cover cursor-zoom-in"
                                            />
                                        )}
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg sm:text-xl text-purple-700">{announcement.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex gap-4">
                                                {announcement.display_type === 'text' && announcement.image_url && (
                                                    <img
                                                        src={announcement.image_url}
                                                        alt={announcement.title}
                                                        onClick={() => setLightboxImage(announcement.image_url)}
                                                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-md border shrink-0 cursor-zoom-in"
                                                    />
                                                )}
                                                {announcement.content && (
                                                    <p className="text-gray-700 whitespace-pre-wrap text-sm sm:text-base">{announcement.content}</p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Image Lightbox */}
            {lightboxImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-zoom-out"
                    onClick={() => setLightboxImage(null)}
                >
                    <button
                        type="button"
                        onClick={() => setLightboxImage(null)}
                        className="absolute top-4 right-4 text-white/80 hover:text-white"
                        aria-label="Close"
                    >
                        <X className="w-8 h-8" />
                    </button>
                    <img
                        src={lightboxImage}
                        alt="Enlarged announcement"
                        onClick={(e) => e.stopPropagation()}
                        className="max-w-full max-h-full object-contain rounded-md cursor-default"
                    />
                </div>
            )}
        </StudentLayout>
    )
}