import { Head, useForm } from '@inertiajs/react'
import { FormEventHandler, useState, useEffect } from 'react'
import { Shield, Lock, User, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react'

type Props = {
    status?: string
    canResetPassword?: boolean
}

export default function AdminLogin({ status, canResetPassword }: Props) {
    const [showPassword, setShowPassword] = useState(false)

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        role: 'staff', // This gets mapped to 'admin' in FortifyServiceProvider
        remember: false,
    })

    useEffect(() => {
        return () => {
            reset('password')
        }
    }, [])

    const submit: FormEventHandler = (e) => {
        e.preventDefault()
        post('/login', {
            onFinish: () => reset('password'),
        })
    }

    return (
        <>
            <Head title="Admin Login — SNHS DigiStar" />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap');

                * { box-sizing: border-box; }

                body {
                    font-family: 'DM Sans', sans-serif;
                    background: #0f172a;
                    margin: 0;
                }

                .font-display { 
                    font-family: 'DM Serif Display', serif;
                    user-select: none;
                    -webkit-user-select: none;
                    -moz-user-select: none;
                    -ms-user-select: none;
                }

                h1, h2, h3, h4, h5, h6, p, label {
                    user-select: none;
                    -webkit-user-select: none;
                    -moz-user-select: none;
                    -ms-user-select: none;
                }

                input, textarea, button {
                    user-select: text;
                    -webkit-user-select: text;
                    -moz-user-select: text;
                    -ms-user-select: text;
                }

                button {
                    cursor: pointer !important;
                    pointer-events: auto !important;
                }
                
                button:disabled {
                    cursor: not-allowed !important;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }

                .animate-fade-in { animation: fadeIn 0.6s ease forwards; }
                .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
                .animate-float { animation: float 6s ease-in-out infinite; }

                .input-focus:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }

                .gradient-border {
                    position: relative;
                    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
                }

                .gradient-border::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    border-radius: inherit;
                    padding: 1px;
                    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                    -webkit-mask-composite: xor;
                    mask-composite: exclude;
                }
            `}</style>

            <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950">
                    {/* Grid pattern */}
                    <div className="absolute inset-0 opacity-[0.02]" style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                                          linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
                        backgroundSize: '50px 50px'
                    }} />
                    
                    {/* Floating orbs */}
                    <div className="animate-float absolute top-1/4 right-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
                        style={{ background: 'radial-gradient(circle, #3b82f6, transparent)', animationDelay: '0s' }} />
                    <div className="animate-float absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl"
                        style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)', animationDelay: '2s' }} />
                </div>

                {/* Login card */}
                <div className="relative z-10 w-full max-w-md animate-fade-in">
                    <div className="gradient-border rounded-2xl p-8 backdrop-blur-xl">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/20">
                                <Shield className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="font-display text-3xl text-white mb-2">
                                Administrative Access
                            </h1>
                            <p className="text-slate-400 text-sm">
                                Secure login for authorized staff only
                            </p>
                        </div>

                        {/* Status message */}
                        {status && (
                            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                                <p className="text-green-400 text-sm text-center">{status}</p>
                            </div>
                        )}

                        {/* General error message */}
                        {(errors.email || errors.password || errors.role) && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <h3 className="text-red-400 font-semibold text-sm mb-1">Authentication Failed</h3>
                                        {errors.email && <p className="text-red-300 text-sm">{errors.email}</p>}
                                        {errors.password && <p className="text-red-300 text-sm">{errors.password}</p>}
                                        {errors.role && <p className="text-red-300 text-sm">{errors.role}</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={submit} className="space-y-5">
                            {/* Email field */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                                    Username
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className="w-5 h-5 text-slate-500" />
                                    </div>
                                    <input
                                        id="email"
                                        type="text"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="input-focus w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 transition-all"
                                        placeholder="SNHS-LASTNAME-FIRSTNAME"
                                        autoComplete="username"
                                        autoFocus
                                        required
                                        disabled={processing}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Password field */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="w-5 h-5 text-slate-500" />
                                    </div>
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="input-focus w-full pl-12 pr-12 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 transition-all"
                                        placeholder="••••••••"
                                        autoComplete="current-password"
                                        required
                                        minLength={6}
                                        disabled={processing}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                                        disabled={processing}
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Remember me */}
                            {/* <div className="flex items-center">
                                <input
                                    id="remember"
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="w-4 h-4 bg-slate-800 border-slate-700 rounded text-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                                    disabled={processing}
                                />
                                <label htmlFor="remember" className="ml-2 text-sm text-slate-400">
                                    Remember me on this device
                                </label>
                            </div> */}

                            {/* Submit button */}
                            <button
                                type="submit"
                                disabled={processing}
                                style={{ cursor: 'pointer', pointerEvents: 'auto', position: 'relative', zIndex: 10 }}
                                className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Authenticating...</span>
                                    </>
                                ) : (
                                    <>
                                        <Shield className="w-5 h-5" />
                                        <span>Sign In</span>
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Footer */}
                        <div className="mt-8 pt-6 border-t border-slate-800">
                            <p className="text-center text-xs text-slate-500">
                                This is a restricted area. Unauthorized access is prohibited.
                            </p>
                        </div>
                    </div>

                    {/* Back to portal link */}
                    <div className="mt-6 text-center">
                        <a
                            href="/"
                            className="text-sm text-slate-400 hover:text-white transition-colors inline-flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Portal
                        </a>
                    </div>
                </div>
            </div>
        </>
    )
}
