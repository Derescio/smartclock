'use client'

import { useState, useEffect, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ClockIcon, EyeIcon, EyeOffIcon, Building2Icon, UsersIcon } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

function LoginForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const message = searchParams.get('message')

    // Show success message as toast if present in URL
    useEffect(() => {
        if (message) {
            toast.success(message)
        }
    }, [message])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            })

            if (result?.error) {
                // Handle different types of authentication errors
                switch (result.error) {
                    case 'CredentialsSignin':
                        toast.error('Invalid email or password. Please check your credentials and try again.')
                        break
                    case 'Configuration':
                        toast.error('Authentication configuration error. Please contact support.')
                        break
                    case 'AccessDenied':
                        toast.error('Access denied. Your account may be inactive or suspended.')
                        break
                    case 'Verification':
                        toast.error('Email verification required. Please check your email.')
                        break
                    default:
                        toast.error('Login failed. Please try again or contact support if the problem persists.')
                }
                // toast.error('Login failed. Please check your credentials and try again.')
            } else if (result?.ok) {
                toast.success('Welcome back! Redirecting to your dashboard...')
                // Small delay to show the success message before redirect
                setTimeout(() => {
                    router.push('/')
                    router.refresh()
                }, 1000)
            } else {
                toast.error('An unexpected error occurred. Please try again.')
            }
        } catch (error) {
            console.error('Login error:', error)
            toast.error('Connection error. Please check your internet connection and try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {/* Sign In Form */}
            <Card className="card">
                <CardHeader>
                    <CardTitle className="text-center text-xl font-heading">Sign In</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                                placeholder="Enter your email"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? (
                                        <EyeOffIcon className="h-5 w-5" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary h-12 text-lg font-medium"
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </Button>
                    </form>

                    {/* Registration Options */}
                    <div className="mt-6 space-y-3">
                        <div className="text-center text-sm text-gray-600">
                            Don't have an account?
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Link href="/register">
                                <Button variant="outline" className="w-full h-12 flex flex-col items-center justify-center space-y-1">
                                    <Building2Icon className="h-4 w-4" />
                                    <span className="text-xs">Start Organization</span>
                                </Button>
                            </Link>

                            <Link href="/join">
                                <Button variant="outline" className="w-full h-12 flex flex-col items-center justify-center space-y-1">
                                    <UsersIcon className="h-4 w-4" />
                                    <span className="text-xs">Join Team</span>
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Demo Credentials */}
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 className="text-sm font-medium text-blue-800 mb-2">Demo Credentials</h3>
                        <div className="text-xs text-blue-700 space-y-1">
                            <div><strong>Acme Corp:</strong> admin@acme-corp.com / demo123</div>
                            <div><strong>TechStart:</strong> alice@techstart.com / demo123</div>
                            <div><strong>Enterprise:</strong> manager@enterprise-sol.com / demo123</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    )
}

export default function Login() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Logo */}
                <Link href='/'>
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center mb-4">
                            <ClockIcon className="h-12 w-12 text-blue-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-blue-600 font-heading">SmartClock</h1>
                        <p className="text-gray-600 mt-2">Employee Time Tracking</p>
                    </div>
                </Link>

                <Suspense fallback={
                    <Card className="card">
                        <CardContent className="p-6">
                            <div className="text-center">Loading...</div>
                        </CardContent>
                    </Card>
                }>
                    <LoginForm />
                </Suspense>
            </div>
        </div>
    )
} 