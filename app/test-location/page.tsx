"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPinIcon, CheckCircleIcon, XCircleIcon } from "lucide-react"

interface LocationResult {
    isValid: boolean
    userLocation: { latitude: number; longitude: number }
    locations: Array<{
        id: string
        name: string
        address: string
        distance: number
        radius: number
        inRange: boolean
        status: string
    }>
    summary: {
        totalLocations: number
        inRangeCount: number
        closestDistance: number
        canClockIn: boolean
    }
}

export default function TestLocationPage() {
    const [latitude, setLatitude] = useState("")
    const [longitude, setLongitude] = useState("")
    const [result, setResult] = useState<LocationResult | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by this browser")
            return
        }

        setLoading(true)
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLatitude(position.coords.latitude.toString())
                setLongitude(position.coords.longitude.toString())
                setError("")
                setLoading(false)
            },
            (error) => {
                setError(`GPS Error: ${error.message}`)
                setLoading(false)
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
        )
    }

    const testLocation = async () => {
        if (!latitude || !longitude) {
            setError("Please enter latitude and longitude")
            return
        }

        setLoading(true)
        setError("")

        try {
            const response = await fetch("/api/locations/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    latitude: parseFloat(latitude),
                    longitude: parseFloat(longitude),
                }),
            })

            if (response.ok) {
                const data = await response.json()
                setResult(data)
            } else {
                const errorData = await response.json()
                setError(errorData.error || "Failed to verify location")
            }
        } catch (error) {
            setError("Failed to test location" + error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Location Testing Tool</h1>
                    <p className="text-gray-600">Test geofencing and location validation for your organization</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Input Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <MapPinIcon className="h-5 w-5 mr-2 text-blue-600" />
                                Test Coordinates
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="latitude">Latitude</Label>
                                <Input
                                    id="latitude"
                                    value={latitude}
                                    onChange={(e) => setLatitude(e.target.value)}
                                    placeholder="40.7128"
                                    type="number"
                                    step="any"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="longitude">Longitude</Label>
                                <Input
                                    id="longitude"
                                    value={longitude}
                                    onChange={(e) => setLongitude(e.target.value)}
                                    placeholder="-74.0060"
                                    type="number"
                                    step="any"
                                />
                            </div>

                            <div className="flex space-x-3">
                                <Button onClick={getCurrentLocation} variant="outline" disabled={loading}>
                                    {loading ? "Getting Location..." : "Use Current Location"}
                                </Button>
                                <Button onClick={testLocation} disabled={loading || !latitude || !longitude}>
                                    {loading ? "Testing..." : "Test Location"}
                                </Button>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                    {error}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Results Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Validation Results</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {result ? (
                                <div className="space-y-4">
                                    {/* Summary */}
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium">Can Clock In:</span>
                                            {result.summary.canClockIn ? (
                                                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                                            ) : (
                                                <XCircleIcon className="h-5 w-5 text-red-600" />
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <div>Total Locations: {result.summary.totalLocations}</div>
                                            <div>In Range: {result.summary.inRangeCount}</div>
                                            <div>Closest Distance: {result.summary.closestDistance}m</div>
                                        </div>
                                    </div>

                                    {/* Location Details */}
                                    <div className="space-y-3">
                                        <h4 className="font-medium">Location Details:</h4>
                                        {result.locations.map((location) => (
                                            <div
                                                key={location.id}
                                                className={`p-3 rounded-lg border ${location.inRange
                                                    ? "bg-green-50 border-green-200"
                                                    : "bg-red-50 border-red-200"
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-medium">{location.name}</span>
                                                    <span
                                                        className={`text-sm px-2 py-1 rounded ${location.inRange
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-red-100 text-red-800"
                                                            }`}
                                                    >
                                                        {location.status}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    <div>{location.address}</div>
                                                    <div>
                                                        Distance: {location.distance}m (Radius: {location.radius}m)
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <MapPinIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                    <p>Enter coordinates and click "Test Location" to see results</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Instructions */}
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>How to Use</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-sm text-gray-600">
                            <p>1. Click "Use Current Location" to get your GPS coordinates automatically</p>
                            <p>2. Or manually enter latitude and longitude coordinates</p>
                            <p>3. Click "Test Location" to verify if you're within range of work locations</p>
                            <p>4. Green results mean you can clock in with GPS, red means you're out of range</p>
                            <p>5. Use this tool to test different locations and verify geofencing accuracy</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 