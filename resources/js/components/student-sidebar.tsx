import { Link } from '@inertiajs/react'
import {
    LayoutDashboard,
    Calendar,
    BookOpen,
    FileText,
    FileSpreadsheet,
    Settings,
    User,
    GraduationCap
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
        <div className="w-72 bg-gradient-to-b from-purple-900 via-purple-800 to-purple-900 h-screen flex flex-col text-white fixed left-0 top-0 shadow-2xl border-r border-purple-700/50">
            {/* Logo/Brand Section */}
            <div className="p-6 bg-gradient-to-r from-purple-800/50 to-purple-700/30 backdrop-blur-sm border-b border-purple-700/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white tracking-wide">Student Portal</h2>
                        <p className="text-xs text-purple-200">Learning System</p>
                    </div>
                </div>
            </div>

            {/* Navigation - Scrollable */}
            <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-purple-900/20 px-3">
                {/* Dashboard */}
                <Link
                    href="/student/dashboard"
                    className={`flex items-center gap-3 px-4 py-3 mb-1 rounded-xl transition-all duration-300 group ${
                        isActive('/student/dashboard') 
                            ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/30 scale-[1.02]' 
                            : 'text-purple-100 hover:bg-purple-700/50 hover:translate-x-1'
                    }`}
                >
                    <div className={`p-2 rounded-lg transition-all duration-300 ${
                        isActive('/student/dashboard')
                            ? 'bg-white/20'
                            : 'bg-purple-700/30 group-hover:bg-purple-600/40'
                    }`}>
                        <LayoutDashboard className="w-4 h-4" />
                    </div>
                    <span className="font-medium">Dashboard</span>
                </Link>

                {/* Student Clearance */}
                <Link
                    href="/student/clearance"
                    className={`flex items-center gap-3 px-4 py-3 mb-1 rounded-xl transition-all duration-300 group ${
                        isActive('/student/clearance') 
                            ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/30 scale-[1.02]' 
                            : 'text-purple-100 hover:bg-purple-700/50 hover:translate-x-1'
                    }`}
                >
                    <div className={`p-2 rounded-lg transition-all duration-300 ${
                        isActive('/student/clearance')
                            ? 'bg-white/20'
                            : 'bg-purple-700/30 group-hover:bg-purple-600/40'
                    }`}>
                        <FileText className="w-4 h-4" />
                    </div>
                    <span className="font-medium">Student Clearance</span>
                </Link>

                {/* Enrolled Subjects */}
                <Link
                    href="/student/enrolled-subjects"
                    className={`flex items-center gap-3 px-4 py-3 mb-1 rounded-xl transition-all duration-300 group ${
                        isActive('/student/enrolled-subjects') 
                            ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/30 scale-[1.02]' 
                            : 'text-purple-100 hover:bg-purple-700/50 hover:translate-x-1'
                    }`}
                >
                    <div className={`p-2 rounded-lg transition-all duration-300 ${
                        isActive('/student/enrolled-subjects')
                            ? 'bg-white/20'
                            : 'bg-purple-700/30 group-hover:bg-purple-600/40'
                    }`}>
                        <BookOpen className="w-4 h-4" />
                    </div>
                    <span className="font-medium">Enrolled Subjects</span>
                </Link>

                {/* Student Schedule */}
                <Link
                    href="/student/schedule"
                    className={`flex items-center gap-3 px-4 py-3 mb-1 rounded-xl transition-all duration-300 group ${
                        isActive('/student/schedule') 
                            ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/30 scale-[1.02]' 
                            : 'text-purple-100 hover:bg-purple-700/50 hover:translate-x-1'
                    }`}
                >
                    <div className={`p-2 rounded-lg transition-all duration-300 ${
                        isActive('/student/schedule')
                            ? 'bg-white/20'
                            : 'bg-purple-700/30 group-hover:bg-purple-600/40'
                    }`}>
                        <Calendar className="w-4 h-4" />
                    </div>
                    <span className="font-medium">Student Schedule</span>
                </Link>

                {/* Report Card */}
                <Link
                    href="/student/report-card"
                    className={`flex items-center gap-3 px-4 py-3 mb-1 rounded-xl transition-all duration-300 group ${
                        isActive('/student/report-card') 
                            ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/30 scale-[1.02]' 
                            : 'text-purple-100 hover:bg-purple-700/50 hover:translate-x-1'
                    }`}
                >
                    <div className={`p-2 rounded-lg transition-all duration-300 ${
                        isActive('/student/report-card')
                            ? 'bg-white/20'
                            : 'bg-purple-700/30 group-hover:bg-purple-600/40'
                    }`}>
                        <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <span className="font-medium">Report Card</span>
                </Link>

                {/* Profile Settings */}
                <Link
                    href="/student/profile-settings"
                    className={`flex items-center gap-3 px-4 py-3 mb-1 rounded-xl transition-all duration-300 group ${
                        isActive('/student/profile-settings') 
                            ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/30 scale-[1.02]' 
                            : 'text-purple-100 hover:bg-purple-700/50 hover:translate-x-1'
                    }`}
                >
                    <div className={`p-2 rounded-lg transition-all duration-300 ${
                        isActive('/student/profile-settings')
                            ? 'bg-white/20'
                            : 'bg-purple-700/30 group-hover:bg-purple-600/40'
                    }`}>
                        <Settings className="w-4 h-4" />
                    </div>
                    <span className="font-medium">Profile Settings</span>
                </Link>
            </nav>
        </div>
    )
}
