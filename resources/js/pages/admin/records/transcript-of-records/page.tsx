import { Head } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Eye, Printer, Download } from 'lucide-react'
import { useState } from 'react'

type Transcript = {
    id: number
    studentName: string
    lrn: string
    gradeLevel: string
    schoolYear: string
    status: 'Available' | 'Requested'
    dateIssued: string
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

export default function TranscriptOfRecords({ auth }: Props) {
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('All Status')

    const transcripts: Transcript[] = [
        { id: 1, studentName: 'Juan Dela Cruz', lrn: '123456789', gradeLevel: 'Grade 10', schoolYear: '2025-2026', status: 'Available', dateIssued: '2025-02-28' },
        { id: 2, studentName: 'Maria Santos', lrn: '123456790', gradeLevel: 'Grade 10', schoolYear: '2025-2026', status: 'Available', dateIssued: '2025-02-27' },
        { id: 3, studentName: 'Carlos Reyes', lrn: '123456791', gradeLevel: 'Grade 9', schoolYear: '2025-2026', status: 'Requested', dateIssued: '2025-03-25' },
        { id: 4, studentName: 'Ana Cruz', lrn: '123456792', gradeLevel: 'Grade 9', schoolYear: '2024-2025', status: 'Available', dateIssued: '2024-05-15' }
    ]

    const totalCount = transcripts.length
    const availableCount = transcripts.filter(t => t.status === 'Available').length
    const requestedCount = transcripts.filter(t => t.status === 'Requested').length

    return (
        <AdminLayout user={auth?.user}>
            <Head title="Transcript of Records (TOR)" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Transcript of Records (TOR)</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage and distribute student transcripts and academic records
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-600 font-medium">Total Records</p>
                        <p className="text-3xl font-bold text-blue-900 mt-2">{totalCount}</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-600 font-medium">Available</p>
                        <p className="text-3xl font-bold text-green-900 mt-2">{availableCount}</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-600 font-medium">Requested</p>
                        <p className="text-3xl font-bold text-blue-900 mt-2">{requestedCount}</p>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                            <Input
                                type="text"
                                placeholder="Search by student name or LRN..."
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
                                    <SelectItem value="Available">Available</SelectItem>
                                    <SelectItem value="Requested">Requested</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                        <h2 className="text-sm font-semibold text-gray-900">Transcript of Records</h2>
                        <p className="text-sm text-gray-500 mt-1">Showing 4 of 4 records</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Student Name</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">LRN</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Grade Level</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">School Year</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Date Issued</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {transcripts.map((transcript) => (
                                    <tr key={transcript.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-900">{transcript.studentName}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{transcript.lrn}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{transcript.gradeLevel}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{transcript.schoolYear}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                                transcript.status === 'Available' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-blue-100 text-blue-800'
                                            }`}>
                                                {transcript.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{transcript.dateIssued}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button className="text-gray-600 hover:text-blue-600">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button className="text-gray-600 hover:text-purple-600">
                                                    <Printer className="w-4 h-4" />
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
