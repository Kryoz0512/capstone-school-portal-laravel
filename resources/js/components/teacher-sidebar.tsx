import { Link, router } from '@inertiajs/react'
import {
    LayoutDashboard,
    FileSpreadsheet,
    Users,
    FileText,
    Calendar,
    File,
    User,
    Settings,
    LogOut
} from 'lucide-react'

type SidebarProps = {
    currentPath?: string
}

export default function TeacherSidebar({ currentPath }: SidebarProps) {
    const handleLogout = () => {
        router.post('/logout')
    }

    return (
        <div className="w-64 bg-green-700 h-screen flex flex-col text-white fixed left-0 top-0">
            {/* Logo/Brand */}
            <div className="p-6 border-b border-green-600 flex-shrink-0">
                <h1 className="text-xl font-bold">Santor National</h1>
                <p className="text-sm text-green-100">Highschool</p>
            </div>

            {/* Navigation - Scrollable */}
            <nav className="flex-1 py-4 overflow-y-auto scrollbar-hide">
                {/* Dashboard */}
                <Link
                    href="/teacher/dashboard"
                    className="flex items-center gap-3 px-6 py-3 hover:bg-green-600 transition-colors"
                >
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Dashboard</span>
                </Link>

                {/* Grade Sheets */}
                <Link
                    href="/teacher/grade-sheets"
                    className="flex items-center gap-3 px-6 py-3 hover:bg-green-600 transition-colors"
                >
                    <FileSpreadsheet className="w-5 h-5" />
                    <span>Grade Sheets</span>
                </Link>

                {/* Class List */}
                <Link
                    href="/teacher/class-list"
                    className="flex items-center gap-3 px-6 py-3 hover:bg-green-600 transition-colors"
                >
                    <Users className="w-5 h-5" />
                    <span>Class List</span>
                </Link>

                {/* Final Report */}
                <Link
                    href="/teacher/final-report"
                    className="flex items-center gap-3 px-6 py-3 hover:bg-green-600 transition-colors"
                >
                    <FileText className="w-5 h-5" />
                    <span>Final Report</span>
                </Link>

                {/* Transcript of Records */}
                <Link
                    href="/teacher/transcript-of-records"
                    className="flex items-center gap-3 px-6 py-3 hover:bg-green-600 transition-colors"
                >
                    <File className="w-5 h-5" />
                    <span>Transcript of Records</span>
                </Link>

                {/* Schedule */}
                <Link
                    href="/teacher/schedule"
                    className="flex items-center gap-3 px-6 py-3 hover:bg-green-600 transition-colors"
                >
                    <Calendar className="w-5 h-5" />
                    <span>Schedule</span>
                </Link>

                {/* Documents */}
                <Link
                    href="/teacher/documents"
                    className="flex items-center gap-3 px-6 py-3 hover:bg-green-600 transition-colors"
                >
                    <File className="w-5 h-5" />
                    <span>Documents</span>
                </Link>

                {/* Profile */}
                <Link
                    href="/teacher/profile"
                    className="flex items-center gap-3 px-6 py-3 hover:bg-green-600 transition-colors"
                >
                    <User className="w-5 h-5" />
                    <span>Profile</span>
                </Link>

                {/* Profile Settings */}
                <Link
                    href="/teacher/profile-settings"
                    className="flex items-center gap-3 px-6 py-3 hover:bg-green-600 transition-colors"
                >
                    <Settings className="w-5 h-5" />
                    <span>Profile Settings</span>
                </Link>
            </nav>

            {/* Logout */}
            <div className="border-t border-green-600 flex-shrink-0">
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
