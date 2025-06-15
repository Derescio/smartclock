import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { AuthUser } from "@/types"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = session.user as AuthUser
    const { searchParams } = new URL(request.url)
    const latitude = searchParams.get("latitude")
    const longitude = searchParams.get("longitude")

    // Get all active locations for the organization
    const locations = await prisma.location.findMany({
      where: {
        organizationId: user.organizationId,
        isActive: true,
      },
      orderBy: { name: "asc" },
    })

    // If GPS coordinates provided, check which locations are in range
    let locationsWithDistance = locations
    if (latitude && longitude) {
      const userLat = parseFloat(latitude)
      const userLng = parseFloat(longitude)

      locationsWithDistance = locations.map(location => {
        const distance = calculateDistance(
          userLat,
          userLng,
          location.latitude,
          location.longitude
        )
        
        return {
          ...location,
          distance,
          inRange: distance <= location.radius,
        }
      }).sort((a, b) => a.distance - b.distance)
    }

    return NextResponse.json({
      locations: locationsWithDistance,
      userLocation: latitude && longitude ? {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      } : null,
    })

  } catch (error) {
    console.error("Get locations error:", error)
    return NextResponse.json(
      { error: "Failed to get locations" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = session.user as AuthUser
    
    // Check if user has permission to create locations (ADMIN or MANAGER)
    if (!["ADMIN", "MANAGER"].includes(user.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const body = await request.json()
    const { name, address, latitude, longitude, radius = 100 } = body

    // Validate required fields
    if (!name || !address || !latitude || !longitude) {
      return NextResponse.json({ 
        error: "Missing required fields: name, address, latitude, longitude" 
      }, { status: 400 })
    }

    // Generate QR code identifier
    const qrCode = `${user.organizationSlug}-${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now()}`

    const location = await prisma.location.create({
      data: {
        organizationId: user.organizationId,
        name,
        address,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        radius: parseInt(radius),
        qrCode,
        isActive: true,
      },
    })

    return NextResponse.json({
      success: true,
      location,
    })

  } catch (error) {
    console.error("Create location error:", error)
    return NextResponse.json(
      { error: "Failed to create location" },
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