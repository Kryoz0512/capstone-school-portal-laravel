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

    const handleUpload = () => {
        if (!selectedFile || !verifiedUser) {
            alert('Please verify user and select a file first')
            return
        }
        // TODO: Implement upload logic
        console.log('Uploading:', { verifiedUser, selectedFile })
    }

    const handleDelete = () => {
        if (!verifiedUser) {
            alert('Please verify user first')
            return
        }
        // TODO: Implement delete logic
        console.log('Deleting picture for:', verifiedUser)
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
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Picture</h2>
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
                {verifiedUser && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Delete Picture</h2>
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <p className="text-sm text-gray-600">
                                    Remove the profile picture for the selected user. This action cannot be undone.
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
