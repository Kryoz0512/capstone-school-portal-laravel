import { Head } from '@inertiajs/react'
import TeacherLayout from '@/layouts/teacher-layout'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Eye, Download } from 'lucide-react'
import { useState } from 'react'

type Record = {
    id: number
    lrn: string
    studentName: string
    gradeLevel: string
    section: string
    schoolYear: string
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
    const [search, setSearch] = useState('')
    const [gradeLevel, setGradeLevel] = useState('All')
    const [section, setSection] = useState('All')
    const [schoolYear, setSchoolYear] = useState('2024-2025')

    const records: Record[] = [
        { id: 1, lrn: '123456789001', studentName: 'John Garcia', gradeLevel: '10', section: 'A', schoolYear: '2024-2025' },
        { id: 2, lrn: '123456789002', studentName: 'Maria Santos', gradeLevel: '10', section: 'A', schoolYear: '2024-2025' },
        { id: 3, lrn: '123456789003', studentName: 'Pedro Lopez', gradeLevel: '10', section: 'B', schoolYear: '2024-2025' },
        { id: 4, lrn: '123456789004', studentName: 'Rosa Martinez', gradeLevel: '9', section: 'A', schoolYear: '2024-2025' },
        { id: 5, lrn: '123456789005', studentName: 'Antonio Reyes', gradeLevel: '9', section: 'B', schoolYear: '2024-2025' }
    ]

    return (
        <TeacherLayout user={auth?.user}>
            <Head title="Transcript of Records" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Transcript of Records</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        View and download student transcripts
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-sm font-semibold text-gray-900 mb-4">Search & Filters</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                            <Input
                                placeholder="Search by name or LRN..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Grade Level</label>
                            <Select value={gradeLevel} onValueChange={setGradeLevel}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All">All</SelectItem>
                                    <SelectItem value="10">Grade 10</SelectItem>
                                    <SelectItem value="9">Grade 9</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
                            <Select value={section} onValueChange={setSection}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All">All</SelectItem>
                                    <SelectItem value="A">Section A</SelectItem>
                                    <SelectItem value="B">Section B</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">School Year</label>
                            <Select value={schoolYear} onValueChange={setSchoolYear}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="2024-2025">2024-2025</SelectItem>
                                    <SelectItem value="2023-2024">2023-2024</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                        <p className="text-sm text-gray-600">Showing 1 to 5 of 5 entries</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Student LRN</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Student Name</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Grade Level</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Section</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">School Year</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {records.map((record) => (
                                    <tr key={record.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-900">{record.lrn}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{record.studentName}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{record.gradeLevel}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{record.section}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{record.schoolYear}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Button variant="ghost" size="sm">
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm">
                                                    <Download className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </TeacherLayout>
    )
}
