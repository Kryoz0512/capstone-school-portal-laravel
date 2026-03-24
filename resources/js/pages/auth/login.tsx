import { Head, useForm } from '@inertiajs/react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import { Eye, EyeOff, GraduationCap, Users, BookOpen } from 'lucide-react'
import { type FormEvent, useState, useEffect } from 'react'

type Props = {
    status?: string
    slides?: string[]
}

type Role = 'student' | 'teacher' | 'staff'

export default function Login({ status, slides = [] }: Props) {
    const [selectedRole, setSelectedRole] = useState<Role>('student')
    const [showPassword, setShowPassword] = useState(false)
    const [currentSlide, setCurrentSlide] = useState(0)
    
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        role: 'student' as Role,
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

    const roles = [
        { id: 'student' as Role, label: 'Student', icon: GraduationCap },
        { id: 'teacher' as Role, label: 'Teacher', icon: BookOpen },
        { id: 'staff' as Role, label: 'Staff', icon: Users },
    ]

    return (
        <>
            <Head title="Login" />
            <div className="min-h-screen flex">
                {/* Left Side - Login Form */}
                <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8">
                    <div className="w-full max-w-md">
                        <div className="mb-8 text-center">
                            <img 
                                src="/santorlogo.png" 
                                alt="Santor Logo" 
                                className="w-24 h-24 mx-auto mb-4 drop-shadow-lg"
                            />
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Login</h1>
                            <p className="text-gray-600 text-sm">Enter your account details</p>
                        </div>

                        {/* Role Selection */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Select Role
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {roles.map((role) => {
                                    const Icon = role.icon
                                    return (
                                        <button
                                            key={role.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedRole(role.id)
                                                setData('role', role.id)
                                            }}
                                            className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                                                selectedRole === role.id
                                                    ? 'border-green-600 bg-green-50 text-green-700'
                                                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                            }`}
                                        >
                                            <Icon className="w-6 h-6 mb-2" />
                                            <span className="text-xs font-medium">{role.label}</span>
                                        </button>
                                    )
                                })}
                            </div>
                            {errors.role && (
                                <p className="text-red-600 text-xs mt-2">{errors.role}</p>
                            )}
                        </div>

                        <form onSubmit={handleLogin} className="space-y-5">
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Email
                                </label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@school.edu"
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
                        <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
                            Welcome to
                            <br />
                            <span className="text-green-100">Santor Portal</span>
                        </h1>

                        <div className="mt-12 text-green-100">
                            <p className="text-lg">Santor National High School</p>
                            <p className="text-green-200/80">Education Management System</p>
                        </div>

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
