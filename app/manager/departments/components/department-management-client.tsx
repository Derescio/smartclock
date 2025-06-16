"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createDepartment, updateDepartment } from "@/actions/employees"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Users2Icon,
    PlusIcon,
    EditIcon,
    UsersIcon,
    SettingsIcon,
    UserIcon
} from "lucide-react"
import { toast } from "sonner"

interface Department {
    id: string
    name: string
    description: string | null
    color: string | null
    manager: {
        id: string
        name: string | null
        email: string
    } | null
    _count: {
        employees: number
    }
}

interface DepartmentManagementClientProps {
    departments: Department[]
}

const DEPARTMENT_COLORS = [
    "#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444", "#6B7280",
    "#EC4899", "#14B8A6", "#F97316", "#84CC16", "#06B6D4", "#A855F7"
]

export function DepartmentManagementClient({ departments }: DepartmentManagementClientProps) {
    const router = useRouter()
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)

    const [newDepartment, setNewDepartment] = useState({
        name: "",
        description: "",
        color: DEPARTMENT_COLORS[0]
    })

    const [editDepartment, setEditDepartment] = useState({
        name: "",
        description: "",
        color: ""
    })

    const handleCreateDepartment = async () => {
        if (!newDepartment.name.trim()) {
            toast.error("Department name is required")
            return
        }

        setIsSubmitting(true)

        try {
            const result = await createDepartment({
                name: newDepartment.name,
                description: newDepartment.description || undefined,
                color: newDepartment.color
            })

            if (result.success) {
                toast.success(`Department "${newDepartment.name}" created successfully!`)
                setNewDepartment({ name: "", description: "", color: DEPARTMENT_COLORS[0] })
                setIsCreateDialogOpen(false)
                router.refresh()
            } else {
                toast.error(result.error || "Failed to create department")
            }
        } catch (error) {
            console.error("Error creating department:", error)
            toast.error("An unexpected error occurred")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleEditDepartment = async () => {
        if (!editingDepartment || !editDepartment.name.trim()) {
            toast.error("Department name is required")
            return
        }

        setIsSubmitting(true)

        try {
            const result = await updateDepartment(editingDepartment.id, {
                name: editDepartment.name,
                description: editDepartment.description || undefined,
                color: editDepartment.color
            })

            if (result.success) {
                toast.success(`Department "${editDepartment.name}" updated successfully!`)
                setIsEditDialogOpen(false)
                setEditingDepartment(null)
                router.refresh()
            } else {
                toast.error(result.error || "Failed to update department")
            }
        } catch (error) {
            console.error("Error updating department:", error)
            toast.error("An unexpected error occurred")
        } finally {
            setIsSubmitting(false)
        }
    }

    const openEditDialog = (department: Department) => {
        setEditingDepartment(department)
        setEditDepartment({
            name: department.name,
            description: department.description || "",
            color: department.color || DEPARTMENT_COLORS[0]
        })
        setIsEditDialogOpen(true)
    }

    return (
        <div className="space-y-6">
            {/* Create Department Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                    <Button className="mb-4">
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Department
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Department</DialogTitle>
                        <DialogDescription>
                            Add a new department to organize your employees.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Department Name</Label>
                            <Input
                                id="name"
                                value={newDepartment.name}
                                onChange={(e) => setNewDepartment(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="e.g., Engineering, Sales, HR"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Input
                                id="description"
                                value={newDepartment.description}
                                onChange={(e) => setNewDepartment(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Brief description of the department"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="color">Department Color</Label>
                            <Select
                                value={newDepartment.color}
                                onValueChange={(value) => setNewDepartment(prev => ({ ...prev, color: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {DEPARTMENT_COLORS.map((color) => (
                                        <SelectItem key={color} value={color}>
                                            <div className="flex items-center">
                                                <div
                                                    className="w-4 h-4 rounded-full mr-2"
                                                    style={{ backgroundColor: color }}
                                                />
                                                {color}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateDepartment} disabled={isSubmitting}>
                            {isSubmitting ? "Creating..." : "Create Department"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Department Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Department</DialogTitle>
                        <DialogDescription>
                            Update the department information.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Department Name</Label>
                            <Input
                                id="edit-name"
                                value={editDepartment.name}
                                onChange={(e) => setEditDepartment(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="e.g., Engineering, Sales, HR"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-description">Description (Optional)</Label>
                            <Input
                                id="edit-description"
                                value={editDepartment.description}
                                onChange={(e) => setEditDepartment(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Brief description of the department"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-color">Department Color</Label>
                            <Select
                                value={editDepartment.color}
                                onValueChange={(value) => setEditDepartment(prev => ({ ...prev, color: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {DEPARTMENT_COLORS.map((color) => (
                                        <SelectItem key={color} value={color}>
                                            <div className="flex items-center">
                                                <div
                                                    className="w-4 h-4 rounded-full mr-2"
                                                    style={{ backgroundColor: color }}
                                                />
                                                {color}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleEditDepartment} disabled={isSubmitting}>
                            {isSubmitting ? "Updating..." : "Update Department"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Department List */}
            <div className="space-y-4">
                {departments.length === 0 ? (
                    <div className="text-center py-12">
                        <Users2Icon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No departments yet</h3>
                        <p className="text-gray-600 mb-4">
                            Get started by creating your first department to organize your employees.
                        </p>
                        <Button onClick={() => setIsCreateDialogOpen(true)}>
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Add First Department
                        </Button>
                    </div>
                ) : (
                    departments.map((department) => (
                        <Card key={department.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div
                                            className="w-12 h-12 rounded-lg flex items-center justify-center"
                                            style={{ backgroundColor: `${department.color}20` }}
                                        >
                                            <Users2Icon
                                                className="h-6 w-6"
                                                style={{ color: department.color || '#6B7280' }}
                                            />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <h3 className="font-semibold text-gray-900 truncate">
                                                    {department.name}
                                                </h3>
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: department.color || '#6B7280' }}
                                                />
                                            </div>

                                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                                <div className="flex items-center">
                                                    <UsersIcon className="h-4 w-4 mr-1" />
                                                    <span>{department._count.employees} employees</span>
                                                </div>

                                                {department.manager && (
                                                    <div className="flex items-center">
                                                        <UserIcon className="h-4 w-4 mr-1" />
                                                        <span>Manager: {department.manager.name}</span>
                                                    </div>
                                                )}

                                                {department.description && (
                                                    <div className="flex items-center">
                                                        <SettingsIcon className="h-4 w-4 mr-1" />
                                                        <span className="truncate max-w-xs">{department.description}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <Badge
                                            variant="secondary"
                                            style={{
                                                backgroundColor: `${department.color}20`,
                                                color: department.color || '#6B7280'
                                            }}
                                        >
                                            {department._count.employees} members
                                        </Badge>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => openEditDialog(department)}
                                        >
                                            <EditIcon className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
} 