"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ClockIcon, UploadIcon, CheckCircleIcon, UserIcon, BuildingIcon, CheckIcon } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { UploadThingUpload } from "@/app/components/uploadthing-upload"
import { Progress } from "@/components/ui/progress"

interface OrganizationLookupResponse {
    id: string
    name: string
    slug: string
    planType: string
}

interface UploadedFile {
    name: string
    size: number
    ufsUrl: string
    type: string
}

function JoinOrganizationForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isLoading, setIsLoading] = useState(false)
    const [activeTab, setActiveTab] = useState("organization")
    const [organizationInfo, setOrganizationInfo] = useState<OrganizationLookupResponse | null>(null)
    const [uploadedAvatar, setUploadedAvatar] = useState<UploadedFile | null>(null)
    const [uploadedDocuments, setUploadedDocuments] = useState<UploadedFile[]>([])
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
        if (!formData.organizationSlug.trim()) {
            toast.error("Please enter a company code")
            return
        }

        setIsLoading(true)
        try {
            const response = await fetch(`/api/organizations/lookup?slug=${encodeURIComponent(formData.organizationSlug)}`)
            const data = await response.json()

            if (response.ok && data.organization) {
                setOrganizationInfo(data.organization)
                toast.success(`Found ${data.organization.name}! 🎉`)

                // Auto-advance to account setup after a brief delay
                setTimeout(() => {
                    setActiveTab("account")
                }, 1500)
            } else {
                setOrganizationInfo(null)
                if (response.status === 404) {
                    toast.error("Company not found. Please check your company code or contact your manager.")
                } else {
                    toast.error(data.error || "Failed to find organization")
                }
            }
        } catch (error) {
            console.error("Organization lookup error:", error)
            setOrganizationInfo(null)
            toast.error("Unable to connect. Please check your internet connection and try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleAvatarUpload = (files: UploadedFile[]) => {
        if (files.length > 0) {
            setUploadedAvatar(files[0])
            toast.success("Profile picture uploaded successfully!")
        }
    }

    const handleDocumentUpload = (files: UploadedFile[]) => {
        setUploadedDocuments(prev => [...prev, ...files])
        toast.success(`${files.length} document(s) uploaded successfully!`)
    }

    const removeDocument = (index: number) => {
        setUploadedDocuments(prev => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!isFormValid()) return

        setIsLoading(true)
        try {
            const response = await fetch("/api/auth/join-organization", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    organizationSlug: formData.organizationSlug,
                    employeeName: formData.employeeName,
                    employeeEmail: formData.employeeEmail,
                    employeeId: formData.employeeId,
                    employeePassword: formData.employeePassword,
                    avatarUrl: uploadedAvatar?.ufsUrl,
                    documents: uploadedDocuments.map(doc => ({
                        name: doc.name,
                        url: doc.ufsUrl,
                        size: doc.size,
                        type: doc.type
                    }))
                }),
            })

            const data = await response.json()

            if (response.ok) {
                toast.success("Account created successfully! Welcome to the team! 🎉")

                // Redirect to welcome page with user info
                const welcomeUrl = `/welcome?name=${encodeURIComponent(formData.employeeName)}&org=${encodeURIComponent(organizationInfo?.name || 'your organization')}`
                router.push(welcomeUrl)
            } else {
                toast.error(data.error || "Failed to create account")
            }
        } catch (error) {
            console.error("Registration error:", error)
            toast.error("An error occurred during registration")
        } finally {
            setIsLoading(false)
        }
    }

    const isFormValid = () => {
        return organizationInfo &&
            formData.employeeName &&
            formData.employeeEmail &&
            formData.employeePassword &&
            formData.employeePassword === formData.confirmPassword
    }

    // Progress calculation
    const getProgress = () => {
        switch (activeTab) {
            case "organization": return organizationInfo ? 33 : 10
            case "account": return isFormValid() ? 66 : 40
            case "files": return 100
            default: return 0
        }
    }

    const getStepStatus = (step: string) => {
        switch (step) {
            case "organization":
                return organizationInfo ? "completed" : activeTab === "organization" ? "current" : "pending"
            case "account":
                return isFormValid() ? "completed" : activeTab === "account" ? "current" : "pending"
            case "files":
                return activeTab === "files" ? "current" : "pending"
            default:
                return "pending"
        }
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="text-center">Join Your Organization</CardTitle>
                <CardDescription className="text-center">
                    Complete the steps below to set up your account
                </CardDescription>

                {/* Progress Indicator */}
                <div className="space-y-4 pt-4">
                    <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span>{Math.round(getProgress())}% Complete</span>
                    </div>
                    <Progress value={getProgress()} className="w-full" />

                    {/* Step Indicators */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${getStepStatus("organization") === "completed"
                                ? "bg-green-500 text-white"
                                : getStepStatus("organization") === "current"
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-200 text-gray-600"
                                }`}>
                                {getStepStatus("organization") === "completed" ? <CheckIcon className="h-4 w-4" /> : "1"}
                            </div>
                            <span className={`text-sm ${getStepStatus("organization") === "current" ? "font-medium" : ""}`}>
                                Organization
                            </span>
                        </div>

                        <div className="flex items-center space-x-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${getStepStatus("account") === "completed"
                                ? "bg-green-500 text-white"
                                : getStepStatus("account") === "current"
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-200 text-gray-600"
                                }`}>
                                {getStepStatus("account") === "completed" ? <CheckIcon className="h-4 w-4" /> : "2"}
                            </div>
                            <span className={`text-sm ${getStepStatus("account") === "current" ? "font-medium" : ""}`}>
                                Account
                            </span>
                        </div>

                        <div className="flex items-center space-x-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${getStepStatus("files") === "current"
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200 text-gray-600"
                                }`}>
                                3
                            </div>
                            <span className={`text-sm ${getStepStatus("files") === "current" ? "font-medium" : ""}`}>
                                Files
                            </span>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="organization" className="flex items-center gap-2">
                            <BuildingIcon className="h-4 w-4" />
                            Organization
                            {organizationInfo && <CheckCircleIcon className="h-4 w-4 text-green-600" />}
                        </TabsTrigger>
                        <TabsTrigger value="account" disabled={!organizationInfo} className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4" />
                            Account
                        </TabsTrigger>
                        <TabsTrigger value="files" disabled={!organizationInfo} className="flex items-center gap-2">
                            <UploadIcon className="h-4 w-4" />
                            Files
                            {(uploadedAvatar || uploadedDocuments.length > 0) && <CheckCircleIcon className="h-4 w-4 text-green-600" />}
                        </TabsTrigger>
                    </TabsList>

                    {/* Organization Tab */}
                    <TabsContent value="organization" className="space-y-6 mt-6">
                        <div className="text-center">
                            <BuildingIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900">Find Your Organization</h3>
                            <p className="text-gray-600">Enter the company code provided by your manager</p>
                        </div>

                        {organizationInfo && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                                <div className="flex items-center">
                                    <CheckCircleIcon className="h-5 w-5 text-green-600 mr-3" />
                                    <div>
                                        <p className="font-medium text-green-900">{organizationInfo.name}</p>
                                        <p className="text-sm text-green-700">Organization found successfully!</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="organizationSlug">Company Code</Label>
                                <Input
                                    id="organizationSlug"
                                    value={formData.organizationSlug}
                                    onChange={(e) => handleInputChange("organizationSlug", e.target.value)}
                                    placeholder="acme-corp"
                                    required
                                />
                                <div className="text-xs text-gray-500 space-y-1">
                                    <p>💡 Ask your manager for your company's unique code</p>
                                    <p>📧 Check your welcome email for the company code</p>
                                    <p>🔍 Company codes are usually in format: company-name</p>
                                </div>
                            </div>

                            <Button
                                onClick={lookupOrganization}
                                className="w-full"
                                disabled={!formData.organizationSlug || isLoading}
                            >
                                {isLoading ? "Looking up..." : organizationInfo ? "Update Organization" : "Find Organization"}
                            </Button>

                            {organizationInfo && (
                                <Button
                                    onClick={() => setActiveTab("account")}
                                    variant="outline"
                                    className="w-full"
                                >
                                    Continue to Account Setup →
                                </Button>
                            )}

                            {/* Help Section */}
                            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                                <h4 className="font-medium text-blue-900 mb-2">Need Help?</h4>
                                <div className="text-sm text-blue-800 space-y-1">
                                    <p>• Contact your manager or HR department</p>
                                    <p>• Check your welcome email or invitation</p>
                                    <p>• Make sure you're using the correct company code</p>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Account Tab */}
                    <TabsContent value="account" className="space-y-6 mt-6">
                        <div className="text-center">
                            <UserIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900">Create Your Account</h3>
                            <p className="text-gray-600">Fill in your personal information</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
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

                            {formData.employeePassword !== formData.confirmPassword && formData.confirmPassword && (
                                <p className="text-red-600 text-sm">Passwords do not match</p>
                            )}

                            <Separator />

                            <div className="flex space-x-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setActiveTab("files")}
                                    className="flex-1"
                                    disabled={!isFormValid()}
                                >
                                    Add Files (Optional)
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={!isFormValid() || isLoading}
                                    className="flex-1"
                                >
                                    {isLoading ? "Creating Account..." : "Create Account"}
                                </Button>
                            </div>
                        </form>
                    </TabsContent>

                    {/* Files Tab */}
                    <TabsContent value="files" className="space-y-6 mt-6">
                        <div className="text-center">
                            <UploadIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900">Upload Your Files</h3>
                            <p className="text-gray-600">Add your profile picture and any required documents</p>
                        </div>

                        {/* Profile Picture Upload */}
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-900">Profile Picture (Optional)</h4>
                            {uploadedAvatar ? (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-green-900">{uploadedAvatar.name}</p>
                                            <p className="text-sm text-green-700">
                                                {(uploadedAvatar.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <CheckCircleIcon className="h-5 w-5 text-green-600" />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setUploadedAvatar(null)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <UploadThingUpload
                                    endpoint="joinAvatar"
                                    title="Upload Profile Picture"
                                    description="Add a professional photo for your profile"
                                    variant="dropzone"
                                    onUploadComplete={handleAvatarUpload}
                                />
                            )}
                        </div>

                        <Separator />

                        {/* Documents Upload */}
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-900">Onboarding Documents (Optional)</h4>
                            <p className="text-sm text-gray-600">
                                Upload any completed forms, contracts, or documents provided by HR
                            </p>

                            {uploadedDocuments.length > 0 && (
                                <div className="space-y-2">
                                    {uploadedDocuments.map((doc, index) => (
                                        <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium text-blue-900">{doc.name}</p>
                                                    <p className="text-sm text-blue-700">
                                                        {(doc.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeDocument(index)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <UploadThingUpload
                                endpoint="joinDocuments"
                                title="Upload Documents"
                                description="Upload completed forms, contracts, or other documents"
                                variant="dropzone"
                                onUploadComplete={handleDocumentUpload}
                            />
                        </div>

                        <Separator />

                        {/* Final Submit */}
                        <div className="space-y-4">
                            <Button
                                onClick={handleSubmit}
                                disabled={!isFormValid() || isLoading}
                                className="w-full"
                                size="lg"
                            >
                                {isLoading ? "Creating Account..." : "Complete Registration"}
                            </Button>

                            <div className="text-center">
                                <p className="text-sm text-gray-500">
                                    You can always upload files later from your profile page
                                </p>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}

export default function JoinOrganization() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                        <ClockIcon className="h-12 w-12 text-blue-600" />
                        <h1 className="ml-3 text-3xl font-bold text-blue-600">SmartClock</h1>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Join Your Team</h2>
                    <p className="text-gray-600 mt-2">Complete your registration to get started</p>
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