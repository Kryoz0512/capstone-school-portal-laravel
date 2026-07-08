import { Head, useForm } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ShieldAlert, KeyRound, User } from 'lucide-react'

export default function SuperAdminRecoveryVerify() {
    const { data, setData, post, processing, errors } = useForm({
        username: '',
        recovery_code: '',
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        post('/emergency-super-admin-recovery-985f21bc25e6fa14c87717bcbb1d6783/verify')
    }

    return (
        <>
            <Head title="Super Admin Recovery" />
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    {/* Warning Banner */}
                    <div className="bg-red-600 text-white px-4 py-3 rounded-t-xl flex items-center gap-3">
                        <ShieldAlert className="w-6 h-6 shrink-0" />
                        <div>
                            <p className="font-bold text-sm">RESTRICTED ACCESS</p>
                            <p className="text-xs opacity-90">Super Admin Recovery Only</p>
                        </div>
                    </div>

                    {/* Main Card */}
                    <div className="bg-white rounded-b-xl shadow-2xl p-8 border-x-2 border-b-2 border-red-100">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <KeyRound className="w-10 h-10 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Emergency Password Reset</h1>
                            <p className="text-sm text-gray-600">Enter your credentials and recovery code</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Username */}
                            <div>
                                <Label htmlFor="username" className="text-sm font-semibold text-gray-700">
                                    Super Admin Username
                                </Label>
                                <div className="relative mt-2">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        id="username"
                                        type="text"
                                        value={data.username}
                                        onChange={(e) => setData('username', e.target.value)}
                                        className="pl-10 h-12"
                                        placeholder="Enter username"
                                        required
                                    />
                                </div>
                                {errors.username && (
                                    <p className="text-sm text-red-600 mt-1">{errors.username}</p>
                                )}
                            </div>

                            {/* Recovery Code */}
                            <div>
                                <Label htmlFor="recovery_code" className="text-sm font-semibold text-gray-700">
                                    Recovery Code
                                </Label>
                                <div className="relative mt-2">
                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        id="recovery_code"
                                        type="password"
                                        value={data.recovery_code}
                                        onChange={(e) => setData('recovery_code', e.target.value)}
                                        className="pl-10 h-12 font-mono"
                                        placeholder="Enter recovery code"
                                        required
                                    />
                                </div>
                                {errors.recovery_code && (
                                    <p className="text-sm text-red-600 mt-1">{errors.recovery_code}</p>
                                )}
                                <p className="text-xs text-gray-500 mt-2">
                                    This code was provided during system setup
                                </p>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full h-12 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold shadow-lg"
                            >
                                {processing ? 'Verifying...' : 'Verify Identity'}
                            </Button>
                        </form>

                        {/* Security Notice */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                <p className="text-xs text-yellow-800 font-medium">
                                    ⚠️ This action is logged for security purposes
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center mt-6">
                        <p className="text-xs text-gray-500">
                            Emergency Access Only • Contact System Administrator if issues persist
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}
