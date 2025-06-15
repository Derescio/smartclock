"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ClockIcon, MapPinIcon, QrCodeIcon, AlertCircleIcon } from "lucide-react"
import { toast } from "sonner"

interface ClockStatus {
  success: boolean
  currentStatus: string
  todaysHours: number
  lastEvent: {
    id: string;
    type: string;
    timestamp: string;
    location?: {
      latitude: number;
      longitude: number;
    };
  } | null
}

interface Location {
  id: string
  name: string
  distance?: number
  inRange?: boolean
  radius?: number
}

interface ClockEvent {
  id: string;
  type: 'CLOCK_IN' | 'CLOCK_OUT' | 'GEOFENCE';
  timestamp: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
}

interface ClockInOutProps {
  onClockEvent?: (event: ClockEvent) => void;
}

export default function ClockInOut({ onClockEvent }: ClockInOutProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [clockStatus, setClockStatus] = useState<ClockStatus | null>(null)
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [locations, setLocations] = useState<Location[]>([])
  const [gpsError, setGpsError] = useState<string | null>(null)

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError("GPS not supported by this browser")
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }
        setUserLocation(location)
        setGpsError(null)
        loadLocations(location)
      },
      (error) => {
        setGpsError(`GPS Error: ${error.message}`)
        loadLocations()
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    )
  }, [])

  // Set mounted to true after component mounts
  useEffect(() => {
    setMounted(true)
    loadClockStatus()
    requestLocation()
  }, [requestLocation])

  // Update time every second and refresh hours if clocked in
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
      // Refresh status every minute if clocked in
      if (clockStatus?.success && (clockStatus.currentStatus === "CLOCKED_IN" || clockStatus.currentStatus === "ON_BREAK")) {
        if (new Date().getSeconds() === 0) {
          loadClockStatus()
        }
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [clockStatus])

  const loadClockStatus = async () => {
    try {
      const response = await fetch("/api/clock")
      if (response.ok) {
        const data = await response.json()
        setClockStatus(data)
      }
    } catch (error) {
      console.error("Failed to load clock status:", error)
    }
  }

  const loadLocations = async (location?: { latitude: number; longitude: number }) => {
    try {
      const params = new URLSearchParams()
      if (location) {
        params.append("latitude", location.latitude.toString())
        params.append("longitude", location.longitude.toString())
      }

      const response = await fetch(`/api/locations?${params}`)
      if (response.ok) {
        const data = await response.json()
        setLocations(data.locations)
      }
    } catch (error) {
      console.error("Failed to load locations:", error)
    }
  }

  const handleClockAction = async (action: 'CLOCK_IN' | 'CLOCK_OUT' | 'GEOFENCE', location?: GeolocationPosition) => {
    setLoading(true)
    try {
      const payload: {
        action: string;
        latitude?: number;
        longitude?: number;
        locationId?: string;
      } = { action: action }

      // Add GPS coordinates if available
      if (location) {
        payload.latitude = location.coords.latitude
        payload.longitude = location.coords.longitude
      }

      // Add location if GPS method and in range
      if (action === "GEOFENCE") {
        if (!location) {
          toast.error("GPS location required for GPS check-in")
          return
        }

        const inRangeLocation = locations.find(loc => loc.inRange)
        if (!inRangeLocation) {
          // Show detailed error message
          const closestLocation = locations.length > 0 ? locations[0] : null
          if (closestLocation && closestLocation.distance !== undefined && closestLocation.radius !== undefined) {
            toast.error(
              `You are ${Math.round(closestLocation.distance)}m away from ${closestLocation.name}. ` +
              `You must be within ${closestLocation.radius}m to use GPS check-in.`
            )
          } else {
            toast.error("No work locations found for GPS check-in")
          }
          return
        }

        payload.locationId = inRangeLocation.id
      }

      const response = await fetch("/api/clock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok) {
        const actionText = action.toLowerCase().replace('_', ' ')
        let successMessage = `Successfully ${actionText}`

        // Add location info for GPS check-ins
        if (data.locationValidation) {
          successMessage += ` at ${data.locationValidation.locationName} (${Math.round(data.locationValidation.distance)}m away)`
        }

        toast.success(successMessage)
        await loadClockStatus()

        // Call the callback to refresh other components
        onClockEvent?.({
          id: data.eventId,
          type: action === 'GEOFENCE' ? 'CLOCK_IN' : action,
          timestamp: new Date(),
          location: location ? {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          } : undefined,
        })
      } else {
        toast.error(data.error || "Clock operation failed")
      }
    } catch (error) {
      toast.error("Failed to process clock operation: " + error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusDisplay = () => {
    if (!clockStatus?.success) return { text: "Loading...", color: "bg-gray-100 text-gray-800", dot: "bg-gray-500" }

    switch (clockStatus.currentStatus) {
      case "CLOCKED_IN":
        return { text: "Clocked In", color: "bg-green-100 text-green-800", dot: "bg-green-500" }
      case "ON_BREAK":
        return { text: "On Break", color: "bg-yellow-100 text-yellow-800", dot: "bg-yellow-500" }
      case "CLOCKED_OUT":
      default:
        return { text: "Clocked Out", color: "bg-gray-100 text-gray-800", dot: "bg-gray-500" }
    }
  }

  const formatHours = (hours: number) => {
    const h = Math.floor(hours)
    const m = Math.floor((hours - h) * 60)
    return `${h}h ${m}m`
  }

  const getAvailableActions = () => {
    if (!clockStatus?.success) return []

    switch (clockStatus.currentStatus) {
      case "CLOCKED_OUT":
        return [{ type: "CLOCK_IN", label: "Clock In", variant: "default" as const }]
      case "CLOCKED_IN":
        return [
          { type: "CLOCK_OUT", label: "Clock Out", variant: "destructive" as const },
          { type: "BREAK_START", label: "Start Break", variant: "outline" as const }
        ]
      case "ON_BREAK":
        return [
          { type: "BREAK_END", label: "End Break", variant: "default" as const },
          { type: "CLOCK_OUT", label: "Clock Out", variant: "destructive" as const }
        ]
      default:
        return []
    }
  }

  const status = getStatusDisplay()
  const actions = getAvailableActions()
  const inRangeLocations = locations.filter(loc => loc.inRange)

  return (
    <Card className="card">
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-heading">
          <ClockIcon className="h-6 w-6 mr-2 text-blue-600" />
          Time Clock
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Current Time Display */}
        <div className="text-center mb-8">
          <div className="text-4xl font-bold text-gray-900 font-heading mb-2">
            {mounted ? currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "--:--:--"}
          </div>
          <div className="text-gray-600">
            {mounted ? currentTime.toLocaleDateString([], { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "Loading..."}
          </div>
        </div>

        {/* Status Indicator */}
        <div className="text-center mb-6">
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${status.color}`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${status.dot}`} />
            {status.text}
          </div>
        </div>

        {/* Clock Action Buttons */}
        <div className="space-y-3 mb-6">
          {actions.map((action) => (
            <Button
              key={action.type}
              onClick={() => handleClockAction(action.type as 'CLOCK_IN' | 'CLOCK_OUT' | 'GEOFENCE')}
              variant={action.variant}
              className="w-full h-12 text-lg font-medium"
              disabled={loading}
            >
              {loading ? "Processing..." : action.label}
            </Button>
          ))}
        </div>

        {/* GPS Status & Clock-in Methods */}
        {actions.some(a => a.type === "CLOCK_IN") && (
          <div className="pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">Clock-in methods:</p>

            {/* GPS Status */}
            <div className="mb-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">GPS Status:</span>
                {gpsError ? (
                  <span className="text-red-600 text-sm flex items-center">
                    <AlertCircleIcon className="h-4 w-4 mr-1" />
                    {gpsError}
                  </span>
                ) : userLocation ? (
                  <span className="text-green-600 text-sm">✓ Location found</span>
                ) : (
                  <span className="text-gray-500 text-sm">Getting location...</span>
                )}
              </div>

              {inRangeLocations.length > 0 && (
                <div className="mt-2 text-sm text-green-600">
                  ✓ In range of: {inRangeLocations.map(loc => loc.name).join(", ")}
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleClockAction("GEOFENCE")}
                disabled={loading || !userLocation || inRangeLocations.length === 0}
              >
                <MapPinIcon className="h-4 w-4 mr-2" />
                GPS Check-in
              </Button>
              <Button variant="outline" size="sm" className="flex-1" disabled>
                <QrCodeIcon className="h-4 w-4 mr-2" />
                QR Code
              </Button>
            </div>
          </div>
        )}

        {/* Today's Hours */}
        {clockStatus?.success && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Today's Hours:</span>
              <span className="font-medium text-lg">
                {formatHours(clockStatus.todaysHours)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
