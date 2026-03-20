import { Link, router } from '@inertiajs/react'
import {
    LayoutDashboard,
    UserPlus,
    GraduationCap,
    BookOpen,
    ClipboardList,
    FileText,
    User,
    LogOut,
    ChevronRight
} from 'lucide-react'
import { useState, useEffect } from 'react'

type SidebarProps = {
    currentPath?: string
}

export default function AdminSidebar({ currentPath }: SidebarProps) {
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
        })
    }, [])

    const toggleMenu = (menu: string) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menu]: !prev[menu]
        }))
    }

    const handleLogout = () => {
        router.post('/logout')
    }

    return (
        <div className="w-64 bg-green-700 h-screen flex flex-col text-white fixed left-0 top-0">
            {/* Logo/Brand */}
            <div className="p-6 border-b border-green-600 flex-shrink-0">
                <h1 className="text-xl font-bold">Santor National</h1>
                <p className="text-sm text-green-100">HighSchool</p>
            </div>

            {/* Navigation - Scrollable */}
            <nav className="flex-1 py-4 overflow-y-auto scrollbar-hide">
                {/* Dashboard */}
                <Link
                    href="/admin/dashboard"
                    className="flex items-center gap-3 px-6 py-3 hover:bg-green-600 transition-colors"
                >
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Dashboard</span>
                </Link>

                {/* Enrollment */}
                <div>
                    <button
                        onClick={() => toggleMenu('enrollment')}
                        className="w-full flex items-center justify-between px-6 py-3 hover:bg-green-600 transition-colors"
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
                            <Link href="/admin/enrollment/room-schedule" className="block px-12 py-2 text-sm hover:bg-green-600">
                                Room Schedule
                            </Link>
                            <Link href="/admin/enrollment/room-listings" className="block px-12 py-2 text-sm hover:bg-green-600">
                                Room Listings
                            </Link>
                            <Link href="/admin/enrollment/class-sections" className="block px-12 py-2 text-sm hover:bg-green-600">
                                Class Sections
                            </Link>
                            <Link href="/admin/enrollment/faculty-subjects" className="block px-12 py-2 text-sm hover:bg-green-600">
                                Faculty & Subjects
                            </Link>
                            <Link href="/admin/enrollment/load-scheduling" className="block px-12 py-2 text-sm hover:bg-green-600">
                                Load Scheduling
                            </Link>
                            <Link href="/admin/enrollment/adviser-management" className="block px-12 py-2 text-sm hover:bg-green-600">
                                Adviser Management
                            </Link>
                            <Link href="/admin/enrollment/student-not-enrolled" className="block px-12 py-2 text-sm hover:bg-green-600">
                                Students Not Enrolled
                            </Link>
                            <Link href="/admin/enrollment/enrollment-list" className="block px-12 py-2 text-sm hover:bg-green-600">
                                Enrollment List
                            </Link>
                            <Link href="/admin/enrollment/student-schedule" className="block px-12 py-2 text-sm hover:bg-green-600">
                                Student Schedule
                            </Link>
                        </div>
                    )}
                </div>

                {/* Admission */}
                <div>
                    <button
                        onClick={() => toggleMenu('admission')}
                        className="w-full flex items-center justify-between px-6 py-3 hover:bg-green-600 transition-colors"
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
                            <Link href="/admin/admission/registration" className="block px-12 py-2 text-sm hover:bg-green-600">
                                Registration
                            </Link>
                            <Link href="/admin/admission/accreditation" className="block px-12 py-2 text-sm hover:bg-green-600">
                                Accreditation
                            </Link>
                            <Link href="/admin/admission/upload-delete-picture" className="block px-12 py-2 text-sm hover:bg-green-600">
                                Upload or Delete Picture
                            </Link>
                            <Link href="/admin/admission/view-edit-student" className="block px-12 py-2 text-sm hover:bg-green-600">
                                View Edit Student Information
                            </Link>
                        </div>
                    )}
                </div>

                {/* Registrar */}
                <div>
                    <button
                        onClick={() => toggleMenu('registrar')}
                        className="w-full flex items-center justify-between px-6 py-3 hover:bg-green-600 transition-colors"
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
                            <Link href="/admin/registrar/subject-listings" className="block px-12 py-2 text-sm hover:bg-green-600">
                                Subject Listings
                            </Link>
                        </div>
                    )}
                </div>

                {/* Records */}
                <div>
                    <button
                        onClick={() => toggleMenu('records')}
                        className="w-full flex items-center justify-between px-6 py-3 hover:bg-green-600 transition-colors"
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
                            <Link href="/admin/records/final-reports" className="block px-12 py-2 text-sm hover:bg-green-600">
                                Final Reports
                            </Link>
                            <Link href="/admin/records/transcript-of-records" className="block px-12 py-2 text-sm hover:bg-green-600">
                                Transcript Of Records
                            </Link>
                        </div>
                    )}
                </div>

                {/* User Management */}
                <div>
                    <button
                        onClick={() => toggleMenu('usermanagement')}
                        className="w-full flex items-center justify-between px-6 py-3 hover:bg-green-600 transition-colors"
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
                            <Link href="/admin/user-management/admin" className="block px-12 py-2 text-sm hover:bg-green-600">
                                Admin
                            </Link>
                            <Link href="/admin/user-management/teacher" className="block px-12 py-2 text-sm hover:bg-green-600">
                                Teacher
                            </Link>
                        </div>
                    )}
                </div>

                {/* Documents */}
                <Link
                    href="/admin/documents"
                    className="flex items-center gap-3 px-6 py-3 hover:bg-green-600 transition-colors"
                >
                    <FileText className="w-5 h-5" />
                    <span>Documents</span>
                </Link>

                {/* Profile */}
                <Link
                    href="/admin/profile"
                    className="flex items-center gap-3 px-6 py-3 hover:bg-green-600 transition-colors"
                >
                    <User className="w-5 h-5" />
                    <span>Profile</span>
                </Link>
            </nav>

            {/* Logout */}
            <div className="border-t border-green-600 flex-shrink-0">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-6 py-4 hover:bg-red-400 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    )
}
