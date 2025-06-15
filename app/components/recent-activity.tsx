"use client"

import { useState, useEffect, useImperativeHandle, forwardRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ClockIcon, LogInIcon, LogOutIcon, PlayIcon, PauseIcon } from "lucide-react"
import { getTodaysClockEvents } from "@/actions"

interface ClockEvent {
  id: string
  type: string
  timestamp: Date
  method: string
  location?: {
    id: string
    name: string
    address: string
    latitude: number
    longitude: number
    radius: number
    qrCode: string | null
    isActive: boolean
    organizationId: string
    createdAt: Date
    updatedAt: Date
  } | null
}

interface RecentActivityRef {
  refresh: () => void
}

const RecentActivity = forwardRef<RecentActivityRef>((props, ref) => {
  const [activities, setActivities] = useState<ClockEvent[]>([])
  const [loading, setLoading] = useState(true)

  const loadRecentActivity = async () => {
    try {
      setLoading(true)
      const result = await getTodaysClockEvents()
      if (result.success && result.clockEvents) {
        setActivities(result.clockEvents.slice(-5).reverse()) // Show last 5 events, most recent first
      }
    } catch (error) {
      console.error("Failed to load recent activity:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRecentActivity()
  }, [])

  useImperativeHandle(ref, () => ({
    refresh: loadRecentActivity
  }))

  const getActivityDisplay = (event: ClockEvent) => {
    switch (event.type) {
      case "CLOCK_IN":
        return {
          label: "Clocked In",
          icon: LogInIcon,
          color: "text-green-600",
          bgColor: "bg-green-100"
        }
      case "CLOCK_OUT":
        return {
          label: "Clocked Out",
          icon: LogOutIcon,
          color: "text-red-600",
          bgColor: "bg-red-100"
        }
      case "BREAK_START":
        return {
          label: "Break Started",
          icon: PauseIcon,
          color: "text-yellow-600",
          bgColor: "bg-yellow-100"
        }
      case "BREAK_END":
        return {
          label: "Break Ended",
          icon: PlayIcon,
          color: "text-blue-600",
          bgColor: "bg-blue-100"
        }
      default:
        return {
          label: "Unknown",
          icon: ClockIcon,
          color: "text-gray-600",
          bgColor: "bg-gray-100"
        }
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const formatMethod = (method: string) => {
    switch (method) {
      case "GEOFENCE":
        return "GPS"
      case "QR_CODE":
        return "QR Code"
      case "MANUAL":
      default:
        return "Manual"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center font-heading">
            <ClockIcon className="h-5 w-5 mr-2 text-blue-600" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center font-heading">
          <ClockIcon className="h-5 w-5 mr-2 text-blue-600" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ClockIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No activity today</p>
            <p className="text-sm">Clock in to start tracking your time</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const display = getActivityDisplay(activity)
              const IconComponent = display.icon
              return (
                <div key={activity.id} className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${display.bgColor} ${display.color}`}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{display.label}</span>
                      <span className="text-sm text-gray-500">
                        {formatTime(activity.timestamp.toISOString())}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>via {formatMethod(activity.method)}</span>
                      {activity.location && (
                        <>
                          <span>•</span>
                          <span>{activity.location.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
})

RecentActivity.displayName = 'RecentActivity'

export default RecentActivity
