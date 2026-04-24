import { Head } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Upload, Trash2, User, GraduationCap, Users, CheckCircle, XCircle } from 'lucide-react'
import { useState } from 'react'
import axios from 'axios'

type Props = {
    auth?: {
        user: {
            id: number
            name: string
            email: string
            role: string
        }
        admin?: {
            role: string
            position: string
        }
    }
}

type VerifiedUser = {
    id: number
    name: string
    identifier: string
    type: string
    profile_picture: string | null
    grade_level?: string | null
    section?: string | null
}

export default function UploadDeletePicturePage({ auth }: Props) {
    const [selectedUserType, setSelectedUserType] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [verifying, setVerifying] = useState(false)
    const [verifiedUser, setVerifiedUser] = useState<VerifiedUser | null>(null)
    const [verificationError, setVerificationError] = useState('')

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleVerify = async () => {
        if (!selectedUserType || !searchTerm) {
            return
        }

        setVerifying(true)
        setVerificationError('')
        setVerifiedUser(null)

        try {
            const response = await axios.post('/admin/admission/profile-picture/verify', {
                user_type: selectedUserType,
                identifier: searchTerm
            })

            if (response.data.success) {
                setVerifiedUser(response.data.user)
                setVerificationError('')
            }
        } catch (error: any) {
            if (error.response && error.response.data) {
                setVerificationError(error.response.data.message)
            } else {
                setVerificationError('An error occurred while verifying the user')
            }
            setVerifiedUser(null)
        } finally {
            setVerifying(false)
        }
    }

    const handleUpload = async () => {
        if (!selectedFile || !verifiedUser) {
            alert('Please verify user and select a file first')
            return
        }

        try {
            const formData = new FormData()
            formData.append('picture', selectedFile)
            formData.append('user_id', verifiedUser.id.toString())
            formData.append('user_type', verifiedUser.type)

            const response = await axios.post('/admin/admission/profile-picture/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })

            if (response.data.success) {
                alert('Profile picture uploaded successfully!')
                // Update the verified user with new profile picture
                setVerifiedUser({
                    ...verifiedUser,
                    profile_picture: response.data.profile_picture
                })
                // Clear the file input
                setSelectedFile(null)
                setPreviewUrl(null)
            }
        } catch (error: any) {
            console.error('Upload error:', error)
            alert(error.response?.data?.message || 'Failed to upload profile picture')
        }
    }

    const handleDelete = async () => {
        if (!verifiedUser) {
            alert('Please verify user first')
            return
        }

        if (!confirm('Are you sure you want to delete this profile picture? This action cannot be undone.')) {
            return
        }

        try {
            const response = await axios.delete('/admin/admission/profile-picture/delete', {
                data: {
                    user_id: verifiedUser.id,
                    user_type: verifiedUser.type
                }
            })

            if (response.data.success) {
                alert('Profile picture deleted successfully!')
                // Update the verified user to remove profile picture
                setVerifiedUser({
                    ...verifiedUser,
                    profile_picture: null
                })
            }
        } catch (error: any) {
            console.error('Delete error:', error)
            alert(error.response?.data?.message || 'Failed to delete profile picture')
        }
    }

    const handleUserTypeChange = (type: string) => {
        setSelectedUserType(type)
        setSearchTerm('')
        setVerifiedUser(null)
        setVerificationError('')
        setSelectedFile(null)
        setPreviewUrl(null)
    }

    const getPlaceholderText = () => {
        switch (selectedUserType) {
            case 'student':
                return 'Enter Student LRN'
            case 'teacher':
                return 'Enter Teacher Employee No.'
            case 'staff_admin':
                return 'Enter Staff/Admin Employee No.'
            default:
                return 'Select user type first'
        }
    }

    const getUserTypeIcon = (type: string) => {
        switch (type) {
            case 'student':
                return <GraduationCap className="w-12 h-12 text-blue-600" />
            case 'teacher':
                return <User className="w-12 h-12 text-green-600" />
            case 'staff_admin':
                return <Users className="w-12 h-12 text-purple-600" />
            default:
                return null
        }
    }

    return (
        <AdminLayout user={auth?.user} admin={auth?.admin}>
            <Head title="Upload or Delete Picture" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Upload or Delete Picture</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage profile pictures for students, teachers, and staff
                    </p>
                </div>

                {/* User Type Selection */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Select User Type</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={() => handleUserTypeChange('student')}
                            className={`p-6 border-2 rounded-lg transition-all ${
                                selectedUserType === 'student'
                                    ? 'border-blue-600 bg-blue-50'
                                    : 'border-gray-200 hover:border-blue-300'
                            }`}
                        >
                            <div className="flex flex-col items-center gap-3">
                                <GraduationCap className="w-12 h-12 text-blue-600" />
                                <span className="font-semibold text-gray-900">Student</span>
                                <span className="text-xs text-gray-500">Upload/Delete student photos</span>
                            </div>
                        </button>

                        <button
                            onClick={() => handleUserTypeChange('teacher')}
                            className={`p-6 border-2 rounded-lg transition-all ${
                                selectedUserType === 'teacher'
                                    ? 'border-green-600 bg-green-50'
                                    : 'border-gray-200 hover:border-green-300'
                            }`}
                        >
                            <div className="flex flex-col items-center gap-3">
                                <User className="w-12 h-12 text-green-600" />
                                <span className="font-semibold text-gray-900">Teacher</span>
                                <span className="text-xs text-gray-500">Upload/Delete teacher photos</span>
                            </div>
                        </button>

                        <button
                            onClick={() => handleUserTypeChange('staff_admin')}
                            className={`p-6 border-2 rounded-lg transition-all ${
                                selectedUserType === 'staff_admin'
                                    ? 'border-purple-600 bg-purple-50'
                                    : 'border-gray-200 hover:border-purple-300'
                            }`}
                        >
                            <div className="flex flex-col items-center gap-3">
                                <Users className="w-12 h-12 text-purple-600" />
                                <span className="font-semibold text-gray-900">Staff & Admin</span>
                                <span className="text-xs text-gray-500">Upload/Delete staff photos</span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Search User */}
                {selectedUserType && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Search User</h2>
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                                {getUserTypeIcon(selectedUserType)}
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {selectedUserType === 'student' ? 'LRN' : 'Employee Number'} <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-2">
                                    <Input
                                        type="text"
                                        placeholder={getPlaceholderText()}
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value)
                                            setVerifiedUser(null)
                                            setVerificationError('')
                                        }}
                                        className="max-w-md"
                                    />
                                    <Button
                                        onClick={handleVerify}
                                        disabled={!searchTerm || verifying}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        {verifying ? 'Verifying...' : 'Verify'}
                                    </Button>
                                </div>
                                {verificationError && (
                                    <div className="flex items-center gap-2 mt-2 text-red-600">
                                        <XCircle className="w-4 h-4" />
                                        <p className="text-sm">{verificationError}</p>
                                    </div>
                                )}
                                {verifiedUser && (
                                    <div className="flex items-center gap-2 mt-2 text-green-600">
                                        <CheckCircle className="w-4 h-4" />
                                        <p className="text-sm">User found: {verifiedUser.name}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Upload Section */}
                {verifiedUser && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Profile Picture</h2>
                        <div className="flex items-center gap-6 mb-6">
                            <div className="w-32 h-32 rounded-full border-4 border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center">
                                {verifiedUser.profile_picture ? (
                                    <img
                                        src={verifiedUser.profile_picture}
                                        alt={verifiedUser.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="text-center">
                                        <User className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                        <p className="text-xs text-gray-500">No picture</p>
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">{verifiedUser.name}</h3>
                                <p className="text-sm text-gray-600">
                                    {verifiedUser.type === 'student' ? 'LRN' : 'Employee No'}: {verifiedUser.identifier}
                                </p>
                                {verifiedUser.type === 'student' && (
                                    <div className="text-sm text-gray-600 space-y-0.5 mt-1">
                                        {verifiedUser.grade_level && (
                                            <p>Grade Level: <span className="font-medium">{verifiedUser.grade_level}</span></p>
                                        )}
                                        {verifiedUser.section && (
                                            <p>Section: <span className="font-medium">{verifiedUser.section}</span></p>
                                        )}
                                    </div>
                                )}
                                <p className="text-sm text-gray-500 mt-1">
                                    {verifiedUser.profile_picture ? 'Profile picture is set' : 'No profile picture uploaded'}
                                </p>
                            </div>
                        </div>

                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload New Picture</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Image File
                                </label>
                                <div className="flex items-center gap-4">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="max-w-md"
                                    />
                                    <Button
                                        onClick={handleUpload}
                                        className="bg-green-600 hover:bg-green-700"
                                        disabled={!selectedFile}
                                    >
                                        <Upload className="w-4 h-4 mr-2" />
                                        Upload
                                    </Button>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Accepted formats: JPG, PNG, GIF (Max size: 2MB)
                                </p>
                            </div>

                            {/* Image Preview */}
                            {previewUrl && (
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Preview
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 w-48 h-48 flex items-center justify-center">
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="max-w-full max-h-full object-contain"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Delete Section */}
                {verifiedUser && verifiedUser.profile_picture && (
                    <div className="bg-white rounded-lg border border-red-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Delete Picture</h2>
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <p className="text-sm text-gray-600">
                                    Remove the profile picture for <strong>{verifiedUser.name}</strong>. This action cannot be undone.
                                </p>
                            </div>
                            <Button
                                onClick={handleDelete}
                                variant="outline"
                                className="border-red-600 text-red-600 hover:bg-red-50"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Picture
                            </Button>
                        </div>
                    </div>
                )}

                {/* Info Box */}
                {!selectedUserType && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="text-sm font-semibold text-blue-900 mb-2">Getting Started</h3>
                        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                            <li>Select a user type (Student, Teacher, or Staff & Admin)</li>
                            <li>Enter the user's LRN or Employee Number</li>
                            <li>Upload a new picture or delete the existing one</li>
                        </ul>
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}
