import { Head } from '@inertiajs/react'
import StudentLayout from '@/layouts/student-layout'

type Clearance = {
    id: number
    schoolYear: string
    studentLRN: string
    studentName: string
    clearanceStatus: 'Pending' | 'Not Pending'
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

export default function StudentClearance({ auth }: Props) {
    const clearances: Clearance[] = [
        { id: 1, schoolYear: '2024-2025', studentLRN: '123456789012', studentName: 'Maria Santos', clearanceStatus: 'Pending' },
        { id: 2, schoolYear: '2023-2024', studentLRN: '123456789012', studentName: 'Maria Santos', clearanceStatus: 'Not Pending' }
    ]

    return (
        <StudentLayout user={auth?.user}>
            <Head title="Student Clearance" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Student Clearance</h1>
                    <p className="text-sm text-gray-500 mt-1">Check your clearance status</p>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                        <p className="text-sm text-gray-600">Showing 1 to 2 of 2 entries</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">School Year</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Student LRN</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Student Name</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Clearance Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {clearances.map((clearance) => (
                                    <tr key={clearance.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-900">{clearance.schoolYear}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{clearance.studentLRN}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{clearance.studentName}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                                clearance.clearanceStatus === 'Not Pending' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {clearance.clearanceStatus}
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
