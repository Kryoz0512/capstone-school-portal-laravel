import { Link } from '@inertiajs/react'
import {
    LayoutDashboard,
    UserPlus,
    GraduationCap,
    BookOpen,
    ClipboardList,
    FileText,
    ChevronRight,
    Settings,
    Archive,
    User
} from 'lucide-react'
import { useState, useEffect } from 'react'

type SidebarProps = {
    currentPath?: string
    user?: {
        name: string
        email: string
        role: string
    }
    admin?: {
        role: string
        position: string
    }
}

export default function AdminSidebar({ currentPath, user, admin }: SidebarProps) {
    // Determine which menu should be open based on current URL
    const getCurrentPath = () => {
        if (typeof window !== 'undefined') {
            return window.location.pathname
        }
        return ''
    }

    const getInitialExpandedState = () => {
        const path = getCurrentPath()
        return {
            enrollment: path.includes('/admin/enrollment'),
            admission: path.includes('/admin/admission'),
            registrar: path.includes('/admin/registrar'),
            records: path.includes('/admin/records'),
            usermanagement: path.includes('/admin/user-management'),
            maintenance: path.includes('/admin/maintenance'),
        }
    }

    const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(getInitialExpandedState())

    // Update expanded state when path changes
    useEffect(() => {
        const path = getCurrentPath()
        setExpandedMenus({
            enrollment: path.includes('/admin/enrollment'),
            admission: path.includes('/admin/admission'),
            registrar: path.includes('/admin/registrar'),
            records: path.includes('/admin/records'),
            usermanagement: path.includes('/admin/user-management'),
            maintenance: path.includes('/admin/maintenance'),
        })
    }, [])

    const toggleMenu = (menu: string) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menu]: !prev[menu]
        }))
    }

    const isActive = (path: string) => {
        return getCurrentPath() === path
    }

    return (
        <div className="w-64 bg-green-700 h-screen flex flex-col text-white fixed left-0 top-0">
            {/* Profile Section */}
            <div className="p-6 border-b border-green-600">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-800 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-white">{user?.name || 'Admin'}</p>
                        <p className="text-xs text-green-100">{admin?.role || 'Administrator'}</p>
                    </div>
                </div>
            </div>

            {/* Navigation - Scrollable */}
            <nav className="flex-1 py-4 overflow-y-auto scrollbar-hide">
                {/* Dashboard */}
                <Link
                    href="/admin/dashboard"
                    className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                        isActive('/admin/dashboard') 
                            ? 'bg-green-800 text-white' 
                            : 'text-green-50 hover:bg-green-600'
                    }`}
                >
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Dashboard</span>
                </Link>

                {/* Admission */}
                <div>
                    <button
                        onClick={() => toggleMenu('admission')}
                        className="w-full flex items-center justify-between px-6 py-3 text-green-50 hover:bg-green-600 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <ClipboardList className="w-5 h-5" />
                            <span>Admission</span>
                        </div>
                        <ChevronRight
                            className={`w-4 h-4 transition-transform ${expandedMenus.admission ? 'rotate-90' : ''}`}
                        />
                    </button>
                    {expandedMenus.admission && (
                        <div className="bg-green-800">
                            <Link href="/admin/admission/registration" className="block px-12 py-2 text-sm text-green-50 hover:bg-green-900">
                                Registration
                            </Link>
                            <Link href="/admin/admission/accreditation" className="block px-12 py-2 text-sm text-green-50 hover:bg-green-900">
                                Accreditation
                            </Link>
                            <Link href="/admin/admission/upload-delete-picture" className="block px-12 py-2 text-sm text-green-50 hover:bg-green-900">
                                Upload or Delete Picture
                            </Link>
                            <Link href="/admin/admission/view-edit-student" className="block px-12 py-2 text-sm text-green-50 hover:bg-green-900">
                                View Edit Student Information
                            </Link>
                        </div>
                    )}
                </div>

                {/* Enrollment */}
                <div>
                    <button
                        onClick={() => toggleMenu('enrollment')}
                        className="w-full flex items-center justify-between px-6 py-3 text-green-50 hover:bg-green-600 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <UserPlus className="w-5 h-5" />
                            <span>Enrollment</span>
                        </div>
                        <ChevronRight
                            className={`w-4 h-4 transition-transform ${expandedMenus.enrollment ? 'rotate-90' : ''}`}
                        />
                    </button>
                    {expandedMenus.enrollment && (
                        <div className="bg-green-800">
                            <Link href="/admin/enrollment/room-schedule" className="block px-12 py-2 text-sm text-green-50 hover:bg-green-900">
                                Room Schedule
                            </Link>
                            <Link href="/admin/enrollment/room-listings" className="block px-12 py-2 text-sm text-green-50 hover:bg-green-900">
                                Room Listings
                            </Link>
                            <Link href="/admin/enrollment/class-sections" className="block px-12 py-2 text-sm text-green-50 hover:bg-green-900">
                                Class Sections
                            </Link>
                            <Link href="/admin/enrollment/faculty-subjects" className="block px-12 py-2 text-sm text-green-50 hover:bg-green-900">
                                Faculty & Subjects
                            </Link>
                            <Link href="/admin/enrollment/load-scheduling" className="block px-12 py-2 text-sm text-green-50 hover:bg-green-900">
                                Load Scheduling
                            </Link>
                            <Link href="/admin/enrollment/adviser-management" className="block px-12 py-2 text-sm text-green-50 hover:bg-green-900">
                                Adviser Management
                            </Link>
                            <Link href="/admin/enrollment/student-not-enrolled" className="block px-12 py-2 text-sm text-green-50 hover:bg-green-900">
                                Students Not Enrolled
                            </Link>
                            <Link href="/admin/enrollment/enrollment-list" className="block px-12 py-2 text-sm text-green-50 hover:bg-green-900">
                                Enrollment List
                            </Link>
                            <Link href="/admin/enrollment/student-schedule" className="block px-12 py-2 text-sm text-green-50 hover:bg-green-900">
                                Student Schedule
                            </Link>
                        </div>
                    )}
                </div>

                {/* Registrar */}
                <div>
                    <button
                        onClick={() => toggleMenu('registrar')}
                        className="w-full flex items-center justify-between px-6 py-3 text-green-50 hover:bg-green-600 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <BookOpen className="w-5 h-5" />
                            <span>Registrar</span>
                        </div>
                        <ChevronRight
                            className={`w-4 h-4 transition-transform ${expandedMenus.registrar ? 'rotate-90' : ''}`}
                        />
                    </button>
                    {expandedMenus.registrar && (
                        <div className="bg-green-800">
                            <Link href="/admin/registrar/student-checklist" className="block px-12 py-2 text-sm text-green-50 hover:bg-green-900">
                                Student Checklist
                            </Link>
                            <Link href="/admin/registrar/subject-listings" className="block px-12 py-2 text-sm text-green-50 hover:bg-green-900">
                                Subject Listings
                            </Link>
                        </div>
                    )}
                </div>

                {/* Records */}
                <div>
                    <button
                        onClick={() => toggleMenu('records')}
                        className="w-full flex items-center justify-between px-6 py-3 text-green-50 hover:bg-green-600 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5" />
                            <span>Records</span>
                        </div>
                        <ChevronRight
                            className={`w-4 h-4 transition-transform ${expandedMenus.records ? 'rotate-90' : ''}`}
                        />
                    </button>
                    {expandedMenus.records && (
                        <div className="bg-green-800">
                            <Link href="/admin/records/final-reports" className="block px-12 py-2 text-sm text-green-50 hover:bg-green-900">
                                Final Reports
                            </Link>
                            <Link href="/admin/records/transcript-of-records" className="block px-12 py-2 text-sm text-green-50 hover:bg-green-900">
                                Transcript Of Records
                            </Link>
                        </div>
                    )}
                </div>

                {/* User Management */}
                <div>
                    <button
                        onClick={() => toggleMenu('usermanagement')}
                        className="w-full flex items-center justify-between px-6 py-3 text-green-50 hover:bg-green-600 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <GraduationCap className="w-5 h-5" />
                            <span>User Management</span>
                        </div>
                        <ChevronRight
                            className={`w-4 h-4 transition-transform ${expandedMenus.usermanagement ? 'rotate-90' : ''}`}
                        />
                    </button>
                    {expandedMenus.usermanagement && (
                        <div className="bg-green-800">
                            {/* Only show Admin menu for Super Admin role */}
                            {admin?.role === 'Super Admin' && (
                                <Link href="/admin/user-management/admin" className="block px-12 py-2 text-sm text-green-50 hover:bg-green-900">
                                    Admin
                                </Link>
                            )}
                            <Link href="/admin/user-management/teacher" className="block px-12 py-2 text-sm text-green-50 hover:bg-green-900">
                                Teacher
                            </Link>
                        </div>
                    )}
                </div>

                {/* Documents */}
                <Link
                    href="/admin/documents"
                    className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                        isActive('/admin/documents') 
                            ? 'bg-green-800 text-white' 
                            : 'text-green-50 hover:bg-green-600'
                    }`}
                >
                    <FileText className="w-5 h-5" />
                    <span>Documents</span>
                </Link>

                {/* Archive */}
                <Link
                    href="/admin/archive"
                    className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                        isActive('/admin/archive') 
                            ? 'bg-green-800 text-white' 
                            : 'text-green-50 hover:bg-green-600'
                    }`}
                >
                    <Archive className="w-5 h-5" />
                    <span>Archive</span>
                </Link>

                {/* Maintenance */}
                <div>
                    <button
                        onClick={() => toggleMenu('maintenance')}
                        className="w-full flex items-center justify-between px-6 py-3 text-green-50 hover:bg-green-600 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <Settings className="w-5 h-5" />
                            <span>Maintenance</span>
                        </div>
                        <ChevronRight
                            className={`w-4 h-4 transition-transform ${expandedMenus.maintenance ? 'rotate-90' : ''}`}
                        />
                    </button>
                    {expandedMenus.maintenance && (
                        <div className="bg-green-800">
                            <Link href="/admin/maintenance/login-slides" className="block px-12 py-2 text-sm text-green-50 hover:bg-green-900">
                                Login Slides
                            </Link>
                        </div>
                    )}
                </div>
            </nav>
        </div>
    )
}
