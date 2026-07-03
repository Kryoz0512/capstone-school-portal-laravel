import { router, Link, usePage } from '@inertiajs/react'
import { User, LogOut, ChevronDown, Bell, Menu } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useNotifications, type Notification } from '@/hooks/use-notifications'
import { AdviserSidebarContent } from '@/components/adviser-sidebar'

type HeaderProps = {
    user?: { name: string; email: string; role: string }
    teacher?: { profile_picture?: string | null }
}

export default function AdviserHeader({ user, teacher }: HeaderProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [isNotificationOpen, setIsNotificationOpen] = useState(false)
    const [sheetOpen, setSheetOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const notificationRef = useRef<HTMLDivElement>(null)
    const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useNotifications()

    const { auth } = usePage<{
        auth: {
            teacher?: {
                profile_picture?: string | null
                advisory_section?: { grade_level?: string; name?: string } | null
            }
        }
    }>().props

    let profilePicture: string | null = null
    if (auth?.teacher?.profile_picture && typeof auth.teacher.profile_picture === 'string') {
        profilePicture = auth.teacher.profile_picture
    } else if (teacher?.profile_picture && typeof teacher.profile_picture === 'string') {
        profilePicture = teacher.profile_picture
    }

    const advisoryLabel = auth?.teacher?.advisory_section
        ? `${auth.teacher.advisory_section.grade_level ?? ''} - ${auth.teacher.advisory_section.name ?? 'Advisory'}`.trim()
        : 'Class Adviser'

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

    useEffect(() => { if (isNotificationOpen) fetchNotifications() }, [isNotificationOpen, fetchNotifications])

    const handleNotificationClick = async (n: Notification) => {
        setIsNotificationOpen(false)
        if (!n.is_read) await markAsRead(n.id)
        router.visit('/adviser/dashboard', { preserveScroll: true })
    }

    return (
        <header className="bg-white border-b border-gray-200 px-4 sm:px-8 py-3 shadow-md sticky top-0 z-20">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="lg:hidden text-gray-600 hover:bg-gray-100" aria-label="Open menu">
                                <Menu className="w-5 h-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 w-72 border-r border-blue-700/50 [&>button]:text-white [&>button]:top-4 [&>button]:right-4">
                            <AdviserSidebarContent onNavigate={() => setSheetOpen(false)} />
                        </SheetContent>
                    </Sheet>
                    <div className="hidden sm:block">
                        <p className="text-sm text-gray-500">{currentDate}</p>
                        <p className="text-xs text-blue-700 font-medium truncate">{advisoryLabel}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                    <div className="relative" ref={notificationRef}>
                        <button onClick={() => setIsNotificationOpen(!isNotificationOpen)} className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
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
                                        <button onClick={() => markAllAsRead()} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                                            Mark all as read
                                        </button>
                                    )}
                                </div>
                                <div className="overflow-y-auto flex-1">
                                    {notifications.length > 0 ? notifications.map(n => (
                                        <button key={n.id} onClick={() => handleNotificationClick(n)} className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${!n.is_read ? 'bg-blue-50' : ''}`}>
                                            <div className="flex items-start gap-3">
                                                <div className={`w-2 h-2 rounded-full mt-1 ${!n.is_read ? 'bg-blue-500' : 'bg-gray-300'}`} />
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

                    <div className="relative" ref={dropdownRef}>
                        <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                            {profilePicture ? (
                                <img src={profilePicture} alt="Profile" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-blue-600" />
                            ) : (
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                                    <User className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                                </div>
                            )}
                            <div className="text-left hidden sm:block">
                                <p className="text-sm font-medium text-gray-900">{user?.name || 'Adviser'}</p>
                                <p className="text-xs text-gray-500">Class Adviser</p>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform hidden sm:block ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                <Link href="/teacher/profile-settings" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition-colors">
                                    <User className="w-4 h-4 text-gray-600" />
                                    <span className="text-sm text-gray-700">Profile</span>
                                </Link>
                                {/* <Link href="/teacher/dashboard" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition-colors">
                                    <span className="text-sm text-gray-700">Teacher Portal</span>
                                </Link> */}
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