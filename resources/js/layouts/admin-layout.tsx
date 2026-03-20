import { ReactNode } from 'react'
import AdminSidebar from '@/components/admin-sidebar'
import AdminHeader from '@/components/admin-header'

type AdminLayoutProps = {
    children: ReactNode
    user?: {
        name: string
        email: string
        role: string
    }
}

export default function AdminLayout({ children, user }: AdminLayoutProps) {
    return (
        <div className="flex min-h-screen bg-white">
            {/* Sidebar */}
            <AdminSidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <AdminHeader user={user} />

                {/* Page Content */}
                <main className="flex-1 p-8 bg-gray-50">
                    {children}
                </main>
            </div>
        </div>
    )
}
