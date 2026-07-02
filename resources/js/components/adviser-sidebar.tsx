import { Link } from '@inertiajs/react'
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    FileSpreadsheet,
    BookOpen,
    ShieldCheck,
} from 'lucide-react'

export const adviserNavItems = [
    { href: '/adviser/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
    { href: '/adviser/class-list', label: 'Class List', Icon: Users },
    { href: '/adviser/advisory-clearance', label: 'Advisory Clearance', Icon: GraduationCap },
    { href: '/adviser/advisory-grades', label: 'Advisory Grades', Icon: FileSpreadsheet },
]

export function AdviserSidebarContent({ onNavigate }: { onNavigate?: () => void }) {
    const getCurrentPath = () =>
        typeof window !== 'undefined' ? window.location.pathname : ''
    const isActive = (path: string) => getCurrentPath() === path

    return (
        <div className="flex flex-col h-full text-white bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-900">
            <div className="p-6 bg-gradient-to-r from-emerald-800/50 to-emerald-700/30 border-b border-emerald-700/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shrink-0">
                        <ShieldCheck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white tracking-wide">Adviser Portal</h2>
                        <p className="text-xs text-emerald-200">Advisory Class Only</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 py-4 overflow-y-auto px-3">
                {adviserNavItems.map(({ href, label, Icon }) => (
                    <Link
                        key={href}
                        href={href}
                        onClick={onNavigate}
                        className={`flex items-center gap-3 px-4 py-3 mb-1 rounded-xl transition-all duration-300 group ${
                            isActive(href)
                                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-lg shadow-emerald-500/30'
                                : 'text-emerald-100 hover:bg-emerald-700/50 hover:translate-x-1'
                        }`}
                    >
                        <div className={`p-2 rounded-lg transition-all duration-300 ${
                            isActive(href) ? 'bg-white/20' : 'bg-emerald-700/30 group-hover:bg-emerald-600/40'
                        }`}>
                            <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-medium">{label}</span>
                    </Link>
                ))}
            </nav>

            <div className="p-3 border-t border-emerald-700/50">
                <Link
                    href="/teacher/dashboard"
                    onClick={onNavigate}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-emerald-100 hover:bg-emerald-700/50 transition-colors"
                >
                    <div className="p-2 rounded-lg bg-emerald-700/30">
                        <BookOpen className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-sm">Teacher Portal</span>
                </Link>
            </div>
        </div>
    )
}

export default function AdviserSidebar() {
    return (
        <aside className="hidden lg:flex w-72 shrink-0 fixed left-0 top-0 h-screen flex-col shadow-2xl border-r border-emerald-700/50 z-30">
            <AdviserSidebarContent />
        </aside>
    )
}
