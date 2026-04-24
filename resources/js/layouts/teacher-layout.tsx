import { ReactNode } from 'react'
import { usePage } from '@inertiajs/react'
import TeacherSidebar from '@/components/teacher-sidebar'
import TeacherHeader from '@/components/teacher-header'

type TeacherLayoutProps = {
    children: ReactNode
    user?: {
        name: string
        email: string
        role: string
    }
    teacher?: {
        profile_picture?: string | null
    }
}

export default function TeacherLayout({ children, user }: TeacherLayoutProps) {
    const { auth } = usePage<{ auth: { teacher?: { profile_picture?: string | null } } }>().props
    
    return (
        <div className="flex min-h-screen bg-white">
            {/* Sidebar - Fixed */}
            <TeacherSidebar />

            {/* Main Content - With left margin for fixed sidebar */}
            <div className="flex-1 flex flex-col ml-72">
                {/* Header */}
                <TeacherHeader user={user} teacher={auth?.teacher} />

                {/* Page Content */}
                <main className="flex-1 p-8 bg-gray-50">
                    {children}
                </main>
            </div>
        </div>
    )
}
