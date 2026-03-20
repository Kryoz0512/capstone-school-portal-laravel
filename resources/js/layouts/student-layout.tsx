import { ReactNode } from 'react'
import StudentSidebar from '@/components/student-sidebar'
import StudentHeader from '@/components/student-header'

type StudentLayoutProps = {
    children: ReactNode
    user?: {
        name: string
        email: string
        role: string
    }
}

export default function StudentLayout({ children, user }: StudentLayoutProps) {
    return (
        <div className="flex min-h-screen bg-white">
            {/* Sidebar - Fixed */}
            <StudentSidebar />

            {/* Main Content - With left margin for fixed sidebar */}
            <div className="flex-1 flex flex-col ml-64">
                {/* Header */}
                <StudentHeader user={user} />

                {/* Page Content */}
                <main className="flex-1 p-8 bg-gray-50">
                    {children}
                </main>
            </div>
        </div>
    )
}
