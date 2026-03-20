import { Head } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Button } from '@/components/ui/button'
import { FileText, Download } from 'lucide-react'

type Document = {
    id: number
    title: string
    description: string
    fileType: 'PDF' | 'DOCX'
    icon: typeof FileText
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
            title: 'Grading Template (PDF)',
            description: 'Standard grading sheet template',
            fileType: 'PDF',
            icon: FileText
        },
        {
            id: 2,
            title: 'Class List Template (DOCX)',
            description: 'Class attendance and list template',
            fileType: 'DOCX',
            icon: FileText
        },
        {
            id: 3,
            title: 'Lesson Plan Template (DOCX)',
            description: 'Standard lesson planning document',
            fileType: 'DOCX',
            icon: FileText
        },
        {
            id: 4,
            title: 'Student Report Card (PDF)',
            description: 'Report card format and template',
            fileType: 'PDF',
            icon: FileText
        }
    ]

    return (
        <AdminLayout user={auth?.user}>
            <Head title="Documents" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Download useful templates and forms
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {documents.map((doc) => (
                        <div key={doc.id} className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-green-600" />
                                </div>
                                <span className={`text-xs font-medium px-2 py-1 rounded ${
                                    doc.fileType === 'PDF' 
                                        ? 'bg-red-50 text-red-700' 
                                        : 'bg-blue-50 text-blue-700'
                                }`}>
                                    {doc.fileType}
                                </span>
                            </div>

                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {doc.title}
                            </h3>
                            <p className="text-sm text-gray-500 mb-4">
                                {doc.description}
                            </p>

                            <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                                <Download className="w-4 h-4 mr-2" />
                                Download
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </AdminLayout>
    )
}
