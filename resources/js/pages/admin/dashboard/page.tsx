import { Head } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Megaphone } from 'lucide-react'
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
    auth?: {
        user: {
            id: number
            name: string
            email: string
            role: string
        }
        admin?: {
            role: string
            position: string
        }
    }
}

export default function AdminDashboard({ auth }: Props) {
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
        <AdminLayout user={auth?.user} admin={auth?.admin}>
            <Head title="Admin Dashboard" />
            
            <div className="space-y-6">
                {/* Welcome Message */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500 text-lg mt-2">
                        Welcome! Manage all school operations from the menu on the left.
                    </p>
                </div>

                {/* Announcements Section */}
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <Megaphone className="w-6 h-6 text-green-600" />
                        <h2 className="text-2xl font-bold text-gray-900">Announcements</h2>
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
                                    <Card className="border-green-200 hover:shadow-md transition-shadow">
                                        <CardHeader>
                                            <CardTitle className="text-xl text-green-700">{announcement.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-gray-700 whitespace-pre-wrap">{announcement.content}</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    )
}
