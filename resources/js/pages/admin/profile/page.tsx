import { Head, usePage, useForm } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin-layout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useState } from 'react'

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
    }
}

export default function ProfileSettings({ profile }: Props) {
    const { auth } = usePage<{ auth: { user: { id: number; name: string; email: string; role: string } } }>().props
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [showSuccessDialog, setShowSuccessDialog] = useState(false)

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

    return (
        <AdminLayout user={auth?.user}>
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
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                            {profile.initials}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{profile.full_name}</h2>
                            <p className="text-sm text-gray-600">{profile.position}</p>
                            <div className="flex gap-2 mt-2">
                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">{profile.role}</span>
                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">Active Account</span>
                            </div>
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
        </AdminLayout>
    )
}
