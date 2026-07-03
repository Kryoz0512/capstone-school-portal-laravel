import { Head, router, usePage } from '@inertiajs/react'
import ArchiveController from '@/actions/App/Http/Controllers/ArchiveController'
import AdminLayout from '@/layouts/admin-layout'
import ConfirmDialog from '@/components/modals/confirm-dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RotateCcw, Trash2, Archive as ArchiveIcon, ShieldAlert, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

type ArchiveItem = {
    id: number
    source: 'soft' | 'legacy'
    type: string
    name: string
    email: string
    archived_by: string
    archived_at: string
    reason: string | null
    has_academic_records?: boolean
}

type Props = {
    auth?: {
        user: { id: number; name: string; email: string; role: string }
        admin?: { role: string; position: string }
    }
    archives: ArchiveItem[]
    counts: Record<string, number>
    currentTab: string
    isSuperAdmin?: boolean
}

type FlashProps = {
    flash?: { success?: string; error?: string }
}

const TAB_OPTIONS = [
    { value: 'all', label: 'All' },
    { value: 'teacher', label: 'Teachers' },
    { value: 'admin', label: 'Admins' },
    { value: 'student', label: 'Students' },
    { value: 'subject', label: 'Subjects' },
    { value: 'room', label: 'Rooms' },
]

function ToastBanner({ message, variant }: { message: string; variant: 'success' | 'error' }) {
    return (
        <Alert variant={variant === 'error' ? 'destructive' : 'default'} className="border-green-200 bg-green-50">
            <AlertTitle>{variant === 'success' ? 'Success' : 'Error'}</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
        </Alert>
    )
}

function AccessDenied() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
            <div className="p-4 rounded-full bg-red-100">
                <ShieldAlert className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
            <p className="text-gray-600 max-w-md">
                Archive management is restricted to Super Admins only. Contact your system administrator if you believe this is an error.
            </p>
        </div>
    )
}

/** Backend route segment: `legacy` or entity key (teacher, student, …). */
function getArchiveRouteSource(item: ArchiveItem): string {
    if (item.source === 'legacy') {
        return 'legacy'
    }

    return item.type.toLowerCase()
}

function getTypeBadgeClass(type: string) {
    switch (type) {
        case 'Teacher': return 'bg-blue-100 text-blue-800 hover:bg-blue-100'
        case 'Admin': return 'bg-purple-100 text-purple-800 hover:bg-purple-100'
        case 'Student': return 'bg-green-100 text-green-800 hover:bg-green-100'
        case 'Subject': return 'bg-orange-100 text-orange-800 hover:bg-orange-100'
        case 'Room': return 'bg-cyan-100 text-cyan-800 hover:bg-cyan-100'
        default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100'
    }
}

export default function ArchivePage({ auth, archives = [], counts = {}, currentTab = 'all' }: Props) {
    const { flash } = usePage<{ flash: FlashProps['flash'] }>().props
    const isSuperAdmin = auth?.admin?.role === 'Super Admin'

    const [activeTab, setActiveTab] = useState(currentTab)
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null)

    const [restoreTarget, setRestoreTarget] = useState<ArchiveItem | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<ArchiveItem | null>(null)

    useEffect(() => {
        if (flash?.success) {
            setToast({ message: flash.success, variant: 'success' })
        } else if (flash?.error) {
            setToast({ message: flash.error, variant: 'error' })
        }
    }, [flash])

    useEffect(() => {
        if (!toast) return
        const timer = setTimeout(() => setToast(null), 4000)
        return () => clearTimeout(timer)
    }, [toast])

    const handleTabChange = (value: string) => {
        setActiveTab(value)
        setCurrentPage(1)
        router.get(ArchiveController.index.url({ query: { tab: value } }), {}, { preserveState: true, replace: true })
    }

    const paginatedArchives = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage
        return archives.slice(start, start + itemsPerPage)
    }, [archives, currentPage, itemsPerPage])

    const totalPages = Math.max(1, Math.ceil(archives.length / itemsPerPage))

    const confirmRestore = () => {
        if (!restoreTarget) return
        router.post(
            ArchiveController.restore.url({
                source: getArchiveRouteSource(restoreTarget),
                id: restoreTarget.id,
            }),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setRestoreTarget(null)
                    setToast({ message: 'Record restored successfully.', variant: 'success' })
                },
                onError: () => setToast({ message: 'Failed to restore record.', variant: 'error' }),
            },
        )
    }

    const confirmForceDelete = () => {
        if (!deleteTarget) return
        router.delete(
            ArchiveController.destroy.url({
                source: getArchiveRouteSource(deleteTarget),
                id: deleteTarget.id,
            }),
            {
                preserveScroll: true,
                onSuccess: () => {
                    setDeleteTarget(null)
                    setToast({ message: 'Record permanently deleted.', variant: 'success' })
                },
                onError: () => setToast({ message: 'Failed to permanently delete record.', variant: 'error' }),
            },
        )
    }

    if (!isSuperAdmin) {
        return (
            <AdminLayout user={auth?.user} admin={auth?.admin}>
                <Head title="Archive" />
                <AccessDenied />
            </AdminLayout>
        )
    }

    return (
        <AdminLayout user={auth?.user} admin={auth?.admin}>
            <Head title="Archive" />

            <div className="space-y-6">
                {toast && <ToastBanner message={toast.message} variant={toast.variant} />}

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Archive</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Restore or permanently remove archived records. Student grades are never deleted.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <ArchiveIcon className="w-5 h-5 text-gray-600" />
                        <span className="text-sm font-medium text-gray-600">
                            {counts.all ?? archives.length} archived item(s)
                        </span>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={handleTabChange}>
                    <TabsList className="bg-white border border-gray-200 p-1 rounded-lg flex flex-wrap gap-1 h-auto">
                        {TAB_OPTIONS.map((tab) => (
                            <TabsTrigger
                                key={tab.value}
                                value={tab.value}
                                className="data-[state=active]:bg-green-700 data-[state=active]:text-white rounded-md px-4 py-2"
                            >
                                {tab.label}
                                <span className="ml-2 text-xs opacity-75">({counts[tab.value] ?? 0})</span>
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {TAB_OPTIONS.map((tab) => (
                        <TabsContent key={tab.value} value={tab.value} className="mt-4">
                            <ArchiveTable
                                archives={paginatedArchives}
                                totalCount={archives.length}
                                currentPage={currentPage}
                                totalPages={totalPages}
                                itemsPerPage={itemsPerPage}
                                onPageChange={setCurrentPage}
                                onItemsPerPageChange={(value) => {
                                    setItemsPerPage(value)
                                    setCurrentPage(1)
                                }}
                                onRestore={setRestoreTarget}
                                onForceDelete={setDeleteTarget}
                            />
                        </TabsContent>
                    ))}
                </Tabs>
            </div>

            <ConfirmDialog
                open={!!restoreTarget}
                onOpenChange={(open) => !open && setRestoreTarget(null)}
                title="Restore Record"
                description={`Are you sure you want to restore "${restoreTarget?.name}"? Management records will be restored. Existing grades will remain unchanged.`}
                confirmText="Restore"
                onConfirm={confirmRestore}
            />

            <ConfirmDialog
                open={!!deleteTarget}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
                title="Permanently Delete"
                description={
                    deleteTarget?.has_academic_records
                        ? `Warning: This action is permanent and cannot be undone. "${deleteTarget.name}" has academic grade records — only the login account and management records will be removed. Grade history will be preserved.`
                        : 'Warning: This action is permanent and cannot be undone. This record will be permanently removed from the archive.'
                }
                confirmText="Permanently Delete"
                variant="destructive"
                onConfirm={confirmForceDelete}
            />
        </AdminLayout>
    )
}

function ArchiveTable({
    archives,
    totalCount,
    currentPage,
    totalPages,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange,
    onRestore,
    onForceDelete,
}: {
    archives: ArchiveItem[]
    totalCount: number
    currentPage: number
    totalPages: number
    itemsPerPage: number
    onPageChange: (page: number) => void
    onItemsPerPageChange: (value: number) => void
    onRestore: (item: ArchiveItem) => void
    onForceDelete: (item: ArchiveItem) => void
}) {
    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-green-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-sm font-medium text-white">Type</th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-white">Deleted Item</th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-white">Email</th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-white">Archived By</th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-white">Archived At</th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-white">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {archives.length > 0 ? (
                            archives.map((archive) => (
                                <tr key={`${archive.source}-${archive.id}`} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <Badge className={getTypeBadgeClass(archive.type)}>{archive.type}</Badge>
                                        {archive.has_academic_records && (
                                            <Badge variant="outline" className="ml-2 text-xs">Has Grades</Badge>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{archive.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{archive.email}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{archive.archived_by}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{archive.archived_at}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onRestore(archive)}
                                                title="Restore"
                                            >
                                                <RotateCcw className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onForceDelete(archive)}
                                                title="Permanently Delete"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                                    No archived records found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {totalCount > 0 && (
                <div className="p-4 border-t border-gray-200 flex items-center justify-between flex-wrap gap-4">
                    <p className="text-sm text-gray-600">
                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} entries
                    </p>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
                        <Button variant="outline" size="sm" onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
