import { Head, useForm, router } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Download, FileText, Plus, Trash2, Upload, X } from 'lucide-react'
import { useRef, useState, FormEvent } from 'react'

type DocumentItem = {
    id: number
    title: string
    file_name: string
    file_type: string
    file_size: string
    uploaded_by: string
    uploaded_at: string
}

type Props = {
    documents: DocumentItem[]
    auth?: {
        user: { id: number; name: string; email: string; role: string }
        admin?: { role: string; position: string }
    }
}

const fileTypeBadge: Record<string, string> = {
    PDF: 'bg-red-50 text-red-700',
    DOC: 'bg-blue-50 text-blue-700',
    DOCX: 'bg-blue-50 text-blue-700',
    XLS: 'bg-green-50 text-green-700',
    XLSX: 'bg-green-50 text-green-700',
}

export default function Documents({ documents, auth }: Props) {
    const [showForm, setShowForm] = useState(false)
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const { data, setData, post, processing, errors, reset } = useForm<{
        title: string
        file: File | null
    }>({
        title: '',
        file: null,
    })

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        post('/admin/documents', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                reset()
                if (fileInputRef.current) fileInputRef.current.value = ''
                setShowForm(false)
            },
        })
    }

    const handleCancel = () => {
        reset()
        if (fileInputRef.current) fileInputRef.current.value = ''
        setShowForm(false)
    }

    const handleDelete = (id: number, title: string) => {
        if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
        setDeletingId(id)
        router.delete(`/admin/documents/${id}`, {
            preserveScroll: true,
            onFinish: () => setDeletingId(null),
        })
    }

    return (
        <AdminLayout user={auth?.user} admin={auth?.admin}>
            <Head title="Documents" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Upload and manage templates and forms for teachers
                        </p>
                    </div>
                    <Button
                        onClick={() => (showForm ? handleCancel() : setShowForm(true))}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        {showForm ? (
                            <>
                                <X className="w-4 h-4 mr-2" />
                                Cancel
                            </>
                        ) : (
                            <>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Document
                            </>
                        )}
                    </Button>
                </div>

                {showForm && (
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                        <h2 className="text-base font-semibold text-gray-900 mb-4">Upload New Document</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="title" className="mb-1 block">Title</Label>
                                <Input
                                    id="title"
                                    type="text"
                                    placeholder="e.g. Grade 7-10 – Filipino"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                />
                                {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
                            </div>

                            <div>
                                <Label htmlFor="file" className="mb-1 block">File</Label>
                                <input
                                    ref={fileInputRef}
                                    id="file"
                                    type="file"
                                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                                    onChange={(e) => setData('file', e.target.files?.[0] ?? null)}
                                    className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-green-50 file:text-green-700 file:text-sm file:font-medium hover:file:bg-green-100 border border-gray-300 rounded-lg cursor-pointer"
                                />
                                <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX, XLS, or XLSX — max 10MB</p>
                                {errors.file && <p className="text-xs text-red-600 mt-1">{errors.file}</p>}
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={handleCancel}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing || !data.title || !data.file}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    {processing ? 'Uploading...' : 'Upload Document'}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">File</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Uploaded By</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {documents.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center">
                                            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                            <p className="text-sm font-medium text-gray-500">No documents uploaded yet</p>
                                            <p className="text-xs text-gray-400 mt-1">Click "Add Document" to upload the first file.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    documents.map((doc, index) => (
                                        <tr key={doc.id} className={`hover:bg-gray-50 ${index % 2 === 1 ? 'bg-gray-50/40' : ''}`}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                                                    <span className="text-sm font-medium text-gray-900">{doc.title}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${fileTypeBadge[doc.file_type] ?? 'bg-gray-50 text-gray-700'}`}>
                                                        {doc.file_type}
                                                    </span>
                                                    <span className="text-xs text-gray-400">{doc.file_size}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{doc.uploaded_by}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{doc.uploaded_at}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-4">
                                                    <a
                                                        href={`/admin/documents/${doc.id}/download`}
                                                        className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
                                                    >
                                                        <Download className="w-3.5 h-3.5" />
                                                        Download
                                                    </a>
                                                    <button
                                                        onClick={() => handleDelete(doc.id, doc.title)}
                                                        disabled={deletingId === doc.id}
                                                        className="inline-flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}