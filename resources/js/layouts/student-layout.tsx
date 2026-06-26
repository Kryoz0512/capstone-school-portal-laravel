import { ReactNode } from 'react'
import { usePage } from '@inertiajs/react'
import StudentSidebar from '@/components/student-sidebar'
import StudentHeader from '@/components/student-header'

type StudentLayoutProps = {
    children: ReactNode
    user?: {
        name: string
        email: string
        role: string
    }
    student?: {
        profile_picture?: string | null
    }
}

export default function StudentLayout({ children, user }: StudentLayoutProps) {
    const { auth } = usePage<{ auth: { student?: { profile_picture?: string | null } } }>().props

    return (
        <div className="flex min-h-screen bg-white">
            {/* Sidebar — desktop only */}
            <StudentSidebar />

            {/* Main content — no left margin on mobile, offset by sidebar width on desktop */}
            <div className="flex-1 flex flex-col min-w-0 lg:ml-72">
                <StudentHeader user={user} student={auth?.student} />

                <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50">
                    {children}
                </main>
            </div>
        </div>
    )
}