import { Head } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'

type School = {
    id: number
    schoolCode: string
    schoolName: string
    schoolType: string
    schoolAddress: string
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

export default function SchoolAccreditation({ auth }: Props) {
    const [schoolType, setSchoolType] = useState('')

    const schools: School[] = [
        { id: 1, schoolCode: 'SNHS-001', schoolName: 'Santor National High School', schoolType: 'Public', schoolAddress: '123 Main St, City, Country' },
        { id: 2, schoolCode: 'PNHS-002', schoolName: 'Pittsburg National High School', schoolType: 'Private', schoolAddress: '456 Oak Ave, City, Country' }
    ]

    return (
        <AdminLayout user={auth?.user}>
            <Head title="School Accreditation" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">School Accreditation</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage school accreditation information
                    </p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Add School</h2>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    School Code <span className="text-red-500">*</span>
                                </label>
                                <Input type="text" placeholder="Enter school code" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    School Name <span className="text-red-500">*</span>
                                </label>
                                <Input type="text" placeholder="Enter school name" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    School Type <span className="text-red-500">*</span>
                                </label>
                                <Select value={schoolType} onValueChange={setSchoolType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select school type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="public">Public</SelectItem>
                                        <SelectItem value="private">Private</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    School Address <span className="text-red-500">*</span>
                                </label>
                                <Input type="text" placeholder="Enter school address" />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button className="bg-green-600 hover:bg-green-700 text-white">
                                Add
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                        <h2 className="text-sm font-semibold text-gray-900">Accredited Schools</h2>
                    </div>

                    <div className="p-4 border-b border-gray-200">
                        <p className="text-sm text-gray-600">
                            Showing 1 to {schools.length} of {schools.length} entries
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">School Code</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">School Name</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">School Type</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">School Address</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {schools.map((school) => (
                                    <tr key={school.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-900">{school.schoolCode}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{school.schoolName}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{school.schoolType}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{school.schoolAddress}</td>
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
