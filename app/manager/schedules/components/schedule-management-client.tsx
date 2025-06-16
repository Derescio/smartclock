"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    CalendarIcon,
    SearchIcon,
    MoreVerticalIcon,
    EditIcon,
    TrashIcon,
    CheckIcon,
    XIcon,
    ClockIcon,
    MapPinIcon,
    UsersIcon,
} from "lucide-react"
import { approveSchedule, rejectSchedule, deleteSchedule } from "@/actions/schedules"
import { toast } from "sonner"

interface Schedule {
    id: string
    title: string
    description?: string | null
    scheduleType: string
    status: string
    startDate: Date
    endDate?: Date | null
    startTime: string
    endTime: string
    breakDuration?: number | null
    isRecurring: boolean
    recurrence?: string | null
    recurrenceDays?: string | null
    user?: {
        id: string
        name: string | null
        email: string
        employeeId?: string | null
    } | null
    department?: {
        id: string
        name: string
        color?: string | null
    } | null
    location?: {
        id: string
        name: string
        address: string
    } | null
    creator: {
        id: string
        name: string | null
        email: string
    }
    approver?: {
        id: string
        name: string | null
        email: string
    } | null
}

interface ScheduleManagementClientProps {
    schedules: Schedule[]
}

export function ScheduleManagementClient({ schedules }: ScheduleManagementClientProps) {
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [scheduleToDelete, setScheduleToDelete] = useState<Schedule | null>(null)

    // Filter schedules based on search term
    const filteredSchedules = schedules.filter(schedule =>
        schedule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.department?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.location?.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleApprove = async (schedule: Schedule) => {
        setIsLoading(true)
        try {
            const result = await approveSchedule(schedule.id)
            if (result.success) {
                toast.success("Schedule approved successfully")
                router.refresh()
            } else {
                toast.error(result.error || "Failed to approve schedule")
            }
        } catch (error) {
            toast.error("An unexpected error occurred: " + error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleReject = async (schedule: Schedule) => {
        setIsLoading(true)
        try {
            const result = await rejectSchedule(schedule.id, "Rejected by manager")
            if (result.success) {
                toast.success("Schedule rejected")
                router.refresh()
            } else {
                toast.error(result.error || "Failed to reject schedule")
            }
        } catch (error) {
            toast.error("An unexpected error occurred: " + error)
        } finally {
            setIsLoading(false)
        }
    }

    const openDeleteDialog = (schedule: Schedule) => {
        setScheduleToDelete(schedule)
        setDeleteDialogOpen(true)
    }

    const handleDelete = async () => {
        if (!scheduleToDelete) return

        setIsLoading(true)
        try {
            const result = await deleteSchedule(scheduleToDelete.id)
            if (result.success) {
                toast.success("Schedule deleted successfully")
                router.refresh()
                setDeleteDialogOpen(false)
                setScheduleToDelete(null)
            } else {
                toast.error(result.error || "Failed to delete schedule")
            }
        } catch (error) {
            toast.error("An unexpected error occurred: " + error)
        } finally {
            setIsLoading(false)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <Badge variant="outline" className="text-orange-600 border-orange-600">Pending</Badge>
            case 'APPROVED':
                return <Badge variant="default" className="bg-green-600">Approved</Badge>
            case 'REJECTED':
                return <Badge variant="destructive">Rejected</Badge>
            case 'CANCELLED':
                return <Badge variant="secondary">Cancelled</Badge>
            case 'COMPLETED':
                return <Badge variant="outline">Completed</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':')
        const hour = parseInt(hours)
        const ampm = hour >= 12 ? 'PM' : 'AM'
        const displayHour = hour % 12 || 12
        return `${displayHour}:${minutes} ${ampm}`
    }

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    return (
        <div className="space-y-6">
            {/* Search */}
            <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                    placeholder="Search schedules by title, employee, department, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Schedules Grid */}
            {filteredSchedules.length === 0 ? (
                <div className="text-center py-12">
                    <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No schedules found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first schedule.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSchedules.map((schedule) => (
                        <Card key={schedule.id} className="relative">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-lg flex items-center space-x-2">
                                            <CalendarIcon className="h-5 w-5 text-blue-600" />
                                            <span>{schedule.title}</span>
                                        </CardTitle>
                                        {schedule.description && (
                                            <p className="text-sm text-gray-600 mt-1">{schedule.description}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {getStatusBadge(schedule.status)}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreVerticalIcon className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() => router.push(`/manager/schedules/${schedule.id}/edit`)}
                                                >
                                                    <EditIcon className="h-4 w-4 mr-2" />
                                                    Edit Schedule
                                                </DropdownMenuItem>
                                                {schedule.status === 'PENDING' && (
                                                    <>
                                                        <DropdownMenuItem
                                                            onClick={() => handleApprove(schedule)}
                                                            disabled={isLoading}
                                                            className="text-green-600"
                                                        >
                                                            <CheckIcon className="h-4 w-4 mr-2" />
                                                            Approve
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleReject(schedule)}
                                                            disabled={isLoading}
                                                            className="text-red-600"
                                                        >
                                                            <XIcon className="h-4 w-4 mr-2" />
                                                            Reject
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                                <DropdownMenuItem
                                                    onClick={() => openDeleteDialog(schedule)}
                                                    disabled={isLoading}
                                                    className="text-red-600"
                                                >
                                                    <TrashIcon className="h-4 w-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Date and Time */}
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2 text-sm">
                                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                                        <span>{formatDate(schedule.startDate)}</span>
                                        {schedule.endDate && (
                                            <>
                                                <span>-</span>
                                                <span>{formatDate(schedule.endDate)}</span>
                                            </>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-2 text-sm">
                                        <ClockIcon className="h-4 w-4 text-gray-400" />
                                        <span>{formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}</span>
                                        {schedule.breakDuration && (
                                            <span className="text-gray-500">({schedule.breakDuration}min break)</span>
                                        )}
                                    </div>
                                </div>

                                {/* Assignment */}
                                <div className="space-y-2">
                                    {schedule.user && (
                                        <div className="flex items-center space-x-2 text-sm">
                                            <UsersIcon className="h-4 w-4 text-purple-600" />
                                            <span>{schedule.user.name || schedule.user.email}</span>
                                        </div>
                                    )}
                                    {schedule.department && (
                                        <div className="flex items-center space-x-2 text-sm">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: schedule.department.color || '#6B7280' }}
                                            />
                                            <span>{schedule.department.name}</span>
                                        </div>
                                    )}
                                    {schedule.location && (
                                        <div className="flex items-center space-x-2 text-sm">
                                            <MapPinIcon className="h-4 w-4 text-green-600" />
                                            <span>{schedule.location.name}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Creator */}
                                <div className="pt-2 border-t text-xs text-gray-500">
                                    Created by {schedule.creator.name || schedule.creator.email}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Schedule</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{scheduleToDelete?.title}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isLoading}
                        >
                            {isLoading ? "Deleting..." : "Delete Schedule"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
} 