"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    CalendarIcon,
    ClockIcon,
    PlusIcon,
    DownloadIcon,
    EyeIcon,
    RefreshCwIcon
} from "lucide-react"
import {
    getEmployeeTimesheets,
    generateTimesheetFromClockEvents,
    getWeeklyTimesheet
} from "@/actions"
import { toast } from "sonner"

interface Timesheet {
    id: string
    startDate: Date
    endDate: Date
    totalHours: number
    regularHours: number
    overtimeHours: number
    breakHours: number
    status: string
    submittedAt?: Date | null
    approvedAt?: Date | null
    user: {
        id: string
        name: string | null
        email: string
        employeeId?: string | null
    }
    approver?: {
        id: string
        name: string | null
        email: string
    } | null
}

interface WeeklyData {
    startDate: string
    endDate: string
    totalHours: number
    dailyHours: {
        date: string
        hours: number
        clockIn?: string
        clockOut?: string
        breaks: { start: string, end?: string }[]
    }[]
}

export function TimesheetClient() {
    const [timesheets, setTimesheets] = useState<Timesheet[]>([])
    const [weeklyData, setWeeklyData] = useState<WeeklyData | null>(null)
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [selectedWeek, setSelectedWeek] = useState("")

    // Set default dates (current week)
    useEffect(() => {
        const today = new Date()
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - today.getDay()) // Sunday

        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6) // Saturday

        setStartDate(startOfWeek.toISOString().split('T')[0])
        setEndDate(endOfWeek.toISOString().split('T')[0])
        setSelectedWeek(startOfWeek.toISOString().split('T')[0])
    }, [])

    const loadTimesheets = async () => {
        try {
            setLoading(true)
            const result = await getEmployeeTimesheets()
            if (result.success && result.timesheets) {
                setTimesheets(result.timesheets)
            }
        } catch (error) {
            console.error("Failed to load timesheets:", error)
            toast.error("Failed to load timesheets")
        } finally {
            setLoading(false)
        }
    }

    const loadWeeklyData = async (weekStart: string) => {
        try {
            const result = await getWeeklyTimesheet(weekStart)
            if (result.success && result.weeklyData) {
                setWeeklyData(result.weeklyData)
            }
        } catch (error) {
            console.error("Failed to load weekly data:", error)
        }
    }

    useEffect(() => {
        loadTimesheets()
    }, [])

    useEffect(() => {
        if (selectedWeek) {
            loadWeeklyData(selectedWeek)
        }
    }, [selectedWeek])

    const handleGenerateTimesheet = async () => {
        if (!startDate || !endDate) {
            toast.error("Please select start and end dates")
            return
        }

        try {
            setGenerating(true)
            const result = await generateTimesheetFromClockEvents(startDate, endDate)
            if (result.success) {
                toast.success("Timesheet generated successfully!")
                loadTimesheets() // Refresh the list
            } else {
                toast.error(result.error || "Failed to generate timesheet")
            }
        } catch (error) {
            console.error("Failed to generate timesheet:", error)
            toast.error("An unexpected error occurred")
        } finally {
            setGenerating(false)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>
            case 'APPROVED':
                return <Badge variant="outline" className="text-green-600 border-green-600">Approved</Badge>
            case 'REJECTED':
                return <Badge variant="outline" className="text-red-600 border-red-600">Rejected</Badge>
            case 'DRAFT':
                return <Badge variant="outline" className="text-gray-600 border-gray-600">Draft</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const formatHours = (hours: number) => {
        return `${hours.toFixed(2)}h`
    }

    const getDayName = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', { weekday: 'short' })
    }

    return (
        <div className="space-y-8">
            {/* Current Week Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <CalendarIcon className="h-5 w-5 mr-2 text-blue-600" />
                            This Week's Hours
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <Label htmlFor="week-select">Week Starting:</Label>
                                <Input
                                    id="week-select"
                                    type="date"
                                    value={selectedWeek}
                                    onChange={(e) => setSelectedWeek(e.target.value)}
                                    className="w-auto"
                                />
                            </div>

                            {weeklyData && (
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                        <span className="font-medium text-blue-900">Total Hours</span>
                                        <span className="text-xl font-bold text-blue-900">
                                            {formatHours(weeklyData.totalHours)}
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        {weeklyData.dailyHours.map((day) => (
                                            <div key={day.date} className="flex justify-between items-center py-2 border-b border-gray-100">
                                                <div className="flex items-center space-x-3">
                                                    <span className="font-medium text-gray-900 w-12">
                                                        {getDayName(day.date)}
                                                    </span>
                                                    <span className="text-sm text-gray-500">
                                                        {new Date(day.date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-medium">{formatHours(day.hours)}</div>
                                                    {day.clockIn && day.clockOut && (
                                                        <div className="text-xs text-gray-500">
                                                            {day.clockIn} - {day.clockOut}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Generate Timesheet */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <PlusIcon className="h-5 w-5 mr-2 text-green-600" />
                            Generate Timesheet
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="start-date">Start Date</Label>
                                    <Input
                                        id="start-date"
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="end-date">End Date</Label>
                                    <Input
                                        id="end-date"
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            <Button
                                onClick={handleGenerateTimesheet}
                                disabled={generating || !startDate || !endDate}
                                className="w-full"
                            >
                                {generating ? (
                                    <>
                                        <RefreshCwIcon className="h-4 w-4 mr-2 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <PlusIcon className="h-4 w-4 mr-2" />
                                        Generate Timesheet
                                    </>
                                )}
                            </Button>

                            <p className="text-xs text-gray-500">
                                This will create a timesheet based on your clock in/out events for the selected period.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Separator />

            {/* Timesheet History */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Timesheet History</h2>
                    <Button variant="outline" onClick={loadTimesheets} disabled={loading}>
                        <RefreshCwIcon className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                </div>

                {loading ? (
                    <div className="text-center py-8">
                        <div className="text-gray-500">Loading timesheets...</div>
                    </div>
                ) : timesheets.length === 0 ? (
                    <div className="text-center py-8">
                        <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No timesheets found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Generate your first timesheet using the form above.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {timesheets.map((timesheet) => (
                            <Card key={timesheet.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="text-sm font-medium text-gray-900">
                                            {formatDate(timesheet.startDate)} - {formatDate(timesheet.endDate)}
                                        </div>
                                        {getStatusBadge(timesheet.status)}
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Total Hours:</span>
                                            <span className="font-medium">{formatHours(timesheet.totalHours)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Regular:</span>
                                            <span className="font-medium">{formatHours(timesheet.regularHours)}</span>
                                        </div>
                                        {timesheet.overtimeHours > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Overtime:</span>
                                                <span className="font-medium text-orange-600">{formatHours(timesheet.overtimeHours)}</span>
                                            </div>
                                        )}
                                        {timesheet.breakHours > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Break Time:</span>
                                                <span className="font-medium">{formatHours(timesheet.breakHours)}</span>
                                            </div>
                                        )}
                                    </div>

                                    {timesheet.submittedAt && (
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                            <div className="text-xs text-gray-500">
                                                Submitted: {new Date(timesheet.submittedAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-3 flex space-x-2">
                                        <Button variant="outline" size="sm" className="flex-1">
                                            <EyeIcon className="h-3 w-3 mr-1" />
                                            View
                                        </Button>
                                        <Button variant="outline" size="sm" className="flex-1">
                                            <DownloadIcon className="h-3 w-3 mr-1" />
                                            Export
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
} 