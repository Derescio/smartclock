"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    CalendarIcon,
    ClockIcon,
    UsersIcon,
    MapPinIcon,
    InfoIcon,
    RepeatIcon,
    SaveIcon,
    XIcon
} from "lucide-react"
import { updateSchedule } from "@/actions/schedules"
import { toast } from "sonner"

interface Employee {
    id: string
    name: string | null
    email: string
    employeeId?: string | null
    department?: {
        id: string
        name: string
        color?: string | null
    } | null
}

interface Department {
    id: string
    name: string
    color?: string | null
    _count: {
        employees: number
    }
}

interface Location {
    id: string
    name: string
    address: string
}

interface Team {
    id: string
    name: string
    description?: string | null
    color?: string | null
    _count: {
        members: number
    }
    manager?: {
        id: string
        name: string | null
        email: string
    } | null
}

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
    Team?: {
        id: string
        name: string
        color?: string | null
    } | null
}

interface EditScheduleFormProps {
    schedule: Schedule
    employees: Employee[]
    departments: Department[]
    locations: Location[]
    teams: Team[]
}

export function EditScheduleForm({ schedule, employees, departments, locations, teams }: EditScheduleFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    // Determine assignment type based on existing schedule
    const getAssignmentType = () => {
        if (schedule.user) return "individual"
        if (schedule.Team) return "team"
        if (schedule.department) return "department"
        if (schedule.location) return "location"
        return "none"
    }

    const [formData, setFormData] = useState({
        title: schedule.title,
        description: schedule.description || "",
        scheduleType: schedule.scheduleType,
        startDate: new Date(schedule.startDate).toISOString().split('T')[0],
        endDate: schedule.endDate ? new Date(schedule.endDate).toISOString().split('T')[0] : "",
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        breakDuration: schedule.breakDuration || 30,
        isRecurring: schedule.isRecurring,
        recurrence: schedule.recurrence || "WEEKLY",
        recurrenceDays: (() => {
            // Properly parse the JSON recurrenceDays field
            if (!schedule.recurrenceDays) return []
            try {
                return JSON.parse(schedule.recurrenceDays)
            } catch (error) {
                console.error('Error parsing recurrenceDays:', error)
                // Fallback for corrupted data - try to extract day names
                const dayMatches = schedule.recurrenceDays.match(/"(MON|TUE|WED|THU|FRI|SAT|SUN)"/g)
                if (dayMatches) {
                    return [...new Set(dayMatches.map(match => match.replace(/"/g, '')))]
                }
                return []
            }
        })(),
        recurrenceEnd: "",
        assignmentType: getAssignmentType(),
        userId: schedule.user?.id || "none",
        teamId: schedule.Team?.id || "none",
        departmentId: schedule.department?.id || "none",
        locationId: schedule.location?.id || "none"
    })

    const handleInputChange = (field: keyof typeof formData, value: string | number | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleRecurrenceDayToggle = (day: string) => {
        setFormData(prev => ({
            ...prev,
            recurrenceDays: prev.recurrenceDays.includes(day)
                ? prev.recurrenceDays.filter((d: string) => d !== day)
                : [...prev.recurrenceDays, day]
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const result = await updateSchedule(schedule.id, {
                title: formData.title,
                description: formData.description || undefined,
                scheduleType: formData.scheduleType,
                startDate: formData.startDate,
                endDate: formData.endDate || undefined,
                startTime: formData.startTime,
                endTime: formData.endTime,
                breakDuration: formData.breakDuration || undefined,
                isRecurring: formData.isRecurring,
                recurrence: formData.isRecurring ? formData.recurrence : undefined,
                recurrenceDays: formData.isRecurring && formData.recurrenceDays.length > 0 ? formData.recurrenceDays : undefined,
                recurrenceEnd: formData.isRecurring && formData.recurrenceEnd ? formData.recurrenceEnd : undefined,
                userId: formData.assignmentType === "individual" && formData.userId && formData.userId !== "none" ? formData.userId : null,
                teamId: formData.assignmentType === "team" && formData.teamId && formData.teamId !== "none" ? formData.teamId : null,
                departmentId: formData.assignmentType === "department" && formData.departmentId && formData.departmentId !== "none" ? formData.departmentId : null,
                locationId: formData.assignmentType === "location" && formData.locationId && formData.locationId !== "none" ? formData.locationId : null
            })

            if (result.success) {
                toast.success("Schedule updated successfully!")
                router.push("/manager/schedules")
            } else {
                toast.error(result.error || "Failed to update schedule")
            }
        } catch (error) {
            console.error("Error updating schedule:", error)
            toast.error("An unexpected error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    const scheduleTypes = [
        { value: "SHIFT", label: "Regular Shift", description: "Standard work shift" },
        { value: "MEETING", label: "Meeting", description: "Team or client meeting" },
        { value: "TRAINING", label: "Training", description: "Training session" },
        { value: "EVENT", label: "Event", description: "Company event" },
        { value: "OVERTIME", label: "Overtime", description: "Extra work hours" },
        { value: "ON_CALL", label: "On-Call", description: "On-call duty" }
    ]

    const weekDays = [
        { value: "MON", label: "Mon" },
        { value: "TUE", label: "Tue" },
        { value: "WED", label: "Wed" },
        { value: "THU", label: "Thu" },
        { value: "FRI", label: "Fri" },
        { value: "SAT", label: "Sat" },
        { value: "SUN", label: "Sun" }
    ]

    return (
        <TooltipProvider>
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <CalendarIcon className="h-5 w-5 text-blue-600" />
                            <span>Basic Information</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <Label htmlFor="title">Schedule Title *</Label>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <InfoIcon className="h-4 w-4 text-gray-400" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Give your schedule a clear, descriptive name</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => handleInputChange("title", e.target.value)}
                                    placeholder="e.g., Morning Shift, Team Meeting"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <Label htmlFor="scheduleType">Schedule Type</Label>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <InfoIcon className="h-4 w-4 text-gray-400" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Choose the type that best describes this schedule</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <Select value={formData.scheduleType} onValueChange={(value) => handleInputChange("scheduleType", value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {scheduleTypes.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                <div>
                                                    <div className="font-medium">{type.label}</div>
                                                    <div className="text-xs text-gray-500">{type.description}</div>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <Label htmlFor="description">Description</Label>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <InfoIcon className="h-4 w-4 text-gray-400" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Add any additional details or instructions</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => handleInputChange("description", e.target.value)}
                                placeholder="Optional description or special instructions..."
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <Label htmlFor="startDate">Start Date *</Label>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <InfoIcon className="h-4 w-4 text-gray-400" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>When does this schedule begin?</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <Label htmlFor="endDate">End Date</Label>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <InfoIcon className="h-4 w-4 text-gray-400" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Leave empty for ongoing schedules</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <Input
                                    id="endDate"
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => handleInputChange("endDate", e.target.value)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Time & Duration */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <ClockIcon className="h-5 w-5 text-blue-600" />
                            <span>Time & Duration</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <Label htmlFor="startTime">Start Time *</Label>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <InfoIcon className="h-4 w-4 text-gray-400" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>What time does this schedule start?</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <Input
                                    id="startTime"
                                    type="time"
                                    value={formData.startTime}
                                    onChange={(e) => handleInputChange("startTime", e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <Label htmlFor="endTime">End Time *</Label>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <InfoIcon className="h-4 w-4 text-gray-400" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>What time does this schedule end?</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <Input
                                    id="endTime"
                                    type="time"
                                    value={formData.endTime}
                                    onChange={(e) => handleInputChange("endTime", e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <Label htmlFor="breakDuration">Break Duration (minutes)</Label>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <InfoIcon className="h-4 w-4 text-gray-400" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Total break time in minutes (e.g., 30 for lunch break)</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <Input
                                    id="breakDuration"
                                    type="number"
                                    min="0"
                                    max="480"
                                    value={formData.breakDuration}
                                    onChange={(e) => handleInputChange("breakDuration", parseInt(e.target.value) || 0)}
                                    placeholder="30"
                                />
                            </div>
                        </div>

                        <Separator />

                        {/* Recurring Schedule */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <RepeatIcon className="h-4 w-4 text-gray-600" />
                                    <Label htmlFor="isRecurring">Recurring Schedule</Label>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <InfoIcon className="h-4 w-4 text-gray-400" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Enable this for schedules that repeat regularly</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <Switch
                                    id="isRecurring"
                                    checked={formData.isRecurring}
                                    onCheckedChange={(checked) => handleInputChange("isRecurring", checked)}
                                />
                            </div>

                            {formData.isRecurring && (
                                <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Recurrence Pattern</Label>
                                            <Select value={formData.recurrence} onValueChange={(value) => handleInputChange("recurrence", value)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="DAILY">Daily</SelectItem>
                                                    <SelectItem value="WEEKLY">Weekly</SelectItem>
                                                    <SelectItem value="BIWEEKLY">Bi-weekly</SelectItem>
                                                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Recurrence End Date</Label>
                                            <Input
                                                type="date"
                                                value={formData.recurrenceEnd}
                                                onChange={(e) => handleInputChange("recurrenceEnd", e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {formData.recurrence === "WEEKLY" && (
                                        <div className="space-y-2">
                                            <Label>Select Days</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {weekDays.map((day) => (
                                                    <Badge
                                                        key={day.value}
                                                        variant={formData.recurrenceDays.includes(day.value) ? "default" : "outline"}
                                                        className="cursor-pointer"
                                                        onClick={() => handleRecurrenceDayToggle(day.value)}
                                                    >
                                                        {day.label}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Assignment */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <UsersIcon className="h-5 w-5 text-blue-600" />
                            <span>Assignment</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Label>Assignment Type</Label>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <InfoIcon className="h-4 w-4 text-gray-400" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Choose how to assign this schedule</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                <Card
                                    className={`cursor-pointer transition-colors ${formData.assignmentType === "none" ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
                                        }`}
                                    onClick={() => handleInputChange("assignmentType", "none")}
                                >
                                    <CardContent className="p-4 text-center">
                                        <XIcon className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                                        <div className="font-medium">None</div>
                                        <div className="text-xs text-gray-500">No specific assignment</div>
                                    </CardContent>
                                </Card>

                                <Card
                                    className={`cursor-pointer transition-colors ${formData.assignmentType === "individual" ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
                                        }`}
                                    onClick={() => handleInputChange("assignmentType", "individual")}
                                >
                                    <CardContent className="p-4 text-center">
                                        <UsersIcon className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                                        <div className="font-medium">Individual</div>
                                        <div className="text-xs text-gray-500">Assign to specific employee</div>
                                    </CardContent>
                                </Card>

                                <Card
                                    className={`cursor-pointer transition-colors ${formData.assignmentType === "team" ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
                                        }`}
                                    onClick={() => handleInputChange("assignmentType", "team")}
                                >
                                    <CardContent className="p-4 text-center">
                                        <UsersIcon className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                                        <div className="font-medium">Team</div>
                                        <div className="text-xs text-gray-500">Assign to team</div>
                                    </CardContent>
                                </Card>

                                <Card
                                    className={`cursor-pointer transition-colors ${formData.assignmentType === "department" ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
                                        }`}
                                    onClick={() => handleInputChange("assignmentType", "department")}
                                >
                                    <CardContent className="p-4 text-center">
                                        <UsersIcon className="h-8 w-8 mx-auto mb-2 text-green-600" />
                                        <div className="font-medium">Department</div>
                                        <div className="text-xs text-gray-500">Assign to entire department</div>
                                    </CardContent>
                                </Card>

                                <Card
                                    className={`cursor-pointer transition-colors ${formData.assignmentType === "location" ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
                                        }`}
                                    onClick={() => handleInputChange("assignmentType", "location")}
                                >
                                    <CardContent className="p-4 text-center">
                                        <MapPinIcon className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                                        <div className="font-medium">Location</div>
                                        <div className="text-xs text-gray-500">Assign to location</div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Assignment Selection */}
                        {formData.assignmentType === "individual" && (
                            <div className="space-y-2">
                                <Label>Select Employee</Label>
                                <Select value={formData.userId} onValueChange={(value) => handleInputChange("userId", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose an employee..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">
                                            <span className="text-gray-500 italic">No value</span>
                                        </SelectItem>
                                        {employees.map((employee) => (
                                            <SelectItem key={employee.id} value={employee.id}>
                                                <div className="flex items-center space-x-2">
                                                    <span>{employee.name || employee.email}</span>
                                                    {employee.employeeId && (
                                                        <span className="text-xs text-gray-500">({employee.employeeId})</span>
                                                    )}
                                                    {employee.department && (
                                                        <Badge variant="outline" className="text-xs">
                                                            {employee.department.name}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {formData.assignmentType === "team" && (
                            <div className="space-y-2">
                                <Label>Select Team</Label>
                                <Select value={formData.teamId} onValueChange={(value) => handleInputChange("teamId", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose a team..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">
                                            <span className="text-gray-500 italic">No value</span>
                                        </SelectItem>
                                        {teams.map((team) => (
                                            <SelectItem key={team.id} value={team.id}>
                                                <div className="flex items-center space-x-2">
                                                    <div
                                                        className="w-3 h-3 rounded-full"
                                                        style={{ backgroundColor: team.color || '#6B7280' }}
                                                    />
                                                    <span>{team.name}</span>
                                                    <span className="text-xs text-gray-500">({team._count.members} members)</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {formData.assignmentType === "department" && (
                            <div className="space-y-2">
                                <Label>Select Department</Label>
                                <Select value={formData.departmentId} onValueChange={(value) => handleInputChange("departmentId", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose a department..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">
                                            <span className="text-gray-500 italic">No value</span>
                                        </SelectItem>
                                        {departments.map((department) => (
                                            <SelectItem key={department.id} value={department.id}>
                                                <div className="flex items-center space-x-2">
                                                    <div
                                                        className="w-3 h-3 rounded-full"
                                                        style={{ backgroundColor: department.color || '#6B7280' }}
                                                    />
                                                    <span>{department.name}</span>
                                                    <span className="text-xs text-gray-500">({department._count.employees} employees)</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {formData.assignmentType === "location" && (
                            <div className="space-y-2">
                                <Label>Select Location</Label>
                                <Select value={formData.locationId} onValueChange={(value) => handleInputChange("locationId", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose a location..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">
                                            <span className="text-gray-500 italic">No value</span>
                                        </SelectItem>
                                        {locations.map((location) => (
                                            <SelectItem key={location.id} value={location.id}>
                                                <div>
                                                    <div className="font-medium">{location.name}</div>
                                                    <div className="text-xs text-gray-500">{location.address}</div>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading} className="flex items-center space-x-2">
                        <SaveIcon className="h-4 w-4" />
                        <span>{isLoading ? "Updating..." : "Update Schedule"}</span>
                    </Button>
                </div>
            </form>
        </TooltipProvider>
    )
}