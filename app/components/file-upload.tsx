"use client"

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
    UploadIcon,
    FileIcon,
    ImageIcon,
    XIcon,
    CheckCircleIcon,
    AlertCircleIcon
} from 'lucide-react'
import { toast } from 'sonner'
import { FILE_CONFIGS, FileType } from '@/lib/file-upload'

interface FileUploadProps {
    fileType: FileType
    onUploadComplete?: (file: UploadedFile) => void
    onUploadError?: (error: string) => void
    description?: string
    className?: string
    accept?: string
    multiple?: boolean
    maxFiles?: number
}

interface UploadedFile {
    id: string;
    name: string;
    size: number;
    type: string;
    url?: string;
}

interface UploadingFile {
    file: File;
    progress: number;
    status: 'uploading' | 'success' | 'error';
    error?: string;
    result?: { file: UploadedFile };
}

export default function FileUpload({
    fileType,
    onUploadComplete,
    onUploadError,
    description,
    className = '',
    accept,
    multiple = false,
    maxFiles = 1
}: FileUploadProps) {
    const [isDragOver, setIsDragOver] = useState(false)
    const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)

    const config = FILE_CONFIGS[fileType]
    const defaultAccept = accept || config.allowedTypes.join(',')

    const validateFile = useCallback((file: File): string | null => {
        if (file.size > config.maxSize) {
            return `File size exceeds ${Math.round(config.maxSize / (1024 * 1024))}MB limit`
        }

        if (!config.allowedTypes.includes(file.type)) {
            return `File type not allowed. Allowed: ${config.allowedTypes.join(', ')}`
        }

        return null
    }, [config])

    const uploadFile = useCallback(async (file: File): Promise<{ file: UploadedFile }> => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('fileType', fileType)
        if (description) {
            formData.append('description', description)
        }

        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Upload failed')
        }

        return response.json()
    }, [fileType, description])

    const handleFiles = useCallback(async (files: FileList) => {
        const fileArray = Array.from(files)

        if (!multiple && fileArray.length > 1) {
            toast.error('Only one file allowed')
            return
        }

        if (fileArray.length > maxFiles) {
            toast.error(`Maximum ${maxFiles} files allowed`)
            return
        }

        const newUploadingFiles: UploadingFile[] = fileArray.map(file => ({
            file,
            progress: 0,
            status: 'uploading' as const
        }))

        setUploadingFiles(prev => [...prev, ...newUploadingFiles])

        // Upload files
        for (let i = 0; i < fileArray.length; i++) {
            const file = fileArray[i]

            // Validate file
            const validationError = validateFile(file)
            if (validationError) {
                setUploadingFiles(prev =>
                    prev.map(uf =>
                        uf.file === file
                            ? { ...uf, status: 'error', error: validationError }
                            : uf
                    )
                )
                onUploadError?.(validationError)
                continue
            }

            try {
                // Simulate progress
                const progressInterval = setInterval(() => {
                    setUploadingFiles(prev =>
                        prev.map(uf =>
                            uf.file === file && uf.progress < 90
                                ? { ...uf, progress: uf.progress + 10 }
                                : uf
                        )
                    )
                }, 100)

                const result = await uploadFile(file)

                clearInterval(progressInterval)

                setUploadingFiles(prev =>
                    prev.map(uf =>
                        uf.file === file
                            ? { ...uf, progress: 100, status: 'success' as const, result }
                            : uf
                    )
                )

                onUploadComplete?.(result.file)
                toast.success(`${file.name} uploaded successfully`)

            } catch (error) {
                setUploadingFiles(prev =>
                    prev.map(uf =>
                        uf.file === file
                            ? { ...uf, status: 'error', error: (error as Error).message }
                            : uf
                    )
                )

                onUploadError?.((error as Error).message)
                toast.error(`Failed to upload ${file.name}`)
            }
        }
    }, [validateFile, multiple, maxFiles, onUploadComplete, onUploadError, uploadFile])

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)

        const files = e.dataTransfer.files
        if (files.length > 0) {
            handleFiles(files)
        }
    }, [handleFiles])

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files && files.length > 0) {
            handleFiles(files)
        }
        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }, [handleFiles])

    const removeFile = useCallback((file: File) => {
        setUploadingFiles(prev => prev.filter(uf => uf.file !== file))
    }, [])

    const getFileIcon = (file: File) => {
        if (file.type.startsWith('image/')) {
            return <ImageIcon className="h-8 w-8 text-blue-500" />
        }
        return <FileIcon className="h-8 w-8 text-gray-500" />
    }

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Upload Area */}
            <Card
                className={`
          border-2 border-dashed transition-colors cursor-pointer
          ${isDragOver
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }
        `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <CardContent className="p-8 text-center">
                    <UploadIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Upload {fileType.replace('_', ' ').toLowerCase()}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Drag and drop files here, or click to select
                    </p>
                    <p className="text-xs text-gray-500">
                        Max size: {Math.round(config.maxSize / (1024 * 1024))}MB •
                        Allowed: {config.allowedTypes.map(type => type.split('/')[1]).join(', ')}
                    </p>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={defaultAccept}
                        multiple={multiple}
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                </CardContent>
            </Card>

            {/* Uploading Files */}
            {uploadingFiles.length > 0 && (
                <div className="space-y-3">
                    {uploadingFiles.map((uploadingFile, index) => (
                        <Card key={index} className="p-4">
                            <div className="flex items-center space-x-3">
                                {getFileIcon(uploadingFile.file)}

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {uploadingFile.file.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {(uploadingFile.file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>

                                    {uploadingFile.status === 'uploading' && (
                                        <Progress value={uploadingFile.progress} className="mt-2" />
                                    )}

                                    {uploadingFile.status === 'error' && (
                                        <p className="text-xs text-red-600 mt-1">
                                            {uploadingFile.error}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center space-x-2">
                                    {uploadingFile.status === 'success' && (
                                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                    )}
                                    {uploadingFile.status === 'error' && (
                                        <AlertCircleIcon className="h-5 w-5 text-red-500" />
                                    )}

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            removeFile(uploadingFile.file)
                                        }}
                                    >
                                        <XIcon className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
} 