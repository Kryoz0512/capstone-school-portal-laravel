import { Head } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Eye, Download } from 'lucide-react'
import { useState } from 'react'

type Report = {
    id: number
    studentName: string
    gradeLevel: string
    section: string
    schoolYear: string
    status: 'Completed' | 'Pending'
    dateGenerated: string
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

export default function FinalReports({ auth }: Props) {
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('All Status')

    const reports: Report[] = [
        { id: 1, studentName: 'Juan Dela Cruz', gradeLevel: 'Grade 10', section: 'A', schoolYear: '2025-2026', status: 'Completed', dateGenerated: '2025-03-08' },
        { id: 2, studentName: 'Maria Santos', gradeLevel: 'Grade 10', section: 'B', schoolYear: '2025-2026', status: 'Completed', dateGenerated: '2025-02-27' },
        { id: 3, studentName: 'Carlos Reyes', gradeLevel: 'Grade 9', section: 'A', schoolYear: '2025-2026', status: 'Pending', dateGenerated: '2025-03-25' },
        { id: 4, studentName: 'Ana Cruz', gradeLevel: 'Grade 9', section: 'C', schoolYear: '2025-2026', status: 'Completed', dateGenerated: '2025-02-01' }
    ]

    const completedCount = reports.filter(r => r.status === 'Completed').length
    const pendingCount = reports.filter(r => r.status === 'Pending').length

    return (
        <AdminLayout user={auth?.user}>
            <Head title="Final Reports" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Final Reports</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Generate, view, and download final student reports
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-600 font-medium">Total Reports</p>
                        <p className="text-3xl font-bold text-blue-900 mt-2">{reports.length}</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-600 font-medium">Completed</p>
                        <p className="text-3xl font-bold text-green-900 mt-2">{completedCount}</p>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-yellow-600 font-medium">Pending</p>
                        <p className="text-3xl font-bold text-yellow-900 mt-2">{pendingCount}</p>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                            <Input
                                type="text"
                                placeholder="Search by student name or grade..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All Status">All Status</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                        <h2 className="text-sm font-semibold text-gray-900">Final Reports</h2>
                        <p className="text-sm text-gray-500 mt-1">Showing 4 of 4 reports</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Student Name</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Grade Level</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Section</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">School Year</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Date Generated</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {reports.map((report) => (
                                    <tr key={report.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-900">{report.studentName}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{report.gradeLevel}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{report.section}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{report.schoolYear}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                                report.status === 'Completed' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {report.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{report.dateGenerated}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button className="text-gray-600 hover:text-blue-600">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button className="text-gray-600 hover:text-green-600">
                                                    <Download className="w-4 h-4" />
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
