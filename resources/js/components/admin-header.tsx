import { router, Link, usePage } from '@inertiajs/react'
import { User, LogOut, ChevronDown, Bell } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useNotifications, type Notification } from '@/hooks/use-notifications'

type HeaderProps = {
    user?: {
        name: string
        email: string
        role: string
    }
    admin?: {
        role: string
        position: string
        profile_picture?: string | null
    }
}

export default function AdminHeader({ user, admin }: HeaderProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [isNotificationOpen, setIsNotificationOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const notificationRef = useRef<HTMLDivElement>(null)
    const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useNotifications()
    
    // Get shared data directly from Inertia
    const page = usePage()
    const { auth } = page.props as { auth: { admin?: { profile_picture?: string | null } } }
    
    // Handle profile picture - ensure it's always an absolute URL
    let profilePicture: string | null = null
    
    // First try from shared auth data (middleware)
    if (auth?.admin?.profile_picture) {
        const pic = auth.admin.profile_picture
        if (typeof pic === 'string') {
            // If it's already a full URL, use it
            if (pic.startsWith('http://') || pic.startsWith('https://') || pic.startsWith('/')) {
                profilePicture = pic
            } else {
                // Otherwise, construct the full URL
                profilePicture = `${window.location.origin}/storage/${pic}`
            }
        }
    }
    // Then try from props (controller)
    else if (admin?.profile_picture) {
        const pic = admin.profile_picture
        if (typeof pic === 'string') {
            // If it's already a full URL, use it
            if (pic.startsWith('http://') || pic.startsWith('https://') || pic.startsWith('/')) {
                profilePicture = pic
            } else {
                // Otherwise, construct the full URL
                profilePicture = `${window.location.origin}/storage/${pic}`
            }
        } else if (typeof pic === 'object' && pic !== null && 'file_path' in pic) {
            // It's the full profile picture object, extract the URL
            const picObj = pic as { file_path: string }
            profilePicture = `${window.location.origin}/storage/${picObj.file_path}`
        }
    }

    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
    })

    const handleLogout = () => {
        router.post('/logout')
    }

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false)
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setIsNotificationOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Fetch notifications when dropdown opens
    useEffect(() => {
        if (isNotificationOpen) {
            fetchNotifications()
        }
    }, [isNotificationOpen, fetchNotifications])

    const getDashboardPath = () => {
        const role = user?.role || 'student'

        if (role === 'admin') {
            return '/admin/dashboard'
        }

        if (role === 'teacher') {
            return '/teacher/dashboard'
        }

        return '/student/dashboard'
    }

    // Mark notification as read and navigate
    const handleNotificationClick = async (notification: Notification) => {
        setIsNotificationOpen(false)

        if (!notification.is_read) {
            await markAsRead(notification.id)
        }

        router.visit(getDashboardPath(), { preserveScroll: true })
    }

    // Mark all as read
    const handleMarkAllAsRead = async () => {
        await markAllAsRead()
    }

    return (
        <header className="bg-white border-b border-gray-200 px-8 py-4 shadow-md">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-sm text-gray-500">{currentDate}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Notification Bell */}
                    <div className="relative" ref={notificationRef}>
                        <button
                            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <Bell className="w-6 h-6 text-gray-600" />
                            {unreadCount > 0 && (
                                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Notification Dropdown */}
                        {isNotificationOpen && (
                            <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[500px] overflow-hidden flex flex-col">
                                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={handleMarkAllAsRead}
                                            className="text-xs text-green-600 hover:text-green-700 font-medium"
                                        >
                                            Mark all as read
                                        </button>
                                    )}
                                </div>
                                
                                <div className="overflow-y-auto flex-1">
                                    {notifications.length > 0 ? (
                                        notifications.map((notification) => (
                                            <button
                                                key={notification.id}
                                                onClick={() => handleNotificationClick(notification)}
                                                className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                                                    !notification.is_read ? 'bg-blue-50' : ''
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="shrink-0 mt-1">
                                                        <div className={`w-2 h-2 rounded-full ${
                                                            !notification.is_read ? 'bg-blue-500' : 'bg-gray-300'
                                                        }`}></div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                            {notification.title}
                                                        </p>
                                                        <p className="text-sm text-gray-600 truncate">
                                                            {notification.message}
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            {notification.created_at}
                                                        </p>
                                                    </div>
                                                </div>
                                            </button>
                                        ))
                                    ) : (
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
                        className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                            {profilePicture && typeof profilePicture === 'string' ? (
                                <img 
                                    src={profilePicture} 
                                    alt="Profile" 
                                    className="w-10 h-10 rounded-full object-cover border-2 border-green-600"
                                />
                            ) : (
                                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                                    <User className="w-6 h-6 text-white" />
                                </div>
                            )}
                            <div className="text-left">
                                <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin'}</p>
                                <p className="text-xs text-gray-500">{admin?.role || 'Admin'}</p>
                            </div>
                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                            <Link
                                href="/admin/profile"
                                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition-colors"
                            >
                                <User className="w-4 h-4 text-gray-600" />
                                <span className="text-sm text-gray-700">Profile</span>
                            </Link>
                            <div className="border-t border-gray-200 my-2"></div>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 transition-colors text-left"
                            >
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
