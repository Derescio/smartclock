import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ClockIcon, MapPinIcon } from "lucide-react"
import { getTeamActivity } from "../actions"
import RefreshButton from "./refresh-button"

export default async function RecentTeamActivityServer() {
    const activities = await getTeamActivity()

    const getActivityColor = (type: string) => {
        switch (type) {
            case 'CLOCK_IN': return 'bg-green-100 text-green-800'
            case 'CLOCK_OUT': return 'bg-red-100 text-red-800'
            case 'BREAK_START': return 'bg-yellow-100 text-yellow-800'
            case 'BREAK_END': return 'bg-blue-100 text-blue-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getActivityText = (type: string) => {
        switch (type) {
            case 'CLOCK_IN': return 'Clocked In'
            case 'CLOCK_OUT': return 'Clocked Out'
            case 'BREAK_START': return 'Break Started'
            case 'BREAK_END': return 'Break Ended'
            default: return type
        }
    }

    const getMethodIcon = (method: string) => {
        switch (method) {
            case 'GEOFENCE': return '📍'
            case 'QR_CODE': return '📱'
            case 'MANUAL': return '✋'
            default: return '❓'
        }
    }

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

        if (diffInMinutes < 1) return 'Just now'
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
        return date.toLocaleDateString()
    }

    const formatTimeDetailed = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center font-heading">
                        <ClockIcon className="h-5 w-5 mr-2 text-blue-600" />
                        Recent Activity
                    </CardTitle>
                    <RefreshButton />
                </div>
            </CardHeader>
            <CardContent>
                {activities.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No recent activity found.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {activities.slice(0, 10).map((activity) => (
                            <div key={activity.id} className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-sm">{getMethodIcon(activity.method)}</span>
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {activity.userName}
                                        </p>
                                        <Badge className={getActivityColor(activity.type)}>
                                            {getActivityText(activity.type)}
                                        </Badge>
                                    </div>

                                    <div className="mt-1 flex items-center space-x-2 text-xs text-gray-500">
                                        <span>{formatTimeDetailed(activity.timestamp)}</span>
                                        <span>•</span>
                                        <span>{formatTime(activity.timestamp)}</span>
                                        {activity.location && (
                                            <>
                                                <span>•</span>
                                                <div className="flex items-center">
                                                    <MapPinIcon className="h-3 w-3 mr-1" />
                                                    <span className="truncate">{activity.location.name}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {activities.length > 10 && (
                            <div className="text-center pt-4">
                                <button className="text-sm text-blue-600 hover:text-blue-800">
                                    View all activity
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
} 