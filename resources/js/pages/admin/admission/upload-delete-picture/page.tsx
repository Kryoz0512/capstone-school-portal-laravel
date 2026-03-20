import { Head } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'

type Person = {
    id: number
    initials: string
    name: string
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

export default function UploadDeletePicture({ auth }: Props) {
    const people: Person[] = [
        { id: 1, initials: 'JD', name: 'John Doe' },
        { id: 2, initials: 'MJ', name: 'Ms. Johnson' },
        { id: 3, initials: 'MA', name: 'Mark Administrator' }
    ]

    return (
        <AdminLayout user={auth?.user}>
            <Head title="Upload / Delete Picture" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Upload / Delete Picture</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage photos for students, teachers, and staff
                    </p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">All Pictures</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {people.map((person) => (
                            <div key={person.id} className="border border-gray-200 rounded-lg p-6 text-center">
                                <div className="w-24 h-24 mx-auto bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                                    <span className="text-2xl font-semibold text-gray-600">
                                        {person.initials}
                                    </span>
                                </div>
                                <p className="text-sm font-medium text-gray-900 mb-3">
                                    {person.name}
                                </p>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="w-full"
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
