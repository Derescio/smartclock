'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { requireRole } from "./auth"

export async function getOrganizationSchedules() {
  try {
    const user = await requireRole(['MANAGER', 'ADMIN'])

    const schedules = await prisma.schedule.findMany({
      where: {
        organizationId: user.organizationId,
        isActive: true
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
        department: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        location: {
          select: {
            id: true,
            name: true,
            address: true
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true
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
      orderBy: [
        { startDate: 'asc' },
        { startTime: 'asc' }
      ]
    })

    return { success: true, schedules }
  } catch (error) {
    console.error('Get schedules error:', error)
    return { success: false, error: 'Failed to fetch schedules' }
  }
}

export async function createSchedule(data: {
  title: string
  description?: string
  scheduleType: string
  startDate: string
  endDate?: string
  startTime: string
  endTime: string
  breakDuration?: number
  isRecurring: boolean
  recurrence?: string
  recurrenceDays?: string[]
  recurrenceEnd?: string
  userId?: string
  departmentId?: string
  locationId?: string
  teamId?: string
}) {
  try {
    const user = await requireRole(['MANAGER', 'ADMIN'])

    const schedule = await prisma.schedule.create({
      data: {
        organizationId: user.organizationId,
        title: data.title,
        description: data.description,
        scheduleType: data.scheduleType as any,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        startTime: data.startTime,
        endTime: data.endTime,
        breakDuration: data.breakDuration,
        isRecurring: data.isRecurring,
        recurrence: data.recurrence as any,
        recurrenceDays: data.recurrenceDays ? JSON.stringify(data.recurrenceDays) : null,
        recurrenceEnd: data.recurrenceEnd ? new Date(data.recurrenceEnd) : null,
        userId: data.userId,
        departmentId: data.departmentId,
        locationId: data.locationId,
        teamId: data.teamId,
        createdBy: user.id,
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        department: {
          select: {
            id: true,
            name: true
          }
        },
        location: {
          select: {
            id: true,
            name: true
          }
        },
        Team: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      }
    })

    revalidatePath('/manager/schedules')
    return { success: true, schedule }
  } catch (error) {
    console.error('Create schedule error:', error)
    return { success: false, error: 'Failed to create schedule' }
  }
}

export async function updateSchedule(scheduleId: string, data: {
  title?: string
  description?: string
  scheduleType?: string
  startDate?: string
  endDate?: string
  startTime?: string
  endTime?: string
  breakDuration?: number
  isRecurring?: boolean
  recurrence?: string
  recurrenceDays?: string[]
  recurrenceEnd?: string
  userId?: string
  departmentId?: string
  locationId?: string
  teamId?: string
  status?: string
}) {
  try {
    const user = await requireRole(['MANAGER', 'ADMIN'])

    const updateData: any = {}
    
    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description
    if (data.scheduleType !== undefined) updateData.scheduleType = data.scheduleType
    if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate)
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null
    if (data.startTime !== undefined) updateData.startTime = data.startTime
    if (data.endTime !== undefined) updateData.endTime = data.endTime
    if (data.breakDuration !== undefined) updateData.breakDuration = data.breakDuration
    if (data.isRecurring !== undefined) updateData.isRecurring = data.isRecurring
    if (data.recurrence !== undefined) updateData.recurrence = data.recurrence
    if (data.recurrenceDays !== undefined) updateData.recurrenceDays = data.recurrenceDays ? JSON.stringify(data.recurrenceDays) : null
    if (data.recurrenceEnd !== undefined) updateData.recurrenceEnd = data.recurrenceEnd ? new Date(data.recurrenceEnd) : null
    if (data.userId !== undefined) updateData.userId = data.userId
    if (data.departmentId !== undefined) updateData.departmentId = data.departmentId
    if (data.locationId !== undefined) updateData.locationId = data.locationId
    if (data.teamId !== undefined) updateData.teamId = data.teamId
    if (data.status !== undefined) updateData.status = data.status

    const schedule = await prisma.schedule.update({
      where: {
        id: scheduleId,
        organizationId: user.organizationId
      },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        department: {
          select: {
            id: true,
            name: true
          }
        },
        location: {
          select: {
            id: true,
            name: true
          }
        },
        Team: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      }
    })

    revalidatePath('/manager/schedules')
    return { success: true, schedule }
  } catch (error) {
    console.error('Update schedule error:', error)
    return { success: false, error: 'Failed to update schedule' }
  }
}

export async function deleteSchedule(scheduleId: string) {
  try {
    const user = await requireRole(['MANAGER', 'ADMIN'])

    // Soft delete by setting isActive to false
    const schedule = await prisma.schedule.update({
      where: {
        id: scheduleId,
        organizationId: user.organizationId
      },
      data: {
        isActive: false
      }
    })

    revalidatePath('/manager/schedules')
    return { success: true, schedule }
  } catch (error) {
    console.error('Delete schedule error:', error)
    return { success: false, error: 'Failed to delete schedule' }
  }
}

export async function approveSchedule(scheduleId: string) {
  try {
    const user = await requireRole(['MANAGER', 'ADMIN'])

    const schedule = await prisma.schedule.update({
      where: {
        id: scheduleId,
        organizationId: user.organizationId
      },
      data: {
        status: 'APPROVED',
        approvedBy: user.id,
        approvedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    revalidatePath('/manager/schedules')
    return { success: true, schedule }
  } catch (error) {
    console.error('Approve schedule error:', error)
    return { success: false, error: 'Failed to approve schedule' }
  }
}

export async function rejectSchedule(scheduleId: string, reason?: string) {
  try {
    const user = await requireRole(['MANAGER', 'ADMIN'])

    // First get the current schedule to access its description
    const currentSchedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
      select: { description: true }
    })

    const schedule = await prisma.schedule.update({
      where: {
        id: scheduleId,
        organizationId: user.organizationId
      },
      data: {
        status: 'REJECTED',
        approvedBy: user.id,
        approvedAt: new Date(),
        description: reason ? `${currentSchedule?.description || ''}\n\nRejection reason: ${reason}` : currentSchedule?.description
      }
    })

    revalidatePath('/manager/schedules')
    return { success: true, schedule }
  } catch (error) {
    console.error('Reject schedule error:', error)
    return { success: false, error: 'Failed to reject schedule' }
  }
}

export async function getSchedulesByEmployee(userId: string, startDate?: string, endDate?: string) {
  try {
    const user = await requireRole(['MANAGER', 'ADMIN', 'EMPLOYEE'])

    // Employees can only view their own schedules unless they're a manager
    if (user.role === 'EMPLOYEE' && user.id !== userId) {
      return { success: false, error: 'Unauthorized to view other employee schedules' }
    }

    const whereClause: any = {
      organizationId: user.organizationId,
      isActive: true,
      status: 'APPROVED',
      OR: [
        { userId: userId },
        { 
          departmentId: {
            in: await prisma.user.findUnique({
              where: { id: userId },
              select: { departmentId: true }
            }).then(u => u?.departmentId ? [u.departmentId] : [])
          }
        }
      ]
    }

    if (startDate && endDate) {
      whereClause.AND = [
        {
          OR: [
            {
              startDate: {
                gte: new Date(startDate),
                lte: new Date(endDate)
              }
            },
            {
              AND: [
                { isRecurring: true },
                {
                  OR: [
                    { recurrenceEnd: null },
                    { recurrenceEnd: { gte: new Date(startDate) } }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }

    const schedules = await prisma.schedule.findMany({
      where: whereClause,
      include: {
        location: {
          select: {
            id: true,
            name: true,
            address: true
          }
        },
        department: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      },
      orderBy: [
        { startDate: 'asc' },
        { startTime: 'asc' }
      ]
    })

    return { success: true, schedules }
  } catch (error) {
    console.error('Get employee schedules error:', error)
    return { success: false, error: 'Failed to fetch employee schedules' }
  }
}

export async function getScheduleStats() {
  try {
    const user = await requireRole(['MANAGER', 'ADMIN'])

    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)

    const [totalSchedules, pendingSchedules, thisWeekSchedules, activeEmployees] = await Promise.all([
      prisma.schedule.count({
        where: {
          organizationId: user.organizationId,
          isActive: true
        }
      }),
      prisma.schedule.count({
        where: {
          organizationId: user.organizationId,
          isActive: true,
          status: 'PENDING'
        }
      }),
      prisma.schedule.count({
        where: {
          organizationId: user.organizationId,
          isActive: true,
          status: 'APPROVED',
          startDate: {
            gte: startOfWeek,
            lte: endOfWeek
          }
        }
      }),
      prisma.schedule.findMany({
        where: {
          organizationId: user.organizationId,
          isActive: true,
          status: 'APPROVED',
          userId: { not: null }
        },
        select: {
          userId: true
        },
        distinct: ['userId']
      }).then(schedules => schedules.length)
    ])

    return {
      success: true,
      stats: {
        totalSchedules,
        pendingSchedules,
        thisWeekSchedules,
        activeEmployees
      }
    }
  } catch (error) {
    console.error('Get schedule stats error:', error)
    return { success: false, error: 'Failed to fetch schedule statistics' }
  }
}

export async function getScheduleById(scheduleId: string) {
  try {
    const user = await requireRole(['MANAGER', 'ADMIN', 'EMPLOYEE'])

    const schedule = await prisma.schedule.findFirst({
      where: {
        id: scheduleId,
        organizationId: user.organizationId,
        isActive: true
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
        department: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        location: {
          select: {
            id: true,
            name: true,
            address: true
          }
        },
        Team: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true
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

    if (!schedule) {
      return { success: false, error: 'Schedule not found' }
    }

    return { success: true, schedule }
  } catch (error) {
    console.error('Get schedule by ID error:', error)
    return { success: false, error: 'Failed to fetch schedule' }
  }
}

export async function getTodaysSchedule() {
  try {
    const user = await requireRole(['MANAGER', 'ADMIN', 'EMPLOYEE'])

    const today = new Date()
    const startOfDay = new Date(today)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(today)
    endOfDay.setHours(23, 59, 59, 999)

    // Find schedules for today that apply to this user
    const schedules = await prisma.schedule.findMany({
      where: {
        organizationId: user.organizationId,
        isActive: true,
        status: 'APPROVED',
        OR: [
          // Direct assignment to user
          { userId: user.id },
          // Department assignment
          { 
            departmentId: user.departmentId,
            userId: null
          },
          // Location assignment
          { 
            locationId: user.locationId,
            userId: null,
            departmentId: null
          },
          // Team assignment
          {
            teamId: {
              in: await prisma.teamMember.findMany({
                where: { userId: user.id },
                select: { teamId: true }
              }).then(members => members.map(m => m.teamId))
            },
            userId: null,
            departmentId: null,
            locationId: null
          }
        ],
        AND: [
          {
            OR: [
              // Single day schedule for today
              {
                startDate: {
                  gte: startOfDay,
                  lte: endOfDay
                },
                isRecurring: false
              },
              // Recurring schedule that applies today
              {
                isRecurring: true,
                startDate: { lte: today },
                OR: [
                  { recurrenceEnd: null },
                  { recurrenceEnd: { gte: today } }
                ]
              }
            ]
          }
        ]
      },
      include: {
        location: {
          select: {
            id: true,
            name: true,
            address: true
          }
        },
        department: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        Team: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    })

    // Filter recurring schedules by day of week
    const todaySchedules = schedules.filter(schedule => {
      if (!schedule.isRecurring) return true
      
      if (schedule.recurrenceDays) {
        const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
        const todayDay = dayNames[today.getDay()]
        const recurrenceDays = JSON.parse(schedule.recurrenceDays)
        return recurrenceDays.includes(todayDay)
      }
      
      return true
    })

    return { success: true, schedules: todaySchedules }
  } catch (error) {
    console.error('Get todays schedule error:', error)
    return { success: false, error: 'Failed to fetch today\'s schedule' }
  }
} 