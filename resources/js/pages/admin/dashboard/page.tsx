import { Head } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Megaphone, X } from 'lucide-react'
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
                                    <Card className="border-green-200 hover:shadow-md transition-shadow overflow-hidden">
                                        {announcement.display_type === 'banner' && announcement.image_url && (
                                            <img
                                                src={announcement.image_url}
                                                alt={announcement.title}
                                                onClick={() => setLightboxImage(announcement.image_url)}
                                                className="w-full max-h-80 object-cover cursor-zoom-in"
                                            />
                                        )}
                                        <CardHeader>
                                            <CardTitle className="text-xl text-green-700">{announcement.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex gap-4">
                                                {announcement.display_type === 'text' && announcement.image_url && (
                                                    <img
                                                        src={announcement.image_url}
                                                        alt={announcement.title}
                                                        onClick={() => setLightboxImage(announcement.image_url)}
                                                        className="w-24 h-24 object-cover rounded-md border shrink-0 cursor-zoom-in"
                                                    />
                                                )}
                                                {announcement.content && (
                                                    <p className="text-gray-700 whitespace-pre-wrap">{announcement.content}</p>
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
        </AdminLayout>
    )
}