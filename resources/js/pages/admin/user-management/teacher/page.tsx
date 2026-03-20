import { Head } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Button } from '@/components/ui/button'
import AddTeacherModal from '@/components/modals/add-teacher-modal'
import { Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'

type Teacher = {
    id: number
    employeeNo: string
    name: string
    email: string
    subject: string
    grade: string
    position: string
}

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

export default function TeacherManagement({ auth }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    const teachers: Teacher[] = [
        { id: 1, employeeNo: 'T-001', name: 'Maria Santos', email: 'maria.santos@snhs.edu.ph', subject: 'Mathematics', grade: '10', position: 'Teacher I' },
        { id: 2, employeeNo: 'T-002', name: 'Pedro Garcia', email: 'pedro.garcia@snhs.edu.ph', subject: 'Science', grade: '9', position: 'Teacher III' }
    ]

    const totalTeachers = teachers.length
    const grade7Count = 0
    const grade8Count = 0
    const grade9Count = teachers.filter(t => t.grade === '9').length
    const grade10Count = teachers.filter(t => t.grade === '10').length

    return (
        <AdminLayout user={auth?.user}>
            <Head title="Teacher Management" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Teacher Management</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Create and manage teacher accounts with assignment tracking
                        </p>
                    </div>
                    <Button 
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => setIsModalOpen(true)}
                    >
                        + New Teacher
                    </Button>
                </div>

                <AddTeacherModal open={isModalOpen} onOpenChange={setIsModalOpen} />

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-600 font-medium">Total Teachers</p>
                        <p className="text-3xl font-bold text-blue-900 mt-2">{totalTeachers}</p>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <p className="text-sm text-purple-600 font-medium">Grade 7</p>
                        <p className="text-3xl font-bold text-purple-900 mt-2">{grade7Count}</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-600 font-medium">Grade 8</p>
                        <p className="text-3xl font-bold text-green-900 mt-2">{grade8Count}</p>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-yellow-600 font-medium">Grade 9</p>
                        <p className="text-3xl font-bold text-yellow-900 mt-2">{grade9Count}</p>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-600 font-medium">Grade 10</p>
                        <p className="text-3xl font-bold text-red-900 mt-2">{grade10Count}</p>
                    </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                        <div className="text-blue-600 mt-0.5">ℹ️</div>
                        <div>
                            <p className="text-sm font-medium text-blue-900">Teacher Account Requirements:</p>
                            <ul className="text-sm text-blue-700 mt-2 space-y-1">
                                <li>✓ Email must be in format: firstname.lastname@snhs.edu.ph</li>
                                <li>✓ Employee number must be unique (e.g., T-001, T-002)</li>
                                <li>✓ Subject assignment is required from approved list</li>
                                <li>✓ Grade level and section must be specified</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                        <h2 className="text-sm font-semibold text-gray-900">Teacher Accounts</h2>
                        <p className="text-sm text-gray-500 mt-1">Total: {totalTeachers} teacher(s) in the system</p>
                    </div>

                    <div className="p-4 border-b border-gray-200">
                        <p className="text-sm text-gray-600">
                            Showing 1 to {teachers.length} of {teachers.length} entries
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Employee No.</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Subject</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Grade</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Position</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {teachers.map((teacher) => (
                                    <tr key={teacher.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-900">{teacher.employeeNo}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{teacher.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{teacher.email}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{teacher.subject}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{teacher.grade}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{teacher.position}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button className="text-gray-600 hover:text-green-600">
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button className="text-gray-600 hover:text-red-600">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
