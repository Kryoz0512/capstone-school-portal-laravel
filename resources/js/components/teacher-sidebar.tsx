import { Link } from '@inertiajs/react'
import {
    LayoutDashboard,
    FileSpreadsheet,
    Users,
    FileText,
    Calendar,
    File,
    Settings,
    User,
    GraduationCap,
    BookOpen
} from 'lucide-react'

type SidebarProps = {
    currentPath?: string
    user?: {
        name: string
        email: string
        role: string
    }
    teacher?: {
        name: string
        position?: string
    }
}

export default function TeacherSidebar({ currentPath, user, teacher }: SidebarProps) {
    const getCurrentPath = () => {
        if (typeof window !== 'undefined') {
            return window.location.pathname
        }
        return ''
    }

    const isActive = (path: string) => {
        return getCurrentPath() === path
    }

    return (
        <div className="w-72 bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 h-screen flex flex-col text-white fixed left-0 top-0 shadow-2xl border-r border-blue-700/50">
            {/* Logo/Brand Section */}
            <div className="p-6 bg-gradient-to-r from-blue-800/50 to-blue-700/30 backdrop-blur-sm border-b border-blue-700/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                        <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white tracking-wide">Teacher Portal</h2>
                        <p className="text-xs text-blue-200">Education System</p>
                    </div>
                </div>
            </div>

            {/* Navigation - Scrollable */}
            <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-blue-900/20 px-3">
                {/* Dashboard */}
                <Link
                    href="/teacher/dashboard"
                    className={`flex items-center gap-3 px-4 py-3 mb-1 rounded-xl transition-all duration-300 group ${isActive('/teacher/dashboard')
                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30 scale-[1.02]'
                            : 'text-blue-100 hover:bg-blue-700/50 hover:translate-x-1'
                        }`}
                >
                    <div className={`p-2 rounded-lg transition-all duration-300 ${isActive('/teacher/dashboard')
                            ? 'bg-white/20'
                            : 'bg-blue-700/30 group-hover:bg-blue-600/40'
                        }`}>
                        <LayoutDashboard className="w-4 h-4" />
                    </div>
                    <span className="font-medium">Dashboard</span>
                </Link>

                {/* Grade Sheets */}
                <Link
                    href="/teacher/grade-sheets"
                    className={`flex items-center gap-3 px-4 py-3 mb-1 rounded-xl transition-all duration-300 group ${isActive('/teacher/grade-sheets')
                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30 scale-[1.02]'
                            : 'text-blue-100 hover:bg-blue-700/50 hover:translate-x-1'
                        }`}
                >
                    <div className={`p-2 rounded-lg transition-all duration-300 ${isActive('/teacher/grade-sheets')
                            ? 'bg-white/20'
                            : 'bg-blue-700/30 group-hover:bg-blue-600/40'
                        }`}>
                        <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <span className="font-medium">Grade Sheets</span>
                </Link>

                {/* Class List */}
                <Link
                    href="/teacher/class-list"
                    className={`flex items-center gap-3 px-4 py-3 mb-1 rounded-xl transition-all duration-300 group ${isActive('/teacher/class-list')
                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30 scale-[1.02]'
                            : 'text-blue-100 hover:bg-blue-700/50 hover:translate-x-1'
                        }`}
                >
                    <div className={`p-2 rounded-lg transition-all duration-300 ${isActive('/teacher/class-list')
                            ? 'bg-white/20'
                            : 'bg-blue-700/30 group-hover:bg-blue-600/40'
                        }`}>
                        <Users className="w-4 h-4" />
                    </div>
                    <span className="font-medium">Class List</span>
                </Link>

                {/* Final Report */}
                <Link
                    href="/teacher/final-report"
                    className={`flex items-center gap-3 px-4 py-3 mb-1 rounded-xl transition-all duration-300 group ${isActive('/teacher/final-report')
                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30 scale-[1.02]'
                            : 'text-blue-100 hover:bg-blue-700/50 hover:translate-x-1'
                        }`}
                >
                    <div className={`p-2 rounded-lg transition-all duration-300 ${isActive('/teacher/final-report')
                            ? 'bg-white/20'
                            : 'bg-blue-700/30 group-hover:bg-blue-600/40'
                        }`}>
                        <FileText className="w-4 h-4" />
                    </div>
                    <span className="font-medium">Final Report</span>
                </Link>

                {/* Transcript of Records */}
                <Link
                    href="/teacher/transcript-of-records"
                    className={`flex items-center gap-3 px-4 py-3 mb-1 rounded-xl transition-all duration-300 group ${isActive('/teacher/transcript-of-records')
                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30 scale-[1.02]'
                            : 'text-blue-100 hover:bg-blue-700/50 hover:translate-x-1'
                        }`}
                >
                    <div className={`p-2 rounded-lg transition-all duration-300 ${isActive('/teacher/transcript-of-records')
                            ? 'bg-white/20'
                            : 'bg-blue-700/30 group-hover:bg-blue-600/40'
                        }`}>
                        <File className="w-4 h-4" />
                    </div>
                    <span className="font-medium">Transcript of Records</span>
                </Link>

                {/* Schedule */}
                <Link
                    href="/teacher/schedule"
                    className={`flex items-center gap-3 px-4 py-3 mb-1 rounded-xl transition-all duration-300 group ${isActive('/teacher/schedule')
                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30 scale-[1.02]'
                            : 'text-blue-100 hover:bg-blue-700/50 hover:translate-x-1'
                        }`}
                >
                    <div className={`p-2 rounded-lg transition-all duration-300 ${isActive('/teacher/schedule')
                            ? 'bg-white/20'
                            : 'bg-blue-700/30 group-hover:bg-blue-600/40'
                        }`}>
                        <Calendar className="w-4 h-4" />
                    </div>
                    <span className="font-medium">Schedule</span>
                </Link>

                {/* Documents */}
                <Link
                    href="/teacher/documents"
                    className={`flex items-center gap-3 px-4 py-3 mb-1 rounded-xl transition-all duration-300 group ${isActive('/teacher/documents')
                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30 scale-[1.02]'
                            : 'text-blue-100 hover:bg-blue-700/50 hover:translate-x-1'
                        }`}
                >
                    <div className={`p-2 rounded-lg transition-all duration-300 ${isActive('/teacher/documents')
                            ? 'bg-white/20'
                            : 'bg-blue-700/30 group-hover:bg-blue-600/40'
                        }`}>
                        <File className="w-4 h-4" />
                    </div>
                    <span className="font-medium">Documents</span>
                </Link>
                {/* Documents */}
                <Link
                    href="/teacher/student-clearance"
                    className={`flex items-center gap-3 px-4 py-3 mb-1 rounded-xl transition-all duration-300 group ${isActive('/teacher/student-clearance')
                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30 scale-[1.02]'
                            : 'text-blue-100 hover:bg-blue-700/50 hover:translate-x-1'
                        }`}
                >
                    <div className={`p-2 rounded-lg transition-all duration-300 ${isActive('/teacher/student-clearance')
                            ? 'bg-white/20'
                            : 'bg-blue-700/30 group-hover:bg-blue-600/40'
                        }`}>
                        <GraduationCap className="w-4 h-4" />
                    </div>
                    <span className="font-medium">Student Clearance</span>
                </Link>
            </nav>
        </div>
    )
}
