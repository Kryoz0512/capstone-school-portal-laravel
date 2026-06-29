import { Head, useForm, Link } from '@inertiajs/react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import { Eye, EyeOff, GraduationCap, Users, BookOpen, ArrowLeft } from 'lucide-react'
import { type FormEvent, useState, useEffect } from 'react'

type Props = {
    status?: string
    slides?: string[]
    role?: 'student' | 'teacher' | 'staff' | 'adviser'
}

type Role = 'student' | 'teacher' | 'staff' | 'adviser'

export default function Login({ status, slides = [], role = 'student' }: Props) {
    const [showPassword, setShowPassword] = useState(false)
    const [currentSlide, setCurrentSlide] = useState(0)
    const [lockStatus, setLockStatus] = useState<{
        locked: boolean
        seconds_left: number
        minutes?: number
        seconds?: number
        message: string
    } | null>(null)
    const [isCheckingLock, setIsCheckingLock] = useState(false)
    
    const { data, setData, post, processing, errors, clearErrors } = useForm({
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

    // Check lock status when page becomes visible (user returns to tab)
    useEffect(() => {
        const handleVisibilityChange = async () => {
            if (document.visibilityState === 'visible' && data.email && data.email.length >= 3) {
                // User returned to the page - sync lock status immediately
                try {
                    const response = await fetch('/api/check-lock-status', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                        },
                        body: JSON.stringify({ email: data.email }),
                    })
                    const result = await response.json()
                    
                    if (result.locked) {
                        setLockStatus(result)
                    } else {
                        setLockStatus(null)
                    }
                } catch (error) {
                    console.error('Error checking lock status on visibility change:', error)
                }
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
    }, [data.email])

    // Check lock status when email changes
    useEffect(() => {
        // Clear lock status if email is empty or too short
        if (!data.email || data.email.length < 3) {
            setLockStatus(null)
            return
        }

        const timeoutId = setTimeout(async () => {
            setIsCheckingLock(true)
            try {
                const response = await fetch('/api/check-lock-status', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                    body: JSON.stringify({ email: data.email }),
                })
                const result = await response.json()
                
                if (result.locked) {
                    setLockStatus(result)
                } else {
                    setLockStatus(null)
                }
            } catch (error) {
                console.error('Error checking lock status:', error)
                setLockStatus(null)
            } finally {
                setIsCheckingLock(false)
            }
        }, 500) // Debounce for 500ms

        return () => clearTimeout(timeoutId)
    }, [data.email])

    // Countdown timer for locked accounts - makes ONE API call when countdown reaches 0
    useEffect(() => {
        if (!lockStatus?.locked || !lockStatus.seconds_left) return

        // Local countdown that updates every second
        const countdownInterval = setInterval(() => {
            setLockStatus(prev => {
                if (!prev || prev.seconds_left <= 0) {
                    // Account should be unlocked - clear the status
                    return null
                }
                
                const newSecondsLeft = prev.seconds_left - 1
                
                // When countdown reaches 1 second, make API call to reset database early
                if (newSecondsLeft === 1 && data.email) {
                    console.log('Countdown at 1 second, resetting database early...')
                    fetch('/api/check-lock-status', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                        },
                        body: JSON.stringify({ email: data.email }),
                    })
                    .then(response => response.json())
                    .then(result => {
                        console.log('Database reset result:', result)
                        if (!result.locked) {
                            console.log('✓ Account successfully unlocked and reset in database')
                        }
                    })
                    .catch(error => console.error('Error resetting database:', error))
                }
                
                // Calculate minutes and seconds
                const newMinutes = Math.floor(newSecondsLeft / 60)
                const newSeconds = newSecondsLeft % 60
                
                let timeMessage = ''
                if (newMinutes > 0) {
                    timeMessage = `${newMinutes} minute${newMinutes > 1 ? 's' : ''}`
                    if (newSeconds > 0) {
                        timeMessage += ` and ${newSeconds} second${newSeconds > 1 ? 's' : ''}`
                    }
                } else {
                    timeMessage = `${newSeconds} second${newSeconds > 1 ? 's' : ''}`
                }
                
                const newMessage = `This account is locked. Please try again in ${timeMessage}.`
                
                return {
                    ...prev,
                    seconds_left: newSecondsLeft,
                    minutes: newMinutes,
                    seconds: newSeconds,
                    message: newMessage,
                }
            })
        }, 1000)

        return () => {
            clearInterval(countdownInterval)
        }
    }, [lockStatus?.locked, data.email])

    // Clear errors when lock status is cleared
    useEffect(() => {
        if (!lockStatus?.locked && (errors.email || errors.password)) {
            // Clear the errors when account is unlocked
            clearErrors()
        }
    }, [lockStatus?.locked])

    const handleLogin = (e: FormEvent) => {
        e.preventDefault()
        
        // Don't submit if account is locked
        if (lockStatus?.locked) {
            return
        }
        
        post('/login', {
            onError: (errors) => {
                // If we get a lock error, immediately check lock status
                if (errors.email && errors.email.includes('locked')) {
                    // Extract seconds from error message if possible
                    const match = errors.email.match(/(\d+)\s+second/)
                    if (match) {
                        const seconds = parseInt(match[1])
                        setLockStatus({
                            locked: true,
                            seconds_left: seconds,
                            message: errors.email,
                        })
                    } else {
                        // Fallback: check lock status from API
                        checkLockStatusNow()
                    }
                }
            }
        })
    }

    const checkLockStatusNow = async () => {
        if (!data.email) return
        
        try {
            const response = await fetch('/api/check-lock-status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ email: data.email }),
            })
            const result = await response.json()
            
            if (result.locked) {
                setLockStatus(result)
            }
        } catch (error) {
            console.error('Error checking lock status:', error)
        }
    }

    const roleConfig = {
        student: { label: 'Student', icon: GraduationCap, color: 'blue' },
        teacher: { label: 'Teacher', icon: BookOpen, color: 'green' },
        adviser: { label: 'Adviser', icon: Users, color: 'sky' },
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
                                <div className="relative">
                                    <Input
                                        id="email"
                                        type="text"
                                        placeholder="Username"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                        className={`w-full bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-green-600 focus:ring-green-600 ${
                                            lockStatus?.locked ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                                        }`}
                                    />
                                    {isCheckingLock && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                {!lockStatus?.locked && errors.email && (
                                    <p className="text-red-600 text-xs mt-1">{errors.email}</p>
                                )}
                            </div>

                            {/* Lock Status Alert - Shows immediately when account is locked */}
                            {lockStatus?.locked && (
                                <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg animate-pulse">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 mt-0.5">
                                            <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-red-800 font-semibold text-sm mb-1">Account Locked</h3>
                                            <p className="text-red-700 text-sm leading-relaxed">
                                                Too many failed login attempts. This account is temporarily locked.
                                            </p>
                                            <div className="mt-3 flex items-center gap-2">
                                                <div className="flex items-center gap-2 bg-red-100 px-3 py-2 rounded-md">
                                                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {lockStatus.minutes !== undefined && lockStatus.minutes > 0 ? (
                                                        <>
                                                            <span className="text-red-800 font-bold text-lg tabular-nums">
                                                                {lockStatus.minutes}
                                                            </span>
                                                            <span className="text-red-700 text-sm">
                                                                minute{lockStatus.minutes !== 1 ? 's' : ''}
                                                            </span>
                                                            {lockStatus.seconds !== undefined && lockStatus.seconds > 0 && (
                                                                <>
                                                                    <span className="text-red-700 text-sm">and</span>
                                                                    <span className="text-red-800 font-bold text-lg tabular-nums">
                                                                        {lockStatus.seconds}
                                                                    </span>
                                                                    <span className="text-red-700 text-sm">
                                                                        second{lockStatus.seconds !== 1 ? 's' : ''}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="text-red-800 font-bold text-lg tabular-nums">
                                                                {lockStatus.seconds ?? Math.floor(lockStatus.seconds_left)}
                                                            </span>
                                                            <span className="text-red-700 text-sm">
                                                                second{(lockStatus.seconds ?? Math.floor(lockStatus.seconds_left)) !== 1 ? 's' : ''}
                                                            </span>
                                                        </>
                                                    )}
                                                    <span className="text-red-700 text-sm">remaining</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

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
                                        disabled={lockStatus?.locked || false}
                                        className={`w-full bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-green-600 focus:ring-green-600 pr-10 ${
                                            lockStatus?.locked ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={lockStatus?.locked || false}
                                        className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 ${
                                            lockStatus?.locked ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-4 h-4" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                                {!lockStatus?.locked && errors.password && (
                                    <p className="text-red-600 text-xs mt-1">{errors.password}</p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                disabled={processing || lockStatus?.locked || false}
                                className={`w-full font-medium py-6 text-base ${
                                    lockStatus?.locked 
                                        ? 'bg-gray-400 cursor-not-allowed' 
                                        : 'bg-green-600 hover:bg-green-700 text-white'
                                }`}
                            >
                                {processing ? 'Signing in...' : lockStatus?.locked ? 'Account Locked' : 'Login'}
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
