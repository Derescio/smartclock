import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getDepartments } from "@/actions/employees"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Users2Icon,
    PlusIcon,
    EditIcon,
    UsersIcon,
    ArrowLeftIcon
} from "lucide-react"
import Link from "next/link"
import { DepartmentManagementClient } from "./components/department-management-client"

export default async function DepartmentsPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect("/login")
    }

    if (session.user.role !== "MANAGER" && session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
        redirect("/dashboard")
    }

    // Get all departments for this organization
    const departmentsResult = await getDepartments()
    const departments = departmentsResult.success ? departmentsResult.departments : []

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/manager/employees"
                                className="flex items-center text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors"
                            >
                                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                                Back to Employees
                            </Link>
                            <div className="h-6 border-l border-gray-300" />
                            <h1 className="text-xl font-semibold text-gray-900 flex items-center">
                                <Users2Icon className="h-5 w-5 mr-2 text-blue-600" />
                                Department Management
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Statistics Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Departments</p>
                                    <p className="text-2xl font-bold text-gray-900">{departments?.length || 0}</p>
                                </div>
                                <Users2Icon className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Employees</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {departments?.reduce((sum, dept) => sum + dept._count.employees, 0) || 0}
                                    </p>
                                </div>
                                <UsersIcon className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">With Managers</p>
                                    <p className="text-2xl font-bold text-purple-600">
                                        {departments?.filter(dept => dept.manager).length || 0}
                                    </p>
                                </div>
                                <EditIcon className="h-8 w-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Department Management */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span className="flex items-center space-x-2">
                                <Users2Icon className="h-5 w-5" />
                                <span>Departments</span>
                            </span>
                            <Button>
                                <PlusIcon className="h-4 w-4 mr-2" />
                                Add Department
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DepartmentManagementClient departments={departments || []} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 