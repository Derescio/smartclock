"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ClockIcon, UsersIcon } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface OrganizationLookupResponse {
  id: string
  name: string
  slug: string
  planType: string
}

function JoinOrganizationForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [organizationInfo, setOrganizationInfo] = useState<OrganizationLookupResponse | null>(null)
  const [formData, setFormData] = useState({
    organizationSlug: searchParams.get('org') || "",
    employeeName: "",
    employeeEmail: "",
    employeePassword: "",
    confirmPassword: "",
    employeeId: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const lookupOrganization = async () => {
    if (!formData.organizationSlug) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/organizations/lookup?slug=${formData.organizationSlug}`)
      if (response.ok) {
        const org = await response.json()
        setOrganizationInfo(org)
        setStep(2)
      } else {
        toast.error("Organization not found. Please check the company code.")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Organization not found. Please check the company code."
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/join-organization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationSlug: formData.organizationSlug,
          employeeName: formData.employeeName,
          employeeEmail: formData.employeeEmail,
          employeePassword: formData.employeePassword,
          employeeId: formData.employeeId,
        }),
      })

      if (response.ok) {
        router.push("/login?message=Account created successfully")
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <UsersIcon className="h-5 w-5 mr-2 text-blue-600" />
          {step === 1 ? "Find Your Organization" : `Join ${organizationInfo?.name}`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="organizationSlug">Company Code</Label>
              <Input
                id="organizationSlug"
                value={formData.organizationSlug}
                onChange={(e) => handleInputChange("organizationSlug", e.target.value)}
                placeholder="acme-corp"
                required
              />
              <p className="text-xs text-gray-500">
                Ask your manager for your company's unique code
              </p>
            </div>

            <Button
              onClick={lookupOrganization}
              className="w-full"
              disabled={!formData.organizationSlug || isLoading}
            >
              {isLoading ? "Looking up..." : "Find Organization"}
            </Button>
          </div>
        )}

        {step === 2 && organizationInfo && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Organization Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900">{organizationInfo.name}</h3>
              <p className="text-blue-700 text-sm">
                {organizationInfo.planType.charAt(0) + organizationInfo.planType.slice(1).toLowerCase()} Plan
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="employeeName">Full Name</Label>
              <Input
                id="employeeName"
                value={formData.employeeName}
                onChange={(e) => handleInputChange("employeeName", e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="employeeEmail">Email Address</Label>
              <Input
                id="employeeEmail"
                type="email"
                value={formData.employeeEmail}
                onChange={(e) => handleInputChange("employeeEmail", e.target.value)}
                placeholder="john@company.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID (Optional)</Label>
              <Input
                id="employeeId"
                value={formData.employeeId}
                onChange={(e) => handleInputChange("employeeId", e.target.value)}
                placeholder="EMP001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="employeePassword">Password</Label>
              <Input
                id="employeePassword"
                type="password"
                value={formData.employeePassword}
                onChange={(e) => handleInputChange("employeePassword", e.target.value)}
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
                type="submit"
                disabled={isLoading || formData.employeePassword !== formData.confirmPassword}
                className="flex-1"
              >
                {isLoading ? "Creating Account..." : "Join Organization"}
              </Button>
            </div>

            {formData.employeePassword !== formData.confirmPassword && formData.confirmPassword && (
              <p className="text-red-600 text-sm">Passwords do not match</p>
            )}
          </form>
        )}
      </CardContent>
    </Card>
  )
}

export default function JoinOrganization() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <ClockIcon className="h-12 w-12 text-blue-600" />
            <h1 className="ml-3 text-3xl font-bold text-blue-600">SmartClock</h1>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Join Your Team</h2>
          <p className="text-gray-600 mt-2">Enter your company code to get started</p>
        </div>

        <Suspense fallback={
          <Card>
            <CardContent className="p-6">
              <div className="text-center">Loading...</div>
            </CardContent>
          </Card>
        }>
          <JoinOrganizationForm />
        </Suspense>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
          <p className="text-gray-600 mt-2">
            Need to create a new organization?{" "}
            <Link href="/register" className="text-blue-600 hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
} 