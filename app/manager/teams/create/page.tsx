import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getAllTeamMembers } from "@/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeftIcon, UsersIcon } from "lucide-react"
import { CreateTeamForm } from "./components/create-team-form"
import { Employee } from "@/types/teams"

export default async function CreateTeamPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect("/login")
    }

    if (session.user.role !== "MANAGER" && session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
        redirect("/dashboard")
    }

    // Get all employees for team member selection
    const employeesResult = await getAllTeamMembers()
    const employees: Employee[] = Array.isArray(employeesResult) ? employeesResult : []

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/manager/teams"
                                className="flex items-center text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors"
                            >
                                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                                Back to Teams
                            </Link>
                            <div className="h-6 border-l border-gray-300" />
                            <h1 className="text-xl font-semibold text-gray-900 flex items-center">
                                <UsersIcon className="h-5 w-5 mr-2 text-blue-600" />
                                Create Team
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Team Information</CardTitle>
                        <p className="text-sm text-gray-600">
                            Create a new team to group employees for easier schedule management.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <CreateTeamForm employees={employees} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 