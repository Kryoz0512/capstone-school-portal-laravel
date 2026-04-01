import { Head, useForm, Link } from '@inertiajs/react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import { Eye, EyeOff, GraduationCap, Users, BookOpen, ArrowLeft } from 'lucide-react'
import { type FormEvent, useState, useEffect } from 'react'

type Props = {
    status?: string
    slides?: string[]
    role?: 'student' | 'teacher' | 'staff'
}

type Role = 'student' | 'teacher' | 'staff'

export default function Login({ status, slides = [], role = 'student' }: Props) {
    const [showPassword, setShowPassword] = useState(false)
    const [currentSlide, setCurrentSlide] = useState(0)
    
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        role: role,
        remember: false,
    })

    // Slideshow effect
    useEffect(() => {
        if (slides.length <= 1) return

        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length)
        }, 5000)

        return () => clearInterval(interval)
    }, [slides.length])

    const handleLogin = (e: FormEvent) => {
        e.preventDefault()
        post('/login') 
    }

    const roleConfig = {
        student: { label: 'Student', icon: GraduationCap, color: 'blue' },
        teacher: { label: 'Teacher', icon: BookOpen, color: 'green' },
        staff: { label: 'Staff', icon: Users, color: 'purple' },
    }

    const currentRole = roleConfig[role]
    const RoleIcon = currentRole.icon

    return (
        <>
            <Head title="Login" />
            <div className="min-h-screen flex">
                {/* Left Side - Login Form */}
                <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8">
                    <div className="w-full max-w-md">
                        {/* Back Button */}
                        <Link 
                            href="/"
                            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Portal
                        </Link>

                        <div className="mb-8 text-center">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentRole.label} Login</h1>
                            <p className="text-gray-600 text-sm">Enter your account details</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-5">
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Username
                                </label>
                                <Input
                                    id="email"
                                    type="text"
                                    placeholder="Username"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    className="w-full bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-green-600 focus:ring-green-600"
                                />
                                {errors.email && (
                                    <p className="text-red-600 text-xs mt-1">{errors.email}</p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Password
                                </label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        required
                                        className="w-full bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-green-600 focus:ring-green-600 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-4 h-4" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-red-600 text-xs mt-1">{errors.password}</p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-6 text-base"
                            >
                                {processing ? 'Signing in...' : 'Login'}
                            </Button>
                        </form>

                        {status && (
                            <Alert className="mt-4 bg-green-50 border border-green-200 text-green-800">
                                {status}
                            </Alert>
                        )}
                    </div>
                </div>

                {/* Right Side - Welcome Section with Slideshow */}
                <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 to-green-800 items-center justify-center p-12 relative overflow-hidden">
                    {/* Slideshow Background */}
                    {slides.length > 0 && (
                        <div className="absolute inset-0">
                            {slides.map((slide, index) => (
                                <div
                                    key={index}
                                    className={`absolute inset-0 transition-opacity duration-1000 ${
                                        index === currentSlide ? 'opacity-60' : 'opacity-0'
                                    }`}
                                >
                                    <img
                                        src={slide}
                                        alt={`Slide ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-green-600/40 to-green-800/40"></div>
                        </div>
                    )}

                    {/* Decorative circles */}
                    <div className="absolute top-20 right-20 w-64 h-64 bg-green-500/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 left-20 w-80 h-80 bg-green-400/10 rounded-full blur-3xl"></div>
                    
                    <div className="relative z-10 text-center max-w-lg">
                        <img 
                            src="/SNHS-logo-2.png" 
                            alt="SNHS DigiStar Logo" 
                            className="w-auto h-64 mx-auto mb-8 drop-shadow-2xl object-contain"
                        />

                        {/* Slide Indicators */}
                        {slides.length > 1 && (
                            <div className="flex justify-center gap-2 mt-6">
                                {slides.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentSlide(index)}
                                        className={`w-2 h-2 rounded-full transition-all ${
                                            index === currentSlide
                                                ? 'bg-white w-8'
                                                : 'bg-white/50 hover:bg-white/75'
                                        }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
