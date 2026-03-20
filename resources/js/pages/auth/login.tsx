import { Head, useForm } from '@inertiajs/react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import { type FormEvent } from 'react'

type Props = {
    status?: string
}

export default function Login({ status }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    })

    const handleLogin = (e: FormEvent) => {
        e.preventDefault()
        post('/login') 
    }

    return (
        <>
            <Head title="Login" />
            <div className="min-h-screen bg-green-700 flex items-center justify-center p-4">
                <Card className="w-full max-w-md shadow-lg bg-white">
                    <div className="p-8">
                        <div className="mb-8 text-center">
                            <div className="w-35 h-35 flex items-center justify-center mx-auto mb-4">
                                <img src="/santorlogo.png" alt="Santor Logo" />
                            </div>
                            <h1 className="text-2xl font-bold text-green-700">
                                Santor National Highschool
                            </h1>
                            <p className="text-black text-sm mt-2">Sign in to your account</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-black mb-2"
                                >
                                    Email Address
                                </label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@school.edu"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    className="w-full text-black"
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-black mb-2"
                                >
                                    Password
                                </label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                    className="w-full text-black"
                                />
                                {errors.password && (
                                    <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-green-700 hover:bg-green-900 text-white font-medium mt-6"
                            >
                                {processing ? 'Signing in...' : 'Sign In'}
                            </Button>
                        </form>

                        {errors.email && (
                            <Alert className="flex mt-4 bg-red-50 border border-red-200 text-red-700">
                                {errors.email}
                            </Alert>
                        )}

                        {status && (
                            <Alert className="flex mt-4 bg-green-50 border border-green-200 text-green-700">
                                {status}
                            </Alert>
                        )}

                        <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-xs font-semibold text-blue-900 mb-2">
                                Test Credentials:
                            </p>
                            <div className="text-xs text-blue-800 space-y-1">
                                <p>
                                    <strong>Student:</strong> student@school.edu / student123
                                </p>
                                <p>
                                    <strong>Faculty & Staff:</strong>
                                </p>
                                <p className="ml-2">Teacher: teacher@school.edu / teacher123</p>
                                <p className="ml-2">Admin: admin@school.edu / admin123</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </>
    )
}
