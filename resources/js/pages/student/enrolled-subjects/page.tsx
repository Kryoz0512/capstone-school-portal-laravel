import { Head } from '@inertiajs/react'
import StudentLayout from '@/layouts/student-layout'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useState } from 'react'

type Subject = {
    id: number
    subjectCode: string
    subjectName: string
    credits: number
    instructor: string
    status: 'Active'
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

export default function EnrolledSubjects({ auth }: Props) {
    const [schoolYear, setSchoolYear] = useState('2025-2026')
    const [search, setSearch] = useState('')

    const subjects: Subject[] = [
        { id: 1, subjectCode: 'ENG-401', subjectName: 'English 4', credits: 4, instructor: 'Mr. Johnson', status: 'Active' },
        { id: 2, subjectCode: 'MATH-401', subjectName: 'Mathematics 4', credits: 4, instructor: 'Ms. Garcia', status: 'Active' },
        { id: 3, subjectCode: 'SCI-401', subjectName: 'Science 4', credits: 4, instructor: 'Dr. Smith', status: 'Active' },
        { id: 4, subjectCode: 'SS-401', subjectName: 'Social Studies 4', credits: 3, instructor: 'Mr. Lopez', status: 'Active' },
        { id: 5, subjectCode: 'PE-401', subjectName: 'Physical Education 4', credits: 2, instructor: 'Coach Martinez', status: 'Active' },
        { id: 6, subjectCode: 'FIL-401', subjectName: 'Filipino 4', credits: 3, instructor: 'Ms. Santos', status: 'Active' }
    ]

    return (
        <StudentLayout user={auth?.user}>
            <Head title="Enrolled Subjects" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Enrolled Subjects</h1>
                    <p className="text-sm text-gray-500 mt-1">Your registered courses by school year</p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-sm font-semibold text-gray-900 mb-4">Filters</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">School Year</label>
                            <Select value={schoolYear} onValueChange={setSchoolYear}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="2025-2026">2025-2026</SelectItem>
                                    <SelectItem value="2024-2025">2024-2025</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Search Subject</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Search by name or code..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subject Summary */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Subject Summary</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Subject Code</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Subject Name</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Credits</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Instructor</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {subjects.map((subject) => (
                                    <tr key={subject.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-900">{subject.subjectCode}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{subject.subjectName}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                                                {subject.credits}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{subject.instructor}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                {subject.status}
                                            </span>
                                        </td>
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
