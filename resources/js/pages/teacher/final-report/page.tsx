import { Head } from '@inertiajs/react'
import TeacherLayout from '@/layouts/teacher-layout'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'
import { useState } from 'react'

type Student = {
    id: number
    lrn: string
    studentName: string
    gradeLevel: string
    section: string
    finalAverage: number
    remarks: 'Passed' | 'Failed'
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

export default function FinalReport({ auth }: Props) {
    const [gradeLevel, setGradeLevel] = useState('Grade 10')
    const [section, setSection] = useState('Section A')
    const [subject, setSubject] = useState('English')
    const [schoolYear, setSchoolYear] = useState('2024-2025')

    const students: Student[] = [
        { id: 1, lrn: '123456789001', studentName: 'John Garcia', gradeLevel: '10', section: 'A', finalAverage: 85, remarks: 'Passed' },
        { id: 2, lrn: '123456789002', studentName: 'Maria Santos', gradeLevel: '10', section: 'A', finalAverage: 92, remarks: 'Passed' },
        { id: 3, lrn: '123456789003', studentName: 'Pedro Lopez', gradeLevel: '10', section: 'A', finalAverage: 68, remarks: 'Failed' },
        { id: 4, lrn: '123456789004', studentName: 'Rosa Martinez', gradeLevel: '10', section: 'A', finalAverage: 88, remarks: 'Passed' }
    ]

    return (
        <TeacherLayout user={auth?.user}>
            <Head title="Final Grade Report" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Final Grade Report</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Read-only final grades summary
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-sm font-semibold text-gray-900 mb-4">Filters</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Grade Level</label>
                            <Select value={gradeLevel} onValueChange={setGradeLevel}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Grade 10">Grade 10</SelectItem>
                                    <SelectItem value="Grade 9">Grade 9</SelectItem>
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
                                    <SelectItem value="Section A">Section A</SelectItem>
                                    <SelectItem value="Section B">Section B</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                            <Select value={subject} onValueChange={setSubject}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="English">English</SelectItem>
                                    <SelectItem value="Mathematics">Mathematics</SelectItem>
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
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                        <p className="text-sm text-gray-600">Showing 1 to 4 of 4 entries</p>
                        <Button variant="outline" size="sm">
                            <Printer className="w-4 h-4 mr-2" />
                            Print
                        </Button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Student LRN</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Student Name</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Grade Level</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Section</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Final Average</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Remarks</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {students.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-900">{student.lrn}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{student.studentName}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{student.gradeLevel}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{student.section}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{student.finalAverage}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                                student.remarks === 'Passed' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {student.remarks}
                                            </span>
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
