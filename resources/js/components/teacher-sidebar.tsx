import { Link, usePage } from '@inertiajs/react'
import {
    LayoutDashboard,
    FileSpreadsheet,
    Users,
    FileText,
    Calendar,
    File,
    GraduationCap,
    BookOpen,
    UserCheck,
} from 'lucide-react'

const baseNavItems = [
    { href: '/teacher/dashboard',         label: 'Dashboard',         Icon: LayoutDashboard },
    { href: '/teacher/grade-sheets',      label: 'Grade Sheets',      Icon: FileSpreadsheet },
    { href: '/teacher/class-list',        label: 'Class List',        Icon: Users },
    { href: '/teacher/final-report',      label: 'Final Report',      Icon: FileText },
    { href: '/teacher/schedule',          label: 'Schedule',          Icon: Calendar },
    { href: '/teacher/documents',         label: 'Documents',         Icon: File },
    { href: '/teacher/student-clearance', label: 'Student Clearance', Icon: GraduationCap },
]

const advisoryNavItems = [
    { href: '/teacher/advisory/dashboard',  label: 'Advisory Overview', Icon: UserCheck },
    { href: '/teacher/advisory/class-list', label: 'Advisory Class',  Icon: Users },
]

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
    const { auth } = usePage<{ auth: { teacher?: { is_adviser?: boolean } } }>().props
    const isAdviser = auth?.teacher?.is_adviser === true
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : ''
    const isActive = (path: string) => currentPath === path

    const renderNavItem = ({ href, label, Icon }: { href: string; label: string; Icon: typeof LayoutDashboard }) => (
        <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-4 py-3 mb-1 rounded-xl transition-all duration-200 group ${
                isActive(href)
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30 scale-[1.02]'
                    : 'text-blue-100 hover:bg-blue-700/50 hover:translate-x-1'
            }`}
        >
            <div className={`p-2 rounded-lg transition-all duration-200 ${
                isActive(href)
                    ? 'bg-white/20'
                    : 'bg-blue-700/30 group-hover:bg-blue-600/40'
            }`}>
                <Icon className="w-4 h-4" />
            </div>
            <span className="font-medium">{label}</span>
        </Link>
    )

    return (
        <div className="flex flex-col h-full text-white bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900">
            <div className="p-6 bg-gradient-to-r from-blue-800/50 to-blue-700/30 border-b border-blue-700/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shrink-0">
                        <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold tracking-wide">Teacher Portal</h2>
                        <p className="text-xs text-blue-200">Education System</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 py-4 px-3 overflow-y-auto">
                {baseNavItems.map(renderNavItem)}

                {isAdviser && (
                    <>
                        <div className="my-3 px-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-blue-300/80">Advisory (View Only)</p>
                        </div>
                        {advisoryNavItems.map(renderNavItem)}
                    </>
                )}
            </nav>
        </div>
    )
}

export default function TeacherSidebar() {
    return (
        <aside className="hidden lg:flex w-72 shrink-0 fixed left-0 top-0 h-screen flex-col shadow-2xl border-r border-blue-700/50 z-30">
            <SidebarContent />
        </aside>
    )
}
