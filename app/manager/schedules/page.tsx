import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getOrganizationSchedules, getScheduleStats } from "@/actions/schedules"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
    ArrowLeftIcon,
    CalendarIcon,
    ClockIcon,
    UsersIcon,
    PlusIcon,
    AlertCircleIcon
} from "lucide-react"
import { ScheduleManagementClient } from "./components/schedule-management-client"

export default async function ScheduleManagementPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect("/login")
    }

    if (session.user.role !== "MANAGER" && session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
        redirect("/dashboard")
    }

    // Get schedules and statistics
    const [schedulesResult, statsResult] = await Promise.all([
        getOrganizationSchedules(),
        getScheduleStats()
    ])

    if (!schedulesResult.success || !statsResult.success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Schedules</h1>
                    <p className="text-gray-600">
                        {schedulesResult.error || statsResult.error || "Unable to load schedule data"}
                    </p>
                </div>
            </div>
        )
    }

    const schedules = schedulesResult.schedules || []
    const stats = statsResult.stats || {
        totalSchedules: 0,
        pendingSchedules: 0,
        thisWeekSchedules: 0,
        activeEmployees: 0
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/manager"
                                className="flex items-center text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors"
                            >
                                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                                Back to Dashboard
                            </Link>
                            <div className="h-6 border-l border-gray-300" />
                            <h1 className="text-xl font-semibold text-gray-900 flex items-center">
                                <CalendarIcon className="h-5 w-5 mr-2 text-blue-600" />
                                Schedule Management
                            </h1>
                        </div>
                        <Link href="/manager/schedules/create">
                            <Button className="flex items-center space-x-2">
                                <PlusIcon className="h-4 w-4" />
                                <span>Create Schedule</span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Schedules</CardTitle>
                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalSchedules}</div>
                            <p className="text-xs text-muted-foreground">
                                All active schedules
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                            <AlertCircleIcon className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{stats.pendingSchedules}</div>
                            <p className="text-xs text-muted-foreground">
                                Awaiting manager approval
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">This Week</CardTitle>
                            <ClockIcon className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.thisWeekSchedules}</div>
                            <p className="text-xs text-muted-foreground">
                                Scheduled for this week
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
                            <UsersIcon className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">{stats.activeEmployees}</div>
                            <p className="text-xs text-muted-foreground">
                                With assigned schedules
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Schedule Management Interface */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Schedules</CardTitle>
                        <p className="text-sm text-gray-600">
                            Manage employee schedules, approve pending requests, and create new schedules.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <ScheduleManagementClient schedules={schedules} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 