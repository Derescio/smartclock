"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { deleteFile } from "@/lib/file-upload"
import { revalidatePath } from "next/cache"
import type { SessionUser } from "@/types"

export async function deleteFileAction(fileId: string) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return { success: false, error: "Unauthorized" }
    }

    const user = session.user as SessionUser

    // Get file details
    const file = await prisma.file.findFirst({
      where: {
        id: fileId,
        organizationId: user.organizationId
      }
    })

    if (!file) {
      return { success: false, error: "File not found" }
    }

    // Check permissions - only admins or file uploader can delete
    if (user.role !== 'ADMIN' && file.uploadedById !== user.id) {
      return { success: false, error: "Insufficient permissions" }
    }

    // Delete physical file
    const fileDeleted = await deleteFile(file.filePath)
    
    if (!fileDeleted) {
      console.warn(`Physical file not found: ${file.filePath}`)
    }

    // Delete database record
    await prisma.file.delete({
      where: { id: fileId }
    })

    // If it was a company logo or user avatar, update the reference
    if (file.fileType === 'COMPANY_LOGO') {
      await prisma.organization.update({
        where: { id: user.organizationId },
        data: { logoUrl: null }
      })
    } else if (file.fileType === 'EMPLOYEE_AVATAR') {
      await prisma.user.update({
        where: { id: file.uploadedById },
        data: { avatarUrl: null }
      })
    }

    revalidatePath('/admin/files')
    revalidatePath('/profile')
    
    return { success: true }

  } catch (error) {
    console.error("Delete file error:", error)
    return { success: false, error: "Failed to delete file" }
  }
}

export async function updateFileAction(fileId: string, description: string) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return { success: false, error: "Unauthorized" }
    }

    const user = session.user as SessionUser

    // Check if file exists and user has access
    const file = await prisma.file.findFirst({
      where: {
        id: fileId,
        organizationId: user.organizationId
      }
    })

    if (!file) {
      return { success: false, error: "File not found" }
    }

    // Check permissions
    if (user.role !== 'ADMIN' && file.uploadedById !== user.id) {
      return { success: false, error: "Insufficient permissions" }
    }

    // Update file description
    await prisma.file.update({
      where: { id: fileId },
      data: { description }
    })

    revalidatePath('/admin/files')
    
    return { success: true }

  } catch (error) {
    console.error("Update file error:", error)
    return { success: false, error: "Failed to update file" }
  }
}

export async function getOrganizationFiles(fileType?: string) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return { success: false, error: "Unauthorized" }
    }

    const user = session.user as SessionUser

    const whereClause: any = {
      organizationId: user.organizationId,
      isActive: true
    }

    if (fileType) {
      whereClause.fileType = fileType
    }

    const files = await prisma.file.findMany({
      where: whereClause,
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return { success: true, files }

  } catch (error) {
    console.error("Get files error:", error)
    return { success: false, error: "Failed to get files" }
  }
}

export async function getUserFiles(userId?: string) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return { success: false, error: "Unauthorized" }
    }

    const user = session.user as SessionUser
    const targetUserId = userId || user.id

    // Check permissions - users can only see their own files unless they're admin
    if (user.role !== 'ADMIN' && targetUserId !== user.id) {
      return { success: false, error: "Insufficient permissions" }
    }

    const files = await prisma.file.findMany({
      where: {
        uploadedById: targetUserId,
        organizationId: user.organizationId,
        isActive: true
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return { success: true, files }

  } catch (error) {
    console.error("Get user files error:", error)
    return { success: false, error: "Failed to get user files" }
  }
} 