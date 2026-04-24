import { Head, useForm } from '@inertiajs/react'
import StudentLayout from '@/layouts/student-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PhoneInput } from '@/components/ui/phone-input'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

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
    }
}

export default function ProfileSettings({ student, auth }: Props) {
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    // Profile form
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

    // Password form
    const passwordForm = useForm({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
    })

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        profileForm.put('/student/profile-settings', {
            preserveScroll: true,
            onSuccess: () => {
                // Success handled by flash message
            }
        })
    }

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        passwordForm.put('/student/profile-settings/password', {
            preserveScroll: true,
            onSuccess: () => {
                passwordForm.reset()
            }
        })
    }

    return (
        <StudentLayout user={auth?.user}>
            <Head title="Profile Settings" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your personal information and password</p>
                </div>

                {/* Personal Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleProfileSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                                    <Input 
                                        value={profileForm.data.firstName}
                                        onChange={(e) => profileForm.setData('firstName', e.target.value)}
                                        required
                                    />
                                    {profileForm.errors.firstName && (
                                        <p className="text-xs text-red-500 mt-1">{profileForm.errors.firstName}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                    <Input 
                                        value={profileForm.data.lastName}
                                        onChange={(e) => profileForm.setData('lastName', e.target.value)}
                                        required
                                    />
                                    {profileForm.errors.lastName && (
                                        <p className="text-xs text-red-500 mt-1">{profileForm.errors.lastName}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                    <Input 
                                        type="email" 
                                        value={student.email} 
                                        disabled 
                                        className="bg-gray-50"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                                    <PhoneInput 
                                        value={profileForm.data.mobileNumber}
                                        onChange={(value) => profileForm.setData('mobileNumber', value)}
                                    />
                                    {profileForm.errors.mobileNumber && (
                                        <p className="text-xs text-red-500 mt-1">{profileForm.errors.mobileNumber}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Guardian's Contact Number</label>
                                    <PhoneInput 
                                        value={profileForm.data.contactNumber}
                                        onChange={(value) => profileForm.setData('contactNumber', value)}
                                    />
                                    {profileForm.errors.contactNumber && (
                                        <p className="text-xs text-red-500 mt-1">{profileForm.errors.contactNumber}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                                    <Input 
                                        type="date" 
                                        value={profileForm.data.birthDate}
                                        onChange={(e) => profileForm.setData('birthDate', e.target.value)}
                                    />
                                    {profileForm.errors.birthDate && (
                                        <p className="text-xs text-red-500 mt-1">{profileForm.errors.birthDate}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Place of Birth</label>
                                    <Input 
                                        value={profileForm.data.placeOfBirth}
                                        onChange={(e) => profileForm.setData('placeOfBirth', e.target.value)}
                                        placeholder="Enter place of birth"
                                    />
                                    {profileForm.errors.placeOfBirth && (
                                        <p className="text-xs text-red-500 mt-1">{profileForm.errors.placeOfBirth}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">City/Municipality</label>
                                    <Input 
                                        value={profileForm.data.cityMunicipality}
                                        onChange={(e) => profileForm.setData('cityMunicipality', e.target.value)}
                                        placeholder="Enter city/municipality"
                                    />
                                    {profileForm.errors.cityMunicipality && (
                                        <p className="text-xs text-red-500 mt-1">{profileForm.errors.cityMunicipality}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Province/State</label>
                                    <Input 
                                        value={profileForm.data.provinceState}
                                        onChange={(e) => profileForm.setData('provinceState', e.target.value)}
                                        placeholder="Enter province/state"
                                    />
                                    {profileForm.errors.provinceState && (
                                        <p className="text-xs text-red-500 mt-1">{profileForm.errors.provinceState}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                                    <Input 
                                        value={profileForm.data.country}
                                        onChange={(e) => profileForm.setData('country', e.target.value)}
                                        placeholder="Enter country"
                                    />
                                    {profileForm.errors.country && (
                                        <p className="text-xs text-red-500 mt-1">{profileForm.errors.country}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                                    <Input 
                                        value={profileForm.data.nationality}
                                        onChange={(e) => profileForm.setData('nationality', e.target.value)}
                                        placeholder="Enter nationality"
                                    />
                                    {profileForm.errors.nationality && (
                                        <p className="text-xs text-red-500 mt-1">{profileForm.errors.nationality}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Religion</label>
                                    <Input 
                                        value={profileForm.data.religion}
                                        onChange={(e) => profileForm.setData('religion', e.target.value)}
                                        placeholder="Enter religion"
                                    />
                                    {profileForm.errors.religion && (
                                        <p className="text-xs text-red-500 mt-1">{profileForm.errors.religion}</p>
                                    )}
                                </div>
                            </div>
                            <div className="mt-6">
                                <Button 
                                    type="submit"
                                    className="bg-green-700 hover:bg-green-800"
                                    disabled={profileForm.processing}
                                >
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
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                                    <div className="relative">
                                        <Input
                                            type={showCurrentPassword ? 'text' : 'password'}
                                            placeholder="Enter current password"
                                            value={passwordForm.data.current_password}
                                            onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    {passwordForm.errors.current_password && (
                                        <p className="text-xs text-red-500 mt-1">{passwordForm.errors.current_password}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                    <div className="relative">
                                        <Input
                                            type={showNewPassword ? 'text' : 'password'}
                                            placeholder="Enter new password"
                                            value={passwordForm.data.new_password}
                                            onChange={(e) => passwordForm.setData('new_password', e.target.value)}
                                            required
                                            minLength={8}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    {passwordForm.errors.new_password && (
                                        <p className="text-xs text-red-500 mt-1">{passwordForm.errors.new_password}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                                    <div className="relative">
                                        <Input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            placeholder="Confirm new password"
                                            value={passwordForm.data.new_password_confirmation}
                                            onChange={(e) => passwordForm.setData('new_password_confirmation', e.target.value)}
                                            required
                                            minLength={8}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6">
                                <Button 
                                    type="submit"
                                    className="bg-green-700 hover:bg-green-800"
                                    disabled={passwordForm.processing}
                                >
                                    {passwordForm.processing ? 'Updating...' : 'Update Password'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </StudentLayout>
    )
}
