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

    // Parse YYYY-MM-DD format explicitly to avoid timezone issues
    const parseLocalDate = (dateStr: string) => {
      const [year, month, day] = dateStr.split('-').map(Number)
      return new Date(year, month - 1, day) // month is 0-indexed
    }

    const startLocal = parseLocalDate(startDate)
    const endLocal = parseLocalDate(endDate)
    
    // Convert to UTC for database storage while preserving the date
    const startUTC = new Date(Date.UTC(
      startLocal.getFullYear(),
      startLocal.getMonth(),
      startLocal.getDate(),
      0, 0, 0, 0
    ))
    const endUTC = new Date(Date.UTC(
      endLocal.getFullYear(),
      endLocal.getMonth(),
      endLocal.getDate(),
      23, 59, 59, 999
    ))

    // Validate date range
    if (startUTC > endUTC) {
      return { success: false, error: 'Start date must be before end date' }
    }

    // Enhanced duplicate prevention - check for overlapping timesheets
    const existingTimesheets = await prisma.timesheet.findMany({
      where: {
        userId: user.id,
        organizationId: user.organizationId,
        OR: [
          // Exact match (existing logic)
          {
            startDate: startUTC,
            endDate: endUTC
          },
          // Overlapping ranges
          {
            AND: [
              { startDate: { lte: endUTC } },
              { endDate: { gte: startUTC } }
            ]
          }
        ]
      }
    })

    // Check if any existing timesheet overlaps and is not rejected
    const conflictingTimesheet = existingTimesheets.find(ts => 
      ts.status === 'APPROVED' || ts.status === 'PENDING'
    )

    if (conflictingTimesheet) {
      if (conflictingTimesheet.status === 'APPROVED') {
        return { 
          success: false, 
          error: 'A timesheet overlapping this period has already been approved and cannot be modified. Please contact your manager if changes are needed.' 
        }
      } else if (conflictingTimesheet.status === 'PENDING') {
        return { 
          success: false, 
          error: 'A timesheet overlapping this period is already pending approval. Please wait for approval/rejection before creating a new timesheet for this period.' 
        }
      }
    }

    // Get all clock events for the period
    const clockEvents = await prisma.clockEvent.findMany({
      where: {
        userId: user.id,
        organizationId: user.organizationId,
        timestamp: {
          gte: startUTC,
          lte: endUTC
        }
      },
      orderBy: {
        timestamp: 'asc'
      }
    })

    // Validate that there are clock events to generate timesheet from
    if (clockEvents.length === 0) {
      return { 
        success: false, 
        error: 'No clock events found for the selected period. Please ensure you have clocked in/out during this time.' 
      }
    }

    // Calculate hours worked
    let totalHours = 0
    let regularHours = 0
    let overtimeHours = 0
    let breakHours = 0

    // Group events by day
    const eventsByDay = new Map<string, typeof clockEvents>()
    
    clockEvents.forEach(event => {
      // Use UTC date to avoid timezone shifts
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

    // Validate that there are actual worked hours
    if (totalHours === 0) {
      return { 
        success: false, 
        error: 'No worked hours found for the selected period. Please ensure you have valid clock in/out pairs.' 
      }
    }

    // Check if we have an exact match that was rejected (allow regeneration)
    const exactMatchRejected = existingTimesheets.find(ts => 
      ts.startDate.getTime() === startUTC.getTime() && 
      ts.endDate.getTime() === endUTC.getTime() && 
      ts.status === 'REJECTED'
    )

    if (exactMatchRejected) {
      // Update the rejected timesheet instead of creating a new one
      const timesheet = await prisma.timesheet.update({
        where: { id: exactMatchRejected.id },
        data: {
          totalHours: Math.round(totalHours * 100) / 100,
          regularHours: Math.round(regularHours * 100) / 100,
          overtimeHours: Math.round(overtimeHours * 100) / 100,
          breakHours: Math.round(breakHours * 100) / 100,
          status: 'PENDING',
          submittedAt: new Date(),
          notes: null, // Clear previous rejection notes
          approvedBy: null,
          approvedAt: null
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

      return { success: true, timesheet, updated: true, actualDates: { start: startUTC.toISOString().split('T')[0], end: endUTC.toISOString().split('T')[0] } }
    } else {
      // Create new timesheet (only if no conflicts)
      const timesheet = await prisma.timesheet.create({
        data: {
          organizationId: user.organizationId,
          userId: user.id,
          startDate: startUTC,
          endDate: endUTC,
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

      return { 
        success: true, 
        timesheet, 
        updated: false, 
        actualDates: { start: startUTC.toISOString().split('T')[0], end: endUTC.toISOString().split('T')[0] } 
      }
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

    // Parse YYYY-MM-DD format explicitly to avoid timezone issues
    const parseLocalDate = (dateStr: string) => {
      const [year, month, day] = dateStr.split('-').map(Number)
      return new Date(year, month - 1, day) // month is 0-indexed
    }

    const startLocal = parseLocalDate(weekStartDate)
    const startDate = new Date(Date.UTC(
      startLocal.getFullYear(),
      startLocal.getMonth(),
      startLocal.getDate(),
      0, 0, 0, 0
    ))
    
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
        dailyHours: Array.from(dailyHours.values()).sort((a, b) => a.date.localeCompare(b.date))
      }
    }
  } catch (error) {
    console.error('Get weekly timesheet error:', error)
    return { success: false, error: 'Failed to fetch weekly timesheet' }
  }
}

// NEW APPROVAL FUNCTIONS

export async function getAllPendingTimesheets() {
  try {
    const user = await requireRole(['MANAGER', 'ADMIN'])

    // Managers can see employee timesheets, Admins can see all including manager timesheets
    let whereClause: any = {
      organizationId: user.organizationId,
      status: 'PENDING'
    }

    if (user.role === 'MANAGER') {
      // Managers can only approve employee timesheets
      whereClause.user = {
        role: 'EMPLOYEE',
        organizationId: user.organizationId
      }
    }
    // Admins can see all pending timesheets (no additional filter needed)

    const timesheets = await prisma.timesheet.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            employeeId: true,
            role: true,
            department: {
              select: {
                id: true,
                name: true,
                color: true
              }
            }
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
        submittedAt: 'desc'
      }
    })

    return { success: true, timesheets }
  } catch (error) {
    console.error('Get pending timesheets error:', error)
    return { success: false, error: 'Failed to fetch pending timesheets' }
  }
}

export async function approveTimesheet(timesheetId: string, notes?: string) {
  try {
    const user = await requireRole(['MANAGER', 'ADMIN'])

    // Get the timesheet to check permissions
    const timesheet = await prisma.timesheet.findFirst({
      where: {
        id: timesheetId,
        organizationId: user.organizationId
      },
      include: {
        user: {
          select: {
            id: true,
            role: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!timesheet) {
      return { success: false, error: 'Timesheet not found' }
    }

    if (timesheet.status !== 'PENDING') {
      return { success: false, error: 'Timesheet is not pending approval' }
    }

    // Role-based approval validation
    if (user.role === 'MANAGER' && timesheet.user.role !== 'EMPLOYEE') {
      return { 
        success: false, 
        error: 'Managers can only approve employee timesheets. Manager and admin timesheets require admin approval.' 
      }
    }

    // Prevent self-approval
    if (timesheet.userId === user.id) {
      return { success: false, error: 'You cannot approve your own timesheet' }
    }

    const updatedTimesheet = await prisma.timesheet.update({
      where: { id: timesheetId },
      data: {
        status: 'APPROVED',
        approvedBy: user.id,
        approvedAt: new Date(),
        notes: notes
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

    return { success: true, timesheet: updatedTimesheet }
  } catch (error) {
    console.error('Approve timesheet error:', error)
    return { success: false, error: 'Failed to approve timesheet' }
  }
}

export async function rejectTimesheet(timesheetId: string, notes: string) {
  try {
    const user = await requireRole(['MANAGER', 'ADMIN'])

    if (!notes || notes.trim().length === 0) {
      return { success: false, error: 'Rejection reason is required' }
    }

    // Get the timesheet to check permissions
    const timesheet = await prisma.timesheet.findFirst({
      where: {
        id: timesheetId,
        organizationId: user.organizationId
      },
      include: {
        user: {
          select: {
            id: true,
            role: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!timesheet) {
      return { success: false, error: 'Timesheet not found' }
    }

    if (timesheet.status !== 'PENDING') {
      return { success: false, error: 'Timesheet is not pending approval' }
    }

    // Role-based approval validation
    if (user.role === 'MANAGER' && timesheet.user.role !== 'EMPLOYEE') {
      return { 
        success: false, 
        error: 'Managers can only reject employee timesheets. Manager and admin timesheets require admin approval.' 
      }
    }

    // Prevent self-rejection
    if (timesheet.userId === user.id) {
      return { success: false, error: 'You cannot reject your own timesheet' }
    }

    const updatedTimesheet = await prisma.timesheet.update({
      where: { id: timesheetId },
      data: {
        status: 'REJECTED',
        approvedBy: user.id,
        approvedAt: new Date(),
        notes: notes
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

    return { success: true, timesheet: updatedTimesheet }
  } catch (error) {
    console.error('Reject timesheet error:', error)
    return { success: false, error: 'Failed to reject timesheet' }
  }
}

export async function bulkApproveTimesheets(timesheetIds: string[], notes?: string) {
  try {
    const user = await requireRole(['MANAGER', 'ADMIN'])

    if (timesheetIds.length === 0) {
      return { success: false, error: 'No timesheets selected' }
    }

    // Get all timesheets to validate permissions
    const timesheets = await prisma.timesheet.findMany({
      where: {
        id: { in: timesheetIds },
        organizationId: user.organizationId,
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            id: true,
            role: true,
            name: true
          }
        }
      }
    })

    // Filter timesheets based on role permissions
    const validTimesheetIds = timesheets
      .filter(timesheet => {
        // Prevent self-approval
        if (timesheet.userId === user.id) return false
        
        // Managers can only approve employee timesheets
        if (user.role === 'MANAGER' && timesheet.user.role !== 'EMPLOYEE') return false
        
        return true
      })
      .map(t => t.id)

    if (validTimesheetIds.length === 0) {
      return { success: false, error: 'No valid timesheets to approve based on your permissions' }
    }

    const result = await prisma.timesheet.updateMany({
      where: {
        id: { in: validTimesheetIds }
      },
      data: {
        status: 'APPROVED',
        approvedBy: user.id,
        approvedAt: new Date(),
        notes: notes
      }
    })

    return { 
      success: true, 
      approved: result.count,
      total: timesheetIds.length,
      message: `Successfully approved ${result.count} out of ${timesheetIds.length} timesheets`
    }
  } catch (error) {
    console.error('Bulk approve timesheets error:', error)
    return { success: false, error: 'Failed to approve timesheets' }
  }
} 