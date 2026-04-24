import { Head, useForm } from '@inertiajs/react'
import TeacherLayout from '@/layouts/teacher-layout'
import { Input } from '@/components/ui/input'
import { PhoneInput } from '@/components/ui/phone-input'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

type Teacher = {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
}

type Props = {
    teacher: Teacher
    auth?: {
        user: {
            id: number
            name: string
            email: string
            role: string
        }
    }
}

export default function ProfileSettings({ teacher, auth }: Props) {
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    // Profile form
    const profileForm = useForm({
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        phone: teacher.phone,
        address: teacher.address,
    })

    // Password form
    const passwordForm = useForm({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
    })

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        profileForm.put('/teacher/profile-settings', {
            preserveScroll: true,
            onSuccess: () => {
                // Success handled by flash message
            }
        })
    }

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        passwordForm.put('/teacher/profile-settings/password', {
            preserveScroll: true,
            onSuccess: () => {
                passwordForm.reset()
            }
        })
    }

    return (
        <TeacherLayout user={auth?.user}>
            <Head title="Profile Settings" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Update your profile and change your password
                    </p>
                </div>

                {/* Personal Information */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h2>

                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    First Name
                                </label>
                                <Input 
                                    type="text" 
                                    value={profileForm.data.firstName}
                                    onChange={(e) => profileForm.setData('firstName', e.target.value)}
                                    required
                                />
                                {profileForm.errors.firstName && (
                                    <p className="text-xs text-red-500 mt-1">{profileForm.errors.firstName}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Last Name
                                </label>
                                <Input 
                                    type="text" 
                                    value={profileForm.data.lastName}
                                    onChange={(e) => profileForm.setData('lastName', e.target.value)}
                                    required
                                />
                                {profileForm.errors.lastName && (
                                    <p className="text-xs text-red-500 mt-1">{profileForm.errors.lastName}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <Input 
                                    type="email" 
                                    value={teacher.email} 
                                    disabled 
                                    className="bg-gray-50" 
                                />
                                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                <PhoneInput 
                                    value={profileForm.data.phone}
                                    onChange={(value) => profileForm.setData('phone', value)}
                                />
                                {profileForm.errors.phone && (
                                    <p className="text-xs text-red-500 mt-1">{profileForm.errors.phone}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Address
                            </label>
                            <Input 
                                type="text" 
                                value={profileForm.data.address}
                                onChange={(e) => profileForm.setData('address', e.target.value)}
                                placeholder="Enter address"
                            />
                            {profileForm.errors.address && (
                                <p className="text-xs text-red-500 mt-1">{profileForm.errors.address}</p>
                            )}
                        </div>

                        <div className="pt-4">
                            <Button 
                                type="submit"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                disabled={profileForm.processing}
                            >
                                {profileForm.processing ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Change Password */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-yellow-800">
                            <span className="font-medium">Password Requirements:</span> At least 8 characters long. Include uppercase, lowercase, numbers, and special characters for better security.
                        </p>
                    </div>

                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Current Password
                            </label>
                            <div className="relative">
                                <Input 
                                    type={showCurrentPassword ? "text" : "password"} 
                                    placeholder="Enter current password"
                                    value={passwordForm.data.current_password}
                                    onChange={(e) => passwordForm.setData('current_password', e.target.value)}
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
                            {passwordForm.errors.current_password && (
                                <p className="text-xs text-red-500 mt-1">{passwordForm.errors.current_password}</p>
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
                                    value={passwordForm.data.new_password}
                                    onChange={(e) => passwordForm.setData('new_password', e.target.value)}
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
                            {passwordForm.errors.new_password && (
                                <p className="text-xs text-red-500 mt-1">{passwordForm.errors.new_password}</p>
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
                                    value={passwordForm.data.new_password_confirmation}
                                    onChange={(e) => passwordForm.setData('new_password_confirmation', e.target.value)}
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
                        </div>

                        <div className="pt-4">
                            <Button 
                                type="submit"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                disabled={passwordForm.processing}
                            >
                                {passwordForm.processing ? 'Changing...' : 'Change Password'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </TeacherLayout>
    )
}
