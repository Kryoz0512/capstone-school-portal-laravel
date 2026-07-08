import { Head, useForm } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle2, Lock, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

type Props = {
    username: string
}

export default function SuperAdminRecoveryReset({ username }: Props) {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const { data, setData, post, processing, errors } = useForm({
        password: '',
        password_confirmation: '',
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        post('/emergency-super-admin-recovery-985f21bc25e6fa14c87717bcbb1d6783/reset-password')
    }

    return (
        <>
            <Head title="Reset Password" />
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    {/* Success Banner */}
                    <div className="bg-green-600 text-white px-4 py-3 rounded-t-xl flex items-center gap-3">
                        <CheckCircle2 className="w-6 h-6 shrink-0" />
                        <div>
                            <p className="font-bold text-sm">IDENTITY VERIFIED</p>
                            <p className="text-xs opacity-90">Set your new password</p>
                        </div>
                    </div>

                    {/* Main Card */}
                    <div className="bg-white rounded-b-xl shadow-2xl p-8 border-x-2 border-b-2 border-green-100">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <Lock className="w-10 h-10 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Set New Password</h1>
                            <p className="text-sm text-gray-600">For account: <span className="font-mono font-semibold text-green-700">{username}</span></p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* New Password */}
                            <div>
                                <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                                    New Password
                                </Label>
                                <div className="relative mt-2">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="pl-10 pr-10 h-12"
                                        placeholder="Enter new password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-sm text-red-600 mt-1">{errors.password}</p>
                                )}
                                <p className="text-xs text-gray-500 mt-2">
                                    Must be at least 8 characters
                                </p>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <Label htmlFor="password_confirmation" className="text-sm font-semibold text-gray-700">
                                    Confirm Password
                                </Label>
                                <div className="relative mt-2">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        id="password_confirmation"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        className="pl-10 pr-10 h-12"
                                        placeholder="Confirm new password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg"
                            >
                                {processing ? 'Resetting Password...' : 'Reset Password'}
                            </Button>
                        </form>

                        {/* Security Notice */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                <p className="text-xs text-green-800">
                                    ✓ Your identity has been verified. After resetting, you'll be redirected to login.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center mt-6">
                        <p className="text-xs text-gray-500">
                            You will be redirected to login after successful reset
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}
