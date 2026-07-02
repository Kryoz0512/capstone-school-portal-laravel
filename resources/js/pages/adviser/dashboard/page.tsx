import { Head } from '@inertiajs/react'
import AdviserLayout from '@/layouts/adviser-layout'
import { Users, BookOpen, ShieldCheck, Calendar, Megaphone } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import axios from 'axios'

type Announcement = {
    id: number
    title: string
    content: string
    created_by: string
    created_at: string
}

type AdvisorySection = {
    id: number
    name: string
    grade_level_id: number
    grade_level_name: string
}

type Props = {
    stats: {
        totalStudents: number
        subjectsCount: number
        clearedStudents: number
        currentSchoolYear: string
    }
    advisorySection: AdvisorySection
    auth?: { user: { id: number; name: string; email: string; role: string } }
}

export default function AdviserDashboard({ stats, advisorySection, auth }: Props) {
    const [announcements, setAnnouncements] = useState<Announcement[]>([])
    const [loading, setLoading] = useState(true)

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
                    <p className="text-gray-500 mt-1 text-sm sm:text-base">
                        Advisory class: {advisorySection.grade_level_name} - {advisorySection.name}
                    </p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs sm:text-sm text-gray-500">Advisory Students</p>
                                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{stats.totalStudents}</p>
                            </div>
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0">
                                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs sm:text-sm text-gray-500">Subjects in Section</p>
                                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{stats.subjectsCount}</p>
                            </div>
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs sm:text-sm text-gray-500">Clearance Records</p>
                                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{stats.clearedStudents}</p>
                            </div>
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
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

                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <Megaphone className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
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
                                    <Card className="border-emerald-200 hover:shadow-md transition-shadow">
                                        <CardHeader>
                                            <CardTitle className="text-lg sm:text-xl text-emerald-700">{a.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-gray-700 whitespace-pre-wrap text-sm sm:text-base">{a.content}</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdviserLayout>
    )
}
