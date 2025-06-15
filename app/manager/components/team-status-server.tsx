import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { UsersIcon, ClockIcon, MapPinIcon } from "lucide-react"
import { getTeamStatus } from "@/actions"
import RefreshButton from "@/app/manager/components/refresh-button"

export default async function TeamStatusServer() {
    const teamMembers = await getTeamStatus()

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CLOCKED_IN': return 'bg-green-100 text-green-800'
            case 'ON_BREAK': return 'bg-yellow-100 text-yellow-800'
            case 'CLOCKED_OUT': return 'bg-gray-100 text-gray-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case 'CLOCKED_IN': return 'Working'
            case 'ON_BREAK': return 'On Break'
            case 'CLOCKED_OUT': return 'Clocked Out'
            default: return 'Unknown'
        }
    }

    const formatHours = (hours: number) => {
        const h = Math.floor(hours)
        const m = Math.round((hours - h) * 60)
        return `${h}h ${m}m`
    }

    const formatTime = (dateString: string) => {
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
                        <UsersIcon className="h-5 w-5 mr-2 text-blue-600" />
                        Team Status ({teamMembers.length} members)
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                            Updated {new Date().toLocaleTimeString()}
                        </span>
                        <RefreshButton />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {teamMembers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No team members found. Add employees to see their status here.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {teamMembers.map((member) => (
                            <div
                                key={member.id}
                                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3">
                                        <div>
                                            <h3 className="font-medium text-gray-900">{member.name}</h3>
                                            <p className="text-sm text-gray-500">{member.email}</p>
                                        </div>
                                        <Badge className={getStatusColor(member.currentStatus)}>
                                            {getStatusText(member.currentStatus)}
                                        </Badge>
                                    </div>

                                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                                        <div className="flex items-center">
                                            <ClockIcon className="h-4 w-4 mr-1" />
                                            <span>Today: {formatHours(member.todayHours)}</span>
                                        </div>

                                        {member.breakTime > 0 && (
                                            <div className="flex items-center">
                                                <span>Break: {formatHours(member.breakTime)}</span>
                                            </div>
                                        )}

                                        {member.location && (
                                            <div className="flex items-center">
                                                <MapPinIcon className="h-4 w-4 mr-1" />
                                                <span>{member.location.name}</span>
                                            </div>
                                        )}
                                    </div>

                                    {member.currentStatus === 'CLOCKED_IN' && member.clockedInAt && (
                                        <div className="mt-1 text-xs text-gray-500">
                                            Clocked in at {formatTime(member.clockedInAt)}
                                        </div>
                                    )}

                                    {member.currentStatus === 'ON_BREAK' && member.lastBreakStart && (
                                        <div className="mt-1 text-xs text-gray-500">
                                            Break started at {formatTime(member.lastBreakStart)}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Button variant="outline" size="sm">
                                        View Details
                                    </Button>
                                    {member.currentStatus !== 'CLOCKED_OUT' && (
                                        <Button variant="outline" size="sm">
                                            Edit Time
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
} 