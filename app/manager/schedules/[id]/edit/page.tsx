import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getScheduleById } from "@/actions/schedules"
import { getAllTeamMembers } from "@/actions"
import { getDepartments } from "@/actions/employees"
import { getOrganizationLocations } from "@/actions/locations"
import { getOrganizationTeams } from "@/actions/teams"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeftIcon, EditIcon } from "lucide-react"
import { EditScheduleForm } from "./components/edit-schedule-form"

interface EditSchedulePageProps {
    params: Promise<{
        id: string
    }>
}

export default async function EditSchedulePage({ params }: EditSchedulePageProps) {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect("/login")
    }

    if (session.user.role !== "MANAGER" && session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
        redirect("/dashboard")
    }

    // Await params in Next.js 15
    const { id } = await params

    // Get schedule and form data
    const [scheduleResult, employees, departmentsResult, locations, teamsResult] = await Promise.all([
        getScheduleById(id),
        getAllTeamMembers(),
        getDepartments(),
        getOrganizationLocations(),
        getOrganizationTeams()
    ])

    if (!scheduleResult.success || !scheduleResult.schedule) {
        redirect("/manager/schedules")
    }

    if (!departmentsResult.success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Data</h1>
                    <p className="text-gray-600">
                        Unable to load required data for schedule editing.
                    </p>
                </div>
            </div>
        )
    }

    const schedule = scheduleResult.schedule
    const departments = departmentsResult.departments || []
    const teams = teamsResult.success ? (teamsResult.teams || []) : []

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/manager/schedules"
                                className="flex items-center text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors"
                            >
                                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                                Back to Schedules
                            </Link>
                            <div className="h-6 border-l border-gray-300" />
                            <h1 className="text-xl font-semibold text-gray-900 flex items-center">
                                <EditIcon className="h-5 w-5 mr-2 text-blue-600" />
                                Edit Schedule: {schedule.title}
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Schedule Information</CardTitle>
                        <p className="text-sm text-gray-600">
                            Update the schedule information below. Changes will be saved when you submit the form.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <EditScheduleForm
                            schedule={schedule}
                            employees={employees}
                            departments={departments}
                            locations={locations}
                            teams={teams}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 