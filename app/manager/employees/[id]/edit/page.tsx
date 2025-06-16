import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getEmployee, getDepartments } from "@/actions/employees"
import { getOrganizationLocations } from "@/actions/locations"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeftIcon, UserIcon } from "lucide-react"
import { EditEmployeeForm } from "./components/edit-employee-form"

interface EditEmployeePageProps {
    params: Promise<{
        id: string
    }>
}

export default async function EditEmployeePage({ params }: EditEmployeePageProps) {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect("/login")
    }

    if (session.user.role !== "MANAGER" && session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
        redirect("/dashboard")
    }

    // Await params in Next.js 15
    const { id } = await params

    // Get employee data, departments, and locations
    const [employeeResult, departmentsResult, locations] = await Promise.all([
        getEmployee(id),
        getDepartments(),
        getOrganizationLocations()
    ])

    if (!employeeResult.success || !employeeResult.employee) {
        redirect("/manager/employees")
    }

    const employee = employeeResult.employee
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
                                <UserIcon className="h-5 w-5 mr-2 text-blue-600" />
                                Edit Employee: {employee.name}
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
                            Update the employee information below. Changes will be saved immediately.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <EditEmployeeForm
                            employee={employee}
                            departments={departments || []}
                            locations={locations || []}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 