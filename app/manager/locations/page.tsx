import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getOrganizationLocations } from "@/actions/locations"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
    MapPinIcon,
    PlusIcon,
    BuildingIcon,
    UsersIcon,
    ClockIcon,
} from "lucide-react"
import { LocationManagementClient } from "./components/location-management-client"

export default async function LocationsPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect("/login")
    }

    if (session.user.role !== "MANAGER" && session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
        redirect("/dashboard")
    }

    // Get all locations for this organization
    const locations = await getOrganizationLocations()

    // Calculate statistics
    const totalLocations = locations.length
    const activeLocations = locations.filter(loc => loc.isActive).length
    const totalUsers = locations.reduce((sum, loc) => sum + loc._count.users, 0)
    const totalClockEvents = locations.reduce((sum, loc) => sum + loc._count.clockEvents, 0)

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
                            <h1 className="text-xl font-semibold text-gray-900">Location Management</h1>
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
                                    <p className="text-sm font-medium text-gray-600">Total Locations</p>
                                    <p className="text-2xl font-bold text-gray-900">{totalLocations}</p>
                                </div>
                                <BuildingIcon className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Active Locations</p>
                                    <p className="text-2xl font-bold text-green-600">{activeLocations}</p>
                                </div>
                                <MapPinIcon className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Assigned Users</p>
                                    <p className="text-2xl font-bold text-purple-600">{totalUsers}</p>
                                </div>
                                <UsersIcon className="h-8 w-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Clock Events</p>
                                    <p className="text-2xl font-bold text-orange-600">{totalClockEvents}</p>
                                </div>
                                <ClockIcon className="h-8 w-8 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Location Management */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span className="flex items-center space-x-2">
                                <MapPinIcon className="h-5 w-5" />
                                <span>Work Locations</span>
                            </span>
                            <div className="flex space-x-2">
                                <Link href="/manager/locations/add">
                                    <Button>
                                        <PlusIcon className="h-4 w-4 mr-2" />
                                        Add Location
                                    </Button>
                                </Link>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <LocationManagementClient locations={locations} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 