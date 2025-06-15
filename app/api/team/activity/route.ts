import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { AuthUser } from '@/types'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user as AuthUser

    // Check if user has manager or admin permissions
    if (!['MANAGER', 'ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get recent clock events from the last 24 hours
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const recentActivities = await prisma.clockEvent.findMany({
      where: {
        organizationId: user.organizationId,
        timestamp: {
          gte: yesterday
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        location: {
          select: {
            name: true,
            address: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 50 // Limit to last 50 activities
    })

    const activities = recentActivities.map(activity => ({
      id: activity.id,
      userName: activity.user.name,
      userEmail: activity.user.email,
      type: activity.type,
      timestamp: activity.timestamp.toISOString(),
      method: activity.method,
      location: activity.location ? {
        name: activity.location.name,
        address: activity.location.address
      } : undefined,
      coordinates: activity.latitude && activity.longitude ? {
        latitude: activity.latitude,
        longitude: activity.longitude
      } : undefined
    }))

    return NextResponse.json({
      success: true,
      activities
    })

  } catch (error) {
    console.error('Team activity error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team activity' },
      { status: 500 }
    )
  }
} 