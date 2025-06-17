"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    CalendarIcon,
    ClockIcon,
    CheckIcon,
    XIcon,
    UserIcon,
    BuildingIcon,
    EyeIcon,
    CheckCircleIcon,
    XCircleIcon,
    SearchIcon
} from "lucide-react"
import {
    getAllPendingTimesheets,
    approveTimesheet,
    rejectTimesheet,
    bulkApproveTimesheets
} from "@/actions"
import { toast } from "sonner"

interface PendingTimesheet {
    id: string
    startDate: Date
    endDate: Date
    totalHours: number
    regularHours: number
    overtimeHours: number
    breakHours: number
    status: string
    submittedAt?: Date | null
    user: {
        id: string
        name: string | null
        email: string
        employeeId?: string | null
        role: string
        department?: {
            id: string
            name: string
            color?: string | null
        } | null
    }
    approver?: {
        id: string
        name: string | null
        email: string
    } | null
}

interface TimesheetApprovalClientProps {
    userRole: string
}

export function TimesheetApprovalClient({ userRole }: TimesheetApprovalClientProps) {
    const [timesheets, setTimesheets] = useState<PendingTimesheet[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedTimesheets, setSelectedTimesheets] = useState<string[]>([])
    const [showApprovalDialog, setShowApprovalDialog] = useState(false)
    const [showRejectionDialog, setShowRejectionDialog] = useState(false)
    const [selectedTimesheetId, setSelectedTimesheetId] = useState<string | null>(null)
    const [notes, setNotes] = useState("")
    const [processing, setProcessing] = useState(false)

    const loadPendingTimesheets = async () => {
        try {
            setLoading(true)
            const result = await getAllPendingTimesheets()
            if (result.success && result.timesheets) {
                setTimesheets(result.timesheets)
            } else {
                toast.error(result.error || "Failed to load pending timesheets")
            }
        } catch (error) {
            console.error("Failed to load pending timesheets:", error)
            toast.error("Failed to load pending timesheets")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadPendingTimesheets()
    }, [])

    const filteredTimesheets = timesheets.filter(timesheet =>
        timesheet.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        timesheet.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        timesheet.user.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        timesheet.user.department?.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleSelectTimesheet = (timesheetId: string) => {
        setSelectedTimesheets(prev =>
            prev.includes(timesheetId)
                ? prev.filter(id => id !== timesheetId)
                : [...prev, timesheetId]
        )
    }

    const handleSelectAll = () => {
        if (selectedTimesheets.length === filteredTimesheets.length) {
            setSelectedTimesheets([])
        } else {
            setSelectedTimesheets(filteredTimesheets.map(t => t.id))
        }
    }

    const handleApproveTimesheet = async (timesheetId: string, notes?: string) => {
        try {
            setProcessing(true)
            const result = await approveTimesheet(timesheetId, notes)
            if (result.success) {
                toast.success("Timesheet approved successfully!")
                loadPendingTimesheets()
                setShowApprovalDialog(false)
                setNotes("")
                setSelectedTimesheetId(null)
            } else {
                toast.error(result.error || "Failed to approve timesheet")
            }
        } catch (error) {
            console.error("Failed to approve timesheet:", error)
            toast.error("An unexpected error occurred")
        } finally {
            setProcessing(false)
        }
    }

    const handleRejectTimesheet = async (timesheetId: string, notes: string) => {
        try {
            setProcessing(true)
            const result = await rejectTimesheet(timesheetId, notes)
            if (result.success) {
                toast.success("Timesheet rejected successfully!")
                loadPendingTimesheets()
                setShowRejectionDialog(false)
                setNotes("")
                setSelectedTimesheetId(null)
            } else {
                toast.error(result.error || "Failed to reject timesheet")
            }
        } catch (error) {
            console.error("Failed to reject timesheet:", error)
            toast.error("An unexpected error occurred")
        } finally {
            setProcessing(false)
        }
    }

    const handleBulkApprove = async () => {
        if (selectedTimesheets.length === 0) {
            toast.error("Please select timesheets to approve")
            return
        }

        try {
            setProcessing(true)
            const result = await bulkApproveTimesheets(selectedTimesheets, notes)
            if (result.success) {
                toast.success(result.message || "Timesheets approved successfully!")
                loadPendingTimesheets()
                setSelectedTimesheets([])
                setNotes("")
            } else {
                toast.error(result.error || "Failed to approve timesheets")
            }
        } catch (error) {
            console.error("Failed to bulk approve timesheets:", error)
            toast.error("An unexpected error occurred")
        } finally {
            setProcessing(false)
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

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'EMPLOYEE':
                return <Badge variant="outline" className="text-blue-600 border-blue-600">Employee</Badge>
            case 'MANAGER':
                return <Badge variant="outline" className="text-green-600 border-green-600">Manager</Badge>
            case 'ADMIN':
                return <Badge variant="outline" className="text-purple-600 border-purple-600">Admin</Badge>
            default:
                return <Badge variant="outline">{role}</Badge>
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <ClockIcon className="mx-auto h-8 w-8 text-gray-400 animate-spin" />
                    <p className="mt-2 text-sm text-gray-600">Loading pending timesheets...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Search and Bulk Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                        placeholder="Search by employee name, email, ID, or department..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                {selectedTimesheets.length > 0 && (
                    <div className="flex gap-2">
                        <Button
                            onClick={handleBulkApprove}
                            disabled={processing}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            <CheckCircleIcon className="h-4 w-4 mr-2" />
                            Approve Selected ({selectedTimesheets.length})
                        </Button>
                    </div>
                )}
            </div>

            {/* Bulk Selection */}
            {filteredTimesheets.length > 0 && (
                <div className="flex items-center space-x-2">
                    <Checkbox
                        checked={selectedTimesheets.length === filteredTimesheets.length}
                        onCheckedChange={handleSelectAll}
                        id="select-all"
                    />
                    <Label htmlFor="select-all" className="text-sm text-gray-600">
                        Select All ({filteredTimesheets.length} timesheets)
                    </Label>
                </div>
            )}

            {/* Timesheets List */}
            {filteredTimesheets.length === 0 ? (
                <div className="text-center py-12">
                    <CheckCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No pending timesheets</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {searchTerm ? 'Try adjusting your search terms.' : 'All timesheets have been reviewed.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredTimesheets.map((timesheet) => (
                        <Card key={timesheet.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            checked={selectedTimesheets.includes(timesheet.id)}
                                            onCheckedChange={() => handleSelectTimesheet(timesheet.id)}
                                        />
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                {timesheet.user.name || timesheet.user.email}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {timesheet.user.employeeId && `ID: ${timesheet.user.employeeId}`}
                                            </div>
                                        </div>
                                    </div>
                                    {getRoleBadge(timesheet.user.role)}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Date Range */}
                                <div className="flex items-center space-x-2 text-sm">
                                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                                    <span>
                                        {formatDate(timesheet.startDate)} - {formatDate(timesheet.endDate)}
                                    </span>
                                </div>

                                {/* Department */}
                                {timesheet.user.department && (
                                    <div className="flex items-center space-x-2 text-sm">
                                        <BuildingIcon className="h-4 w-4 text-gray-400" />
                                        <span>{timesheet.user.department.name}</span>
                                    </div>
                                )}

                                {/* Hours Summary */}
                                <div className="space-y-2">
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

                                {/* Submission Date */}
                                {timesheet.submittedAt && (
                                    <div className="text-xs text-gray-500">
                                        Submitted: {new Date(timesheet.submittedAt).toLocaleDateString()}
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex space-x-2 pt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedTimesheetId(timesheet.id)
                                            setShowApprovalDialog(true)
                                        }}
                                        className="flex-1 text-green-600 border-green-600 hover:bg-green-50"
                                    >
                                        <CheckIcon className="h-3 w-3 mr-1" />
                                        Approve
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedTimesheetId(timesheet.id)
                                            setShowRejectionDialog(true)
                                        }}
                                        className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                                    >
                                        <XIcon className="h-3 w-3 mr-1" />
                                        Reject
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Approval Dialog */}
            <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Approve Timesheet</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to approve this timesheet? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="approval-notes">Notes (Optional)</Label>
                            <Textarea
                                id="approval-notes"
                                placeholder="Add any notes about the approval..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowApprovalDialog(false)
                                setNotes("")
                                setSelectedTimesheetId(null)
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => selectedTimesheetId && handleApproveTimesheet(selectedTimesheetId, notes)}
                            disabled={processing}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {processing ? "Approving..." : "Approve Timesheet"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Rejection Dialog */}
            <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Timesheet</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting this timesheet. The employee will see this feedback.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="rejection-notes">Rejection Reason *</Label>
                            <Textarea
                                id="rejection-notes"
                                placeholder="Please explain why this timesheet is being rejected..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowRejectionDialog(false)
                                setNotes("")
                                setSelectedTimesheetId(null)
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => selectedTimesheetId && handleRejectTimesheet(selectedTimesheetId, notes)}
                            disabled={processing || !notes.trim()}
                        >
                            {processing ? "Rejecting..." : "Reject Timesheet"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
} 