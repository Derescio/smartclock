"use client"

import { useRef } from "react"
import { CalendarIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import ClockInOut from "./clock-in-out"
import RecentActivity from "./recent-activity"
import QuickStats from "./quick-stats"

export default function DashboardClient() {
    const recentActivityRef = useRef<{ refresh: () => void }>(null)

    const handleClockAction = () => {
        // Refresh recent activity when clock actions happen
        recentActivityRef.current?.refresh()
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Clock In/Out */}
            <div className="lg:col-span-2">
                <ClockInOut onClockAction={handleClockAction} />
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
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Shift Start</span>
                                <span className="font-medium">9:00 AM</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Lunch Break</span>
                                <span className="font-medium">12:00 PM</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Shift End</span>
                                <span className="font-medium">5:00 PM</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="font-heading">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button className="w-full btn-secondary">View Timesheet</Button>
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