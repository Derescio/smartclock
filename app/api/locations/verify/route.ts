import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { AuthUser } from "@/types"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = session.user as AuthUser
    const body = await request.json()
    const { latitude, longitude } = body

    if (!latitude || !longitude) {
      return NextResponse.json({ 
        error: "Missing required fields: latitude, longitude" 
      }, { status: 400 })
    }

    // Get all active locations for the organization
    const locations = await prisma.location.findMany({
      where: {
        organizationId: user.organizationId,
        isActive: true,
      },
      orderBy: { name: "asc" },
    })

    if (locations.length === 0) {
      return NextResponse.json({
        isValid: false,
        error: "No work locations configured",
        locations: [],
        userLocation: { latitude, longitude }
      })
    }

    // Calculate distances to all locations
    const locationsWithDistance = locations.map(location => {
      const distance = calculateDistance(
        latitude,
        longitude,
        location.latitude,
        location.longitude
      )
      
      return {
        id: location.id,
        name: location.name,
        address: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
        radius: location.radius,
        distance: Math.round(distance),
        inRange: distance <= location.radius,
        status: distance <= location.radius ? "IN_RANGE" : "OUT_OF_RANGE"
      }
    }).sort((a, b) => a.distance - b.distance)

    const inRangeLocations = locationsWithDistance.filter(loc => loc.inRange)
    const closestLocation = locationsWithDistance[0]

    return NextResponse.json({
      isValid: inRangeLocations.length > 0,
      userLocation: { latitude, longitude },
      locations: locationsWithDistance,
      inRangeLocations,
      closestLocation,
      summary: {
        totalLocations: locations.length,
        inRangeCount: inRangeLocations.length,
        closestDistance: closestLocation.distance,
        canClockIn: inRangeLocations.length > 0
      }
    })

  } catch (error) {
    console.error("Location verification error:", error)
    return NextResponse.json(
      { error: "Failed to verify location" },
      { status: 500 }
    )
  }
}

// Helper function to calculate distance between two GPS coordinates
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lng2 - lng1) * Math.PI / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distance in meters
} 