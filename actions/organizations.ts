'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { requireRole } from "./auth"

export async function getOrganizationDetails() {
  const user = await requireRole(['ADMIN', 'MANAGER'])

  const organization = await prisma.organization.findUnique({
    where: { id: user.organizationId },
    include: {
      _count: {
        select: {
          users: true,
          locations: true,
          clockEvents: true,
          timesheets: true
        }
      }
    }
  })

  if (!organization) {
    throw new Error('Organization not found')
  }

  return organization
}

export async function updateOrganizationSettings(data: {
  name?: string
  settings?: any
}) {
  try {
    const user = await requireRole(['ADMIN'])

    const organization = await prisma.organization.update({
      where: { id: user.organizationId },
      data
    })

    revalidatePath('/manager')
    revalidatePath('/admin')
    return { success: true, organization }
  } catch (error) {
    console.error('Update organization error:', error)
    return { success: false, error: 'Failed to update organization' }
  }
}

export async function getOrganizationStats(days: number = 30) {
  try {
    const user = await requireRole(['ADMIN', 'MANAGER'])

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get basic counts
    const [totalUsers, totalLocations, totalClockEvents, totalTimesheets] = await Promise.all([
      prisma.user.count({
        where: { 
          organizationId: user.organizationId,
          isActive: true
        }
      }),
      prisma.location.count({
        where: { 
          organizationId: user.organizationId,
          isActive: true
        }
      }),
      prisma.clockEvent.count({
        where: { 
          organizationId: user.organizationId,
          timestamp: { gte: startDate }
        }
      }),
      prisma.timesheet.count({
        where: { 
          organizationId: user.organizationId,
          createdAt: { gte: startDate }
        }
      })
    ])

    // Get user role distribution
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      where: {
        organizationId: user.organizationId,
        isActive: true
      },
      _count: {
        role: true
      }
    })

    // Get recent activity
    const recentClockEvents = await prisma.clockEvent.findMany({
      where: {
        organizationId: user.organizationId,
        timestamp: { gte: startDate }
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        location: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 10
    })

    // Calculate total hours worked
    const clockEvents = await prisma.clockEvent.findMany({
      where: {
        organizationId: user.organizationId,
        timestamp: { gte: startDate }
      },
      orderBy: {
        timestamp: 'asc'
      }
    })

    let totalHours = 0
    const userHours = new Map()

    // Group events by user
    const eventsByUser = clockEvents.reduce((acc, event) => {
      if (!acc[event.userId]) acc[event.userId] = []
      acc[event.userId].push(event)
      return acc
    }, {} as Record<string, any[]>)

    // Calculate hours for each user
    Object.entries(eventsByUser).forEach(([userId, events]) => {
      let userTotalMinutes = 0
      let clockInTime: Date | null = null

      for (const event of events) {
        switch (event.type) {
          case 'CLOCK_IN':
            clockInTime = event.timestamp
            break
          case 'CLOCK_OUT':
            if (clockInTime) {
              userTotalMinutes += (event.timestamp.getTime() - clockInTime.getTime()) / (1000 * 60)
              clockInTime = null
            }
            break
        }
      }

      const userHoursWorked = userTotalMinutes / 60
      userHours.set(userId, userHoursWorked)
      totalHours += userHoursWorked
    })

    return {
      success: true,
      stats: {
        totalUsers,
        totalLocations,
        totalClockEvents,
        totalTimesheets,
        totalHours: Math.round(totalHours * 10) / 10,
        averageHoursPerUser: totalUsers > 0 ? Math.round((totalHours / totalUsers) * 10) / 10 : 0,
        usersByRole: usersByRole.reduce((acc, item) => {
          acc[item.role] = item._count.role
          return acc
        }, {} as Record<string, number>),
        recentActivity: recentClockEvents.map(event => ({
          id: event.id,
          type: event.type,
          timestamp: event.timestamp.toISOString(),
          userName: event.user.name,
          userEmail: event.user.email,
          locationName: event.location?.name
        }))
      }
    }
  } catch (error) {
    console.error('Get organization stats error:', error)
    return { success: false, error: 'Failed to get organization stats' }
  }
}

export async function lookupOrganizationBySlug(slug: string) {
  try {
    const organization = await prisma.organization.findUnique({
      where: { 
        slug,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        slug: true,
        planType: true,
        billingStatus: true
      }
    })

    return { success: true, organization }
  } catch (error) {
    console.error('Lookup organization error:', error)
    return { success: false, error: 'Failed to lookup organization' }
  }
}

export async function createOrganization(data: {
  name: string
  slug: string
  planType?: string
  adminName: string
  adminEmail: string
  adminPassword: string
}) {
  try {
    // Check if slug is already taken
    const existingOrg = await prisma.organization.findUnique({
      where: { slug: data.slug }
    })

    if (existingOrg) {
      return { success: false, error: 'Organization slug already exists' }
    }

    // Create organization and admin user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: data.name,
          slug: data.slug,
          planType: data.planType as any || 'BASIC',
          billingStatus: 'TRIAL',
          trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          isActive: true
        }
      })

      const bcrypt = require('bcryptjs')
      const hashedPassword = await bcrypt.hash(data.adminPassword, 12)

      const adminUser = await tx.user.create({
        data: {
          organizationId: organization.id,
          name: data.adminName,
          email: data.adminEmail,
          password: hashedPassword,
          role: 'ADMIN',
          isActive: true
        }
      })

      return { organization, adminUser }
    })

    revalidatePath('/register')
    return { success: true, ...result }
  } catch (error) {
    console.error('Create organization error:', error)
    return { success: false, error: 'Failed to create organization' }
  }
}

export async function getOrganizationUsage() {
  try {
    const user = await requireRole(['ADMIN'])

    const organization = await prisma.organization.findUnique({
      where: { id: user.organizationId },
      include: {
        _count: {
          select: {
            users: {
              where: { isActive: true }
            }
          }
        }
      }
    })

    if (!organization) {
      throw new Error('Organization not found')
    }

    const currentUsers = organization._count.users
    const userLimit = organization.employeeLimit
    const usagePercentage = (currentUsers / userLimit) * 100

    // Calculate days remaining in trial/subscription
    let daysRemaining = null
    if (organization.billingStatus === 'TRIAL' && organization.trialEndsAt) {
      const now = new Date()
      const trialEnd = new Date(organization.trialEndsAt)
      daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    } else if (organization.subscriptionEnd) {
      const now = new Date()
      const subEnd = new Date(organization.subscriptionEnd)
      daysRemaining = Math.ceil((subEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    }

    return {
      success: true,
      usage: {
        currentUsers,
        userLimit,
        usagePercentage: Math.round(usagePercentage),
        planType: organization.planType,
        billingStatus: organization.billingStatus,
        daysRemaining,
        isNearLimit: usagePercentage > 80,
        canAddUsers: currentUsers < userLimit
      }
    }
  } catch (error) {
    console.error('Get organization usage error:', error)
    return { success: false, error: 'Failed to get organization usage' }
  }
} 