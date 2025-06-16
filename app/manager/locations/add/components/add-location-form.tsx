"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createLocation } from "@/actions/locations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    SaveIcon,
    MapPinIcon,
    AlertCircleIcon,
    LocateIcon,
} from "lucide-react"
import { toast } from "sonner"

export function AddLocationForm() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isGettingLocation, setIsGettingLocation] = useState(false)

    const [formData, setFormData] = useState({
        name: "",
        address: "",
        latitude: "",
        longitude: "",
        radius: "10"
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.name.trim()) {
            newErrors.name = "Location name is required"
        }

        if (!formData.address.trim()) {
            newErrors.address = "Address is required"
        }

        if (!formData.latitude.trim()) {
            newErrors.latitude = "Latitude is required"
        } else if (isNaN(Number(formData.latitude)) || Number(formData.latitude) < -90 || Number(formData.latitude) > 90) {
            newErrors.latitude = "Latitude must be a valid number between -90 and 90"
        }

        if (!formData.longitude.trim()) {
            newErrors.longitude = "Longitude is required"
        } else if (isNaN(Number(formData.longitude)) || Number(formData.longitude) < -180 || Number(formData.longitude) > 180) {
            newErrors.longitude = "Longitude must be a valid number between -180 and 180"
        }

        if (!formData.radius.trim()) {
            newErrors.radius = "Radius is required"
        } else if (isNaN(Number(formData.radius)) || Number(formData.radius) < 1 || Number(formData.radius) > 1000) {
            newErrors.radius = "Radius must be a number between 1 and 1000 meters"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            toast.error("Please fix the form errors")
            return
        }

        setIsSubmitting(true)

        try {
            const result = await createLocation({
                name: formData.name,
                address: formData.address,
                latitude: Number(formData.latitude),
                longitude: Number(formData.longitude),
                radius: Number(formData.radius)
            })

            if (result.success) {
                toast.success(`Location "${formData.name}" has been created successfully!`)
                router.push("/manager/locations")
            } else {
                toast.error(result.error || "Failed to create location")
            }
        } catch (error) {
            console.error("Error creating location:", error)
            toast.error("An unexpected error occurred")
        } finally {
            setIsSubmitting(false)
        }
    }

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by this browser")
            return
        }

        setIsGettingLocation(true)

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData(prev => ({
                    ...prev,
                    latitude: position.coords.latitude.toString(),
                    longitude: position.coords.longitude.toString()
                }))
                toast.success("Current location detected!")
                setIsGettingLocation(false)
            },
            (error) => {
                console.error("Geolocation error:", error)
                toast.error("Failed to get current location. Please enter coordinates manually.")
                setIsGettingLocation(false)
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000
            }
        )
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
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Main Office, Warehouse A, etc."
                        className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && (
                        <p className="text-sm text-red-600 flex items-center">
                            <AlertCircleIcon className="h-4 w-4 mr-1" />
                            {errors.name}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="address">Address *</Label>
                    <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="123 Main St, City, State, ZIP"
                        className={errors.address ? "border-red-500" : ""}
                    />
                    {errors.address && (
                        <p className="text-sm text-red-600 flex items-center">
                            <AlertCircleIcon className="h-4 w-4 mr-1" />
                            {errors.address}
                        </p>
                    )}
                </div>
            </div>

            {/* GPS Coordinates */}
            <Card className="bg-blue-50 border-blue-200">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center space-x-2">
                        <MapPinIcon className="h-4 w-4 text-blue-600" />
                        <span>GPS Coordinates</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            Enter the exact GPS coordinates for this location or use your current location.
                        </p>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={getCurrentLocation}
                            disabled={isGettingLocation}
                        >
                            {isGettingLocation ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
                                    Getting Location...
                                </>
                            ) : (
                                <>
                                    <LocateIcon className="h-4 w-4 mr-2" />
                                    Use Current Location
                                </>
                            )}
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
                                onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                                placeholder="40.7128"
                                className={errors.latitude ? "border-red-500" : ""}
                            />
                            {errors.latitude && (
                                <p className="text-sm text-red-600 flex items-center">
                                    <AlertCircleIcon className="h-4 w-4 mr-1" />
                                    {errors.latitude}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="longitude">Longitude *</Label>
                            <Input
                                id="longitude"
                                type="number"
                                step="any"
                                value={formData.longitude}
                                onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                                placeholder="-74.0060"
                                className={errors.longitude ? "border-red-500" : ""}
                            />
                            {errors.longitude && (
                                <p className="text-sm text-red-600 flex items-center">
                                    <AlertCircleIcon className="h-4 w-4 mr-1" />
                                    {errors.longitude}
                                </p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Geofencing */}
            <div className="space-y-2">
                <Label htmlFor="radius">Geofencing Radius (meters) *</Label>
                <Input
                    id="radius"
                    type="number"
                    min="1"
                    max="1000"
                    value={formData.radius}
                    onChange={(e) => setFormData(prev => ({ ...prev, radius: e.target.value }))}
                    placeholder="10"
                    className={errors.radius ? "border-red-500" : ""}
                />
                {errors.radius && (
                    <p className="text-sm text-red-600 flex items-center">
                        <AlertCircleIcon className="h-4 w-4 mr-1" />
                        {errors.radius}
                    </p>
                )}
                <p className="text-xs text-gray-500">
                    Employees must be within this radius to clock in at this location. Recommended: 10-50 meters.
                </p>
            </div>

            {/* Preview */}
            {formData.latitude && formData.longitude && (
                <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2 mb-2">
                            <MapPinIcon className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-700">Location Preview</span>
                        </div>
                        <div className="text-sm text-green-600">
                            <p><strong>Coordinates:</strong> {formData.latitude}, {formData.longitude}</p>
                            <p><strong>Geofence:</strong> {formData.radius}m radius</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Creating...
                        </>
                    ) : (
                        <>
                            <SaveIcon className="h-4 w-4 mr-2" />
                            Create Location
                        </>
                    )}
                </Button>
            </div>
        </form>
    )
} 