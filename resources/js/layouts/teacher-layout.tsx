import { ReactNode } from 'react'
import TeacherSidebar from '@/components/teacher-sidebar'
import TeacherHeader from '@/components/teacher-header'

type TeacherLayoutProps = {
    children: ReactNode
    user?: {
        name: string
        email: string
        role: string
    }
}

export default function TeacherLayout({ children, user }: TeacherLayoutProps) {
    return (
        <div className="flex min-h-screen bg-white">
            {/* Sidebar - Fixed */}
            <TeacherSidebar />

            {/* Main Content - With left margin for fixed sidebar */}
            <div className="flex-1 flex flex-col ml-64">
                {/* Header */}
                <TeacherHeader user={user} />

                {/* Page Content */}
                <main className="flex-1 p-8 bg-gray-50">
                    {children}
                </main>
            </div>
        </div>
    )
}
