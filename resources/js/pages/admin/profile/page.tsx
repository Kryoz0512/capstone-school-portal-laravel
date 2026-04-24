import { Head, usePage, useForm, router } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Camera, Trash2, Upload, X } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

type Props = {
    profile: {
        id: number
        first_name: string
        last_name: string
        full_name: string
        email: string
        position: string
        role: string
        initials: string
        profile_picture: string | null
    }
}

export default function ProfileSettings({ profile }: Props) {
    const { auth } = usePage<{ auth: { user: { id: number; name: string; email: string; role: string }; admin?: { role: string; position: string } } }>().props
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [showSuccessDialog, setShowSuccessDialog] = useState(false)
    const [showCameraDialog, setShowCameraDialog] = useState(false)
    const [showUploadOptions, setShowUploadOptions] = useState(false)
    const [previewImage, setPreviewImage] = useState<string | null>(profile.profile_picture)
    const [isCameraActive, setIsCameraActive] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const streamRef = useRef<MediaStream | null>(null)

    const { data, setData, put, processing, errors, reset, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    })

    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault()
        put('/admin/profile/password', {
            preserveScroll: true,
            onSuccess: () => {
                reset()
                setShowSuccessDialog(true)
            },
        })
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file')
                return
            }
            
            // Validate file size (2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert('File size must be less than 2MB')
                return
            }

            // Preview image
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreviewImage(reader.result as string)
            }
            reader.readAsDataURL(file)

            // Upload image
            const formData = new FormData()
            formData.append('profile_picture', file)

            router.post('/admin/profile/picture', formData, {
                preserveScroll: true,
                onSuccess: () => {
                    // Image uploaded successfully
                },
                onError: (errors) => {
                    alert(errors.profile_picture || 'Failed to upload image')
                    setPreviewImage(profile.profile_picture)
                }
            })
        }
    }

    const handleDeletePicture = () => {
        if (confirm('Are you sure you want to delete your profile picture?')) {
            router.delete('/admin/profile/picture', {
                preserveScroll: true,
                onSuccess: () => {
                    setPreviewImage(null)
                }
            })
        }
    }

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'user' } // Use front camera
            })
            if (videoRef.current) {
                videoRef.current.srcObject = stream
                streamRef.current = stream
                setIsCameraActive(true)
            }
        } catch (error) {
            alert('Unable to access camera. Please check permissions.')
            console.error('Camera error:', error)
        }
    }

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
            streamRef.current = null
        }
        setIsCameraActive(false)
    }

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current
            const canvas = canvasRef.current
            
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            
            const context = canvas.getContext('2d')
            if (context) {
                context.drawImage(video, 0, 0)
                
                canvas.toBlob((blob) => {
                    if (blob) {
                        const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' })
                        uploadImage(file)
                        stopCamera()
                        setShowCameraDialog(false)
                    }
                }, 'image/jpeg', 0.95)
            }
        }
    }

    const uploadImage = (file: File) => {
        // Preview image
        const reader = new FileReader()
        reader.onloadend = () => {
            setPreviewImage(reader.result as string)
        }
        reader.readAsDataURL(file)

        // Upload image
        const formData = new FormData()
        formData.append('profile_picture', file)

        router.post('/admin/profile/picture', formData, {
            preserveScroll: true,
            onSuccess: () => {
                // Image uploaded successfully
            },
            onError: (errors) => {
                alert(errors.profile_picture || 'Failed to upload image')
                setPreviewImage(profile.profile_picture)
            }
        })
    }

    const handleCameraDialogClose = () => {
        stopCamera()
        setShowCameraDialog(false)
    }

    // Close upload options when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showUploadOptions && !(event.target as Element).closest('.upload-options-container')) {
                setShowUploadOptions(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [showUploadOptions])

    return (
        <AdminLayout user={auth?.user} admin={auth?.admin}>
            <Head title="Profile Settings" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage related settings and password
                    </p>
                </div>

                {/* Profile Card */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            {previewImage ? (
                                <img 
                                    src={previewImage} 
                                    alt="Profile" 
                                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                                />
                            ) : (
                                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg">
                                    {profile.initials}
                                </div>
                            )}
                            <div className="upload-options-container">
                                <button
                                    onClick={() => setShowUploadOptions(!showUploadOptions)}
                                    className="absolute bottom-0 right-0 bg-green-600 hover:bg-green-700 text-white p-2 rounded-full shadow-lg transition-colors"
                                    title="Change profile picture"
                                >
                                    <Camera className="w-4 h-4" />
                                </button>
                                
                                {/* Upload Options Popup */}
                                {showUploadOptions && (
                                    <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-2 z-10 min-w-[200px]">
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
                                    className="absolute top-0 right-0 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg transition-colors"
                                    title="Delete profile picture"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/jpg,image/png"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{profile.full_name}</h2>
                            <p className="text-sm text-gray-600">{profile.position}</p>
                            <div className="flex gap-2 mt-2">
                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">{profile.role}</span>
                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">Active Account</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Click camera icon to take photo or upload. Max 2MB (JPG, PNG)</p>
                        </div>
                    </div>
                </div>

                {/* Personal Information */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h2>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    First Name
                                </label>
                                <Input type="text" defaultValue={profile.first_name} disabled className="bg-gray-50" />
                                <p className="text-xs text-gray-500 mt-1">Can only be changed via User Management</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Last Name
                                </label>
                                <Input type="text" defaultValue={profile.last_name} disabled className="bg-gray-50" />
                                <p className="text-xs text-gray-500 mt-1">Can only be changed via User Management</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <Input type="email" defaultValue={profile.email} disabled className="bg-gray-50" />
                                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Position
                                </label>
                                <Input type="text" defaultValue={profile.position} disabled className="bg-gray-50" />
                                <p className="text-xs text-gray-500 mt-1">Can only be changed via User Management</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Role
                                </label>
                                <Input type="text" defaultValue={profile.role} disabled className="bg-gray-50" />
                                <p className="text-xs text-gray-500 mt-1">Role cannot be changed</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Change Password */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-yellow-800">
                            <span className="font-medium">Password Requirements:</span> At least 8 characters long. Include uppercase, lowercase, numbers, and special characters for better security.
                        </p>
                    </div>

                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Current Password
                            </label>
                            <div className="relative">
                                <Input 
                                    type={showCurrentPassword ? "text" : "password"} 
                                    placeholder="Enter current password"
                                    value={data.current_password}
                                    onChange={(e) => setData('current_password', e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showCurrentPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                            {errors.current_password && (
                                <p className="text-xs text-red-500 mt-1">{errors.current_password}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <Input 
                                    type={showNewPassword ? "text" : "password"} 
                                    placeholder="Enter new password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                    minLength={8}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showNewPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-xs text-red-500 mt-1">{errors.password}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <Input 
                                    type={showConfirmPassword ? "text" : "password"} 
                                    placeholder="Confirm new password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    required
                                    minLength={8}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                            {errors.password_confirmation && (
                                <p className="text-xs text-red-500 mt-1">{errors.password_confirmation}</p>
                            )}
                        </div>

                        <div className="pt-4 flex items-center gap-4">
                            <Button 
                                type="submit" 
                                className="bg-green-600 hover:bg-green-700 text-white"
                                disabled={processing}
                            >
                                {processing ? 'Updating...' : 'Change Password'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Success Dialog */}
            <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center justify-center mb-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                <svg 
                                    className="w-8 h-8 text-green-600" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M5 13l4 4L19 7" 
                                    />
                                </svg>
                            </div>
                        </div>
                        <DialogTitle className="text-center text-xl">Password Changed Successfully!</DialogTitle>
                        <DialogDescription className="text-center">
                            Your password has been updated successfully. Please use your new password the next time you log in.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-center mt-4">
                        <Button 
                            onClick={() => setShowSuccessDialog(false)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            Got it
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

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
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover"
                            />
                            {!isCameraActive && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                                    <p className="text-white">Starting camera...</p>
                                </div>
                            )}
                        </div>
                        <canvas ref={canvasRef} className="hidden" />
                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={handleCameraDialogClose}
                            >
                                <X className="w-4 h-4 mr-2" />
                                Cancel
                            </Button>
                            <Button
                                onClick={capturePhoto}
                                disabled={!isCameraActive}
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                <Camera className="w-4 h-4 mr-2" />
                                Capture Photo
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    )
}
