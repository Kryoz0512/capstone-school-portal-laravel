import { router, Link, usePage } from '@inertiajs/react'
import { Calendar, User, Settings, LogOut, ChevronDown } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

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
    const dropdownRef = useRef<HTMLDivElement>(null)
    
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
        } else if (typeof student.profile_picture === 'object' && 'file_path' in student.profile_picture) {
            // It's the full profile picture object, extract the URL
            profilePicture = `${window.location.origin}/storage/${student.profile_picture.file_path}`
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
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <header className="bg-white border-b border-gray-200 shadow-sm">
            <div className="px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{currentDate}</span>
                    </div>
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
        </header>
    )
}
