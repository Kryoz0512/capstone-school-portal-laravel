import { Head, useForm, router } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Megaphone, Plus, Edit, Trash2, Check, X, Eye, EyeOff, Clock, Image as ImageIcon, Rows, Square } from 'lucide-react'
import { useRef, useState } from 'react'

type DisplayType = 'text' | 'banner'

type Announcement = {
    id: number
    title: string
    content: string
    image_url: string | null
    display_type: DisplayType
    status: 'pending' | 'approved' | 'rejected'
    is_active: boolean
    created_by: string
    created_by_role: string
    approved_by: string | null
    approved_by_role: string | null
    approved_at: string | null
    rejection_reason: string | null
    created_at: string
}

type Props = {
    announcements: Announcement[]
    isSuperAdmin: boolean
    pendingCount: number
    auth: {
        user: any
        admin: any
    }
}

export default function AnnouncementsPage({ announcements, isSuperAdmin, pendingCount, auth }: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isRejectOpen, setIsRejectOpen] = useState(false)
    const [deleteId, setDeleteId] = useState<number | null>(null)
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

    const createFileInputRef = useRef<HTMLInputElement>(null)
    const editFileInputRef = useRef<HTMLInputElement>(null)
    const [createPreview, setCreatePreview] = useState<string | null>(null)
    const [editPreview, setEditPreview] = useState<string | null>(null)
    const [removeExistingImage, setRemoveExistingImage] = useState(false)

    const { data, setData, post, processing, errors, reset } = useForm<{
        title: string
        content: string
        display_type: DisplayType
        image: File | null
    }>({
        title: '',
        content: '',
        display_type: 'text',
        image: null,
    })

    const editForm = useForm<{
        title: string
        content: string
        display_type: DisplayType
        image: File | null
        remove_image: boolean
        _method: string
    }>({
        title: '',
        content: '',
        display_type: 'text',
        image: null,
        remove_image: false,
        _method: 'put',
    })

    const rejectForm = useForm({
        rejection_reason: '',
    })

    const resetCreateImage = () => {
        setCreatePreview(null)
        if (createFileInputRef.current) createFileInputRef.current.value = ''
    }

    const resetEditImage = () => {
        setEditPreview(null)
        setRemoveExistingImage(false)
        if (editFileInputRef.current) editFileInputRef.current.value = ''
    }

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault()
        post('/admin/maintenance/announcements', {
            forceFormData: true,
            onSuccess: () => {
                reset()
                resetCreateImage()
                setIsCreateOpen(false)
            },
        })
    }

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault()
        if (selectedAnnouncement) {
            // Use POST + _method spoof so the multipart image upload works
            editForm.post(`/admin/maintenance/announcements/${selectedAnnouncement.id}`, {
                forceFormData: true,
                onSuccess: () => {
                    editForm.reset()
                    resetEditImage()
                    setIsEditOpen(false)
                    setSelectedAnnouncement(null)
                },
            })
        }
    }

    const handleDelete = () => {
        if (deleteId) {
            router.delete(`/admin/maintenance/announcements/${deleteId}`, {
                onSuccess: () => setDeleteId(null),
            })
        }
    }

    const handleApprove = (id: number) => {
        router.post(`/admin/maintenance/announcements/${id}/approve`)
    }

    const handleReject = (e: React.FormEvent) => {
        e.preventDefault()
        if (selectedAnnouncement) {
            rejectForm.post(`/admin/maintenance/announcements/${selectedAnnouncement.id}/reject`, {
                onSuccess: () => {
                    rejectForm.reset()
                    setIsRejectOpen(false)
                    setSelectedAnnouncement(null)
                },
            })
        }
    }

    const handleToggleActive = (id: number) => {
        router.post(`/admin/maintenance/announcements/${id}/toggle`)
    }

    const openEditDialog = (announcement: Announcement) => {
        setSelectedAnnouncement(announcement)
        editForm.setData({
            title: announcement.title,
            content: announcement.content,
            display_type: announcement.display_type,
            image: null,
            remove_image: false,
            _method: 'put',
        })
        setEditPreview(announcement.image_url)
        setRemoveExistingImage(false)
        setIsEditOpen(true)
    }

    const openRejectDialog = (announcement: Announcement) => {
        setSelectedAnnouncement(announcement)
        setIsRejectOpen(true)
    }

    const onCreateImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null
        setData('image', file)
        setCreatePreview(file ? URL.createObjectURL(file) : null)
    }

    const onEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null
        editForm.setData('image', file)
        setRemoveExistingImage(false)
        setEditPreview(file ? URL.createObjectURL(file) : selectedAnnouncement?.image_url ?? null)
    }

    const filteredAnnouncements = announcements.filter((announcement) => {
        if (filter === 'all') return true
        return announcement.status === filter
    })

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <Badge className="bg-green-500">Approved</Badge>
            case 'pending':
                return <Badge className="bg-yellow-500">Pending</Badge>
            case 'rejected':
                return <Badge className="bg-red-500">Rejected</Badge>
            default:
                return <Badge>{status}</Badge>
        }
    }

    return (
        <AdminLayout user={auth.user} admin={auth.admin}>
            <Head title="Announcements" />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
                        <p className="text-gray-600 mt-1">
                            {isSuperAdmin
                                ? 'Manage and approve announcements'
                                : 'Create announcements for approval'}
                        </p>
                    </div>
                    <Button onClick={() => setIsCreateOpen(true)} className="bg-green-600 hover:bg-green-700">
                        <Plus className="w-4 h-4 mr-2" />
                        New Announcement
                    </Button>
                </div>

                {/* Pending Count for Super Admin */}
                {isSuperAdmin && pendingCount > 0 && (
                    <Card className="border-yellow-200 bg-yellow-50">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-yellow-600" />
                                <p className="text-yellow-800 font-medium">
                                    You have {pendingCount} pending announcement{pendingCount > 1 ? 's' : ''} waiting for approval
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Filter Tabs */}
                <div className="flex gap-2">
                    <Button
                        variant={filter === 'all' ? 'default' : 'outline'}
                        onClick={() => setFilter('all')}
                        className={filter === 'all' ? 'bg-green-600 hover:bg-green-700' : ''}
                    >
                        All ({announcements.length})
                    </Button>
                    {isSuperAdmin && (
                        <Button
                            variant={filter === 'pending' ? 'default' : 'outline'}
                            onClick={() => setFilter('pending')}
                            className={filter === 'pending' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
                        >
                            Pending ({announcements.filter((a) => a.status === 'pending').length})
                        </Button>
                    )}
                    <Button
                        variant={filter === 'approved' ? 'default' : 'outline'}
                        onClick={() => setFilter('approved')}
                        className={filter === 'approved' ? 'bg-green-600 hover:bg-green-700' : ''}
                    >
                        Approved ({announcements.filter((a) => a.status === 'approved').length})
                    </Button>
                    <Button
                        variant={filter === 'rejected' ? 'default' : 'outline'}
                        onClick={() => setFilter('rejected')}
                        className={filter === 'rejected' ? 'bg-red-500 hover:bg-red-600' : ''}
                    >
                        Rejected ({announcements.filter((a) => a.status === 'rejected').length})
                    </Button>
                </div>

                {/* Announcements List */}
                <div className="grid gap-4">
                    {filteredAnnouncements.length === 0 ? (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center py-12">
                                    <Megaphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">No announcements found</p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        filteredAnnouncements.map((announcement) => (
                            <Card key={announcement.id} className="hover:shadow-md transition-shadow overflow-hidden">
                                {/* Banner image renders full width at the top of the card */}
                                {announcement.display_type === 'banner' && announcement.image_url && (
                                    <img
                                        src={announcement.image_url}
                                        alt={announcement.title}
                                        className="w-full max-h-80 object-cover"
                                    />
                                )}
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <CardTitle className="text-xl">{announcement.title}</CardTitle>
                                                {getStatusBadge(announcement.status)}
                                                {announcement.status === 'approved' && (
                                                    <Badge variant={announcement.is_active ? 'default' : 'secondary'}>
                                                        {announcement.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                )}
                                                <Badge variant="outline" className="gap-1">
                                                    {announcement.display_type === 'banner' ? (
                                                        <Rows className="w-3 h-3" />
                                                    ) : (
                                                        <Square className="w-3 h-3" />
                                                    )}
                                                    {announcement.display_type === 'banner' ? 'Banner' : 'Text'}
                                                </Badge>
                                            </div>
                                            <CardDescription>
                                                Created by {announcement.created_by} ({announcement.created_by_role}) on{' '}
                                                {announcement.created_at}
                                            </CardDescription>
                                            {announcement.approved_at && (
                                                <CardDescription className="text-green-600">
                                                    {isSuperAdmin
                                                        ? 'Approved'
                                                        : `Approved by ${announcement.approved_by} (${announcement.approved_by_role}) on ${announcement.approved_at}`
                                                    }
                                                </CardDescription>
                                            )}
                                            {announcement.rejection_reason && (
                                                <CardDescription className="text-red-600 mt-1">
                                                    Rejection reason: {announcement.rejection_reason}
                                                </CardDescription>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            {/* Edit button - only for pending announcements by creator */}
                                            {announcement.status === 'pending' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => openEditDialog(announcement)}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                            )}

                                            {/* Approve/Reject buttons - only for Super Admin on pending */}
                                            {isSuperAdmin && announcement.status === 'pending' && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700"
                                                        onClick={() => handleApprove(announcement.id)}
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => openRejectDialog(announcement)}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </>
                                            )}

                                            {/* Toggle active - only for approved announcements */}
                                            {announcement.status === 'approved' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleToggleActive(announcement.id)}
                                                >
                                                    {announcement.is_active ? (
                                                        <EyeOff className="w-4 h-4" />
                                                    ) : (
                                                        <Eye className="w-4 h-4" />
                                                    )}
                                                </Button>
                                            )}

                                            {/* Delete button */}
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => setDeleteId(announcement.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex gap-4">
                                        {/* Text type image renders as a smaller thumbnail beside the content */}
                                        {announcement.display_type === 'text' && announcement.image_url && (
                                            <img
                                                src={announcement.image_url}
                                                alt={announcement.title}
                                                className="w-28 h-28 object-cover rounded-md border shrink-0"
                                            />
                                        )}
                                        {announcement.content && (
                                            <p className="text-gray-700 whitespace-pre-wrap">{announcement.content}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Create New Announcement</DialogTitle>
                        <DialogDescription>
                            {isSuperAdmin
                                ? 'Your announcement will be published immediately.'
                                : 'Your announcement will be sent for Super Admin approval.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Title</label>
                            <Input
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                placeholder="Enter announcement title"
                                required
                            />
                            {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
                        </div>

                        {/* Display type picker */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">Display Style</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setData('display_type', 'text')}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                                        data.display_type === 'text'
                                            ? 'border-green-600 bg-green-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <Square className="w-5 h-5" />
                                    <span className="text-sm font-medium">Text Post</span>
                                    <span className="text-xs text-gray-500 text-center">Optional small image alongside text</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setData('display_type', 'banner')}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                                        data.display_type === 'banner'
                                            ? 'border-green-600 bg-green-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <Rows className="w-5 h-5" />
                                    <span className="text-sm font-medium">Banner</span>
                                    <span className="text-xs text-gray-500 text-center">Full-width image at the top</span>
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium">Content {data.display_type === 'banner' && '(optional)'}</label>
                            <Textarea
                                value={data.content}
                                onChange={(e) => setData('content', e.target.value)}
                                placeholder="Enter announcement content"
                                rows={6}
                                required={data.display_type === 'text'}
                            />
                            {errors.content && <p className="text-sm text-red-600 mt-1">{errors.content}</p>}
                        </div>

                        {/* Image upload */}
                        <div>
                            <label className="text-sm font-medium">
                                Image {data.display_type === 'banner' ? '' : '(optional)'}
                            </label>
                            <div className="mt-1 flex items-center gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => createFileInputRef.current?.click()}
                                >
                                    <ImageIcon className="w-4 h-4 mr-2" />
                                    {createPreview ? 'Change Image' : 'Upload Image'}
                                </Button>
                                {createPreview && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setData('image', null)
                                            resetCreateImage()
                                        }}
                                    >
                                        Remove
                                    </Button>
                                )}
                            </div>
                            <input
                                ref={createFileInputRef}
                                type="file"
                                accept="image/png,image/jpeg,image/jpg,image/webp"
                                className="hidden"
                                onChange={onCreateImageChange}
                            />
                            {createPreview && (
                                <img
                                    src={createPreview}
                                    alt="Preview"
                                    className={
                                        data.display_type === 'banner'
                                            ? 'mt-3 w-full max-h-56 object-cover rounded-md border'
                                            : 'mt-3 w-28 h-28 object-cover rounded-md border'
                                    }
                                />
                            )}
                            {errors.image && <p className="text-sm text-red-600 mt-1">{errors.image}</p>}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing} className="bg-green-600 hover:bg-green-700">
                                {processing ? 'Creating...' : 'Create Announcement'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Announcement</DialogTitle>
                        <DialogDescription>Update your pending announcement.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEdit} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Title</label>
                            <Input
                                value={editForm.data.title}
                                onChange={(e) => editForm.setData('title', e.target.value)}
                                placeholder="Enter announcement title"
                                required
                            />
                            {editForm.errors.title && <p className="text-sm text-red-600 mt-1">{editForm.errors.title}</p>}
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">Display Style</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => editForm.setData('display_type', 'text')}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                                        editForm.data.display_type === 'text'
                                            ? 'border-green-600 bg-green-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <Square className="w-5 h-5" />
                                    <span className="text-sm font-medium">Text Post</span>
                                    <span className="text-xs text-gray-500 text-center">Optional small image alongside text</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => editForm.setData('display_type', 'banner')}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                                        editForm.data.display_type === 'banner'
                                            ? 'border-green-600 bg-green-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <Rows className="w-5 h-5" />
                                    <span className="text-sm font-medium">Banner</span>
                                    <span className="text-xs text-gray-500 text-center">Full-width image at the top</span>
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium">
                                Content {editForm.data.display_type === 'banner' && '(optional)'}
                            </label>
                            <Textarea
                                value={editForm.data.content}
                                onChange={(e) => editForm.setData('content', e.target.value)}
                                placeholder="Enter announcement content"
                                rows={6}
                                required={editForm.data.display_type === 'text'}
                            />
                            {editForm.errors.content && <p className="text-sm text-red-600 mt-1">{editForm.errors.content}</p>}
                        </div>

                        {/* Image upload / replace / remove */}
                        <div>
                            <label className="text-sm font-medium">
                                Image {editForm.data.display_type === 'banner' ? '' : '(optional)'}
                            </label>
                            <div className="mt-1 flex items-center gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => editFileInputRef.current?.click()}
                                >
                                    <ImageIcon className="w-4 h-4 mr-2" />
                                    {editPreview ? 'Change Image' : 'Upload Image'}
                                </Button>
                                {editPreview && !removeExistingImage && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            editForm.setData('image', null)
                                            editForm.setData('remove_image', true)
                                            setRemoveExistingImage(true)
                                            setEditPreview(null)
                                            if (editFileInputRef.current) editFileInputRef.current.value = ''
                                        }}
                                    >
                                        Remove
                                    </Button>
                                )}
                            </div>
                            <input
                                ref={editFileInputRef}
                                type="file"
                                accept="image/png,image/jpeg,image/jpg,image/webp"
                                className="hidden"
                                onChange={onEditImageChange}
                            />
                            {editPreview && (
                                <img
                                    src={editPreview}
                                    alt="Preview"
                                    className={
                                        editForm.data.display_type === 'banner'
                                            ? 'mt-3 w-full max-h-56 object-cover rounded-md border'
                                            : 'mt-3 w-28 h-28 object-cover rounded-md border'
                                    }
                                />
                            )}
                            {editForm.errors.image && <p className="text-sm text-red-600 mt-1">{editForm.errors.image}</p>}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={editForm.processing} className="bg-green-600 hover:bg-green-700">
                                {editForm.processing ? 'Updating...' : 'Update Announcement'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Announcement</DialogTitle>
                        <DialogDescription>Please provide a reason for rejecting this announcement.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleReject} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Rejection Reason</label>
                            <Textarea
                                value={rejectForm.data.rejection_reason}
                                onChange={(e) => rejectForm.setData('rejection_reason', e.target.value)}
                                placeholder="Enter reason for rejection"
                                rows={4}
                                required
                            />
                            {rejectForm.errors.rejection_reason && (
                                <p className="text-sm text-red-600 mt-1">{rejectForm.errors.rejection_reason}</p>
                            )}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsRejectOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={rejectForm.processing} variant="destructive">
                                {rejectForm.processing ? 'Rejecting...' : 'Reject Announcement'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this announcement? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    )
}