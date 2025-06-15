'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user || null
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  return user as any
}

export async function requireRole(allowedRoles: string[]) {
  const user = await requireAuth()
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Insufficient permissions')
  }
  return user
}

export async function createUser(data: {
  name: string
  email: string
  password: string
  organizationId: string
  role?: string
  locationId?: string
}) {
  try {
    const hashedPassword = await bcrypt.hash(data.password, 12)
    
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        organizationId: data.organizationId,
        role: data.role as any || 'EMPLOYEE',
        locationId: data.locationId,
      },
      include: {
        organization: true,
        location: true
      }
    })

    revalidatePath('/manager')
    return { success: true, user }
  } catch (error) {
    console.error('Create user error:', error)
    return { success: false, error: 'Failed to create user' }
  }
}

export async function updateUserProfile(userId: string, data: {
  name?: string
  email?: string
  locationId?: string
}) {
  try {
    const currentUser = await requireAuth()
    
    // Users can only update their own profile unless they're admin/manager
    if (currentUser.id !== userId && !['ADMIN', 'MANAGER'].includes(currentUser.role)) {
      throw new Error('Unauthorized')
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      include: {
        organization: true,
        location: true
      }
    })

    revalidatePath('/manager')
    revalidatePath('/')
    return { success: true, user }
  } catch (error) {
    console.error('Update user error:', error)
    return { success: false, error: 'Failed to update user' }
  }
}

export async function deactivateUser(userId: string) {
  try {
    await requireRole(['ADMIN', 'MANAGER'])
    
    const user = await prisma.user.update({
      where: { id: userId },
      data: { isActive: false }
    })

    revalidatePath('/manager')
    return { success: true, user }
  } catch (error) {
    console.error('Deactivate user error:', error)
    return { success: false, error: 'Failed to deactivate user' }
  }
} 