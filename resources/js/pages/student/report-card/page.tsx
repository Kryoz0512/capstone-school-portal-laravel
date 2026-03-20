import { Head } from '@inertiajs/react'
import StudentLayout from '@/layouts/student-layout'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'

type Grade = {
    id: number
    subject: string
    teacher: string
    quarter1: number
    quarter2: number
    quarter3: number
    quarter4: number
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

export default function ReportCard({ auth }: Props) {
    const [schoolYear, setSchoolYear] = useState('2024-2025')

    const studentInfo = {
        lrn: '123456789012',
        name: 'Maria Santos',
        gradeSection: 'Grade 10 - A',
        adviser: 'Mr. Rodriguez'
    }

    const grades: Grade[] = [
        { id: 1, subject: 'English', teacher: 'Ms. Johnson', quarter1: 88, quarter2: 90, quarter3: 92, quarter4: 91 },
        { id: 2, subject: 'Mathematics', teacher: 'Mr. Smith', quarter1: 78, quarter2: 82, quarter3: 85, quarter4: 86 },
        { id: 3, subject: 'Science', teacher: 'Dr. Garcia', quarter1: 92, quarter2: 94, quarter3: 95, quarter4: 94 },
        { id: 4, subject: 'Social Studies', teacher: 'Ms. Williams', quarter1: 86, quarter2: 87, quarter3: 88, quarter4: 88 },
        { id: 5, subject: 'Filipino', teacher: 'Mr. Cruz', quarter1: 89, quarter2: 91, quarter3: 90, quarter4: 90 }
    ]

    return (
        <StudentLayout user={auth?.user}>
            <Head title="Report Card" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Report Card</h1>
                    <p className="text-sm text-gray-500 mt-1">Your academic performance</p>
                </div>

                {/* Student Info Card */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Student LRN:</p>
                            <p className="text-base font-semibold text-gray-900">{studentInfo.lrn}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Student Name:</p>
                            <p className="text-base font-semibold text-gray-900">{studentInfo.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Grade & Section:</p>
                            <p className="text-base font-semibold text-gray-900">{studentInfo.gradeSection}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Section Adviser:</p>
                            <p className="text-base font-semibold text-gray-900">{studentInfo.adviser}</p>
                        </div>
                    </div>
                </div>

                {/* Filter */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="max-w-xs">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by School Year</label>
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

                {/* Grades Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-green-700 text-white">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium">Subject</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium">Teacher</th>
                                    <th className="px-6 py-3 text-center text-sm font-medium">Quarter 1</th>
                                    <th className="px-6 py-3 text-center text-sm font-medium">Quarter 2</th>
                                    <th className="px-6 py-3 text-center text-sm font-medium">Quarter 3</th>
                                    <th className="px-6 py-3 text-center text-sm font-medium">Quarter 4</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {grades.map((grade) => (
                                    <tr key={grade.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-900">{grade.subject}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{grade.teacher}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900 text-center">{grade.quarter1}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900 text-center">{grade.quarter2}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900 text-center">{grade.quarter3}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900 text-center">{grade.quarter4}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </StudentLayout>
    )
}
