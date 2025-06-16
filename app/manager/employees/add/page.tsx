import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getDepartments } from "@/actions/employees"
import { getOrganizationLocations } from "@/actions/locations"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeftIcon, UserPlusIcon } from "lucide-react"
import { AddEmployeeForm } from "./components/add-employee-form"

export default async function AddEmployeePage() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect("/login")
    }

    if (session.user.role !== "MANAGER" && session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
        redirect("/dashboard")
    }

    // Get departments and locations for the form
    const [departmentsResult, locations] = await Promise.all([
        getDepartments(),
        getOrganizationLocations()
    ])

    const departments = departmentsResult.success ? departmentsResult.departments : []

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
                                <UserPlusIcon className="h-5 w-5 mr-2 text-blue-600" />
                                Add New Employee
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Employee Information</CardTitle>
                        <p className="text-sm text-gray-600">
                            Fill out the form below to add a new employee to your organization.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <AddEmployeeForm
                            departments={departments || []}
                            locations={locations || []}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 