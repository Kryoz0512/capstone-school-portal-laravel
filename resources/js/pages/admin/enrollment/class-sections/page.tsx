import { Head } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'

type Section = {
    id: number
    sectionName: string
    gradeLevel: number
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
    sections?: Section[]
}

export default function ClassSections({ auth, sections = [] }: Props) {
    const sampleSections: Section[] = sections.length > 0 ? sections : [
        { id: 1, sectionName: 'Grade 10 - Section A', gradeLevel: 10 },
        { id: 2, sectionName: 'Grade 10 - Section B', gradeLevel: 10 },
        { id: 3, sectionName: 'Grade 9 - Section A', gradeLevel: 9 }
    ]

    return (
        <AdminLayout user={auth?.user}>
            <Head title="Class Sections" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Class Sections</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Create and manage class sections
                        </p>
                    </div>
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                        + Create Section
                    </Button>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                        <h2 className="text-sm font-semibold text-gray-900">Sections</h2>
                    </div>

                    <div className="p-4 border-b border-gray-200">
                        <p className="text-sm text-gray-600">
                            Showing 1 to {sampleSections.length} of {sampleSections.length} entries
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                                        Section Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                                        Grade Level
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {sampleSections.map((section) => (
                                    <tr key={section.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {section.sectionName}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {section.gradeLevel}
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
