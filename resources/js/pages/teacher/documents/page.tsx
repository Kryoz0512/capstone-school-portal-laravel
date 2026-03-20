import { Head } from '@inertiajs/react'
import TeacherLayout from '@/layouts/teacher-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, FileText } from 'lucide-react'

type Document = {
    id: number
    title: string
    description: string
    type: 'PDF' | 'DOCX'
    size: string
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

export default function Documents({ auth }: Props) {
    const documents: Document[] = [
        {
            id: 1,
            title: 'Teaching Load',
            description: 'Your current teaching assignments and schedule',
            type: 'PDF',
            size: '245 KB'
        },
        {
            id: 2,
            title: 'Class Roster',
            description: 'Complete list of students in your classes',
            type: 'DOCX',
            size: '128 KB'
        },
        {
            id: 3,
            title: 'Curriculum Guide',
            description: 'Subject curriculum and learning competencies',
            type: 'PDF',
            size: '1.2 MB'
        },
        {
            id: 4,
            title: 'Grading Sheet Template',
            description: 'Template for recording student grades',
            type: 'DOCX',
            size: '89 KB'
        }
    ]

    return (
        <TeacherLayout user={auth?.user}>
            <Head title="Documents" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Access and download your teaching documents
                    </p>
                </div>

                {/* Documents Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {documents.map((doc) => (
                        <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <FileText className="w-6 h-6 text-green-700" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{doc.title}</CardTitle>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                    doc.type === 'PDF' 
                                                        ? 'bg-red-100 text-red-800' 
                                                        : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {doc.type}
                                                </span>
                                                <span className="text-xs text-gray-500">{doc.size}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="mb-4">
                                    {doc.description}
                                </CardDescription>
                                <Button className="w-full bg-green-700 hover:bg-green-800">
                                    <Download className="w-4 h-4 mr-2" />
                                    Download
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </TeacherLayout>
    )
}
