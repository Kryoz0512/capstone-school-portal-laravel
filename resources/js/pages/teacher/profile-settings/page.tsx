import { Head, useForm, router, usePage } from '@inertiajs/react'
import TeacherLayout from '@/layouts/teacher-layout'
import { Input } from '@/components/ui/input'
import { PhoneInput } from '@/components/ui/phone-input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Camera, Trash2, Upload, X } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

type Teacher = { firstName: string; lastName: string; email: string; phone: string; address: string; profile_picture?: string | null }
type Props = { teacher: Teacher; auth?: { user: { id: number; name: string; email: string; role: string }; teacher?: { profile_picture?: string | null } } }

export default function ProfileSettings({ teacher, auth }: Props) {
    const { auth: pageAuth } = usePage<{ auth: { teacher?: { profile_picture?: string | null } } }>().props
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [showCameraDialog, setShowCameraDialog] = useState(false)
    const [showUploadOptions, setShowUploadOptions] = useState(false)
    const [previewImage, setPreviewImage] = useState<string | null>(pageAuth?.teacher?.profile_picture || teacher.profile_picture || null)
    const [isCameraActive, setIsCameraActive] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const streamRef = useRef<MediaStream | null>(null)

    const profileForm = useForm({ firstName: teacher.firstName, lastName: teacher.lastName, phone: teacher.phone, address: teacher.address })
    const passwordForm = useForm({ current_password: '', new_password: '', new_password_confirmation: '' })

    const handleProfileSubmit = (e: React.FormEvent) => { e.preventDefault(); profileForm.put('/teacher/profile-settings', { preserveScroll: true }) }
    const handlePasswordSubmit = (e: React.FormEvent) => { e.preventDefault(); passwordForm.put('/teacher/profile-settings/password', { preserveScroll: true, onSuccess: () => passwordForm.reset() }) }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (!file.type.startsWith('image/')) { alert('Please select an image file'); return }
        if (file.size > 2 * 1024 * 1024) { alert('File size must be less than 2MB'); return }
        const reader = new FileReader()
        reader.onloadend = () => setPreviewImage(reader.result as string)
        reader.readAsDataURL(file)
        const formData = new FormData()
        formData.append('profile_picture', file)
        router.post('/teacher/profile-settings/picture', formData, { preserveScroll: true, onError: (errors) => { alert(errors.profile_picture || 'Failed to upload image'); setPreviewImage(teacher.profile_picture || null) } })
    }

    const handleDeletePicture = () => {
        if (confirm('Are you sure you want to delete your profile picture?')) {
            router.delete('/teacher/profile-settings/picture', { preserveScroll: true, onSuccess: () => setPreviewImage(null) })
        }
    }

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
            if (videoRef.current) { videoRef.current.srcObject = stream; streamRef.current = stream; setIsCameraActive(true) }
        } catch { alert('Unable to access camera. Please check permissions.') }
    }

    const stopCamera = () => {
        streamRef.current?.getTracks().forEach(t => t.stop())
        streamRef.current = null
        setIsCameraActive(false)
    }

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return
        const canvas = canvasRef.current
        canvas.width = videoRef.current.videoWidth
        canvas.height = videoRef.current.videoHeight
        canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0)
        canvas.toBlob(blob => {
            if (blob) {
                const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' })
                const reader = new FileReader()
                reader.onloadend = () => setPreviewImage(reader.result as string)
                reader.readAsDataURL(file)
                const formData = new FormData()
                formData.append('profile_picture', file)
                router.post('/teacher/profile-settings/picture', formData, { preserveScroll: true, onError: (errors) => { alert(errors.profile_picture || 'Failed to upload image'); setPreviewImage(teacher.profile_picture || null) } })
                stopCamera()
                setShowCameraDialog(false)
            }
        }, 'image/jpeg', 0.95)
    }

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (showUploadOptions && !(e.target as Element).closest('.upload-options-container')) setShowUploadOptions(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [showUploadOptions])

    return (
        <TeacherLayout user={auth?.user}>
            <Head title="Profile Settings" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Profile Settings</h1>
                    <p className="text-sm text-gray-500 mt-1">Update your profile and change your password</p>
                </div>

                {/* Profile Picture */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-gray-200 p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                        <div className="relative shrink-0">
                            {previewImage ? (
                                <img src={previewImage} alt="Profile" className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-white shadow-lg" />
                            ) : (
                                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold border-4 border-white shadow-lg">
                                    {teacher.firstName.charAt(0)}{teacher.lastName.charAt(0)}
                                </div>
                            )}
                            <div className="upload-options-container">
                                <button onClick={() => setShowUploadOptions(!showUploadOptions)} className="absolute bottom-0 right-0 bg-green-600 hover:bg-green-700 text-white p-1.5 sm:p-2 rounded-full shadow-lg transition-colors" title="Change profile picture">
                                    <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </button>
                                {showUploadOptions && (
                                    <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-2 z-10 min-w-[180px] sm:min-w-[200px]">
                                        <button onClick={() => { setShowCameraDialog(true); setShowUploadOptions(false); setTimeout(() => startCamera(), 100) }} className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-100 rounded-md transition-colors">
                                            <Camera className="w-4 h-4" /><span className="text-sm">Take Photo</span>
                                        </button>
                                        <button onClick={() => { fileInputRef.current?.click(); setShowUploadOptions(false) }} className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-100 rounded-md transition-colors">
                                            <Upload className="w-4 h-4" /><span className="text-sm">Upload Photo</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                            {previewImage && (
                                <button onClick={handleDeletePicture} className="absolute top-0 right-0 bg-red-600 hover:bg-red-700 text-white p-1.5 sm:p-2 rounded-full shadow-lg transition-colors" title="Delete profile picture">
                                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </button>
                            )}
                            <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png" onChange={handleFileSelect} className="hidden" />
                        </div>
                        <div className="text-center sm:text-left">
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900">{teacher.firstName} {teacher.lastName}</h2>
                            <p className="text-sm text-gray-600 break-all">{teacher.email}</p>
                            <p className="text-xs text-gray-500 mt-2">Click camera icon to take photo or upload. Max 2MB (JPG, PNG)</p>
                        </div>
                    </div>
                </div>

                {/* Personal Information */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Personal Information</h2>
                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                                <Input type="text" value={profileForm.data.firstName} onChange={e => profileForm.setData('firstName', e.target.value)} required />
                                {profileForm.errors.firstName && <p className="text-xs text-red-500 mt-1">{profileForm.errors.firstName}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                <Input type="text" value={profileForm.data.lastName} onChange={e => profileForm.setData('lastName', e.target.value)} required />
                                {profileForm.errors.lastName && <p className="text-xs text-red-500 mt-1">{profileForm.errors.lastName}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <Input type="email" value={teacher.email} disabled className="bg-gray-50" />
                                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                <PhoneInput value={profileForm.data.phone} onChange={v => profileForm.setData('phone', v)} />
                                {profileForm.errors.phone && <p className="text-xs text-red-500 mt-1">{profileForm.errors.phone}</p>}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                            <Input type="text" value={profileForm.data.address} onChange={e => profileForm.setData('address', e.target.value)} placeholder="Enter address" />
                            {profileForm.errors.address && <p className="text-xs text-red-500 mt-1">{profileForm.errors.address}</p>}
                        </div>
                        <div className="pt-2 sm:pt-4">
                            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto" disabled={profileForm.processing}>
                                {profileForm.processing ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Change Password */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-yellow-800"><span className="font-medium">Password Requirements:</span> At least 8 characters long. Include uppercase, lowercase, numbers, and special characters for better security.</p>
                    </div>
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        {[
                            { label: 'Current Password', field: 'current_password' as const, show: showCurrentPassword, toggle: () => setShowCurrentPassword(!showCurrentPassword), error: passwordForm.errors.current_password, placeholder: 'Enter current password' },
                            { label: 'New Password', field: 'new_password' as const, show: showNewPassword, toggle: () => setShowNewPassword(!showNewPassword), error: passwordForm.errors.new_password, placeholder: 'Enter new password' },
                            { label: 'Confirm New Password', field: 'new_password_confirmation' as const, show: showConfirmPassword, toggle: () => setShowConfirmPassword(!showConfirmPassword), error: undefined, placeholder: 'Confirm new password' },
                        ].map(({ label, field, show, toggle, error, placeholder }) => (
                            <div key={field}>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                                <div className="relative">
                                    <Input type={show ? 'text' : 'password'} placeholder={placeholder} value={passwordForm.data[field]} onChange={e => passwordForm.setData(field, e.target.value)} required minLength={field !== 'current_password' ? 8 : undefined} />
                                    <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">{show ? '👁️' : '👁️‍🗨️'}</button>
                                </div>
                                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                            </div>
                        ))}
                        <div className="pt-2 sm:pt-4">
                            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto" disabled={passwordForm.processing}>
                                {passwordForm.processing ? 'Changing...' : 'Change Password'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

            <Dialog open={showCameraDialog} onOpenChange={() => { stopCamera(); setShowCameraDialog(false) }}>
                <DialogContent className="sm:max-w-2xl mx-4">
                    <DialogHeader>
                        <DialogTitle>Take a Photo</DialogTitle>
                        <DialogDescription>Position yourself in the frame and click capture when ready</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                            {!isCameraActive && <div className="absolute inset-0 flex items-center justify-center bg-gray-900"><p className="text-white">Starting camera...</p></div>}
                        </div>
                        <canvas ref={canvasRef} className="hidden" />
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => { stopCamera(); setShowCameraDialog(false) }}><X className="w-4 h-4 mr-2" />Cancel</Button>
                            <Button onClick={capturePhoto} disabled={!isCameraActive} className="bg-green-600 hover:bg-green-700 text-white"><Camera className="w-4 h-4 mr-2" />Capture Photo</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </TeacherLayout>
    )
}