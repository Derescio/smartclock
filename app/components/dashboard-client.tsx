"use client"

import { useRef, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CalendarIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import ClockInOut from "./clock-in-out"
import RecentActivity from "./recent-activity"
import QuickStats from "./quick-stats"
import { getTodaysSchedule } from "@/actions"

interface Schedule {
    id: string
    title: string
    description?: string | null
    scheduleType: string
    startTime: string
    endTime: string
    breakDuration?: number | null
    location?: {
        id: string
        name: string
        address: string
    } | null
    department?: {
        id: string
        name: string
        color?: string | null
    } | null
    Team?: {
        id: string
        name: string
        color?: string | null
    } | null
}

export default function DashboardClient() {
    const router = useRouter()
    const recentActivityRef = useRef<{ refresh: () => void }>(null)
    const [todaysSchedules, setTodaysSchedules] = useState<Schedule[]>([])
    const [loading, setLoading] = useState(true)

    const handleClockAction = () => {
        // Refresh recent activity when clock actions happen
        recentActivityRef.current?.refresh()
    }

    const loadTodaysSchedule = async () => {
        try {
            setLoading(true)
            const result = await getTodaysSchedule()
            if (result.success && result.schedules) {
                setTodaysSchedules(result.schedules)
            }
        } catch (error) {
            console.error("Failed to load today's schedule:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadTodaysSchedule()
    }, [])

    const handleViewTimesheet = () => {
        router.push("/timesheets")
    }

    const formatTime = (timeString: string) => {
        const [hours, minutes] = timeString.split(':')
        const hour = parseInt(hours)
        const ampm = hour >= 12 ? 'PM' : 'AM'
        const displayHour = hour % 12 || 12
        return `${displayHour}:${minutes} ${ampm}`
    }

    const getBreakTime = (schedule: Schedule) => {
        if (!schedule.breakDuration) return null

        const startTime = new Date(`2000-01-01T${schedule.startTime}`)
        const endTime = new Date(`2000-01-01T${schedule.endTime}`)
        const totalMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60)
        const midpoint = startTime.getTime() + (totalMinutes / 2) * 60 * 1000
        const breakTime = new Date(midpoint)

        return breakTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Clock In/Out */}
            <div className="lg:col-span-2">
                <ClockInOut onClockEvent={handleClockAction} />
                <div className="mt-8">
                    <RecentActivity ref={recentActivityRef} />
                </div>
            </div>

            {/* Right Column - Stats and Info */}
            <div className="space-y-6">
                <QuickStats />

                {/* Today's Schedule */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center font-heading">
                            <CalendarIcon className="h-5 w-5 mr-2 text-blue-600" />
                            Today's Schedule
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-4">
                                <div className="text-sm text-gray-500">Loading schedule...</div>
                            </div>
                        ) : todaysSchedules.length === 0 ? (
                            <div className="text-center py-4">
                                <div className="text-sm text-gray-500">No schedule for today</div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {todaysSchedules.map((schedule) => (
                                    <div key={schedule.id} className="border rounded-lg p-3 bg-gray-50">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-medium text-gray-900">{schedule.title}</h4>
                                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                                {schedule.scheduleType}
                                            </span>
                                        </div>

                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Shift Start</span>
                                                <span className="font-medium">{formatTime(schedule.startTime)}</span>
                                            </div>

                                            {schedule.breakDuration && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600">Break Time</span>
                                                    <span className="font-medium">{getBreakTime(schedule)}</span>
                                                </div>
                                            )}

                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Shift End</span>
                                                <span className="font-medium">{formatTime(schedule.endTime)}</span>
                                            </div>

                                            {schedule.location && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600">Location</span>
                                                    <span className="font-medium text-xs">{schedule.location.name}</span>
                                                </div>
                                            )}

                                            {schedule.department && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600">Department</span>
                                                    <span className="font-medium text-xs">{schedule.department.name}</span>
                                                </div>
                                            )}

                                            {schedule.Team && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600">Team</span>
                                                    <span className="font-medium text-xs">{schedule.Team.name}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="font-heading">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button onClick={handleViewTimesheet} className="w-full btn-secondary">
                            View Timesheet
                        </Button>
                        <Button variant="outline" className="w-full">
                            Request Time Off
                        </Button>
                        <Button variant="outline" className="w-full">
                            Report Issue
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 