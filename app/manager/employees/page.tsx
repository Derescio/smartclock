import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getAllTeamMembers } from "@/actions/team"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
    UsersIcon,
    PlusIcon,
    SearchIcon,
    FilterIcon,
    MoreVerticalIcon,
    MailIcon,
    PhoneIcon,
    MapPinIcon,
    CalendarIcon,
    EditIcon,
    TrashIcon,
    UserCheckIcon,
    Users2Icon
} from "lucide-react"

import Link from "next/link"
import { EmployeeManagementClient } from "./components/employee-management-client"

export default async function EmployeesPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect("/login")
    }

    if (session.user.role !== "MANAGER" && session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
        redirect("/dashboard")
    }

    // Get all team members for this organization
    const employees = await getAllTeamMembers()

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/manager"
                                className="text-gray-500 hover:text-gray-900 text-sm font-medium"
                            >
                                ← Back to Dashboard
                            </Link>
                            <div className="h-6 border-l border-gray-300" />
                            <h1 className="text-xl font-semibold text-gray-900">Employee Management</h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Statistics Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Employees</p>
                                    <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
                                </div>
                                <UsersIcon className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Active Today</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {employees.filter(emp => emp.isActive).length}
                                    </p>
                                </div>
                                <UserCheckIcon className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Departments</p>
                                    <p className="text-2xl font-bold text-purple-600">
                                        {new Set(employees.map(emp => emp.department?.name).filter(Boolean)).size || 1}
                                    </p>
                                </div>
                                <Users2Icon className="h-8 w-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Managers</p>
                                    <p className="text-2xl font-bold text-orange-600">
                                        {employees.filter(emp => emp.role === "MANAGER" || emp.role === "ADMIN").length}
                                    </p>
                                </div>
                                <UserCheckIcon className="h-8 w-8 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Employee Management */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span className="flex items-center space-x-2">
                                <UsersIcon className="h-5 w-5" />
                                <span>Team Members</span>
                            </span>
                            <Link href="/manager/employees/add">
                                <Button>
                                    <PlusIcon className="h-4 w-4 mr-2" />
                                    Add Employee
                                </Button>
                            </Link>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <EmployeeManagementClient employees={employees} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 