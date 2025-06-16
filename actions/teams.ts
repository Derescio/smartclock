'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { requireRole } from "./auth"

export async function getOrganizationTeams() {
  try {
    const user = await requireRole(['MANAGER', 'ADMIN'])

    const teams = await prisma.team.findMany({
      where: {
        organizationId: user.organizationId,
        isActive: true
      },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                employeeId: true,
                department: {
                  select: {
                    id: true,
                    name: true,
                    color: true
                  }
                }
              }
            }
          }
        },
        _count: {
          select: {
            members: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return { success: true, teams }
  } catch (error) {
    console.error('Get teams error:', error)
    return { success: false, error: 'Failed to fetch teams' }
  }
}

export async function createTeam(data: {
  name: string
  description?: string
  color?: string
  managerId?: string
  memberIds: string[]
}) {
  try {
    const user = await requireRole(['MANAGER', 'ADMIN'])

    const team = await prisma.team.create({
      data: {
        organizationId: user.organizationId,
        name: data.name,
        description: data.description,
        color: data.color,
        managerId: data.managerId,
        members: {
          create: data.memberIds.map(userId => ({
            userId
          }))
        }
      },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    revalidatePath('/manager/teams')
    return { success: true, team }
  } catch (error) {
    console.error('Create team error:', error)
    return { success: false, error: 'Failed to create team' }
  }
}

export async function updateTeam(teamId: string, data: {
  name?: string
  description?: string
  color?: string
  managerId?: string
  memberIds?: string[]
}) {
  try {
    const user = await requireRole(['MANAGER', 'ADMIN'])

    // If memberIds are provided, update team membership
    if (data.memberIds !== undefined) {
      // Remove existing members and add new ones
      await prisma.teamMember.deleteMany({
        where: { teamId }
      })

      await prisma.teamMember.createMany({
        data: data.memberIds.map(userId => ({
          teamId,
          userId
        }))
      })
    }

    const updateData: {
      name?: string
      description?: string
      color?: string
      managerId?: string
    } = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.color !== undefined) updateData.color = data.color
    if (data.managerId !== undefined) updateData.managerId = data.managerId

    const team = await prisma.team.update({
      where: {
        id: teamId,
        organizationId: user.organizationId
      },
      data: updateData,
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    revalidatePath('/manager/teams')
    return { success: true, team }
  } catch (error) {
    console.error('Update team error:', error)
    return { success: false, error: 'Failed to update team' }
  }
}

export async function deleteTeam(teamId: string) {
  try {
    const user = await requireRole(['MANAGER', 'ADMIN'])

    await prisma.team.update({
      where: {
        id: teamId,
        organizationId: user.organizationId
      },
      data: {
        isActive: false
      }
    })

    revalidatePath('/manager/teams')
    return { success: true }
  } catch (error) {
    console.error('Delete team error:', error)
    return { success: false, error: 'Failed to delete team' }
  }
}

export async function getTeamStats() {
  try {
    const user = await requireRole(['MANAGER', 'ADMIN'])

    const [totalTeams, activeTeams, totalMembers] = await Promise.all([
      prisma.team.count({
        where: {
          organizationId: user.organizationId,
          isActive: true
        }
      }),
      prisma.team.count({
        where: {
          organizationId: user.organizationId,
          isActive: true
        }
      }),
      prisma.teamMember.count({
        where: {
          team: {
            organizationId: user.organizationId,
            isActive: true
          }
        }
      })
    ])

    const avgTeamSize = totalTeams > 0 ? Math.round(totalMembers / totalTeams) : 0

    return {
      success: true,
      stats: {
        totalTeams,
        activeTeams,
        totalMembers,
        avgTeamSize
      }
    }
  } catch (error) {
    console.error('Get team stats error:', error)
    return { success: false, error: 'Failed to fetch team stats' }
  }
} 