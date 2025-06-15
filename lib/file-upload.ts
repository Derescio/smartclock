import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { nanoid } from 'nanoid'

// File type configurations
export const FILE_CONFIGS = {
  COMPANY_LOGO: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'] as string[],
    directory: 'uploads/company-logos',
    maxWidth: 500,
    maxHeight: 500
  },
  EMPLOYEE_AVATAR: {
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'] as string[],
    directory: 'uploads/employee-avatars',
    maxWidth: 300,
    maxHeight: 300
  },
  DOCUMENT: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ] as string[],
    directory: 'uploads/documents'
  }
} as const

export type FileType = keyof typeof FILE_CONFIGS

export interface UploadResult {
  success: boolean
  filePath?: string
  fileName?: string
  originalName?: string
  size?: number
  error?: string
}

export interface FileValidationResult {
  isValid: boolean
  error?: string
}

// Validate file against configuration
export function validateFile(file: File, fileType: FileType): FileValidationResult {
  const config = FILE_CONFIGS[fileType]
  
  // Check file size
  if (file.size > config.maxSize) {
    return {
      isValid: false,
      error: `File size exceeds ${Math.round(config.maxSize / (1024 * 1024))}MB limit`
    }
  }
  
  // Check file type
  if (!(config.allowedTypes as string[]).includes(file.type)) {
    return {
      isValid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${config.allowedTypes.join(', ')}`
    }
  }
  
  return { isValid: true }
}

// Generate unique filename
export function generateFileName(originalName: string, organizationId?: string): string {
  const extension = path.extname(originalName)
  const timestamp = Date.now()
  const uniqueId = nanoid(8)
  const orgPrefix = organizationId ? `${organizationId}_` : ''
  
  return `${orgPrefix}${timestamp}_${uniqueId}${extension}`
}

// Ensure directory exists
async function ensureDirectoryExists(dirPath: string): Promise<void> {
  const fullPath = path.join(process.cwd(), 'public', dirPath)
  
  if (!existsSync(fullPath)) {
    await mkdir(fullPath, { recursive: true })
  }
}

// Upload file to server
export async function uploadFile(
  file: File,
  fileType: FileType,
  organizationId?: string
): Promise<UploadResult> {
  try {
    // Validate file
    const validation = validateFile(file, fileType)
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error
      }
    }
    
    const config = FILE_CONFIGS[fileType]
    const fileName = generateFileName(file.name, organizationId)
    const uploadDir = config.directory
    
    // Ensure upload directory exists
    await ensureDirectoryExists(uploadDir)
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Create file path
    const filePath = path.join(process.cwd(), 'public', uploadDir, fileName)
    
    // Write file
    await writeFile(filePath, buffer)
    
    // Return public URL path
    const publicPath = `/${uploadDir}/${fileName}`
    
    return {
      success: true,
      filePath: publicPath,
      fileName,
      originalName: file.name,
      size: file.size
    }
    
  } catch (error) {
    console.error('File upload error:', error)
    return {
      success: false,
      error: 'Failed to upload file'
    }
  }
}

// Delete file from server
export async function deleteFile(filePath: string): Promise<boolean> {
  try {
    const fullPath = path.join(process.cwd(), 'public', filePath)
    
    if (existsSync(fullPath)) {
      const fs = await import('fs/promises')
      await fs.unlink(fullPath)
      return true
    }
    
    return false
  } catch (error) {
    console.error('File deletion error:', error)
    return false
  }
}

// Get file info
export function getFileInfo(filePath: string) {
  const fileName = path.basename(filePath)
  const extension = path.extname(filePath)
  const nameWithoutExt = path.basename(filePath, extension)
  
  return {
    fileName,
    extension,
    nameWithoutExt,
    isImage: ['.jpg', '.jpeg', '.png', '.webp', '.svg'].includes(extension.toLowerCase()),
    isPDF: extension.toLowerCase() === '.pdf'
  }
} 