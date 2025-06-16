"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { updateLocation } from "@/actions/locations"
import { MapPinIcon, NavigationIcon } from "lucide-react"
import { toast } from "sonner"

interface Location {
    id: string
    name: string
    address: string
    description?: string | null
    latitude: number
    longitude: number
    radius: number
    isActive: boolean
}

interface EditLocationFormProps {
    location: Location
}

export function EditLocationForm({ location }: EditLocationFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: location.name,
        address: location.address,
        description: location.description || "",
        latitude: location.latitude,
        longitude: location.longitude,
        geofenceRadius: location.radius,
        isActive: location.isActive
    })

    const handleInputChange = (field: string, value: string | number | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData(prev => ({
                        ...prev,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    }))
                    toast.success("Location updated with current GPS coordinates")
                },
                (error) => {
                    toast.error("Unable to get current location: " + error.message)
                }
            )
        } else {
            toast.error("Geolocation is not supported by this browser")
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const result = await updateLocation(location.id, {
                name: formData.name,
                address: formData.address,
                latitude: formData.latitude,
                longitude: formData.longitude,
                radius: formData.geofenceRadius,
                isActive: formData.isActive
            })

            if (result.success) {
                toast.success("Location updated successfully")
                router.push("/manager/locations")
            } else {
                toast.error(result.error || "Failed to update location")
            }
        } catch (error) {
            console.error("Error updating location:", error)
            toast.error("An unexpected error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="name">Location Name *</Label>
                    <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="e.g., Main Office, Warehouse A"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="geofenceRadius">Geofence Radius (meters) *</Label>
                    <Input
                        id="geofenceRadius"
                        type="number"
                        min="1"
                        max="1000"
                        value={formData.geofenceRadius}
                        onChange={(e) => handleInputChange("geofenceRadius", parseInt(e.target.value))}
                        placeholder="e.g., 50"
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="e.g., 123 Business St, City, State 12345"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange("description", e.target.value)}
                    placeholder="Optional description of the location..."
                    rows={3}
                />
            </div>

            {/* GPS Coordinates */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">GPS Coordinates</Label>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={getCurrentLocation}
                        className="flex items-center space-x-2"
                    >
                        <NavigationIcon className="h-4 w-4" />
                        <span>Use Current Location</span>
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="latitude">Latitude *</Label>
                        <Input
                            id="latitude"
                            type="number"
                            step="any"
                            value={formData.latitude}
                            onChange={(e) => handleInputChange("latitude", parseFloat(e.target.value))}
                            placeholder="e.g., 40.7128"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="longitude">Longitude *</Label>
                        <Input
                            id="longitude"
                            type="number"
                            step="any"
                            value={formData.longitude}
                            onChange={(e) => handleInputChange("longitude", parseFloat(e.target.value))}
                            placeholder="e.g., -74.0060"
                            required
                        />
                    </div>
                </div>

                {/* Live Preview */}
                {formData.latitude && formData.longitude && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 text-blue-800">
                            <MapPinIcon className="h-4 w-4" />
                            <span className="text-sm font-medium">Location Preview</span>
                        </div>
                        <p className="text-sm text-blue-700 mt-1">
                            Coordinates: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                        </p>
                        <p className="text-sm text-blue-600 mt-1">
                            Geofence radius: {formData.geofenceRadius} meters
                        </p>
                    </div>
                )}
            </div>

            {/* Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                    <Label htmlFor="isActive" className="text-base font-medium">
                        Location Status
                    </Label>
                    <p className="text-sm text-gray-600">
                        {formData.isActive ? "Active - employees can clock in/out" : "Inactive - location disabled"}
                    </p>
                </div>
                <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/manager/locations")}
                    disabled={isLoading}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Updating..." : "Update Location"}
                </Button>
            </div>
        </form>
    )
} 