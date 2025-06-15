import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { UsersIcon, MapPinIcon, TrendingUpIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Providers from "../components/providers"
import Navigation from "../components/navigation"
import TeamStatusServer from "./components/team-status-server"
import TeamStatsServer from "./components/team-stats-server"
import RecentTeamActivityServer from "./components/recent-team-activity-server"
import type { SessionUser } from "@/types"

export default async function ManagerDashboard() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/login")
    }

    const user = session.user as SessionUser

    // Check if user has manager or admin permissions
    if (!['MANAGER', 'ADMIN'].includes(user.role)) {
        redirect("/") // Redirect employees to main dashboard
    }

    return (
        <Providers session={session}>
            <div className="min-h-screen bg-gray-50">
                <Navigation />

                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 font-heading">
                            Manager Dashboard
                        </h2>
                        <p className="text-gray-600 mt-1">Here's what's happening with your team today</p>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                            <span>Role: {user.role}</span>
                            <span>•</span>
                            <span>Plan: {user.planType}</span>
                            <span>•</span>
                            <span className="text-blue-600 font-medium">Manager Dashboard</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Left Column - Team Stats */}
                        <div className="lg:col-span-1">
                            <TeamStatsServer />
                        </div>

                        {/* Middle Column - Team Status */}
                        <div className="lg:col-span-2">
                            <TeamStatusServer />
                        </div>

                        {/* Right Column - Recent Activity */}
                        <div className="lg:col-span-1">
                            <RecentTeamActivityServer />
                        </div>
                    </div>

                    {/* Bottom Section - Quick Actions */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center font-heading">
                                    <UsersIcon className="h-5 w-5 mr-2 text-blue-600" />
                                    Team Management
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button className="w-full btn-secondary">View All Employees</Button>
                                <Button variant="outline" className="w-full">
                                    Add New Employee
                                </Button>
                                <Button variant="outline" className="w-full">
                                    Manage Schedules
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center font-heading">
                                    <MapPinIcon className="h-5 w-5 mr-2 text-blue-600" />
                                    Location Management
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button className="w-full btn-secondary">View Locations</Button>
                                <Button variant="outline" className="w-full">
                                    Add New Location
                                </Button>
                                <Button variant="outline" className="w-full">
                                    Update Geofences
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center font-heading">
                                    <TrendingUpIcon className="h-5 w-5 mr-2 text-blue-600" />
                                    Reports & Analytics
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button className="w-full btn-secondary">Attendance Report</Button>
                                <Button variant="outline" className="w-full">
                                    Hours Summary
                                </Button>
                                <Button variant="outline" className="w-full">
                                    Export Data
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </Providers>
    )
} 