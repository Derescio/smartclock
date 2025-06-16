'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { requireRole } from "./auth"

export async function getTeamStatus() {
  const user = await requireRole(['MANAGER', 'ADMIN'])

  const teamMembers = await prisma.user.findMany({
    where: {
      organizationId: user.organizationId,
      isActive: true,
      role: {
        in: ['EMPLOYEE', 'MANAGER', 'ADMIN']
      }
    },
    include: {
      location: true,
      clockEvents: {
        where: {
          timestamp: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        },
        orderBy: {
          timestamp: 'desc'
        }
      }
    }
  })

  const teamStatus = teamMembers.map((member) => {
    const todayEvents = member.clockEvents
    
    let currentStatus = 'CLOCKED_OUT'
    let clockedInAt: string | undefined
    let lastBreakStart: string | undefined
    let todayHours = 0
    let breakTime = 0

    if (todayEvents.length > 0) {
      const latestEvent = todayEvents[0]
      
      if (latestEvent.type === 'CLOCK_IN') {
        currentStatus = 'CLOCKED_IN'
        clockedInAt = latestEvent.timestamp.toISOString()
      } else if (latestEvent.type === 'BREAK_START') {
        currentStatus = 'ON_BREAK'
        lastBreakStart = latestEvent.timestamp.toISOString()
      } else if (latestEvent.type === 'BREAK_END') {
        currentStatus = 'CLOCKED_IN'
      } else if (latestEvent.type === 'CLOCK_OUT') {
        currentStatus = 'CLOCKED_OUT'
      }

      // Calculate hours worked today
      let workStart: Date | null = null
      let totalWorkTime = 0
      let totalBreakTime = 0
      let currentBreakStart: Date | null = null

      const chronologicalEvents = [...todayEvents].reverse()
      
      for (const event of chronologicalEvents) {
        const eventTime = event.timestamp

        switch (event.type) {
          case 'CLOCK_IN':
            workStart = eventTime
            break
          
          case 'BREAK_START':
            if (workStart) {
              totalWorkTime += (eventTime.getTime() - workStart.getTime())
            }
            currentBreakStart = eventTime
            break
          
          case 'BREAK_END':
            if (currentBreakStart) {
              totalBreakTime += (eventTime.getTime() - currentBreakStart.getTime())
              currentBreakStart = null
            }
            workStart = eventTime
            break
          
          case 'CLOCK_OUT':
            if (workStart) {
              totalWorkTime += (eventTime.getTime() - workStart.getTime())
              workStart = null
            }
            break
        }
      }

      if (currentStatus === 'CLOCKED_IN' && workStart) {
        totalWorkTime += (new Date().getTime() - workStart.getTime())
      }

      if (currentStatus === 'ON_BREAK' && currentBreakStart) {
        totalBreakTime += (new Date().getTime() - currentBreakStart.getTime())
      }

      todayHours = totalWorkTime / (1000 * 60 * 60)
      breakTime = totalBreakTime / (1000 * 60 * 60)
    }

    return {
      id: member.id,
      name: member.name,
      email: member.email,
      role: member.role,
      currentStatus,
      todayHours: Math.max(0, todayHours),
      breakTime: Math.max(0, breakTime),
      lastActivity: todayEvents[0]?.timestamp.toISOString() || new Date().toISOString(),
      location: member.location ? {
        name: member.location.name,
        address: member.location.address
      } : undefined,
      clockedInAt,
      lastBreakStart
    }
  })

  return teamStatus
}

export async function getTeamStats() {
  const user = await requireRole(['MANAGER', 'ADMIN'])

  const today = new Date()
  const startOfDay = new Date(today.setHours(0, 0, 0, 0))

  const totalEmployees = await prisma.user.count({
    where: {
      organizationId: user.organizationId,
      isActive: true,
      role: {
        in: ['EMPLOYEE', 'MANAGER', 'ADMIN']
      }
    }
  })

  const todayClockEvents = await prisma.clockEvent.findMany({
    where: {
      organizationId: user.organizationId,
      timestamp: {
        gte: startOfDay
      }
    },
    include: {
      user: true
    },
    orderBy: {
      timestamp: 'desc'
    }
  })

  const userStatusMap = new Map()
  const userEvents = new Map()

  todayClockEvents.forEach(event => {
    const userId = event.userId
    if (!userStatusMap.has(userId)) {
      let status = 'CLOCKED_OUT'
      if (event.type === 'CLOCK_IN') status = 'CLOCKED_IN'
      else if (event.type === 'BREAK_START') status = 'ON_BREAK'
      else if (event.type === 'BREAK_END') status = 'CLOCKED_IN'
      
      userStatusMap.set(userId, status)
    }

    if (!userEvents.has(userId)) {
      userEvents.set(userId, [])
    }
    userEvents.get(userId).push(event)
  })

  let totalHoursToday = 0
  userEvents.forEach((events, userId) => {
    const chronologicalEvents = events.reverse()
    let workStart = null
    let totalWorkTime = 0

    for (const event of chronologicalEvents) {
      const eventTime = event.timestamp

      switch (event.type) {
        case 'CLOCK_IN':
          workStart = eventTime
          break
        case 'BREAK_START':
          if (workStart) {
            totalWorkTime += (eventTime.getTime() - workStart.getTime())
          }
          break
        case 'BREAK_END':
          workStart = eventTime
          break
        case 'CLOCK_OUT':
          if (workStart) {
            totalWorkTime += (eventTime.getTime() - workStart.getTime())
            workStart = null
          }
          break
      }
    }

    const currentStatus = userStatusMap.get(userId)
    if (currentStatus === 'CLOCKED_IN' && workStart) {
      totalWorkTime += (new Date().getTime() - workStart.getTime())
    }

    const hoursWorked = totalWorkTime / (1000 * 60 * 60)
    totalHoursToday += Math.max(0, hoursWorked)
  })

  let currentlyWorking = 0
  let onBreak = 0
  let clockedOut = 0

  const allEmployees = await prisma.user.findMany({
    where: {
      organizationId: user.organizationId,
      isActive: true,
      role: {
        in: ['EMPLOYEE', 'MANAGER', 'ADMIN']
      }
    },
    select: { id: true }
  })

  allEmployees.forEach(employee => {
    const status = userStatusMap.get(employee.id) || 'CLOCKED_OUT'
    switch (status) {
      case 'CLOCKED_IN':
        currentlyWorking++
        break
      case 'ON_BREAK':
        onBreak++
        break
      case 'CLOCKED_OUT':
        clockedOut++
        break
    }
  })

  const employeesWhoWorkedToday = userEvents.size
  const attendanceRate = totalEmployees > 0 ? (employeesWhoWorkedToday / totalEmployees) * 100 : 0
  const averageHoursPerEmployee = totalEmployees > 0 ? totalHoursToday / totalEmployees : 0

  return {
    totalEmployees,
    currentlyWorking,
    onBreak,
    clockedOut,
    totalHoursToday: Math.round(totalHoursToday * 10) / 10,
    averageHoursPerEmployee: Math.round(averageHoursPerEmployee * 10) / 10,
    attendanceRate: Math.round(attendanceRate * 10) / 10
  }
}

export async function getTeamActivity() {
  const user = await requireRole(['MANAGER', 'ADMIN'])

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
    take: 50
  })

  return recentActivities.map(activity => ({
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
}

export async function getAllTeamMembers() {
  const user = await requireRole(['MANAGER', 'ADMIN'])

  const teamMembers = await prisma.user.findMany({
    where: {
      organizationId: user.organizationId,
      isActive: true
    },
    include: {
      location: true,
      organization: true,
      department: true
    },
    orderBy: {
      name: 'asc'
    }
  })

  return teamMembers
}

export async function updateTeamMemberRole(userId: string, role: string) {
  try {
    await requireRole(['ADMIN', 'MANAGER'])

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role: role as 'EMPLOYEE' | 'MANAGER' | 'ADMIN' | 'SUPER_ADMIN' },
      include: {
        location: true,
        organization: true
      }
    })

    revalidatePath('/manager')
    return { success: true, user }
  } catch (error) {
    console.error('Update team member role error:', error)
    return { success: false, error: 'Failed to update team member role' }
  }
}

export async function refreshManagerDashboard() {
  revalidatePath('/manager')
} 