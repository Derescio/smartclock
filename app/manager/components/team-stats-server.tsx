import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UsersIcon, ClockIcon, TrendingUpIcon, AlertCircleIcon } from "lucide-react"
import { getTeamStats } from "@/actions/team"
import Link from "next/link"

export default async function TeamStatsServer() {
    const stats = await getTeamStats()

    const formatHours = (hours: number) => {
        return `${hours.toFixed(1)}h`
    }

    const formatPercentage = (percentage: number) => {
        return `${Math.round(percentage)}%`
    }

    return (
        <div className="space-y-4">
            {/* Total Employees */}
            <Link href="/manager/employees">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <UsersIcon className="h-8 w-8 text-blue-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
                                <p className="text-xs text-blue-600 hover:text-blue-800">Click to manage →</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </Link>

            {/* Currently Working */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center">
                        <ClockIcon className="h-8 w-8 text-green-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Currently Working</p>
                            <p className="text-2xl font-bold text-green-600">{stats.currentlyWorking}</p>
                            <p className="text-xs text-gray-500">
                                {stats.onBreak > 0 && `${stats.onBreak} on break`}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Today's Hours */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center">
                        <TrendingUpIcon className="h-8 w-8 text-purple-600" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Hours Today</p>
                            <p className="text-2xl font-bold text-purple-600">
                                {formatHours(stats.totalHoursToday)}
                            </p>
                            <p className="text-xs text-gray-500">
                                Avg: {formatHours(stats.averageHoursPerEmployee)} per employee
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Attendance Rate */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center">
                        <AlertCircleIcon className={`h-8 w-8 ${stats.attendanceRate >= 90 ? 'text-green-600' :
                            stats.attendanceRate >= 75 ? 'text-yellow-600' : 'text-red-600'
                            }`} />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                            <p className={`text-2xl font-bold ${stats.attendanceRate >= 90 ? 'text-green-600' :
                                stats.attendanceRate >= 75 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                {formatPercentage(stats.attendanceRate)}
                            </p>
                            <p className="text-xs text-gray-500">Today</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Status Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Status Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Working</span>
                            <span className="text-sm font-medium text-green-600">
                                {stats.currentlyWorking}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">On Break</span>
                            <span className="text-sm font-medium text-yellow-600">
                                {stats.onBreak}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Clocked Out</span>
                            <span className="text-sm font-medium text-gray-600">
                                {stats.clockedOut}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 