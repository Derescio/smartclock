"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
//import { Separator } from "@/components/ui/separator"
import {
    UsersIcon,
    UserIcon,
    PaletteIcon,
    SaveIcon
} from "lucide-react"
import { createTeam } from "@/actions/teams"
import { toast } from "sonner"
import { Employee } from "@/types/teams"

interface CreateTeamFormProps {
    employees: Employee[]
}

export function CreateTeamForm({ employees }: CreateTeamFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        color: "#3B82F6", // Default blue color
        managerId: "",
        memberIds: [] as string[]
    })

    const handleInputChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleMemberToggle = (employeeId: string) => {
        setFormData(prev => ({
            ...prev,
            memberIds: prev.memberIds.includes(employeeId)
                ? prev.memberIds.filter(id => id !== employeeId)
                : [...prev.memberIds, employeeId]
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const result = await createTeam({
                name: formData.name,
                description: formData.description || undefined,
                color: formData.color,
                managerId: formData.managerId || undefined,
                memberIds: formData.memberIds
            })

            if (result.success) {
                toast.success("Team created successfully!")
                router.push("/manager/teams")
            } else {
                toast.error(result.error || "Failed to create team")
            }
        } catch (error) {
            console.error("Error creating team:", error)
            toast.error("An unexpected error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    const predefinedColors = [
        "#3B82F6", // Blue
        "#10B981", // Green
        "#F59E0B", // Yellow
        "#EF4444", // Red
        "#8B5CF6", // Purple
        "#F97316", // Orange
        "#06B6D4", // Cyan
        "#84CC16", // Lime
        "#EC4899", // Pink
        "#6B7280"  // Gray
    ]

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <UsersIcon className="h-5 w-5 text-blue-600" />
                        <span>Basic Information</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Team Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                                placeholder="e.g., Marketing Team, Night Shift"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="manager">Team Manager</Label>
                            <Select value={formData.managerId} onValueChange={(value) => handleInputChange("managerId", value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a team manager (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    {employees.map((employee) => (
                                        <SelectItem key={employee.id} value={employee.id}>
                                            <div className="flex items-center space-x-2">
                                                <UserIcon className="h-4 w-4" />
                                                <span>{employee.name || employee.email}</span>
                                                {employee.employeeId && (
                                                    <span className="text-xs text-gray-500">({employee.employeeId})</span>
                                                )}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleInputChange("description", e.target.value)}
                            placeholder="Optional description of the team's purpose or responsibilities..."
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="flex items-center space-x-2">
                            <PaletteIcon className="h-4 w-4" />
                            <span>Team Color</span>
                        </Label>
                        <div className="flex flex-wrap gap-2">
                            {predefinedColors.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    className={`w-8 h-8 rounded-full border-2 transition-all ${formData.color === color
                                        ? 'border-gray-900 scale-110'
                                        : 'border-gray-300 hover:border-gray-500'
                                        }`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => handleInputChange("color", color)}
                                />
                            ))}
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                            <Input
                                type="color"
                                value={formData.color}
                                onChange={(e) => handleInputChange("color", e.target.value)}
                                className="w-16 h-8 p-1 border rounded"
                            />
                            <span className="text-sm text-gray-500">Custom color</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Team Members */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <UsersIcon className="h-5 w-5 text-blue-600" />
                        <span>Team Members</span>
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                        Select employees to add to this team. You can modify team membership later.
                    </p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-sm text-gray-700">
                        Selected: {formData.memberIds.length} employee{formData.memberIds.length !== 1 ? 's' : ''}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                        {employees.map((employee) => (
                            <div
                                key={employee.id}
                                className={`p-3 border rounded-lg cursor-pointer transition-colors ${formData.memberIds.includes(employee.id)
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                onClick={() => handleMemberToggle(employee.id)}
                            >
                                <div className="flex items-center space-x-2">
                                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${formData.memberIds.includes(employee.id)
                                        ? 'border-blue-500 bg-blue-500'
                                        : 'border-gray-300'
                                        }`}>
                                        {formData.memberIds.includes(employee.id) && (
                                            <div className="w-2 h-2 bg-white rounded-sm" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-gray-900 truncate">
                                            {employee.name || employee.email}
                                        </div>
                                        {employee.employeeId && (
                                            <div className="text-xs text-gray-500">
                                                ID: {employee.employeeId}
                                            </div>
                                        )}
                                        {employee.department && (
                                            <Badge variant="outline" className="text-xs mt-1">
                                                {employee.department.name}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {employees.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            <UsersIcon className="mx-auto h-8 w-8 mb-2" />
                            <p>No employees available to add to the team.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/manager/teams")}
                    disabled={isLoading}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading || !formData.name.trim()}>
                    <SaveIcon className="h-4 w-4 mr-2" />
                    {isLoading ? "Creating..." : "Create Team"}
                </Button>
            </div>
        </form>
    )
} 