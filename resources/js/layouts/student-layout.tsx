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
            {/* Sidebar - Fixed */}
            <StudentSidebar />

            {/* Main Content - With left margin for fixed sidebar */}
            <div className="flex-1 flex flex-col ml-72">
                {/* Header */}
                <StudentHeader user={user} student={auth?.student} />

                {/* Page Content */}
                <main className="flex-1 p-8 bg-gray-50">
                    {children}
                </main>
            </div>
        </div>
    )
}
