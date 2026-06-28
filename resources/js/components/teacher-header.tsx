importimport { router, Link, usePage } from '@inertiajs/react'
import { User, LogOut, ChevronDown, Bell, Menu, BookOpen, LayoutDashboard, FileSpreadsheet, Users, FileText, Calendar, File, GraduationCap } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'

type Notification = {
    id: number
    type: string
    title: string
    message: string
    announcement_id: number | null
    is_read: boolean
    created_at: string
    created_at_full: string
}

type HeaderProps = {
    user?: { name: string; email: string; role: string }
    teacher?: { profile_picture?: string | null }
}

const navItems = [
    { href: '/teacher/dashboard',         label: 'Dashboard',         Icon: LayoutDashboard },
    { href: '/teacher/grade-sheets',      label: 'Grade Sheets',      Icon: FileSpreadsheet },
    { href: '/teacher/class-list',        label: 'Class List',        Icon: Users },
    { href: '/teacher/final-report',      label: 'Final Report',      Icon: FileText },
    { href: '/teacher/schedule',          label: 'Schedule',          Icon: Calendar },
    { href: '/teacher/documents',         label: 'Documents',         Icon: File },
    { href: '/teacher/student-clearance', label: 'Student Clearance', Icon: GraduationCap },
]

function MobileSidebarContent({ onNavigate }: { onNavigate: () => void }) {
    const current = typeof window !== 'undefined' ? window.location.pathname : ''
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
                {navItems.map(({ href, label, Icon }) => (
                    <Link
                        key={href}
                        href={href}
                        onClick={onNavigate}
                        className={`flex items-center gap-3 px-4 py-3 mb-1 rounded-xl transition-all duration-200 group ${
                            current === href
                                ? 'bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/30'
                                : 'text-blue-100 hover:bg-blue-700/50'
                        }`}
                    >
                        <div className={`p-2 rounded-lg ${current === href ? 'bg-white/20' : 'bg-blue-700/30 group-hover:bg-blue-600/40'}`}>
                            <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-medium">{label}</span>
                    </Link>
                ))}
            </nav>
        </div>
    )
}

export default function TeacherHeader({ user, teacher }: HeaderProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [isNotificationOpen, setIsNotificationOpen] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [sheetOpen, setSheetOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const notificationRef = useRef<HTMLDivElement>(null)

    const { auth } = usePage<{ auth: { teacher?: { profile_picture?: string | null } } }>().props

    let profilePicture: string | null = null
    if (auth?.teacher?.profile_picture && typeof auth.teacher.profile_picture === 'string') {
        profilePicture = auth.teacher.profile_picture
    } else if (teacher?.profile_picture) {
        if (typeof teacher.profile_picture === 'string') {
            profilePicture = teacher.profile_picture
        } else if (typeof teacher.profile_picture === 'object' && 'file_path' in (teacher.profile_picture as object)) {
            const p = teacher.profile_picture as { file_path: string }
            profilePicture = `${window.location.origin}/storage/${p.file_path}`
        }
    }

    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long', month: 'short', day: 'numeric',
    })

    const handleLogout = () => router.post('/logout')

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
                setIsDropdownOpen(false)
            if (notificationRef.current && !notificationRef.current.contains(e.target as Node))
                setIsNotificationOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications')
            const data = await res.json()
            setNotifications(data)
        } catch { /* silent */ }
    }

    const fetchUnreadCount = async () => {
        try {
            const res = await fetch('/api/notifications/unread-count')
            const data = await res.json()
            setUnreadCount(data.count)
        } catch { /* silent */ }
    }

    useEffect(() => {
        fetchUnreadCount()
        const iv = setInterval(fetchUnreadCount, 30_000)
        return () => clearInterval(iv)
    }, [])

    useEffect(() => { if (isNotificationOpen) fetchNotifications() }, [isNotificationOpen])

    const handleNotificationClick = async (n: Notification) => {
        if (n.is_read) { setIsNotificationOpen(false); router.visit('/teacher/dashboard', { preserveScroll: true }); return }
        setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, is_read: true } : x))
        setUnreadCount(prev => Math.max(0, prev - 1))
        setIsNotificationOpen(false)
        try {
            await fetch(`/api/notifications/${n.id}/read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
                },
            })
        } catch { /* silent */ }
        router.visit('/teacher/dashboard', { preserveScroll: true })
    }

    const handleMarkAllAsRead = async () => {
        try {
            await fetch('/api/notifications/mark-all-read', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
                },
            })
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
            setUnreadCount(0)
        } catch { /* silent */ }
    }

    return (
        <header className="bg-white border-b border-gray-200 px-4 sm:px-8 py-3 shadow-md sticky top-0 z-20">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="lg:hidden text-gray-600 hover:bg-gray-100"
                                aria-label="Open menu"
                            >
                                <Menu className="w-5 h-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent
                            side="left"
                            className="p-0 w-72 border-r border-blue-700/50 [&>button]:text-white [&>button]:top-4 [&>button]:right-4"
                        >
                            <MobileSidebarContent onNavigate={() => setSheetOpen(false)} />
                        </SheetContent>
                    </Sheet>
                    <p className="text-sm text-gray-500 hidden sm:block">{currentDate}</p>
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                    {/* Notification Bell */}
                    <div className="relative" ref={notificationRef}>
                        <button
                            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                            {unreadCount > 0 && (
                                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>
                        {isNotificationOpen && (
                            <div className="absolute right-0 mt-2 w-72 sm:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[500px] overflow-hidden flex flex-col">
                                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <button onClick={handleMarkAllAsRead} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                                            Mark all as read
                                        </button>
                                    )}
                                </div>
                                <div className="overflow-y-auto flex-1">
                                    {notifications.length > 0 ? notifications.map(n => (
                                        <button
                                            key={n.id}
                                            onClick={() => handleNotificationClick(n)}
                                            className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${!n.is_read ? 'bg-blue-50' : ''}`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="shrink-0 mt-1">
                                                    <div className={`w-2 h-2 rounded-full ${!n.is_read ? 'bg-blue-500' : 'bg-gray-300'}`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">{n.title}</p>
                                                    <p className="text-sm text-gray-600 truncate">{n.message}</p>
                                                    <p className="text-xs text-gray-400 mt-1">{n.created_at}</p>
                                                </div>
                                            </div>
                                        </button>
                                    )) : (
                                        <div className="p-8 text-center text-gray-500">
                                            <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                            <p className="text-sm">No notifications yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Profile Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            {profilePicture ? (
                                <img src={profilePicture} alt="Profile" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-blue-600" />
                            ) : (
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                                    <User className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                                </div>
                            )}
                            <div className="text-left hidden sm:block">
                                <p className="text-sm font-medium text-gray-900">{user?.name || 'Teacher'}</p>
                                <p className="text-xs text-gray-500">Teacher</p>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform hidden sm:block ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                <Link href="/teacher/profile-settings" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition-colors">
                                    <User className="w-4 h-4 text-gray-600" />
                                    <span className="text-sm text-gray-700">Profile</span>
                                </Link>
                                <div className="border-t border-gray-200 my-2" />
                                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 transition-colors text-left">
                                    <LogOut className="w-4 h-4 text-red-600" />
                                    <span className="text-sm text-red-600">Logout</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}