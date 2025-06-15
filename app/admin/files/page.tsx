"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Navigation from "@/app/components/navigation";
import { UploadThingUpload } from "@/app/components/uploadthing-upload";
import {
    FileIcon,
    DownloadIcon,
    TrashIcon,
    ImageIcon,
    FileTextIcon,
    HardDriveIcon,
    FolderIcon
} from "lucide-react";
import { toast } from "sonner";
import { getOrganizationFiles, deleteFileAction } from "@/actions/file-actions";
import type { File } from "@prisma/client";

interface FileWithUploader extends File {
    uploadedBy: {
        name: string | null;
        email: string;
    };
}

interface UploadedFile {
    name: string;
    size: number;
    url: string;
    type: string;
}

export default function AdminFilesPage() {
    const { data: session } = useSession();
    const [files, setFiles] = useState<FileWithUploader[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalFiles: 0,
        totalSize: 0,
        fileTypes: {} as Record<string, number>
    });

    const loadFiles = async () => {
        try {
            const result = await getOrganizationFiles();
            if (result.success && result.files) {
                setFiles(result.files as FileWithUploader[]);

                // Calculate stats
                const totalFiles = result.files.length;
                const totalSize = result.files.reduce((sum, file) => sum + file.fileSize, 0);
                const fileTypes = result.files.reduce((acc, file) => {
                    acc[file.fileType] = (acc[file.fileType] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>);

                setStats({ totalFiles, totalSize, fileTypes });
            }
        } catch (error) {
            console.error("Failed to load files:", error);
            toast.error("Failed to load files");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFiles();
    }, []);

    const handleFileDelete = async (fileId: string) => {
        if (!confirm("Are you sure you want to delete this file?")) return;

        try {
            const result = await deleteFileAction(fileId);
            if (result.success) {
                toast.success("File deleted successfully");
                loadFiles(); // Reload files
            } else {
                toast.error(result.error || "Failed to delete file");
            }
        } catch (error) {
            console.error("Failed to delete file:", error);
            toast.error("Failed to delete file");
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const getFileTypeIcon = (fileType: string) => {
        switch (fileType) {
            case "COMPANY_LOGO":
            case "EMPLOYEE_AVATAR":
                return ImageIcon;
            case "DOCUMENT":
            case "ONBOARDING_DOCUMENT":
                return FileTextIcon;
            default:
                return FileIcon;
        }
    };

    const getFileTypeBadgeColor = (fileType: string) => {
        switch (fileType) {
            case "COMPANY_LOGO":
                return "bg-blue-100 text-blue-800";
            case "EMPLOYEE_AVATAR":
                return "bg-green-100 text-green-800";
            case "DOCUMENT":
                return "bg-purple-100 text-purple-800";
            case "ONBOARDING_DOCUMENT":
                return "bg-orange-100 text-orange-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const handleUploadComplete = (files: UploadedFile[]) => {
        console.log("Files uploaded:", files);
        loadFiles(); // Reload files to show new uploads
    };

    if (session?.user?.role !== "ADMIN") {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navigation />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
                        <p className="text-gray-600 mt-2">Only administrators can access file management.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navigation />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">File Management</h1>
                    <p className="text-gray-600 mt-2">
                        Manage company files, logos, and documents
                    </p>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <FolderIcon className="h-8 w-8 text-blue-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Files</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalFiles}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <HardDriveIcon className="h-8 w-8 text-green-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Size</p>
                                    <p className="text-2xl font-bold text-gray-900">{formatFileSize(stats.totalSize)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <ImageIcon className="h-8 w-8 text-purple-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Images</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {(stats.fileTypes.COMPANY_LOGO || 0) + (stats.fileTypes.EMPLOYEE_AVATAR || 0)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <FileTextIcon className="h-8 w-8 text-orange-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Documents</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {(stats.fileTypes.DOCUMENT || 0) + (stats.fileTypes.ONBOARDING_DOCUMENT || 0)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Upload Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Company Logo Upload */}
                    <UploadThingUpload
                        endpoint="companyLogo"
                        title="Company Logo"
                        description="Upload your organization's logo"
                        onUploadComplete={handleUploadComplete}
                    />

                    {/* Document Upload */}
                    <UploadThingUpload
                        endpoint="documentUpload"
                        title="General Documents"
                        description="Upload company documents and files"
                        onUploadComplete={handleUploadComplete}
                    />

                    {/* Onboarding Documents */}
                    <UploadThingUpload
                        endpoint="onboardingDocuments"
                        title="Onboarding Documents"
                        description="Upload HR and onboarding materials"
                        onUploadComplete={handleUploadComplete}
                    />
                </div>

                <Separator className="my-8" />

                {/* Files List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Uploaded Files</CardTitle>
                        <CardDescription>
                            All files uploaded to your organization
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500">Loading files...</p>
                            </div>
                        ) : files.length === 0 ? (
                            <div className="text-center py-8">
                                <FileIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">No files uploaded yet</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {files.map((file) => {
                                    const IconComponent = getFileTypeIcon(file.fileType);
                                    return (
                                        <div
                                            key={file.id}
                                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className={`p-2 rounded-lg ${getFileTypeBadgeColor(file.fileType)}`}>
                                                    <IconComponent className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{file.originalName}</p>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                        <span>Uploaded by {file.uploadedBy.name || file.uploadedBy.email}</span>
                                                        <span>•</span>
                                                        <span>{formatFileSize(file.fileSize)}</span>
                                                        <span>•</span>
                                                        <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Badge className={getFileTypeBadgeColor(file.fileType)}>
                                                    {file.fileType.replace(/_/g, " ")}
                                                </Badge>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => window.open(file.filePath, "_blank")}
                                                >
                                                    <DownloadIcon className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleFileDelete(file.id)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 