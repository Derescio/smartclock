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

    const today = new Date()
    const startOfDay = new Date(today.setHours(0, 0, 0, 0))

    // Get all active employees in the organization (including admins who can clock in)
    const totalEmployees = await prisma.user.count({
      where: {
        organizationId: user.organizationId,
        isActive: true,
        role: {
          in: ['EMPLOYEE', 'MANAGER', 'ADMIN']
        }
      }
    })

    // Get today's clock events for all employees
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

    // Group events by user to determine current status
    const userStatusMap = new Map()
    const userHoursMap = new Map()

    // Process events to determine current status for each user
    todayClockEvents.forEach(event => {
      const userId = event.userId
      if (!userStatusMap.has(userId)) {
        // This is the latest event for this user
        let status = 'CLOCKED_OUT'
        if (event.type === 'CLOCK_IN') status = 'CLOCKED_IN'
        else if (event.type === 'BREAK_START') status = 'ON_BREAK'
        else if (event.type === 'BREAK_END') status = 'CLOCKED_IN'
        
        userStatusMap.set(userId, status)
      }
    })

    // Calculate hours worked for each user
    const userEvents = new Map()
    todayClockEvents.forEach(event => {
      const userId = event.userId
      if (!userEvents.has(userId)) {
        userEvents.set(userId, [])
      }
      userEvents.get(userId).push(event)
    })

    let totalHoursToday = 0
    userEvents.forEach((events, userId) => {
      const chronologicalEvents = events.reverse() // Oldest first
      let workStart = null
      let totalWorkTime = 0
      let currentBreakStart = null

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

      // If still clocked in, add time until now
      const currentStatus = userStatusMap.get(userId)
      if (currentStatus === 'CLOCKED_IN' && workStart) {
        totalWorkTime += (new Date().getTime() - workStart.getTime())
      }

      const hoursWorked = totalWorkTime / (1000 * 60 * 60)
      userHoursMap.set(userId, Math.max(0, hoursWorked))
      totalHoursToday += Math.max(0, hoursWorked)
    })

    // Count status distribution
    let currentlyWorking = 0
    let onBreak = 0
    let clockedOut = 0

    // Get all employee IDs (including admins who can clock in)
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

    // Calculate attendance rate (employees who clocked in today)
    const employeesWhoWorkedToday = userEvents.size
    const attendanceRate = totalEmployees > 0 ? (employeesWhoWorkedToday / totalEmployees) * 100 : 0

    // Calculate average hours per employee
    const averageHoursPerEmployee = totalEmployees > 0 ? totalHoursToday / totalEmployees : 0

    const stats = {
      totalEmployees,
      currentlyWorking,
      onBreak,
      clockedOut,
      totalHoursToday: Math.round(totalHoursToday * 10) / 10, // Round to 1 decimal
      averageHoursPerEmployee: Math.round(averageHoursPerEmployee * 10) / 10,
      attendanceRate: Math.round(attendanceRate * 10) / 10
    }

    return NextResponse.json({
      success: true,
      stats
    })

  } catch (error) {
    console.error('Team stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team stats' },
      { status: 500 }
    )
  }
} 