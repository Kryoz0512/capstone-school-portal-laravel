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
    admin?: {
        role: string
        position: string
        profile_picture?: string | null
    }
}

export default function AdminLayout({ children, user, admin }: AdminLayoutProps) {
    return (
        <div className="flex min-h-screen bg-white">
            {/* Sidebar - Fixed */}
            <AdminSidebar user={user} admin={admin} />

            {/* Main Content - With left margin for fixed sidebar */}
            <div className="flex-1 flex flex-col ml-72">
                {/* Header */}
                <AdminHeader user={user} admin={admin} />

                {/* Page Content */}
                <main className="flex-1 p-8 bg-gray-50">
                    {children}
                </main>
            </div>
        </div>
    )
}
