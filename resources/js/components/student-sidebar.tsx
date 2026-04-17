import { Link } from '@inertiajs/react'
import {
    LayoutDashboard,
    Calendar,
    BookOpen,
    FileText,
    FileSpreadsheet,
    Settings,
    User
} from 'lucide-react'

type SidebarProps = {
    currentPath?: string
    user?: {
        name: string
        email: string
        role: string
    }
    student?: {
        first_name: string
        last_name: string
        grade_level?: string
    }
}

export default function StudentSidebar({ currentPath, user, student }: SidebarProps) {
    const studentName = student ? `${student.first_name} ${student.last_name}` : user?.name || 'Student'
    const studentInfo = student?.grade_level ? `Grade ${student.grade_level}` : 'Student'
    
    return (
        <div className="w-64 bg-purple-700 h-screen flex flex-col text-white fixed left-0 top-0">
            {/* Profile Section */}
            <div className="p-6 border-b border-purple-600">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-800 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-white">{studentName}</p>
                        <p className="text-xs text-purple-100">{studentInfo}</p>
                    </div>
                </div>
            </div>

            {/* Navigation - Scrollable */}
            <nav className="flex-1 py-4 overflow-y-auto scrollbar-hide">
                {/* Dashboard */}
                <Link
                    href="/student/dashboard"
                    className="flex items-center gap-3 px-6 py-3 text-purple-50 hover:bg-purple-600 transition-colors"
                >
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Dashboard</span>
                </Link>

                {/* Student Clearance */}
                <Link
                    href="/student/clearance"
                    className="flex items-center gap-3 px-6 py-3 text-purple-50 hover:bg-purple-600 transition-colors"
                >
                    <FileText className="w-5 h-5" />
                    <span>Student Clearance</span>
                </Link>

                {/* Enrolled Subjects */}
                <Link
                    href="/student/enrolled-subjects"
                    className="flex items-center gap-3 px-6 py-3 text-purple-50 hover:bg-purple-600 transition-colors"
                >
                    <BookOpen className="w-5 h-5" />
                    <span>Enrolled Subjects</span>
                </Link>

                {/* Student Schedule */}
                <Link
                    href="/student/schedule"
                    className="flex items-center gap-3 px-6 py-3 text-purple-50 hover:bg-purple-600 transition-colors"
                >
                    <Calendar className="w-5 h-5" />
                    <span>Student Schedule</span>
                </Link>

                {/* Report Card */}
                <Link
                    href="/student/report-card"
                    className="flex items-center gap-3 px-6 py-3 text-purple-50 hover:bg-purple-600 transition-colors"
                >
                    <FileSpreadsheet className="w-5 h-5" />
                    <span>Report Card</span>
                </Link>

                {/* Profile Settings */}
                <Link
                    href="/student/profile-settings"
                    className="flex items-center gap-3 px-6 py-3 text-purple-50 hover:bg-purple-600 transition-colors"
                >
                    <Settings className="w-5 h-5" />
                    <span>Profile Settings</span>
                </Link>
            </nav>
        </div>
    )
}
