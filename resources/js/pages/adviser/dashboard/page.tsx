import { Head } from '@inertiajs/react'
import AdviserLayout from '@/layouts/adviser-layout'
import { Users, UserCheck, Calendar, Megaphone, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

type Props = {
    stats: {
        totalStudents: number
        sectionName: string
        gradeLevel: string
        currentSchoolYear: string
    } | null
    advisorySection: {
        id: number
        name: string
        gradeLevel: string
    } | null
    noAssignment: boolean
    auth?: { user: { id: number; name: string; email: string; role: string } }
}

export default function AdviserDashboard({ stats, advisorySection, noAssignment, auth }: Props) {
    const [announcements, setAnnouncements] = useState<Announcement[]>([])
    const [loading, setLoading] = useState(true)
    const [lightboxImage, setLightboxImage] = useState<string | null>(null)

    useEffect(() => {
        axios.get('/api/announcements/approved')
            .then(res => { setAnnouncements(res.data); setLoading(false) })
            .catch(() => setLoading(false))
    }, [])

    return (
        <AdviserLayout user={auth?.user}>
            <Head title="Adviser Dashboard" />
            <div className="space-y-6">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Welcome, {auth?.user.name}!</h2>
                    <p className="text-gray-500 mt-1 text-sm sm:text-base">Your advisory class overview</p>
                </div>

                {noAssignment ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                        <p className="text-amber-800 font-medium">No advisory class assigned</p>
                        <p className="text-sm text-amber-700 mt-1">
                            You are not currently assigned as a class adviser. Please contact the registrar's office.
                        </p>
                    </div>
                ) : stats && advisorySection ? (
                    <>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-5">
                            <p className="text-sm text-blue-700 font-medium">Advisory Class</p>
                            <p className="text-lg sm:text-xl font-bold text-blue-900 mt-1">
                                {stats.gradeLevel} - {stats.sectionName}
                            </p>
                            <p className="text-sm text-blue-600 mt-1">School Year {stats.currentSchoolYear}</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
                            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs sm:text-sm text-gray-500">Total Students</p>
                                        <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{stats.totalStudents}</p>
                                    </div>
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                                        <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs sm:text-sm text-gray-500">Section</p>
                                        <p className="text-lg sm:text-xl font-bold text-gray-900 mt-1 sm:mt-2">{stats.sectionName}</p>
                                    </div>
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
                                        <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs sm:text-sm text-gray-500">School Year</p>
                                        <p className="text-lg sm:text-xl font-bold text-gray-900 mt-1 sm:mt-2">{stats.currentSchoolYear}</p>
                                    </div>
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
                                        <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : null}

                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <Megaphone className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Announcements</h2>
                    </div>
                    {loading ? (
                        <Card><CardContent className="pt-6"><p className="text-center text-gray-500">Loading announcements...</p></CardContent></Card>
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
                            {announcements.map(a => (
                                <div key={a.id}>
                                    <p className="text-sm text-gray-500 mb-2">Posted by {a.created_by} on {a.created_at}</p>
                                    <Card className="border-blue-200 hover:shadow-md transition-shadow overflow-hidden">
                                        {a.display_type === 'banner' && a.image_url && (
                                            <img
                                                src={a.image_url}
                                                alt={a.title}
                                                onClick={() => setLightboxImage(a.image_url)}
                                                className="w-full max-h-80 object-cover cursor-zoom-in"
                                            />
                                        )}
                                        <CardHeader>
                                            <CardTitle className="text-lg sm:text-xl text-blue-700">{a.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex gap-4">
                                                {a.display_type === 'text' && a.image_url && (
                                                    <img
                                                        src={a.image_url}
                                                        alt={a.title}
                                                        onClick={() => setLightboxImage(a.image_url)}
                                                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-md border shrink-0 cursor-zoom-in"
                                                    />
                                                )}
                                                {a.content && (
                                                    <p className="text-gray-700 whitespace-pre-wrap text-sm sm:text-base">{a.content}</p>
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
        </AdviserLayout>
    )
}
