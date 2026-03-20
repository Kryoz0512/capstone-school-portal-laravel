import { Head } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'

type Subject = {
    id: number
    subjectCode: string
    subjectName: string
    description: string
    gradeLevel: string
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

export default function SubjectListings({ auth }: Props) {
    const subjects: Subject[] = [
        { id: 1, subjectCode: 'ENG-01', subjectName: 'English Literature', description: 'Introduction to English literature and writing skills', gradeLevel: 'Grade 7' },
        { id: 2, subjectCode: 'MATH-01', subjectName: 'Basic Mathematics', description: 'Fundamentals of algebra and geometry', gradeLevel: 'Grade 7' }
    ]

    return (
        <AdminLayout user={auth?.user}>
            <Head title="Subject Listings" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Subject Listings</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Manage school subjects by grade level
                        </p>
                    </div>
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                        + Add Subject
                    </Button>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <p className="text-sm text-gray-600">
                        Filter by Grade Level
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        Showing {subjects.length} subjects
                    </p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Subject Code</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Subject Name</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Description</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Grade Level</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {subjects.map((subject) => (
                                    <tr key={subject.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-900">{subject.subjectCode}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{subject.subjectName}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{subject.description}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                {subject.gradeLevel}
                                            </span>
                                        </td>
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
