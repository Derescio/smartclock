'use server'

import { prisma } from "@/lib/prisma"
import { requireRole } from "./auth"

export async function getEmployeeTimesheets(startDate?: string, endDate?: string) {
  try {
    const user = await requireRole(['MANAGER', 'ADMIN', 'EMPLOYEE'])

    const whereClause: any = {
      organizationId: user.organizationId,
      userId: user.id
    }

    if (startDate && endDate) {
      whereClause.startDate = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    const timesheets = await prisma.timesheet.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            employeeId: true
          }
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        startDate: 'desc'
      }
    })

    return { success: true, timesheets }
  } catch (error) {
    console.error('Get employee timesheets error:', error)
    return { success: false, error: 'Failed to fetch timesheets' }
  }
}

export async function generateTimesheetFromClockEvents(startDate: string, endDate: string) {
  try {
    const user = await requireRole(['MANAGER', 'ADMIN', 'EMPLOYEE'])

    const start = new Date(startDate)
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999) // Include the entire end date

    // Get all clock events for the period
    const clockEvents = await prisma.clockEvent.findMany({
      where: {
        userId: user.id,
        organizationId: user.organizationId,
        timestamp: {
          gte: start,
          lte: end
        }
      },
      orderBy: {
        timestamp: 'asc'
      }
    })

    // Calculate hours worked
    let totalHours = 0
    let regularHours = 0
    let overtimeHours = 0
    let breakHours = 0

    // Group events by day
    const eventsByDay = new Map<string, typeof clockEvents>()
    
    clockEvents.forEach(event => {
      const dayKey = event.timestamp.toISOString().split('T')[0]
      if (!eventsByDay.has(dayKey)) {
        eventsByDay.set(dayKey, [])
      }
      eventsByDay.get(dayKey)!.push(event)
    })

    // Calculate hours for each day
    eventsByDay.forEach((dayEvents) => {
      let dayTotalMinutes = 0
      let dayBreakMinutes = 0
      let clockInTime: Date | null = null
      let breakStartTime: Date | null = null

      for (const event of dayEvents) {
        switch (event.type) {
          case 'CLOCK_IN':
            clockInTime = event.timestamp
            break
          case 'CLOCK_OUT':
            if (clockInTime) {
              dayTotalMinutes += (event.timestamp.getTime() - clockInTime.getTime()) / (1000 * 60)
              clockInTime = null
            }
            break
          case 'BREAK_START':
            breakStartTime = event.timestamp
            break
          case 'BREAK_END':
            if (breakStartTime) {
              dayBreakMinutes += (event.timestamp.getTime() - breakStartTime.getTime()) / (1000 * 60)
              breakStartTime = null
            }
            break
        }
      }

      const dayHours = Math.max(0, dayTotalMinutes / 60)
      const dayBreakHours = dayBreakMinutes / 60

      totalHours += dayHours
      breakHours += dayBreakHours

      // Calculate regular vs overtime (assuming 8 hours is regular)
      if (dayHours <= 8) {
        regularHours += dayHours
      } else {
        regularHours += 8
        overtimeHours += (dayHours - 8)
      }
    })

    // Check if timesheet already exists for this period
    const existingTimesheet = await prisma.timesheet.findFirst({
      where: {
        userId: user.id,
        organizationId: user.organizationId,
        startDate: start,
        endDate: end
      }
    })

    if (existingTimesheet) {
      // Update existing timesheet
      const timesheet = await prisma.timesheet.update({
        where: { id: existingTimesheet.id },
        data: {
          totalHours: Math.round(totalHours * 100) / 100,
          regularHours: Math.round(regularHours * 100) / 100,
          overtimeHours: Math.round(overtimeHours * 100) / 100,
          breakHours: Math.round(breakHours * 100) / 100,
          status: 'PENDING',
          submittedAt: new Date()
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              employeeId: true
            }
          }
        }
      })

      return { success: true, timesheet }
    } else {
      // Create new timesheet
      const timesheet = await prisma.timesheet.create({
        data: {
          organizationId: user.organizationId,
          userId: user.id,
          startDate: start,
          endDate: end,
          totalHours: Math.round(totalHours * 100) / 100,
          regularHours: Math.round(regularHours * 100) / 100,
          overtimeHours: Math.round(overtimeHours * 100) / 100,
          breakHours: Math.round(breakHours * 100) / 100,
          status: 'PENDING',
          submittedAt: new Date()
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              employeeId: true
            }
          }
        }
      })

      return { success: true, timesheet }
    }
  } catch (error) {
    console.error('Generate timesheet error:', error)
    return { success: false, error: 'Failed to generate timesheet' }
  }
}

export async function getTimesheetById(timesheetId: string) {
  try {
    const user = await requireRole(['MANAGER', 'ADMIN', 'EMPLOYEE'])

    const timesheet = await prisma.timesheet.findFirst({
      where: {
        id: timesheetId,
        organizationId: user.organizationId,
        // Employees can only view their own timesheets
        ...(user.role === 'EMPLOYEE' ? { userId: user.id } : {})
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            employeeId: true
          }
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!timesheet) {
      return { success: false, error: 'Timesheet not found' }
    }

    return { success: true, timesheet }
  } catch (error) {
    console.error('Get timesheet by ID error:', error)
    return { success: false, error: 'Failed to fetch timesheet' }
  }
}

export async function getWeeklyTimesheet(weekStartDate: string) {
  try {
    const user = await requireRole(['MANAGER', 'ADMIN', 'EMPLOYEE'])

    const startDate = new Date(weekStartDate)
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 6)
    endDate.setHours(23, 59, 59, 999)

    // Get clock events for the week
    const clockEvents = await prisma.clockEvent.findMany({
      where: {
        userId: user.id,
        organizationId: user.organizationId,
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        timestamp: 'asc'
      }
    })

    // Group events by day and calculate daily hours
    const dailyHours = new Map<string, {
      date: string
      hours: number
      clockIn?: string
      clockOut?: string
      breaks: { start: string, end?: string }[]
    }>()

    // Initialize all days of the week
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      const dateKey = date.toISOString().split('T')[0]
      dailyHours.set(dateKey, {
        date: dateKey,
        hours: 0,
        breaks: []
      })
    }

    // Group events by day
    const eventsByDay = new Map<string, typeof clockEvents>()
    clockEvents.forEach(event => {
      const dayKey = event.timestamp.toISOString().split('T')[0]
      if (!eventsByDay.has(dayKey)) {
        eventsByDay.set(dayKey, [])
      }
      eventsByDay.get(dayKey)!.push(event)
    })

    // Calculate hours for each day
    eventsByDay.forEach((dayEvents, dayKey) => {
      let dayTotalMinutes = 0
      let clockInTime: Date | null = null
      let clockOutTime: Date | null = null
      const breaks: { start: string, end?: string }[] = []
      let currentBreakStart: Date | null = null

      for (const event of dayEvents) {
        switch (event.type) {
          case 'CLOCK_IN':
            clockInTime = event.timestamp
            if (!dailyHours.get(dayKey)?.clockIn) {
              dailyHours.get(dayKey)!.clockIn = event.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
            break
          case 'CLOCK_OUT':
            if (clockInTime) {
              dayTotalMinutes += (event.timestamp.getTime() - clockInTime.getTime()) / (1000 * 60)
              clockInTime = null
            }
            clockOutTime = event.timestamp
            dailyHours.get(dayKey)!.clockOut = event.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            break
          case 'BREAK_START':
            currentBreakStart = event.timestamp
            breaks.push({
              start: event.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            })
            break
          case 'BREAK_END':
            if (currentBreakStart && breaks.length > 0) {
              breaks[breaks.length - 1].end = event.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              currentBreakStart = null
            }
            break
        }
      }

      const dayHours = Math.max(0, dayTotalMinutes / 60)
      const dayData = dailyHours.get(dayKey)!
      dayData.hours = Math.round(dayHours * 100) / 100
      dayData.breaks = breaks
    })

    const totalWeekHours = Array.from(dailyHours.values()).reduce((sum, day) => sum + day.hours, 0)

    return { 
      success: true, 
      weeklyData: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        totalHours: Math.round(totalWeekHours * 100) / 100,
        dailyHours: Array.from(dailyHours.values())
      }
    }
  } catch (error) {
    console.error('Get weekly timesheet error:', error)
    return { success: false, error: 'Failed to fetch weekly timesheet' }
  }
} 