import { Link, router } from '@inertiajs/react'
import {
    LayoutDashboard,
    Calendar,
    BookOpen,
    FileText,
    FileSpreadsheet,
    Settings,
    LogOut
} from 'lucide-react'

type SidebarProps = {
    currentPath?: string
}

export default function StudentSidebar({ currentPath }: SidebarProps) {
    const handleLogout = () => {
        router.post('/logout')
    }

    return (
        <div className="w-64 bg-green-700 h-screen flex flex-col text-white fixed left-0 top-0">
            {/* Logo/Brand */}
            <div className="p-6 border-b border-green-600 shrink-0">
                <h1 className="text-xl font-bold">Santor National</h1>
                <p className="text-sm text-green-100">Highschool</p>
            </div>

            {/* Navigation - Scrollable */}
            <nav className="flex-1 py-4 overflow-y-auto scrollbar-hide">
                {/* Dashboard */}
                <Link
                    href="/student/dashboard"
                    className="flex items-center gap-3 px-6 py-3 hover:bg-green-600 transition-colors"
                >
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Dashboard</span>
                </Link>

                {/* Student Clearance */}
                <Link
                    href="/student/clearance"
                    className="flex items-center gap-3 px-6 py-3 hover:bg-green-600 transition-colors"
                >
                    <FileText className="w-5 h-5" />
                    <span>Student Clearance</span>
                </Link>

                {/* Enrolled Subjects */}
                <Link
                    href="/student/enrolled-subjects"
                    className="flex items-center gap-3 px-6 py-3 hover:bg-green-600 transition-colors"
                >
                    <BookOpen className="w-5 h-5" />
                    <span>Enrolled Subjects</span>
                </Link>

                {/* Student Schedule */}
                <Link
                    href="/student/schedule"
                    className="flex items-center gap-3 px-6 py-3 hover:bg-green-600 transition-colors"
                >
                    <Calendar className="w-5 h-5" />
                    <span>Student Schedule</span>
                </Link>

                {/* Report Card */}
                <Link
                    href="/student/report-card"
                    className="flex items-center gap-3 px-6 py-3 hover:bg-green-600 transition-colors"
                >
                    <FileSpreadsheet className="w-5 h-5" />
                    <span>Report Card</span>
                </Link>

                {/* Profile Settings */}
                <Link
                    href="/student/profile-settings"
                    className="flex items-center gap-3 px-6 py-3 hover:bg-green-600 transition-colors"
                >
                    <Settings className="w-5 h-5" />
                    <span>Profile Settings</span>
                </Link>
            </nav>

            {/* Logout */}
            <div className="border-t border-green-600 shrink-0">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-6 py-4 hover:bg-red-400 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    )
}
