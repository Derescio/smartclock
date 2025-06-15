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

    // Get all users in the organization (including admins who can also clock in)
    const teamMembers = await prisma.user.findMany({
      where: {
        organizationId: user.organizationId,
        isActive: true,
        role: {
          in: ['EMPLOYEE', 'MANAGER', 'ADMIN'] // Include all roles that can clock in
        }
      },
      include: {
        location: true,
        clockEvents: {
          where: {
            timestamp: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)) // Today's events
            }
          },
          orderBy: {
            timestamp: 'desc'
          }
        }
      }
    })

    // Calculate current status and hours for each team member
    const teamStatus = await Promise.all(
      teamMembers.map(async (member) => {
        const todayEvents = member.clockEvents
        
        // Determine current status
        let currentStatus = 'CLOCKED_OUT'
        let clockedInAt: string | undefined
        let lastBreakStart: string | undefined
        let todayHours = 0
        let breakTime = 0

        if (todayEvents.length > 0) {
          const latestEvent = todayEvents[0]
          
          // Determine current status based on latest event
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

          // Process events in chronological order
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

          // If still clocked in, add time until now
          if (currentStatus === 'CLOCKED_IN' && workStart) {
            totalWorkTime += (new Date().getTime() - workStart.getTime())
          }

          // If currently on break, add break time until now
          if (currentStatus === 'ON_BREAK' && currentBreakStart) {
            totalBreakTime += (new Date().getTime() - currentBreakStart.getTime())
          }

          todayHours = totalWorkTime / (1000 * 60 * 60) // Convert to hours
          breakTime = totalBreakTime / (1000 * 60 * 60) // Convert to hours
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
    )

    return NextResponse.json({
      success: true,
      teamMembers: teamStatus
    })

  } catch (error) {
    console.error('Team status error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team status' },
      { status: 500 }
    )
  }
} 