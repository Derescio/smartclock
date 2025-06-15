'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { requireRole } from "./auth"

export async function getOrganizationLocations() {
  const user = await requireRole(['MANAGER', 'ADMIN'])

  const locations = await prisma.location.findMany({
    where: {
      organizationId: user.organizationId,
      isActive: true
    },
    include: {
      users: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      _count: {
        select: {
          users: true,
          clockEvents: true
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  })

  return locations
}

export async function createLocation(data: {
  name: string
  address: string
  latitude: number
  longitude: number
  radius?: number
}) {
  try {
    const user = await requireRole(['ADMIN', 'MANAGER'])

    const location = await prisma.location.create({
      data: {
        organizationId: user.organizationId,
        name: data.name,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        radius: data.radius || 10,
        isActive: true
      }
    })

    revalidatePath('/manager')
    revalidatePath('/test-location')
    return { success: true, location }
  } catch (error) {
    console.error('Create location error:', error)
    return { success: false, error: 'Failed to create location' }
  }
}

export async function updateLocation(locationId: string, data: {
  name?: string
  address?: string
  latitude?: number
  longitude?: number
  radius?: number
  isActive?: boolean
}) {
  try {
    const user = await requireRole(['ADMIN', 'MANAGER'])

    const location = await prisma.location.update({
      where: { 
        id: locationId,
        organizationId: user.organizationId // Ensure user can only update their org's locations
      },
      data
    })

    revalidatePath('/manager')
    revalidatePath('/test-location')
    return { success: true, location }
  } catch (error) {
    console.error('Update location error:', error)
    return { success: false, error: 'Failed to update location' }
  }
}

export async function deleteLocation(locationId: string) {
  try {
    const user = await requireRole(['ADMIN', 'MANAGER'])

    // Check if location has users assigned
    const usersCount = await prisma.user.count({
      where: { locationId }
    })

    if (usersCount > 0) {
      return { 
        success: false, 
        error: `Cannot delete location. ${usersCount} users are assigned to this location.` 
      }
    }

    // Soft delete by setting isActive to false
    const location = await prisma.location.update({
      where: { 
        id: locationId,
        organizationId: user.organizationId
      },
      data: { isActive: false }
    })

    revalidatePath('/manager')
    revalidatePath('/test-location')
    return { success: true, location }
  } catch (error) {
    console.error('Delete location error:', error)
    return { success: false, error: 'Failed to delete location' }
  }
}

export async function validateLocationCoordinates(latitude: number, longitude: number) {
  try {
    const user = await requireRole(['EMPLOYEE', 'MANAGER', 'ADMIN'])

    const locations = await prisma.location.findMany({
      where: {
        organizationId: user.organizationId,
        isActive: true
      }
    })

    const validationResults = locations.map(location => {
      const distance = calculateDistance(
        latitude,
        longitude,
        location.latitude,
        location.longitude
      )

      return {
        locationId: location.id,
        locationName: location.name,
        distance: Math.round(distance),
        radius: location.radius,
        isWithinRadius: distance <= location.radius,
        coordinates: {
          latitude: location.latitude,
          longitude: location.longitude
        }
      }
    })

    // Find the closest valid location
    const validLocations = validationResults.filter(result => result.isWithinRadius)
    const closestLocation = validationResults.reduce((closest, current) => 
      current.distance < closest.distance ? current : closest
    )

    return {
      success: true,
      userCoordinates: { latitude, longitude },
      locations: validationResults,
      validLocations,
      closestLocation,
      canClockIn: validLocations.length > 0
    }
  } catch (error) {
    console.error('Validate location error:', error)
    return { success: false, error: 'Failed to validate location' }
  }
}

export async function generateLocationQRCode(locationId: string) {
  try {
    const user = await requireRole(['ADMIN', 'MANAGER'])

    // Generate a unique QR code for the location
    const qrCode = `smartclock-${locationId}-${Date.now()}`

    const location = await prisma.location.update({
      where: { 
        id: locationId,
        organizationId: user.organizationId
      },
      data: { qrCode }
    })

    revalidatePath('/manager')
    return { success: true, location, qrCode }
  } catch (error) {
    console.error('Generate QR code error:', error)
    return { success: false, error: 'Failed to generate QR code' }
  }
}

export async function getLocationAnalytics(locationId: string, days: number = 30) {
  try {
    const user = await requireRole(['MANAGER', 'ADMIN'])

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const clockEvents = await prisma.clockEvent.findMany({
      where: {
        locationId,
        organizationId: user.organizationId,
        timestamp: {
          gte: startDate
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    })

    const totalEvents = clockEvents.length
    const uniqueUsers = new Set(clockEvents.map(event => event.userId)).size
    const clockInEvents = clockEvents.filter(event => event.type === 'CLOCK_IN').length
    const clockOutEvents = clockEvents.filter(event => event.type === 'CLOCK_OUT').length

    // Group events by day
    const eventsByDay = clockEvents.reduce((acc, event) => {
      const day = event.timestamp.toISOString().split('T')[0]
      if (!acc[day]) acc[day] = 0
      acc[day]++
      return acc
    }, {} as Record<string, number>)

    return {
      success: true,
      analytics: {
        totalEvents,
        uniqueUsers,
        clockInEvents,
        clockOutEvents,
        eventsByDay,
        averageEventsPerDay: totalEvents / days,
        recentEvents: clockEvents.slice(0, 10)
      }
    }
  } catch (error) {
    console.error('Get location analytics error:', error)
    return { success: false, error: 'Failed to get location analytics' }
  }
}

// Helper function to calculate distance between two coordinates
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