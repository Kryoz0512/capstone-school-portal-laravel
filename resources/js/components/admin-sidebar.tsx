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
    User,
    Sparkles
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
        <div className="w-72 bg-gradient-to-b from-green-700 via-green-600 to-green-700 h-screen flex flex-col text-white fixed left-0 top-0 shadow-2xl border-r border-green-500/50">
            {/* Logo/Brand Section */}
            <div className="p-6 bg-gradient-to-r from-green-600/50 to-green-500/30 backdrop-blur-sm border-b border-green-500/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-300 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white tracking-wide">Admin Portal</h2>
                        <p className="text-xs text-green-100">Management System</p>
                    </div>
                </div>
            </div>

            {/* Navigation - Scrollable */}
            <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-green-800 scrollbar-track-green-700/20 px-3">
                {/* Dashboard */}
                <Link
                    href="/admin/dashboard"
                    className={`flex items-center gap-3 px-4 py-3 mb-1 rounded-xl transition-all duration-300 group ${
                        isActive('/admin/dashboard') 
                            ? 'bg-gradient-to-r from-green-500 to-green-400 text-white shadow-lg shadow-green-400/30 scale-[1.02]' 
                            : 'text-green-50 hover:bg-green-500/50 hover:translate-x-1'
                    }`}
                >
                    <div className={`p-2 rounded-lg transition-all duration-300 ${
                        isActive('/admin/dashboard')
                            ? 'bg-white/20'
                            : 'bg-green-500/30 group-hover:bg-green-400/40'
                    }`}>
                        <LayoutDashboard className="w-4 h-4" />
                    </div>
                    <span className="font-medium">Dashboard</span>
                </Link>

                {/* Admission */}
                <div className="mb-1">
                    <button
                        onClick={() => toggleMenu('admission')}
                        className="w-full flex items-center justify-between px-4 py-3 text-green-50 hover:bg-green-500/50 rounded-xl transition-all duration-300 group hover:translate-x-1"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-500/30 group-hover:bg-green-400/40 transition-all duration-300">
                                <ClipboardList className="w-4 h-4" />
                            </div>
                            <span className="font-medium">Admission</span>
                        </div>
                        <ChevronRight
                            className={`w-4 h-4 transition-transform duration-300 ${expandedMenus.admission ? 'rotate-90' : ''}`}
                        />
                    </button>
                    {expandedMenus.admission && (
                        <div className="mt-1 ml-4 space-y-1 border-l-2 border-green-400/30 pl-2">
                            <Link href="/admin/admission/registration" className="block px-4 py-2.5 text-sm text-green-100 hover:text-white hover:bg-green-500/40 rounded-lg transition-all duration-200 hover:translate-x-1">
                                <span className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-300"></span>
                                    Registration
                                </span>
                            </Link>
                            <Link href="/admin/admission/accreditation" className="block px-4 py-2.5 text-sm text-green-100 hover:text-white hover:bg-green-500/40 rounded-lg transition-all duration-200 hover:translate-x-1">
                                <span className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-300"></span>
                                    Accreditation
                                </span>
                            </Link>
                            <Link href="/admin/admission/upload-delete-picture" className="block px-4 py-2.5 text-sm text-green-100 hover:text-white hover:bg-green-500/40 rounded-lg transition-all duration-200 hover:translate-x-1">
                                <span className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-300"></span>
                                    Upload or Delete Picture
                                </span>
                            </Link>
                            <Link href="/admin/admission/view-edit-student" className="block px-4 py-2.5 text-sm text-green-100 hover:text-white hover:bg-green-500/40 rounded-lg transition-all duration-200 hover:translate-x-1">
                                <span className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-300"></span>
                                    View Edit Student Information
                                </span>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Enrollment */}
                <div className="mb-1">
                    <button
                        onClick={() => toggleMenu('enrollment')}
                        className="w-full flex items-center justify-between px-4 py-3 text-green-50 hover:bg-green-500/50 rounded-xl transition-all duration-300 group hover:translate-x-1"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-500/30 group-hover:bg-green-400/40 transition-all duration-300">
                                <UserPlus className="w-4 h-4" />
                            </div>
                            <span className="font-medium">Enrollment</span>
                        </div>
                        <ChevronRight
                            className={`w-4 h-4 transition-transform duration-300 ${expandedMenus.enrollment ? 'rotate-90' : ''}`}
                        />
                    </button>
                    {expandedMenus.enrollment && (
                        <div className="mt-1 ml-4 space-y-1 border-l-2 border-green-400/30 pl-2">
                            <Link href="/admin/enrollment/room-schedule" className="block px-4 py-2.5 text-sm text-green-100 hover:text-white hover:bg-green-500/40 rounded-lg transition-all duration-200 hover:translate-x-1">
                                <span className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-300"></span>
                                    Room Schedule
                                </span>
                            </Link>
                            <Link href="/admin/enrollment/room-listings" className="block px-4 py-2.5 text-sm text-green-100 hover:text-white hover:bg-green-500/40 rounded-lg transition-all duration-200 hover:translate-x-1">
                                <span className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-300"></span>
                                    Room Listings
                                </span>
                            </Link>
                            <Link href="/admin/enrollment/class-sections" className="block px-4 py-2.5 text-sm text-green-100 hover:text-white hover:bg-green-500/40 rounded-lg transition-all duration-200 hover:translate-x-1">
                                <span className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-300"></span>
                                    Class Sections
                                </span>
                            </Link>
                            <Link href="/admin/enrollment/faculty-subjects" className="block px-4 py-2.5 text-sm text-green-100 hover:text-white hover:bg-green-500/40 rounded-lg transition-all duration-200 hover:translate-x-1">
                                <span className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-300"></span>
                                    Faculty & Subjects
                                </span>
                            </Link>
                            <Link href="/admin/enrollment/load-scheduling" className="block px-4 py-2.5 text-sm text-green-100 hover:text-white hover:bg-green-500/40 rounded-lg transition-all duration-200 hover:translate-x-1">
                                <span className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-300"></span>
                                    Load Scheduling
                                </span>
                            </Link>
                            <Link href="/admin/enrollment/adviser-management" className="block px-4 py-2.5 text-sm text-green-100 hover:text-white hover:bg-green-500/40 rounded-lg transition-all duration-200 hover:translate-x-1">
                                <span className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-300"></span>
                                    Adviser Management
                                </span>
                            </Link>
                            <Link href="/admin/enrollment/student-not-enrolled" className="block px-4 py-2.5 text-sm text-green-100 hover:text-white hover:bg-green-500/40 rounded-lg transition-all duration-200 hover:translate-x-1">
                                <span className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-300"></span>
                                    Students Not Enrolled
                                </span>
                            </Link>
                            <Link href="/admin/enrollment/enrollment-list" className="block px-4 py-2.5 text-sm text-green-100 hover:text-white hover:bg-green-500/40 rounded-lg transition-all duration-200 hover:translate-x-1">
                                <span className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-300"></span>
                                    Enrollment List
                                </span>
                            </Link>
                            <Link href="/admin/enrollment/student-schedule" className="block px-4 py-2.5 text-sm text-green-100 hover:text-white hover:bg-green-500/40 rounded-lg transition-all duration-200 hover:translate-x-1">
                                <span className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-300"></span>
                                    Student Schedule
                                </span>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Registrar */}
                <div className="mb-1">
                    <button
                        onClick={() => toggleMenu('registrar')}
                        className="w-full flex items-center justify-between px-4 py-3 text-green-50 hover:bg-green-500/50 rounded-xl transition-all duration-300 group hover:translate-x-1"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-500/30 group-hover:bg-green-400/40 transition-all duration-300">
                                <BookOpen className="w-4 h-4" />
                            </div>
                            <span className="font-medium">Registrar</span>
                        </div>
                        <ChevronRight
                            className={`w-4 h-4 transition-transform duration-300 ${expandedMenus.registrar ? 'rotate-90' : ''}`}
                        />
                    </button>
                    {expandedMenus.registrar && (
                        <div className="mt-1 ml-4 space-y-1 border-l-2 border-green-400/30 pl-2">
                            <Link href="/admin/registrar/student-checklist" className="block px-4 py-2.5 text-sm text-green-100 hover:text-white hover:bg-green-500/40 rounded-lg transition-all duration-200 hover:translate-x-1">
                                <span className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-300"></span>
                                    Student Checklist
                                </span>
                            </Link>
                            <Link href="/admin/registrar/subject-listings" className="block px-4 py-2.5 text-sm text-green-100 hover:text-white hover:bg-green-500/40 rounded-lg transition-all duration-200 hover:translate-x-1">
                                <span className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-300"></span>
                                    Subject Listings
                                </span>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Records */}
                <div className="mb-1">
                    <button
                        onClick={() => toggleMenu('records')}
                        className="w-full flex items-center justify-between px-4 py-3 text-green-50 hover:bg-green-500/50 rounded-xl transition-all duration-300 group hover:translate-x-1"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-500/30 group-hover:bg-green-400/40 transition-all duration-300">
                                <FileText className="w-4 h-4" />
                            </div>
                            <span className="font-medium">Records</span>
                        </div>
                        <ChevronRight
                            className={`w-4 h-4 transition-transform duration-300 ${expandedMenus.records ? 'rotate-90' : ''}`}
                        />
                    </button>
                    {expandedMenus.records && (
                        <div className="mt-1 ml-4 space-y-1 border-l-2 border-green-400/30 pl-2">
                            <Link href="/admin/records/final-reports" className="block px-4 py-2.5 text-sm text-green-100 hover:text-white hover:bg-green-500/40 rounded-lg transition-all duration-200 hover:translate-x-1">
                                <span className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-300"></span>
                                    Final Reports
                                </span>
                            </Link>
                            <Link href="/admin/records/transcript-of-records" className="block px-4 py-2.5 text-sm text-green-100 hover:text-white hover:bg-green-500/40 rounded-lg transition-all duration-200 hover:translate-x-1">
                                <span className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-300"></span>
                                    Transcript Of Records
                                </span>
                            </Link>
                        </div>
                    )}
                </div>

                {/* User Management */}
                <div className="mb-1">
                    <button
                        onClick={() => toggleMenu('usermanagement')}
                        className="w-full flex items-center justify-between px-4 py-3 text-green-50 hover:bg-green-500/50 rounded-xl transition-all duration-300 group hover:translate-x-1"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-500/30 group-hover:bg-green-400/40 transition-all duration-300">
                                <GraduationCap className="w-4 h-4" />
                            </div>
                            <span className="font-medium">User Management</span>
                        </div>
                        <ChevronRight
                            className={`w-4 h-4 transition-transform duration-300 ${expandedMenus.usermanagement ? 'rotate-90' : ''}`}
                        />
                    </button>
                    {expandedMenus.usermanagement && (
                        <div className="mt-1 ml-4 space-y-1 border-l-2 border-green-400/30 pl-2">
                            {/* Only show Admin menu for Super Admin role */}
                            {admin?.role === 'Super Admin' && (
                                <Link href="/admin/user-management/admin" className="block px-4 py-2.5 text-sm text-green-100 hover:text-white hover:bg-green-500/40 rounded-lg transition-all duration-200 hover:translate-x-1">
                                    <span className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-300"></span>
                                        Admin
                                    </span>
                                </Link>
                            )}
                            <Link href="/admin/user-management/teacher" className="block px-4 py-2.5 text-sm text-green-100 hover:text-white hover:bg-green-500/40 rounded-lg transition-all duration-200 hover:translate-x-1">
                                <span className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-300"></span>
                                    Teacher
                                </span>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Documents */}
                <Link
                    href="/admin/documents"
                    className={`flex items-center gap-3 px-4 py-3 mb-1 rounded-xl transition-all duration-300 group ${
                        isActive('/admin/documents') 
                            ? 'bg-gradient-to-r from-green-500 to-green-400 text-white shadow-lg shadow-green-400/30 scale-[1.02]' 
                            : 'text-green-50 hover:bg-green-500/50 hover:translate-x-1'
                    }`}
                >
                    <div className={`p-2 rounded-lg transition-all duration-300 ${
                        isActive('/admin/documents')
                            ? 'bg-white/20'
                            : 'bg-green-500/30 group-hover:bg-green-400/40'
                    }`}>
                        <FileText className="w-4 h-4" />
                    </div>
                    <span className="font-medium">Documents</span>
                </Link>

                {/* Archive */}
                <Link
                    href="/admin/archive"
                    className={`flex items-center gap-3 px-4 py-3 mb-1 rounded-xl transition-all duration-300 group ${
                        isActive('/admin/archive') 
                            ? 'bg-gradient-to-r from-green-500 to-green-400 text-white shadow-lg shadow-green-400/30 scale-[1.02]' 
                            : 'text-green-50 hover:bg-green-500/50 hover:translate-x-1'
                    }`}
                >
                    <div className={`p-2 rounded-lg transition-all duration-300 ${
                        isActive('/admin/archive')
                            ? 'bg-white/20'
                            : 'bg-green-500/30 group-hover:bg-green-400/40'
                    }`}>
                        <Archive className="w-4 h-4" />
                    </div>
                    <span className="font-medium">Archive</span>
                </Link>

                {/* Maintenance */}
                <div className="mb-1">
                    <button
                        onClick={() => toggleMenu('maintenance')}
                        className="w-full flex items-center justify-between px-4 py-3 text-green-50 hover:bg-green-500/50 rounded-xl transition-all duration-300 group hover:translate-x-1"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-500/30 group-hover:bg-green-400/40 transition-all duration-300">
                                <Settings className="w-4 h-4" />
                            </div>
                            <span className="font-medium">Maintenance</span>
                        </div>
                        <ChevronRight
                            className={`w-4 h-4 transition-transform duration-300 ${expandedMenus.maintenance ? 'rotate-90' : ''}`}
                        />
                    </button>
                    {expandedMenus.maintenance && (
                        <div className="mt-1 ml-4 space-y-1 border-l-2 border-green-400/30 pl-2">
                            <Link href="/admin/maintenance/login-slides" className="block px-4 py-2.5 text-sm text-green-100 hover:text-white hover:bg-green-500/40 rounded-lg transition-all duration-200 hover:translate-x-1">
                                <span className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-300"></span>
                                    Login Slides
                                </span>
                            </Link>
                        </div>
                    )}
                </div>
            </nav>
        </div>
    )
}
