"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateEmployee, createDepartment, toggleEmployeeStatus } from "@/actions/employees"
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
import { Switch } from "@/components/ui/switch"
import {
    PlusIcon,
    SaveIcon,
    AlertCircleIcon,
    UserIcon,
    Users2Icon,
    MapPinIcon,
    ShieldIcon,
    ShieldOffIcon
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

interface Employee {
    id: string
    name: string | null
    email: string
    role: string
    isActive: boolean
    phoneNumber: string | null
    employeeId: string | null
    departmentId: string | null
    locationId: string | null
    createdAt: Date
    department: {
        id: string
        name: string
        color: string | null
    } | null
    location: {
        id: string
        name: string
        address: string
    } | null
}

interface EditEmployeeFormProps {
    employee: Employee
    departments: Department[]
    locations: Location[]
}

const DEPARTMENT_COLORS = [
    "#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444", "#6B7280",
    "#EC4899", "#14B8A6", "#F97316", "#84CC16", "#06B6D4", "#A855F7"
]

export function EditEmployeeForm({ employee, departments, locations }: EditEmployeeFormProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isTogglingStatus, setIsTogglingStatus] = useState(false)
    const [showCreateDepartment, setShowCreateDepartment] = useState(false)
    const [newDepartment, setNewDepartment] = useState({
        name: "",
        description: "",
        color: DEPARTMENT_COLORS[0]
    })

    const [formData, setFormData] = useState({
        name: employee.name || "",
        email: employee.email,
        role: employee.role as "EMPLOYEE" | "MANAGER" | "ADMIN",
        phoneNumber: employee.phoneNumber || "",
        employeeId: employee.employeeId || "",
        departmentId: employee.departmentId || "none",
        locationId: employee.locationId || "none",
        isActive: employee.isActive
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
            const result = await updateEmployee(employee.id, {
                name: formData.name,
                email: formData.email,
                role: formData.role,
                phoneNumber: formData.phoneNumber || undefined,
                employeeId: formData.employeeId || undefined,
                departmentId: formData.departmentId === "none" ? undefined : formData.departmentId || undefined,
                locationId: formData.locationId === "none" ? undefined : formData.locationId || undefined,
                isActive: formData.isActive
            })

            if (result.success) {
                toast.success(`Employee ${formData.name} has been updated successfully!`)
                router.push("/manager/employees")
            } else {
                toast.error(result.error || "Failed to update employee")
            }
        } catch (error) {
            console.error("Error updating employee:", error)
            toast.error("An unexpected error occurred")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleToggleStatus = async () => {
        setIsTogglingStatus(true)

        try {
            const result = await toggleEmployeeStatus(employee.id)

            if (result.success && result.employee) {
                const action = result.action === 'activated' ? 'activated' : 'deactivated'
                toast.success(`Employee ${formData.name} has been ${action}`)
                setFormData(prev => ({ ...prev, isActive: result.employee.isActive }))
            } else {
                toast.error(result.error || "Failed to update employee status")
            }
        } catch (error) {
            console.error("Error toggling employee status:", error)
            toast.error("An unexpected error occurred")
        } finally {
            setIsTogglingStatus(false)
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
        <div className="space-y-6">
            {/* Employee Status Toggle */}
            <Card className={`border-2 ${formData.isActive ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            {formData.isActive ? (
                                <ShieldIcon className="h-5 w-5 text-green-600" />
                            ) : (
                                <ShieldOffIcon className="h-5 w-5 text-red-600" />
                            )}
                            <CardTitle className="text-sm">
                                Employee Status: {formData.isActive ? 'Active' : 'Inactive'}
                            </CardTitle>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Label htmlFor="status-toggle" className="text-sm">
                                {formData.isActive ? 'Deactivate' : 'Activate'}
                            </Label>
                            <Switch
                                id="status-toggle"
                                checked={formData.isActive}
                                onCheckedChange={handleToggleStatus}
                                disabled={isTogglingStatus}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-600">
                        {formData.isActive
                            ? "This employee can log in and clock in/out normally."
                            : "This employee is deactivated and cannot access the system."
                        }
                    </p>
                </CardContent>
            </Card>

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

                {/* Contact Information */}
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
                                Updating...
                            </>
                        ) : (
                            <>
                                <SaveIcon className="h-4 w-4 mr-2" />
                                Update Employee
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
} 