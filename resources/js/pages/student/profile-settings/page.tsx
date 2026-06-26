import { Head, router } from '@inertiajs/react'
import StudentLayout from '@/layouts/student-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PhoneInput } from '@/components/ui/phone-input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Eye, EyeOff, Camera, Trash2, Upload, X } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useForm, usePage } from '@inertiajs/react'

type Student = {
    firstName: string
    lastName: string
    email: string
    mobileNumber: string
    contactNumber: string
    birthDate: string
    placeOfBirth: string
    cityMunicipality: string
    provinceState: string
    country: string
    nationality: string
    religion: string
    profile_picture?: string | null
}

type Props = {
    student: Student
    auth?: {
        user: {
            id: number
            name: string
            email: string
            role: string
        }
        student?: {
            profile_picture?: string | null
        }
    }
}

export default function ProfileSettings({ student, auth }: Props) {
    const { auth: pageAuth } = usePage<{ auth: { student?: { profile_picture?: string | null } } }>().props
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [showCameraDialog, setShowCameraDialog] = useState(false)
    const [showUploadOptions, setShowUploadOptions] = useState(false)
    const [previewImage, setPreviewImage] = useState<string | null>(
        pageAuth?.student?.profile_picture || student.profile_picture || null
    )
    const [isCameraActive, setIsCameraActive] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const streamRef = useRef<MediaStream | null>(null)

    const profileForm = useForm({
        firstName: student.firstName,
        lastName: student.lastName,
        mobileNumber: student.mobileNumber,
        contactNumber: student.contactNumber,
        birthDate: student.birthDate,
        placeOfBirth: student.placeOfBirth,
        cityMunicipality: student.cityMunicipality,
        provinceState: student.provinceState,
        country: student.country,
        nationality: student.nationality,
        religion: student.religion,
    })

    const passwordForm = useForm({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
    })

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        profileForm.put('/student/profile-settings', { preserveScroll: true })
    }

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        passwordForm.put('/student/profile-settings/password', {
            preserveScroll: true,
            onSuccess: () => passwordForm.reset(),
        })
    }

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
        router.post('/student/profile-settings/picture', formData, {
            preserveScroll: true,
            onError: (errors) => {
                alert(errors.profile_picture || 'Failed to upload image')
                setPreviewImage(student.profile_picture || null)
            },
        })
    }

    const handleDeletePicture = () => {
        if (confirm('Are you sure you want to delete your profile picture?')) {
            router.delete('/student/profile-settings/picture', {
                preserveScroll: true,
                onSuccess: () => setPreviewImage(null),
            })
        }
    }

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
            if (videoRef.current) {
                videoRef.current.srcObject = stream
                streamRef.current = stream
                setIsCameraActive(true)
            }
        } catch (error) {
            alert('Unable to access camera. Please check permissions.')
        }
    }

    const stopCamera = () => {
        streamRef.current?.getTracks().forEach(t => t.stop())
        streamRef.current = null
        setIsCameraActive(false)
    }

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return
        const video = videoRef.current
        const canvas = canvasRef.current
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        canvas.getContext('2d')?.drawImage(video, 0, 0)
        canvas.toBlob((blob) => {
            if (!blob) return
            uploadImage(new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' }))
            stopCamera()
            setShowCameraDialog(false)
        }, 'image/jpeg', 0.95)
    }

    const uploadImage = (file: File) => {
        const reader = new FileReader()
        reader.onloadend = () => setPreviewImage(reader.result as string)
        reader.readAsDataURL(file)
        const formData = new FormData()
        formData.append('profile_picture', file)
        router.post('/student/profile-settings/picture', formData, {
            preserveScroll: true,
            onError: (errors) => {
                alert(errors.profile_picture || 'Failed to upload image')
                setPreviewImage(student.profile_picture || null)
            },
        })
    }

    const handleCameraDialogClose = () => { stopCamera(); setShowCameraDialog(false) }

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (showUploadOptions && !(e.target as Element).closest('.upload-options-container'))
                setShowUploadOptions(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [showUploadOptions])

    return (
        <StudentLayout user={auth?.user}>
            <Head title="Profile Settings" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Profile Settings</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your personal information and password</p>
                </div>

                {/* Profile Picture Section */}
                <Card className="overflow-visible">
                    <CardHeader>
                        <CardTitle>Profile Picture</CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-visible">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 sm:ml-8">
                            <div className="relative shrink-0">
                                {previewImage ? (
                                    <img
                                        src={previewImage}
                                        alt="Profile"
                                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-white shadow-lg"
                                    />
                                ) : (
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold border-4 border-white shadow-lg">
                                        {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                                    </div>
                                )}
                                <div className="upload-options-container">
                                    <button
                                        onClick={() => setShowUploadOptions(!showUploadOptions)}
                                        className="absolute bottom-0 right-0 bg-green-700 hover:bg-green-800 text-white p-2 rounded-full shadow-lg transition-colors"
                                        title="Change profile picture"
                                    >
                                        <Camera className="w-4 h-4" />
                                    </button>
                                    {showUploadOptions && (
                                        <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-2 z-10 min-w-[200px]">
                                            <button
                                                onClick={() => {
                                                    setShowCameraDialog(true)
                                                    setShowUploadOptions(false)
                                                    setTimeout(() => startCamera(), 100)
                                                }}
                                                className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-100 rounded-md transition-colors"
                                            >
                                                <Camera className="w-4 h-4" />
                                                <span className="text-sm">Take Photo</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    fileInputRef.current?.click()
                                                    setShowUploadOptions(false)
                                                }}
                                                className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-100 rounded-md transition-colors"
                                            >
                                                <Upload className="w-4 h-4" />
                                                <span className="text-sm">Upload Photo</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {previewImage && (
                                    <button
                                        onClick={handleDeletePicture}
                                        className="absolute top-0 right-0 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full shadow-lg transition-colors"
                                        title="Delete profile picture"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                )}
                                <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png" onChange={handleFileSelect} className="hidden" />
                            </div>
                            <div>
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900">{student.firstName} {student.lastName}</h2>
                                <p className="text-sm text-gray-600">{student.email}</p>
                                <p className="text-xs text-gray-500 mt-2">Click camera icon to take photo or upload. Max 2MB (JPG, PNG)</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Personal Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleProfileSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                                    <Input
                                        value={profileForm.data.firstName}
                                        onChange={(e) => profileForm.setData('firstName', e.target.value)}
                                        required
                                    />
                                    {profileForm.errors.firstName && <p className="text-xs text-red-500 mt-1">{profileForm.errors.firstName}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                    <Input
                                        value={profileForm.data.lastName}
                                        onChange={(e) => profileForm.setData('lastName', e.target.value)}
                                        required
                                    />
                                    {profileForm.errors.lastName && <p className="text-xs text-red-500 mt-1">{profileForm.errors.lastName}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                    <Input type="email" value={student.email} disabled className="bg-gray-50" />
                                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                                    <PhoneInput value={profileForm.data.mobileNumber} onChange={(value) => profileForm.setData('mobileNumber', value)} />
                                    {profileForm.errors.mobileNumber && <p className="text-xs text-red-500 mt-1">{profileForm.errors.mobileNumber}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Guardian's Contact Number</label>
                                    <PhoneInput value={profileForm.data.contactNumber} onChange={(value) => profileForm.setData('contactNumber', value)} />
                                    {profileForm.errors.contactNumber && <p className="text-xs text-red-500 mt-1">{profileForm.errors.contactNumber}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                                    <Input type="date" value={profileForm.data.birthDate} onChange={(e) => profileForm.setData('birthDate', e.target.value)} />
                                    {profileForm.errors.birthDate && <p className="text-xs text-red-500 mt-1">{profileForm.errors.birthDate}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Place of Birth</label>
                                    <Input value={profileForm.data.placeOfBirth} onChange={(e) => profileForm.setData('placeOfBirth', e.target.value)} placeholder="Enter place of birth" />
                                    {profileForm.errors.placeOfBirth && <p className="text-xs text-red-500 mt-1">{profileForm.errors.placeOfBirth}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">City/Municipality</label>
                                    <Input value={profileForm.data.cityMunicipality} onChange={(e) => profileForm.setData('cityMunicipality', e.target.value)} placeholder="Enter city/municipality" />
                                    {profileForm.errors.cityMunicipality && <p className="text-xs text-red-500 mt-1">{profileForm.errors.cityMunicipality}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Province/State</label>
                                    <Input value={profileForm.data.provinceState} onChange={(e) => profileForm.setData('provinceState', e.target.value)} placeholder="Enter province/state" />
                                    {profileForm.errors.provinceState && <p className="text-xs text-red-500 mt-1">{profileForm.errors.provinceState}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                                    <Input value={profileForm.data.country} onChange={(e) => profileForm.setData('country', e.target.value)} placeholder="Enter country" />
                                    {profileForm.errors.country && <p className="text-xs text-red-500 mt-1">{profileForm.errors.country}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                                    <Input value={profileForm.data.nationality} onChange={(e) => profileForm.setData('nationality', e.target.value)} placeholder="Enter nationality" />
                                    {profileForm.errors.nationality && <p className="text-xs text-red-500 mt-1">{profileForm.errors.nationality}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Religion</label>
                                    <Input value={profileForm.data.religion} onChange={(e) => profileForm.setData('religion', e.target.value)} placeholder="Enter religion" />
                                    {profileForm.errors.religion && <p className="text-xs text-red-500 mt-1">{profileForm.errors.religion}</p>}
                                </div>
                            </div>
                            <div className="mt-6">
                                <Button type="submit" className="bg-green-700 hover:bg-green-800 w-full sm:w-auto" disabled={profileForm.processing}>
                                    {profileForm.processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Change Password */}
                <Card>
                    <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                        <CardDescription>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
                                <p className="text-sm text-yellow-800">
                                    Password Requirements: At least 8 characters long, include uppercase, lowercase, numbers, and special characters for better security.
                                </p>
                            </div>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handlePasswordSubmit}>
                            <div className="space-y-4">
                                {[
                                    { label: 'Current Password', field: 'current_password' as const, show: showCurrentPassword, setShow: setShowCurrentPassword },
                                    { label: 'New Password', field: 'new_password' as const, show: showNewPassword, setShow: setShowNewPassword },
                                    { label: 'Confirm New Password', field: 'new_password_confirmation' as const, show: showConfirmPassword, setShow: setShowConfirmPassword },
                                ].map(({ label, field, show, setShow }) => (
                                    <div key={field}>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                                        <div className="relative">
                                            <Input
                                                type={show ? 'text' : 'password'}
                                                placeholder={`Enter ${label.toLowerCase()}`}
                                                value={passwordForm.data[field]}
                                                onChange={(e) => passwordForm.setData(field, e.target.value)}
                                                required
                                                minLength={8}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShow(!show)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        {field in passwordForm.errors && (
                                            <p className="text-xs text-red-500 mt-1">{(passwordForm.errors as Record<string, string>)[field]}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6">
                                <Button type="submit" className="bg-green-700 hover:bg-green-800 w-full sm:w-auto" disabled={passwordForm.processing}>
                                    {passwordForm.processing ? 'Updating...' : 'Update Password'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* Camera Dialog */}
            <Dialog open={showCameraDialog} onOpenChange={handleCameraDialogClose}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Take a Photo</DialogTitle>
                        <DialogDescription>
                            Position yourself in the frame and click capture when ready
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                            {!isCameraActive && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                                    <p className="text-white text-sm">Starting camera...</p>
                                </div>
                            )}
                        </div>
                        <canvas ref={canvasRef} className="hidden" />
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={handleCameraDialogClose}>
                                <X className="w-4 h-4 mr-2" /> Cancel
                            </Button>
                            <Button onClick={capturePhoto} disabled={!isCameraActive} className="bg-green-700 hover:bg-green-800 text-white">
                                <Camera className="w-4 h-4 mr-2" /> Capture Photo
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </StudentLayout>
    )
}