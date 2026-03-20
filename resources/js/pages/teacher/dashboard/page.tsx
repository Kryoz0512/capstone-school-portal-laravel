import { Head } from '@inertiajs/react'
import TeacherLayout from '@/layouts/teacher-layout'
import { Users, BookOpen, UserCheck, Calendar } from 'lucide-react'

type Props = {
    auth?: {
        user: {
            id: number
            name: string
            email: string
            role: string
        }
    }
}

export default function TeacherDashboard({ auth }: Props) {
    return (
        <TeacherLayout user={auth?.user}>
            <Head title="Teacher Dashboard" />

            <div className="space-y-6">
                {/* Welcome Message */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Welcome, Teacher!</h2>
                    <p className="text-gray-500 mt-1">Here's your teaching overview</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Students</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">156</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Subjects Handled</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">4</p>
                            </div>
                            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Sections Assigned</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">6</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                                <UserCheck className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Current School Year</p>
                                <p className="text-xl font-bold text-gray-900 mt-2">2024-2025</p>
                            </div>
                            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Access */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">Grade Sheets</h4>
                            <p className="text-sm text-gray-500">Enter and manage grades</p>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">Class List</h4>
                            <p className="text-sm text-gray-500">View your students</p>
                        </div>
                    </div>
                </div>
            </div>
        </TeacherLayout>
    )
}
