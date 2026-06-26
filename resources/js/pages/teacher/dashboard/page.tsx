import { Head } from '@inertiajs/react'
import TeacherLayout from '@/layouts/teacher-layout'
import { Users, BookOpen, UserCheck, Calendar, Megaphone } from 'lucide-react'
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

type Props = {
    stats: {
        totalStudents: number
        subjectsHandled: number
        sectionsAssigned: number
        currentSchoolYear: string
    }
    auth?: { user: { id: number; name: string; email: string; role: string } }
}

export default function TeacherDashboard({ stats, auth }: Props) {
    const [announcements, setAnnouncements] = useState<Announcement[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        axios.get('/api/announcements/approved')
            .then(res => { setAnnouncements(res.data); setLoading(false) })
            .catch(() => setLoading(false))
    }, [])

    return (
        <TeacherLayout user={auth?.user}>
            <Head title="Teacher Dashboard" />
            <div className="space-y-6">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Welcome, {auth?.user.name}!</h2>
                    <p className="text-gray-500 mt-1 text-sm sm:text-base">Here's your teaching overview</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
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
                                <p className="text-xs sm:text-sm text-gray-500">Subjects Handled</p>
                                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{stats.subjectsHandled}</p>
                            </div>
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs sm:text-sm text-gray-500">Sections Assigned</p>
                                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{stats.sectionsAssigned}</p>
                            </div>
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
                                <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs sm:text-sm text-gray-500">Current School Year</p>
                                <p className="text-lg sm:text-xl font-bold text-gray-900 mt-1 sm:mt-2">{stats.currentSchoolYear}</p>
                            </div>
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
                                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Announcements */}
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
                                    <Card className="border-blue-200 hover:shadow-md transition-shadow">
                                        <CardHeader>
                                            <CardTitle className="text-lg sm:text-xl text-blue-700">{a.title}</CardTitle>
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
        </TeacherLayout>
    )
}