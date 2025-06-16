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
    CheckIcon,
    ArrowLeftIcon,
    ArrowRightIcon
} from "lucide-react"
import { createSchedule } from "@/actions/schedules"
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

interface CreateScheduleFormProps {
    employees: Employee[]
    departments: Department[]
    locations: Location[]
    teams: Team[]
}

export function CreateScheduleForm({ employees, departments, locations, teams }: CreateScheduleFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [currentStep, setCurrentStep] = useState(1)

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        scheduleType: "SHIFT",
        startDate: "",
        endDate: "",
        startTime: "09:00",
        endTime: "17:00",
        breakDuration: 30,
        isRecurring: false,
        recurrence: "WEEKLY",
        recurrenceDays: [] as string[],
        recurrenceEnd: "",
        assignmentType: "individual", // individual, department, location, team
        userId: "",
        departmentId: "",
        locationId: "",
        teamId: ""
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
                ? prev.recurrenceDays.filter(d => d !== day)
                : [...prev.recurrenceDays, day]
        }))
    }

    const validateStep = (step: number) => {
        switch (step) {
            case 1:
                return formData.title.trim() !== "" && formData.startDate !== ""
            case 2:
                return formData.startTime !== "" && formData.endTime !== ""
            case 3:
                if (formData.assignmentType === "individual") return formData.userId !== ""
                if (formData.assignmentType === "department") return formData.departmentId !== ""
                if (formData.assignmentType === "location") return formData.locationId !== ""
                if (formData.assignmentType === "team") return formData.teamId !== ""
                return false
            default:
                return true
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const result = await createSchedule({
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
                userId: formData.assignmentType === "individual" ? formData.userId : undefined,
                departmentId: formData.assignmentType === "department" ? formData.departmentId : undefined,
                locationId: formData.assignmentType === "location" ? formData.locationId : undefined,
                teamId: formData.assignmentType === "team" ? formData.teamId : undefined
            })

            if (result.success) {
                toast.success("Schedule created successfully!")
                router.push("/manager/schedules")
            } else {
                toast.error(result.error || "Failed to create schedule")
            }
        } catch (error) {
            console.error("Error creating schedule:", error)
            toast.error("An unexpected error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    const steps = [
        { number: 1, title: "Basic Info", description: "Schedule details" },
        { number: 2, title: "Time & Duration", description: "When and how long" },
        { number: 3, title: "Assignment", description: "Who is scheduled" },
        { number: 4, title: "Review", description: "Confirm details" }
    ]

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
            <div className="space-y-8">
                {/* Progress Steps */}
                <div className="flex items-center justify-between">
                    {steps.map((step, index) => (
                        <div key={step.number} className="flex items-center">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${currentStep >= step.number
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'border-gray-300 text-gray-500'
                                }`}>
                                {currentStep > step.number ? (
                                    <CheckIcon className="h-4 w-4" />
                                ) : (
                                    <span className="text-sm font-medium">{step.number}</span>
                                )}
                            </div>
                            <div className="ml-3">
                                <div className={`text-sm font-medium ${currentStep >= step.number ? 'text-blue-600' : 'text-gray-500'
                                    }`}>
                                    {step.title}
                                </div>
                                <div className="text-xs text-gray-500">{step.description}</div>
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`w-12 h-0.5 mx-4 ${currentStep > step.number ? 'bg-blue-600' : 'bg-gray-300'
                                    }`} />
                            )}
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Step 1: Basic Information */}
                    {currentStep === 1 && (
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
                    )}

                    {/* Step 2: Time & Duration */}
                    {currentStep === 2 && (
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
                    )}

                    {/* Step 3: Assignment */}
                    {currentStep === 3 && (
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

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                                                <UsersIcon className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                                                <div className="font-medium">Team</div>
                                                <div className="text-xs text-gray-500">Assign to entire team</div>
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
                                                {teams.map((team) => (
                                                    <SelectItem key={team.id} value={team.id}>
                                                        <div className="flex items-center space-x-2">
                                                            <div
                                                                className="w-3 h-3 rounded-full"
                                                                style={{ backgroundColor: team.color || '#3B82F6' }}
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
                    )}

                    {/* Step 4: Review */}
                    {currentStep === 4 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Review & Confirm</CardTitle>
                                <p className="text-sm text-gray-600">
                                    Please review the schedule details before creating.
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <div className="text-sm font-medium text-gray-700">Schedule Title</div>
                                        <div>{formData.title}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-700">Type</div>
                                        <div>{scheduleTypes.find(t => t.value === formData.scheduleType)?.label}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-700">Date</div>
                                        <div>
                                            {formData.startDate}
                                            {formData.endDate && ` - ${formData.endDate}`}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-700">Time</div>
                                        <div>{formData.startTime} - {formData.endTime}</div>
                                    </div>
                                    {formData.breakDuration > 0 && (
                                        <div>
                                            <div className="text-sm font-medium text-gray-700">Break Duration</div>
                                            <div>{formData.breakDuration} minutes</div>
                                        </div>
                                    )}
                                    <div>
                                        <div className="text-sm font-medium text-gray-700">Assignment</div>
                                        <div>
                                            {formData.assignmentType === "individual" &&
                                                employees.find(e => e.id === formData.userId)?.name}
                                            {formData.assignmentType === "team" &&
                                                teams.find(t => t.id === formData.teamId)?.name}
                                            {formData.assignmentType === "department" &&
                                                departments.find(d => d.id === formData.departmentId)?.name}
                                            {formData.assignmentType === "location" &&
                                                locations.find(l => l.id === formData.locationId)?.name}
                                        </div>
                                    </div>
                                </div>

                                {formData.description && (
                                    <div>
                                        <div className="text-sm font-medium text-gray-700">Description</div>
                                        <div className="text-sm text-gray-600">{formData.description}</div>
                                    </div>
                                )}

                                {formData.isRecurring && (
                                    <div>
                                        <div className="text-sm font-medium text-gray-700">Recurrence</div>
                                        <div className="text-sm text-gray-600">
                                            {formData.recurrence}
                                            {formData.recurrence === "WEEKLY" && formData.recurrenceDays.length > 0 &&
                                                ` on ${formData.recurrenceDays.join(", ")}`}
                                            {formData.recurrenceEnd && ` until ${formData.recurrenceEnd}`}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                            disabled={currentStep === 1}
                            className="flex items-center space-x-2"
                        >
                            <ArrowLeftIcon className="h-4 w-4" />
                            <span>Previous</span>
                        </Button>

                        {currentStep < 4 ? (
                            <Button
                                type="button"
                                onClick={() => setCurrentStep(currentStep + 1)}
                                disabled={!validateStep(currentStep)}
                                className="flex items-center space-x-2"
                            >
                                <span>Next</span>
                                <ArrowRightIcon className="h-4 w-4" />
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                disabled={isLoading || !validateStep(currentStep)}
                                className="flex items-center space-x-2"
                            >
                                <CheckIcon className="h-4 w-4" />
                                <span>{isLoading ? "Creating..." : "Create Schedule"}</span>
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </TooltipProvider>
    )
} 