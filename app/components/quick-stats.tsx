"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ClockIcon, CalendarIcon, TrendingUpIcon, LucideIcon } from "lucide-react"

interface TimeStats {
  today: number
  thisWeek: number
  thisMonth: number
  overtime: number
}

export default function QuickStats() {
  const [stats, setStats] = useState<TimeStats>({
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    overtime: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      // For now, we'll calculate basic stats from today's data
      // In a full implementation, you'd have dedicated endpoints for weekly/monthly stats
      const response = await fetch("/api/clock")
      if (response.ok) {
        const data = await response.json()

        // Calculate this week's hours (simplified - just multiply today by days worked)
        const todayHours = data.todaysHours || 0
        const thisWeekEstimate = todayHours * 5 // Rough estimate
        const thisMonthEstimate = todayHours * 22 // Rough estimate
        const overtimeHours = Math.max(0, todayHours - 8) // Overtime after 8 hours

        setStats({
          today: todayHours,
          thisWeek: thisWeekEstimate,
          thisMonth: thisMonthEstimate,
          overtime: overtimeHours
        })
      }
    } catch (error) {
      console.error("Failed to load stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatHours = (hours: number) => {
    if (hours < 1) {
      const minutes = Math.floor(hours * 60)
      return `${minutes}m`
    }
    const h = Math.floor(hours)
    const m = Math.floor((hours - h) * 60)
    return m > 0 ? `${h}.${Math.floor(m / 6)}h` : `${h}h`
  }

  const StatCard = ({ title, value, icon: Icon, color, isLoading }: {
    title: string
    value: number
    icon: LucideIcon
    color: string
    isLoading: boolean
  }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            {isLoading ? (
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
            ) : (
              <p className="text-2xl font-bold text-gray-900 font-heading">
                {formatHours(value)}
              </p>
            )}
          </div>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-4">
      <StatCard
        title="Today"
        value={stats.today}
        icon={ClockIcon}
        color="text-blue-600"
        isLoading={loading}
      />

      <StatCard
        title="This Week"
        value={stats.thisWeek}
        icon={CalendarIcon}
        color="text-teal-500"
        isLoading={loading}
      />

      <StatCard
        title="Overtime"
        value={stats.overtime}
        icon={TrendingUpIcon}
        color="text-yellow-500"
        isLoading={loading}
      />
    </div>
  )
}
