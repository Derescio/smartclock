"use client"

import { useState, useMemo } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
    SearchIcon,
    FilterIcon,
    MailIcon,
    PhoneIcon,
    MapPinIcon,
    CalendarIcon,
    MoreVerticalIcon,
    EditIcon,
    Users2Icon,
    UserIcon
} from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import Link from "next/link"

interface Employee {
    id: string
    name: string | null
    email: string
    role: string
    isActive: boolean
    phoneNumber: string | null
    employeeId: string | null
    avatarUrl: string | null
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

interface EmployeeManagementClientProps {
    employees: Employee[]
}

export function EmployeeManagementClient({ employees }: EmployeeManagementClientProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [roleFilter, setRoleFilter] = useState<string>("all")
    const [departmentFilter, setDepartmentFilter] = useState<string>("all")
    const [statusFilter, setStatusFilter] = useState<string>("all")

    // Get unique departments for filter
    const departments = useMemo(() => {
        const uniqueDepts = new Map()
        employees.forEach(emp => {
            if (emp.department) {
                uniqueDepts.set(emp.department.id, emp.department)
            }
        })
        return Array.from(uniqueDepts.values())
    }, [employees])

    // Filter employees based on search and filters
    const filteredEmployees = useMemo(() => {
        return employees.filter(employee => {
            const matchesSearch =
                !searchTerm ||
                employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                employee.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())

            const matchesRole =
                roleFilter === "all" ||
                employee.role === roleFilter

            const matchesDepartment =
                departmentFilter === "all" ||
                employee.department?.id === departmentFilter ||
                (departmentFilter === "none" && !employee.department)

            const matchesStatus =
                statusFilter === "all" ||
                (statusFilter === "active" && employee.isActive) ||
                (statusFilter === "inactive" && !employee.isActive)

            return matchesSearch && matchesRole && matchesDepartment && matchesStatus
        })
    }, [employees, searchTerm, roleFilter, departmentFilter, statusFilter])

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'bg-red-100 text-red-800'
            case 'MANAGER': return 'bg-blue-100 text-blue-800'
            case 'EMPLOYEE': return 'bg-green-100 text-green-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusColor = (isActive: boolean) => {
        return isActive
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
    }

    const getDepartmentColor = (color: string | null) => {
        return color || '#6B7280' // Default gray
    }

    return (
        <div className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search employees by name, email, or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <div className="flex gap-2">
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="w-32">
                            <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="EMPLOYEE">Employee</SelectItem>
                            <SelectItem value="MANAGER">Manager</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Department" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Departments</SelectItem>
                            <SelectItem value="none">No Department</SelectItem>
                            {departments.map(dept => (
                                <SelectItem key={dept.id} value={dept.id}>
                                    {dept.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-32">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Results Summary */}
            <div className="text-sm text-gray-600">
                Showing {filteredEmployees.length} of {employees.length} employees
            </div>

            {/* Employee List */}
            <div className="space-y-4">
                {filteredEmployees.length === 0 ? (
                    <div className="text-center py-12">
                        <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
                        <p className="text-gray-600 mb-4">
                            {employees.length === 0
                                ? "Get started by adding your first employee."
                                : "Try adjusting your search or filter criteria."
                            }
                        </p>
                        {employees.length === 0 && (
                            <Link href="/manager/employees/add">
                                <Button>Add Employee</Button>
                            </Link>
                        )}
                    </div>
                ) : (
                    filteredEmployees.map((employee) => (
                        <Card key={employee.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage
                                                src={employee.avatarUrl || ''}
                                                alt={employee.name || ''}
                                            />
                                            <AvatarFallback>
                                                {employee.name?.charAt(0)?.toUpperCase() || 'U'}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <h3 className="font-semibold text-gray-900 truncate">
                                                    {employee.name || 'Unnamed Employee'}
                                                </h3>
                                                {employee.employeeId && (
                                                    <span className="text-sm text-gray-500 font-mono">
                                                        #{employee.employeeId}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                                <div className="flex items-center">
                                                    <MailIcon className="h-4 w-4 mr-1" />
                                                    <span className="truncate">{employee.email}</span>
                                                </div>

                                                {employee.phoneNumber && (
                                                    <div className="flex items-center">
                                                        <PhoneIcon className="h-4 w-4 mr-1" />
                                                        {employee.phoneNumber}
                                                    </div>
                                                )}

                                                {employee.location && (
                                                    <div className="flex items-center">
                                                        <MapPinIcon className="h-4 w-4 mr-1" />
                                                        {employee.location.name}
                                                    </div>
                                                )}

                                                {employee.department && (
                                                    <div className="flex items-center">
                                                        <Users2Icon className="h-4 w-4 mr-1" />
                                                        <span
                                                            className="px-2 py-1 rounded-full text-xs font-medium"
                                                            style={{
                                                                backgroundColor: `${getDepartmentColor(employee.department.color)}20`,
                                                                color: getDepartmentColor(employee.department.color)
                                                            }}
                                                        >
                                                            {employee.department.name}
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="flex items-center">
                                                    <CalendarIcon className="h-4 w-4 mr-1" />
                                                    Joined {new Date(employee.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <Badge className={getRoleColor(employee.role)}>
                                            {employee.role}
                                        </Badge>
                                        <Badge className={getStatusColor(employee.isActive)}>
                                            {employee.isActive ? 'Active' : 'Inactive'}
                                        </Badge>

                                        <Link href={`/manager/employees/${employee.id}/edit`}>
                                            <Button variant="ghost" size="sm">
                                                <EditIcon className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
} 