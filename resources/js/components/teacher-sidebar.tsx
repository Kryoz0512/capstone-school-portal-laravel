import { Link } from '@inertiajs/react'
import {
    LayoutDashboard,
    Calendar,
    BookOpen,
    FileText,
    FileSpreadsheet,
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

const navItems = [
    { href: '/student/dashboard',         label: 'Dashboard',         Icon: LayoutDashboard },
    { href: '/student/clearance',         label: 'Student Clearance', Icon: FileText },
    { href: '/student/enrolled-subjects', label: 'Enrolled Subjects', Icon: BookOpen },
    { href: '/student/schedule',          label: 'Student Schedule',  Icon: Calendar },
    { href: '/student/report-card',       label: 'Report Card',       Icon: FileSpreadsheet },
]

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
    const getCurrentPath = () =>
        typeof window !== 'undefined' ? window.location.pathname : ''
    const isActive = (path: string) => getCurrentPath() === path

    return (
        <div className="flex flex-col h-full text-white bg-gradient-to-b from-purple-900 via-purple-800 to-purple-900">
            <div className="p-6 bg-gradient-to-r from-purple-800/50 to-purple-700/30 border-b border-purple-700/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shrink-0">
                        <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white tracking-wide">Student Portal</h2>
                        <p className="text-xs text-purple-200">Learning System</p>
                    </div>
                </div>
            </div>
            <nav className="flex-1 py-4 overflow-y-auto px-3 scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-purple-900/20">
                {navItems.map(({ href, label, Icon }) => (
                    <Link
                        key={href}
                        href={href}
                        onClick={onNavigate}
                        className={`flex items-center gap-3 px-4 py-3 mb-1 rounded-xl transition-all duration-300 group ${
                            isActive(href)
                                ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/30 scale-[1.02]'
                                : 'text-purple-100 hover:bg-purple-700/50 hover:translate-x-1'
                        }`}
                    >
                        <div className={`p-2 rounded-lg transition-all duration-300 ${
                            isActive(href) ? 'bg-white/20' : 'bg-purple-700/30 group-hover:bg-purple-600/40'
                        }`}>
                            <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-medium">{label}</span>
                    </Link>
                ))}
            </nav>
        </div>
    )
}

export default function StudentSidebar({ user, student }: SidebarProps) {
    // Desktop-only sidebar. Mobile navigation is handled by StudentHeader's Sheet.
    return (
        <aside className="hidden lg:flex w-72 shrink-0 fixed left-0 top-0 h-screen flex-col shadow-2xl border-r border-purple-700/50 z-30">
            <SidebarContent />
        </aside>
    )
}