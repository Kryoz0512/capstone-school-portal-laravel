import { Head } from '@inertiajs/react'
import TeacherLayout from '@/layouts/teacher-layout'
import { Download, FileText } from 'lucide-react'

type DocumentItem = { id: number; title: string; file_name: string; file_type: string; file_size: string; uploaded_by: string; uploaded_at: string }

// This now matches the shape Laravel's paginate() -> Inertia actually sends
type PaginatedDocuments = {
    data: DocumentItem[]
    current_page: number
    last_page: number
    per_page: number
    total: number
    links: { url: string | null; label: string; active: boolean }[]
}

type Props = { documents: PaginatedDocuments; auth?: { user: { id: number; name: string; email: string; role: string } } }

const fileTypeBadge: Record<string, string> = {
    PDF: 'bg-red-50 text-red-700', DOC: 'bg-blue-50 text-blue-700', DOCX: 'bg-blue-50 text-blue-700',
    XLS: 'bg-green-50 text-green-700', XLSX: 'bg-green-50 text-green-700',
}

export default function Documents({ documents, auth }: Props) {
    const rows = documents.data // <-- the actual array lives here

    return (
        <TeacherLayout user={auth?.user}>
            <Head title="Documents" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Documents</h1>
                    <p className="text-sm text-gray-500 mt-1">Access and download templates uploaded by the registrar's office</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[400px]">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Title</th>
                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">File</th>
                                    <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date Added</th>
                                    <th className="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center">
                                            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                            <p className="text-sm font-medium text-gray-500">No documents available yet</p>
                                            <p className="text-xs text-gray-400 mt-1">Check back later once the registrar's office uploads files.</p>
                                        </td>
                                    </tr>
                                ) : rows.map((doc, index) => (
                                    <tr key={doc.id} className={`hover:bg-gray-50 ${index % 2 === 1 ? 'bg-gray-50/40' : ''}`}>
                                        <td className="px-4 sm:px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                                                <span className="text-sm font-medium text-gray-900">{doc.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded ${fileTypeBadge[doc.file_type] ?? 'bg-gray-50 text-gray-700'}`}>{doc.file_type}</span>
                                                <span className="hidden sm:inline text-xs text-gray-400">{doc.file_size}</span>
                                            </div>
                                        </td>
                                        <td className="hidden sm:table-cell px-6 py-4 text-sm text-gray-600">{doc.uploaded_at}</td>
                                        <td className="px-4 sm:px-6 py-4 text-right">
                                            <a href={`/teacher/documents/${doc.id}/download`} className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800">
                                                <Download className="w-3.5 h-3.5" />
                                                <span className="hidden sm:inline">Download</span>
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Optional: pagination controls, since the backend already paginates */}
                    {documents.last_page > 1 && (
                        <div className="flex justify-center gap-1 py-3 border-t border-gray-200">
                            {documents.links.map((link, i) => {
                                const isDisabled = link.url === null
                                const base = 'px-3 py-1 text-sm rounded'
                                const activeClass = link.active ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                                const disabledClass = isDisabled ? 'pointer-events-none opacity-40' : ''

                                return (
                                    <a
                                        key={i}
                                        href={isDisabled ? '#' : link.url}
                                        className={base + ' ' + activeClass + ' ' + disabledClass}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </TeacherLayout>
    )
}