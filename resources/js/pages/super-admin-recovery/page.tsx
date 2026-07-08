import { Head, Link } from '@inertiajs/react'
import { ShieldAlert, KeyRound, ArrowRight } from 'lucide-react'

export default function SuperAdminRecoveryIndex() {
    return (
        <>
            <Head title="Super Admin Recovery" />
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-xl shadow-2xl p-8 border border-red-200">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <ShieldAlert className="w-10 h-10 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Super Admin Recovery</h1>
                            <p className="text-sm text-gray-600">Emergency password reset portal</p>
                        </div>

                        <div className="space-y-4">
                            <Link
                                href="/emergency-super-admin-recovery-985f21bc25e6fa14c87717bcbb1d6783"
                                className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-lg hover:border-red-400 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <KeyRound className="w-6 h-6 text-red-600" />
                                    <div>
                                        <p className="font-semibold text-gray-900">Start Recovery</p>
                                        <p className="text-xs text-gray-600">Reset super admin password</p>
                                    </div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-red-600 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                <p className="text-xs text-yellow-800 font-medium">
                                    ⚠️ Authorized personnel only
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="text-center mt-6">
                        <p className="text-xs text-gray-400">
                            Emergency Access Only • For System Administrators
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}
