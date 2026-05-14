import { router, Link, usePage } from '@inertiajs/react'
import { Calendar, User, Settings, LogOut, ChevronDown, Bell } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

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

type StudentHeaderProps = {
    user?: {
        name: string
        email: string
        role: string
    }
    student?: {
        profile_picture?: string | null
    }
}

export default function StudentHeader({ user, student }: StudentHeaderProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [isNotificationOpen, setIsNotificationOpen] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const notificationRef = useRef<HTMLDivElement>(null)
    
    // Get shared data directly from Inertia
    const { auth } = usePage<{ auth: { student?: { profile_picture?: string | null } } }>().props
    
    // Handle profile picture - could be a string URL or an object with file_path
    let profilePicture: string | null = null
    
    // First try from shared auth data (middleware)
    if (auth?.student?.profile_picture && typeof auth.student.profile_picture === 'string') {
        profilePicture = auth.student.profile_picture
    }
    // Then try from props (controller) - might be an object
    else if (student?.profile_picture) {
        if (typeof student.profile_picture === 'string') {
            profilePicture = student.profile_picture
        } else if (typeof student.profile_picture === 'object' && student.profile_picture !== null && 'file_path' in student.profile_picture) {
            // It's the full profile picture object, extract the URL
            const picObj = student.profile_picture as { file_path: string }
            profilePicture = `${window.location.origin}/storage/${picObj.file_path}`
        }
    }

    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
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

    // Fetch notifications
    const fetchNotifications = async () => {
        try {
            const response = await fetch('/api/notifications')
            const data = await response.json()
            setNotifications(data)
        } catch (error) {
            console.error('Error fetching notifications:', error)
        }
    }

    // Fetch unread count
    const fetchUnreadCount = async () => {
        try {
            const response = await fetch('/api/notifications/unread-count')
            const data = await response.json()
            setUnreadCount(data.count)
        } catch (error) {
            console.error('Error fetching unread count:', error)
        }
    }

    // Poll for new notifications every 30 seconds
    useEffect(() => {
        fetchUnreadCount()
        const interval = setInterval(fetchUnreadCount, 30000)
        return () => clearInterval(interval)
    }, [])

    // Fetch notifications when dropdown opens
    useEffect(() => {
        if (isNotificationOpen) {
            fetchNotifications()
        }
    }, [isNotificationOpen])

    // Mark notification as read and navigate
    const handleNotificationClick = async (notification: Notification) => {
        if (notification.is_read) {
            setIsNotificationOpen(false)
            router.visit('/student/dashboard', { preserveScroll: true })
            return
        }

        try {
            setNotifications(prev => 
                prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
            )
            setUnreadCount(prev => Math.max(0, prev - 1))
            setIsNotificationOpen(false)

            const response = await fetch(`/api/notifications/${notification.id}/read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            })

            if (!response.ok) {
                throw new Error('Failed to mark notification as read')
            }

            await response.json()
            await new Promise(resolve => setTimeout(resolve, 100))

            router.visit('/student/dashboard', { preserveScroll: true })
        } catch (error) {
            console.error('Error handling notification click:', error)
            router.visit('/student/dashboard', { preserveScroll: true })
        }
    }

    // Mark all as read
    const handleMarkAllAsRead = async () => {
        try {
            await fetch('/api/notifications/mark-all-read', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            })

            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
            setUnreadCount(0)
        } catch (error) {
            console.error('Error marking all as read:', error)
        }
    }

    return (
        <header className="bg-white border-b border-gray-200 shadow-sm">
            <div className="px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{currentDate}</span>
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
                                            className="text-xs text-purple-600 hover:text-purple-700 font-medium"
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
                                className="w-10 h-10 rounded-full object-cover border-2 border-purple-600"
                            />
                        ) : (
                            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-white" />
                            </div>
                        )}
                        <div className="text-left">
                            <p className="text-sm font-medium text-gray-900">{user?.name || 'Student'}</p>
                            <p className="text-xs text-gray-500">Student</p>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                            <Link
                                href="/student/profile-settings"
                                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition-colors"
                            >
                                <Settings className="w-4 h-4 text-gray-600" />
                                <span className="text-sm text-gray-700">Profile Settings</span>
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
