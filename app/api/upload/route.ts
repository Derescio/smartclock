import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadFile, FileType } from '@/lib/file-upload'
import { prisma } from '@/lib/prisma'
import type { SessionUser } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user as SessionUser
    const formData = await request.formData()
    
    const file = formData.get('file') as File
    const fileType = formData.get('fileType') as FileType
    const description = formData.get('description') as string || ''
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    if (!fileType || !['COMPANY_LOGO', 'EMPLOYEE_AVATAR', 'DOCUMENT'].includes(fileType)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    // Upload file
    const uploadResult = await uploadFile(file, fileType, user.organizationId)
    
    if (!uploadResult.success) {
      return NextResponse.json({ error: uploadResult.error }, { status: 400 })
    }

    // Save file record to database
    const fileRecord = await prisma.file.create({
      data: {
        fileName: uploadResult.fileName!,
        originalName: uploadResult.originalName!,
        filePath: uploadResult.filePath!,
        fileType,
        fileSize: uploadResult.size!,
        description,
        uploadedById: user.id,
        organizationId: user.organizationId
      }
    })

    // Update user/organization record based on file type
    if (fileType === 'COMPANY_LOGO') {
      await prisma.organization.update({
        where: { id: user.organizationId },
        data: { logoUrl: uploadResult.filePath }
      })
    } else if (fileType === 'EMPLOYEE_AVATAR') {
      await prisma.user.update({
        where: { id: user.id },
        data: { avatarUrl: uploadResult.filePath }
      })
    }

    return NextResponse.json({
      success: true,
      file: {
        id: fileRecord.id,
        fileName: fileRecord.fileName,
        originalName: fileRecord.originalName,
        filePath: fileRecord.filePath,
        fileType: fileRecord.fileType,
        fileSize: fileRecord.fileSize,
        description: fileRecord.description,
        uploadedAt: fileRecord.createdAt
      }
    })

  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user as SessionUser
    const { searchParams } = new URL(request.url)
    const fileType = searchParams.get('fileType') as FileType
    const userId = searchParams.get('userId')

    // Build where clause for file filtering
    const whereClause: Record<string, unknown> = {
      organizationId: user.organizationId,
      isActive: true
    }

    if (fileType) {
      whereClause.fileType = fileType
    }

    if (userId) {
      whereClause.uploadedById = userId
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

    return NextResponse.json({ files })

  } catch (error) {
    console.error('Get files API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 