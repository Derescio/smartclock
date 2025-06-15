'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

async function requireAuth() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error("Authentication required")
  }
  return session.user
}

export async function clockIn(data: {
  method?: string
  latitude?: number
  longitude?: number
  locationId?: string
  notes?: string
}) {
  try {
    const user = await requireAuth()
    
    // Validate current status
    const lastEvent = await getLastClockEvent(user.id, user.organizationId)
    const currentStatus = getStatusFromLastEvent(lastEvent)
    
    if (currentStatus !== 'CLOCKED_OUT') {
      return { success: false, error: `Cannot clock in from current status: ${currentStatus}` }
    }

    // Enhanced location validation for GPS-based check-ins
    let validatedLocationId = data.locationId
    let locationValidation = null

    if (data.method === "GEOFENCE" && data.latitude && data.longitude) {
      locationValidation = await validateUserLocation(
        user.organizationId, 
        data.latitude, 
        data.longitude, 
        data.locationId
      )

      if (!locationValidation.isValid) {
        return { 
          success: false, 
          error: locationValidation.error,
          details: locationValidation.details
        }
      }

      validatedLocationId = locationValidation.locationId
    }

    const clockEvent = await prisma.clockEvent.create({
      data: {
        organizationId: user.organizationId,
        userId: user.id,
        type: 'CLOCK_IN',
        method: data.method as any || 'MANUAL',
        latitude: data.latitude,
        longitude: data.longitude,
        locationId: validatedLocationId,
        notes: data.notes,
        timestamp: new Date(),
      },
      include: {
        location: true,
      },
    })

    revalidatePath('/manager')
    revalidatePath('/')

    return {
      success: true,
      clockEvent,
      currentStatus: 'CLOCKED_IN',
      locationValidation: locationValidation ? {
        distance: locationValidation.distance,
        locationName: locationValidation.locationName
      } : null,
    }
  } catch (error) {
    console.error('Clock in error:', error)
    return { success: false, error: 'Failed to clock in' }
  }
}

export async function clockOut(data: {
  method?: string
  latitude?: number
  longitude?: number
  locationId?: string
  notes?: string
}) {
  try {
    const user = await requireAuth()
    
    // Validate current status
    const lastEvent = await getLastClockEvent(user.id, user.organizationId)
    const currentStatus = getStatusFromLastEvent(lastEvent)
    
    if (!['CLOCKED_IN', 'ON_BREAK'].includes(currentStatus)) {
      return { success: false, error: `Cannot clock out from current status: ${currentStatus}` }
    }

    const clockEvent = await prisma.clockEvent.create({
      data: {
        organizationId: user.organizationId,
        userId: user.id,
        type: 'CLOCK_OUT',
        method: data.method as any || 'MANUAL',
        latitude: data.latitude,
        longitude: data.longitude,
        locationId: data.locationId,
        notes: data.notes,
        timestamp: new Date(),
      },
      include: {
        location: true,
      },
    })

    const todaysHours = await calculateTodaysHours(user.id, user.organizationId)

    revalidatePath('/manager')
    revalidatePath('/')

    return {
      success: true,
      clockEvent,
      currentStatus: 'CLOCKED_OUT',
      todaysHours,
    }
  } catch (error) {
    console.error('Clock out error:', error)
    return { success: false, error: 'Failed to clock out' }
  }
}

export async function startBreak(data: {
  method?: string
  notes?: string
}) {
  try {
    const user = await requireAuth()
    
    // Validate current status
    const lastEvent = await getLastClockEvent(user.id, user.organizationId)
    const currentStatus = getStatusFromLastEvent(lastEvent)
    
    if (currentStatus !== 'CLOCKED_IN') {
      return { success: false, error: `Cannot start break from current status: ${currentStatus}` }
    }

    const clockEvent = await prisma.clockEvent.create({
      data: {
        organizationId: user.organizationId,
        userId: user.id,
        type: 'BREAK_START',
        method: data.method as any || 'MANUAL',
        notes: data.notes,
        timestamp: new Date(),
      },
    })

    revalidatePath('/manager')
    revalidatePath('/')

    return {
      success: true,
      clockEvent,
      currentStatus: 'ON_BREAK',
    }
  } catch (error) {
    console.error('Start break error:', error)
    return { success: false, error: 'Failed to start break' }
  }
}

export async function endBreak(data: {
  method?: string
  notes?: string
}) {
  try {
    const user = await requireAuth()
    
    // Validate current status
    const lastEvent = await getLastClockEvent(user.id, user.organizationId)
    const currentStatus = getStatusFromLastEvent(lastEvent)
    
    if (currentStatus !== 'ON_BREAK') {
      return { success: false, error: `Cannot end break from current status: ${currentStatus}` }
    }

    const clockEvent = await prisma.clockEvent.create({
      data: {
        organizationId: user.organizationId,
        userId: user.id,
        type: 'BREAK_END',
        method: data.method as any || 'MANUAL',
        notes: data.notes,
        timestamp: new Date(),
      },
    })

    revalidatePath('/manager')
    revalidatePath('/')

    return {
      success: true,
      clockEvent,
      currentStatus: 'CLOCKED_IN',
    }
  } catch (error) {
    console.error('End break error:', error)
    return { success: false, error: 'Failed to end break' }
  }
}

export async function getCurrentStatus() {
  try {
    const user = await requireAuth()
    
    const lastEvent = await getLastClockEvent(user.id, user.organizationId)
    const currentStatus = getStatusFromLastEvent(lastEvent)
    const todaysHours = await calculateTodaysHours(user.id, user.organizationId)

    return {
      success: true,
      currentStatus,
      todaysHours,
      lastEvent,
    }
  } catch (error) {
    console.error('Get current status error:', error)
    return { success: false, error: 'Failed to get current status' }
  }
}

export async function getTodaysClockEvents(date?: string) {
  try {
    const user = await requireAuth()
    const targetDate = date || new Date().toISOString().split("T")[0]
    
    const startOfDay = new Date(targetDate + "T00:00:00.000Z")
    const endOfDay = new Date(targetDate + "T23:59:59.999Z")

    const clockEvents = await prisma.clockEvent.findMany({
      where: {
        userId: user.id,
        organizationId: user.organizationId,
        timestamp: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: { timestamp: "asc" },
      include: {
        location: true,
      },
    })

    return { success: true, clockEvents }
  } catch (error) {
    console.error('Get clock events error:', error)
    return { success: false, error: 'Failed to get clock events' }
  }
}

// Helper functions
async function getLastClockEvent(userId: string, organizationId: string) {
  return await prisma.clockEvent.findFirst({
    where: {
      userId,
      organizationId,
    },
    orderBy: { timestamp: "desc" },
  })
}

function getStatusFromLastEvent(lastEvent: any): string {
  if (!lastEvent) return "CLOCKED_OUT"
  
  switch (lastEvent.type) {
    case "CLOCK_IN":
      return "CLOCKED_IN"
    case "CLOCK_OUT":
      return "CLOCKED_OUT"
    case "BREAK_START":
      return "ON_BREAK"
    case "BREAK_END":
      return "CLOCKED_IN"
    default:
      return "CLOCKED_OUT"
  }
}

async function calculateTodaysHours(userId: string, organizationId: string, date?: string): Promise<number> {
  const targetDate = date || new Date().toISOString().split("T")[0]
  const startOfDay = new Date(targetDate + "T00:00:00.000Z")
  const endOfDay = new Date(targetDate + "T23:59:59.999Z")

  const events = await prisma.clockEvent.findMany({
    where: {
      userId,
      organizationId,
      timestamp: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    orderBy: { timestamp: "asc" },
  })

  let totalMinutes = 0
  let clockInTime: Date | null = null
  let breakStartTime: Date | null = null

  for (const event of events) {
    switch (event.type) {
      case "CLOCK_IN":
        clockInTime = event.timestamp
        break
      case "CLOCK_OUT":
        if (clockInTime) {
          totalMinutes += (event.timestamp.getTime() - clockInTime.getTime()) / (1000 * 60)
          clockInTime = null
        }
        break
      case "BREAK_START":
        breakStartTime = event.timestamp
        break
      case "BREAK_END":
        if (breakStartTime && clockInTime) {
          const breakMinutes = (event.timestamp.getTime() - breakStartTime.getTime()) / (1000 * 60)
          totalMinutes -= breakMinutes
          breakStartTime = null
        }
        break
    }
  }

  if (clockInTime) {
    const now = new Date()
    totalMinutes += (now.getTime() - clockInTime.getTime()) / (1000 * 60)
    
    if (breakStartTime) {
      const breakMinutes = (now.getTime() - breakStartTime.getTime()) / (1000 * 60)
      totalMinutes -= breakMinutes
    }
  }

  return Math.max(0, totalMinutes / 60)
}

async function validateUserLocation(
  organizationId: string, 
  userLatitude: number, 
  userLongitude: number, 
  requestedLocationId?: string
): Promise<{
  isValid: boolean
  error?: string
  details?: any
  locationId?: string
  distance?: number
  locationName?: string
}> {
  try {
    const locations = await prisma.location.findMany({
      where: {
        organizationId,
        isActive: true,
      },
    })

    if (locations.length === 0) {
      return {
        isValid: false,
        error: "No active locations found for your organization",
      }
    }

    let targetLocation = null
    let minDistance = Infinity

    if (requestedLocationId) {
      targetLocation = locations.find(loc => loc.id === requestedLocationId)
      if (!targetLocation) {
        return {
          isValid: false,
          error: "Requested location not found",
        }
      }
    } else {
      for (const location of locations) {
        const distance = calculateDistance(
          userLatitude,
          userLongitude,
          location.latitude,
          location.longitude
        )
        
        if (distance < minDistance) {
          minDistance = distance
          targetLocation = location
        }
      }
    }

    if (!targetLocation) {
      return {
        isValid: false,
        error: "No suitable location found",
      }
    }

    const distance = calculateDistance(
      userLatitude,
      userLongitude,
      targetLocation.latitude,
      targetLocation.longitude
    )

    const isWithinRadius = distance <= targetLocation.radius

    return {
      isValid: isWithinRadius,
      error: isWithinRadius ? undefined : `You are ${Math.round(distance)}m away from ${targetLocation.name}. You must be within ${targetLocation.radius}m to clock in.`,
      details: {
        distance: Math.round(distance),
        radius: targetLocation.radius,
        locationName: targetLocation.name,
      },
      locationId: targetLocation.id,
      distance: Math.round(distance),
      locationName: targetLocation.name,
    }
  } catch (error) {
    console.error("Location validation error:", error)
    return {
      isValid: false,
      error: "Failed to validate location",
    }
  }
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lng2 - lng1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
} 