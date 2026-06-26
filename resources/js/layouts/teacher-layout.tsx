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
            {/* Sidebar — desktop only (hidden on mobile) */}
            <TeacherSidebar />

            {/* Main content — no left margin on mobile, offset by sidebar width on desktop */}
            <div className="flex-1 flex flex-col min-w-0 lg:ml-72">
                <TeacherHeader user={user} teacher={auth?.teacher} />

                <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50">
                    {children}
                </main>
            </div>
        </div>
    )
}