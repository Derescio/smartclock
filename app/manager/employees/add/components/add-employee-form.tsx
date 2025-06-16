"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createEmployee, createDepartment } from "@/actions/employees"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    PlusIcon,
    SaveIcon,
    EyeIcon,
    EyeOffIcon,
    AlertCircleIcon,
    UserIcon,
    Users2Icon,
    MapPinIcon
} from "lucide-react"
import { toast } from "sonner"

interface Department {
    id: string
    name: string
    description: string | null
    color: string | null
    manager: {
        id: string
        name: string | null
        email: string
    } | null
    _count: {
        employees: number
    }
}

interface Location {
    id: string
    name: string
    address: string
    latitude: number
    longitude: number
    radius: number
    users: {
        id: string
        name: string | null
        email: string
    }[]
    _count: {
        users: number
        clockEvents: number
    }
}

interface AddEmployeeFormProps {
    departments: Department[]
    locations: Location[]
}

const DEPARTMENT_COLORS = [
    "#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444", "#6B7280",
    "#EC4899", "#14B8A6", "#F97316", "#84CC16", "#06B6D4", "#A855F7"
]

export function AddEmployeeForm({ departments, locations }: AddEmployeeFormProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showCreateDepartment, setShowCreateDepartment] = useState(false)
    const [newDepartment, setNewDepartment] = useState({
        name: "",
        description: "",
        color: DEPARTMENT_COLORS[0]
    })

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "EMPLOYEE" as "EMPLOYEE" | "MANAGER" | "ADMIN",
        phoneNumber: "",
        employeeId: "",
        departmentId: "",
        locationId: ""
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.name.trim()) {
            newErrors.name = "Name is required"
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required"
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Invalid email format"
        }

        if (!formData.password.trim()) {
            newErrors.password = "Password is required"
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters"
        }

        if (formData.phoneNumber && !/^\+?[\d\s\-\(\)]+$/.test(formData.phoneNumber)) {
            newErrors.phoneNumber = "Invalid phone number format"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            toast.error("Please fix the form errors")
            return
        }

        setIsSubmitting(true)

        try {
            const result = await createEmployee({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role,
                phoneNumber: formData.phoneNumber || undefined,
                employeeId: formData.employeeId || undefined,
                departmentId: formData.departmentId === "none" ? undefined : formData.departmentId || undefined,
                locationId: formData.locationId === "none" ? undefined : formData.locationId || undefined,
            })

            if (result.success) {
                toast.success(`Employee ${formData.name} has been created successfully!`)
                router.push("/manager/employees")
            } else {
                toast.error(result.error || "Failed to create employee")
            }
        } catch (error) {
            console.error("Error creating employee:", error)
            toast.error("An unexpected error occurred")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCreateDepartment = async () => {
        if (!newDepartment.name.trim()) {
            toast.error("Department name is required")
            return
        }

        try {
            const result = await createDepartment({
                name: newDepartment.name,
                description: newDepartment.description || undefined,
                color: newDepartment.color
            })

            if (result.success && result.department) {
                toast.success(`Department "${newDepartment.name}" created successfully!`)
                setFormData(prev => ({ ...prev, departmentId: result.department.id }))
                setNewDepartment({ name: "", description: "", color: DEPARTMENT_COLORS[0] })
                setShowCreateDepartment(false)
                // Refresh the page to show the new department
                router.refresh()
            } else {
                toast.error(result.error || "Failed to create department")
            }
        } catch (error) {
            console.error("Error creating department:", error)
            toast.error("An unexpected error occurred")
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="John Doe"
                        className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && (
                        <p className="text-sm text-red-600 flex items-center">
                            <AlertCircleIcon className="h-4 w-4 mr-1" />
                            {errors.name}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="john.doe@company.com"
                        className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && (
                        <p className="text-sm text-red-600 flex items-center">
                            <AlertCircleIcon className="h-4 w-4 mr-1" />
                            {errors.email}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">Initial Password *</Label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                            placeholder="Enter initial password"
                            className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                        </Button>
                    </div>
                    {errors.password && (
                        <p className="text-sm text-red-600 flex items-center">
                            <AlertCircleIcon className="h-4 w-4 mr-1" />
                            {errors.password}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="role">Role *</Label>
                    <Select
                        value={formData.role}
                        onValueChange={(value: "EMPLOYEE" | "MANAGER" | "ADMIN") =>
                            setFormData(prev => ({ ...prev, role: value }))
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="EMPLOYEE">
                                <div className="flex items-center">
                                    <UserIcon className="h-4 w-4 mr-2" />
                                    Employee
                                </div>
                            </SelectItem>
                            <SelectItem value="MANAGER">
                                <div className="flex items-center">
                                    <Users2Icon className="h-4 w-4 mr-2" />
                                    Manager
                                </div>
                            </SelectItem>
                            <SelectItem value="ADMIN">
                                <div className="flex items-center">
                                    <UserIcon className="h-4 w-4 mr-2" />
                                    Admin
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                        id="phone"
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                        placeholder="+1 (555) 123-4567"
                        className={errors.phoneNumber ? "border-red-500" : ""}
                    />
                    {errors.phoneNumber && (
                        <p className="text-sm text-red-600 flex items-center">
                            <AlertCircleIcon className="h-4 w-4 mr-1" />
                            {errors.phoneNumber}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="employeeId">Employee ID</Label>
                    <Input
                        id="employeeId"
                        value={formData.employeeId}
                        onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                        placeholder="EMP001"
                    />
                    <p className="text-xs text-gray-500">Optional: Custom employee identifier</p>
                </div>
            </div>

            {/* Department & Location */}
            <div className="space-y-6">
                <div className="space-y-2">
                    <Label>Department</Label>
                    <div className="flex gap-2">
                        <Select
                            value={formData.departmentId}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, departmentId: value }))}
                        >
                            <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Select department (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">No Department</SelectItem>
                                {departments.map((dept) => (
                                    <SelectItem key={dept.id} value={dept.id}>
                                        <div className="flex items-center">
                                            <div
                                                className="w-3 h-3 rounded-full mr-2"
                                                style={{ backgroundColor: dept.color || '#6B7280' }}
                                            />
                                            {dept.name}
                                            <Badge variant="secondary" className="ml-2">
                                                {dept._count.employees}
                                            </Badge>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowCreateDepartment(!showCreateDepartment)}
                        >
                            <PlusIcon className="h-4 w-4 mr-2" />
                            New
                        </Button>
                    </div>
                </div>

                {/* Create New Department */}
                {showCreateDepartment && (
                    <Card className="bg-blue-50 border-blue-200">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Create New Department</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="deptName">Department Name</Label>
                                    <Input
                                        id="deptName"
                                        value={newDepartment.name}
                                        onChange={(e) => setNewDepartment(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="e.g., Engineering, Sales, HR"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="deptColor">Color</Label>
                                    <Select
                                        value={newDepartment.color}
                                        onValueChange={(value) => setNewDepartment(prev => ({ ...prev, color: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {DEPARTMENT_COLORS.map((color) => (
                                                <SelectItem key={color} value={color}>
                                                    <div className="flex items-center">
                                                        <div
                                                            className="w-4 h-4 rounded-full mr-2"
                                                            style={{ backgroundColor: color }}
                                                        />
                                                        {color}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="deptDesc">Description (Optional)</Label>
                                <Input
                                    id="deptDesc"
                                    value={newDepartment.description}
                                    onChange={(e) => setNewDepartment(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Brief description of the department"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button type="button" onClick={handleCreateDepartment} size="sm">
                                    Create Department
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowCreateDepartment(false)}
                                    size="sm"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="space-y-2">
                    <Label>Work Location</Label>
                    <Select
                        value={formData.locationId}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, locationId: value }))}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select work location (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">No Location</SelectItem>
                            {locations.map((location) => (
                                <SelectItem key={location.id} value={location.id}>
                                    <div className="flex items-center">
                                        <MapPinIcon className="h-4 w-4 mr-2" />
                                        <div>
                                            <div className="font-medium">{location.name}</div>
                                            <div className="text-xs text-gray-500">{location.address}</div>
                                        </div>
                                        <Badge variant="secondary" className="ml-2">
                                            {location._count.users} users
                                        </Badge>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Creating...
                        </>
                    ) : (
                        <>
                            <SaveIcon className="h-4 w-4 mr-2" />
                            Create Employee
                        </>
                    )}
                </Button>
            </div>
        </form>
    )
} 