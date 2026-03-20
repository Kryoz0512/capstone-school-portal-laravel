import { Head } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'

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

export default function AdminDashboard({ auth }: Props) {
    return (
        <AdminLayout user={auth?.user}>
            <Head title="Admin Dashboard" />
            
            <div className="space-y-6">
                {/* Welcome Message */}
                <p className="text-gray-500 text-lg">
                    Welcome! Manage all school operations from the Enrollment menu on the left.
                </p>

                {/* Announcements Card */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Announcements
                    </h2>
                    <p className="text-gray-700">
                        School Year 2024-2025 has officially started. Please update all schedules and rosters.
                    </p>
                </div>
            </div>
        </AdminLayout>
    )
}
