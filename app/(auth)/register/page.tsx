"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ClockIcon, Building2Icon, UsersIcon, CreditCardIcon } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function RegisterOrganization() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        // Organization details
        organizationName: "",
        organizationSlug: "",
        planType: "BASIC",

        // Owner details
        ownerName: "",
        ownerEmail: "",
        ownerPassword: "",
        confirmPassword: "",
    })

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))

        // Auto-generate slug from organization name
        if (field === "organizationName") {
            const slug = value.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "")
            setFormData(prev => ({
                ...prev,
                organizationSlug: slug
            }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const response = await fetch("/api/auth/register-organization", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            if (response.ok) {
                router.push("/login?message=Organization created successfully")
            } else {
                const errorData = await response.json()
                toast.error(errorData.message || "Registration failed")
            }
        } catch (err) {
            console.error('Registration error:', err)
            toast.error("Registration failed. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const planFeatures = {
        BASIC: { employees: 50, price: 10, features: ["Basic time tracking", "GPS geofencing", "QR check-in"] },
        PROFESSIONAL: { employees: 100, price: 20, features: ["Everything in Basic", "Advanced reporting", "Manager dashboard"] },
        ENTERPRISE: { employees: "Unlimited", price: 65, features: ["Everything in Professional", "API access", "Custom branding", "Priority support"] }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                        <ClockIcon className="h-12 w-12 text-blue-600" />
                        <h1 className="ml-3 text-3xl font-bold text-blue-600">SmartClock</h1>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Start Your Free Trial</h2>
                    <p className="text-gray-600 mt-2">Create your organization and get started in minutes</p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center mb-8">
                    <div className="flex items-center space-x-4">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                            <Building2Icon className="h-4 w-4" />
                        </div>
                        <div className={`h-1 w-16 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                            <UsersIcon className="h-4 w-4" />
                        </div>
                        <div className={`h-1 w-16 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                            <CreditCardIcon className="h-4 w-4" />
                        </div>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>
                            {step === 1 && "Organization Details"}
                            {step === 2 && "Admin Account"}
                            {step === 3 && "Choose Your Plan"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {step === 1 && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="organizationName">Organization Name</Label>
                                        <Input
                                            id="organizationName"
                                            value={formData.organizationName}
                                            onChange={(e) => handleInputChange("organizationName", e.target.value)}
                                            placeholder="Acme Corporation"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="organizationSlug">Organization URL</Label>
                                        <div className="flex items-center">
                                            <span className="text-sm text-gray-500 mr-2">smartclock.app/</span>
                                            <Input
                                                id="organizationSlug"
                                                value={formData.organizationSlug}
                                                onChange={(e) => handleInputChange("organizationSlug", e.target.value)}
                                                placeholder="acme-corp"
                                                required
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500">This will be your organization's unique URL</p>
                                    </div>

                                    <Button
                                        type="button"
                                        onClick={() => setStep(2)}
                                        className="w-full"
                                        disabled={!formData.organizationName || !formData.organizationSlug}
                                    >
                                        Continue
                                    </Button>
                                </>
                            )}

                            {step === 2 && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="ownerName">Your Full Name</Label>
                                        <Input
                                            id="ownerName"
                                            value={formData.ownerName}
                                            onChange={(e) => handleInputChange("ownerName", e.target.value)}
                                            placeholder="John Doe"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="ownerEmail">Email Address</Label>
                                        <Input
                                            id="ownerEmail"
                                            type="email"
                                            value={formData.ownerEmail}
                                            onChange={(e) => handleInputChange("ownerEmail", e.target.value)}
                                            placeholder="john@acme.com"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="ownerPassword">Password</Label>
                                        <Input
                                            id="ownerPassword"
                                            type="password"
                                            value={formData.ownerPassword}
                                            onChange={(e) => handleInputChange("ownerPassword", e.target.value)}
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            value={formData.confirmPassword}
                                            onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>

                                    {formData.ownerPassword !== formData.confirmPassword && formData.confirmPassword && (
                                        <p className="text-red-600 text-sm">Passwords do not match</p>
                                    )}

                                    <div className="flex space-x-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setStep(1)}
                                            className="flex-1"
                                        >
                                            Back
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={() => setStep(3)}
                                            className="flex-1"
                                            disabled={!formData.ownerName || !formData.ownerEmail || !formData.ownerPassword || formData.ownerPassword !== formData.confirmPassword}
                                        >
                                            Continue
                                        </Button>
                                    </div>
                                </>
                            )}

                            {step === 3 && (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {Object.entries(planFeatures).map(([plan, details]) => (
                                            <div
                                                key={plan}
                                                className={`border rounded-lg p-4 cursor-pointer transition-colors ${formData.planType === plan ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                onClick={() => handleInputChange("planType", plan)}
                                            >
                                                <h3 className="font-semibold text-lg">{plan}</h3>
                                                <p className="text-2xl font-bold text-blue-600">${details.price}/mo</p>
                                                <p className="text-sm text-gray-600 mb-3">Up to {details.employees} employees</p>
                                                <ul className="text-sm space-y-1">
                                                    {details.features.map((feature, index) => (
                                                        <li key={index} className="flex items-center">
                                                            <span className="text-green-600 mr-2">✓</span>
                                                            {feature}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <h3 className="font-semibold text-blue-900">14-Day Free Trial</h3>
                                        <p className="text-blue-700 text-sm">
                                            Start with a free trial. No credit card required. Cancel anytime.
                                        </p>
                                    </div>

                                    <div className="flex space-x-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setStep(2)}
                                            className="flex-1"
                                        >
                                            Back
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={isLoading}
                                            className="flex-1"
                                        >
                                            {isLoading ? "Creating Organization..." : "Start Free Trial"}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </form>
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="text-center mt-6">
                    <p className="text-gray-600">
                        Already have an account?{" "}
                        <Link href="/login" className="text-blue-600 hover:underline">
                            Sign in
                        </Link>
                    </p>
                    <p className="text-gray-600 mt-2">
                        Want to join an existing organization?{" "}
                        <Link href="/join" className="text-blue-600 hover:underline">
                            Join here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
} 