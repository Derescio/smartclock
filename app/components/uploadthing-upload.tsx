"use client";

import React from "react";
import { UploadButton, UploadDropzone } from "@/lib/uploadthing";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileIcon, ImageIcon, FileTextIcon } from "lucide-react";
import { toast } from "sonner";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

interface UploadedFile {
    key: string;
    name: string;
    size: number;
    url: string;
    ufsUrl: string;
    type: string;
}

interface UploadThingUploadProps {
    endpoint: "companyLogo" | "employeeAvatar" | "documentUpload" | "onboardingDocuments" | "joinAvatar" | "joinDocuments";
    title?: string;
    description?: string;
    variant?: "button" | "dropzone";
    onUploadComplete?: (files: UploadedFile[]) => void;
    onUploadError?: (error: Error) => void;
    className?: string;
}

const getFileTypeInfo = (endpoint: keyof OurFileRouter) => {
    switch (endpoint) {
        case "companyLogo":
            return {
                icon: ImageIcon,
                allowedTypes: "Images (PNG, JPG, WebP, SVG)",
                maxSize: "4MB",
                maxFiles: 1,
                color: "bg-blue-100 text-blue-800"
            };
        case "employeeAvatar":
        case "joinAvatar":
            return {
                icon: ImageIcon,
                allowedTypes: "Images (PNG, JPG, WebP, SVG)",
                maxSize: "2MB",
                maxFiles: 1,
                color: "bg-green-100 text-green-800"
            };
        case "documentUpload":
        case "joinDocuments":
            return {
                icon: FileTextIcon,
                allowedTypes: "Documents (PDF, Word, Text)",
                maxSize: "16MB",
                maxFiles: 5,
                color: "bg-purple-100 text-purple-800"
            };
        case "onboardingDocuments":
            return {
                icon: FileIcon,
                allowedTypes: "Documents (PDF, Word)",
                maxSize: "16MB",
                maxFiles: 10,
                color: "bg-orange-100 text-orange-800"
            };
        default:
            return {
                icon: FileIcon,
                allowedTypes: "Various file types",
                maxSize: "16MB",
                maxFiles: 5,
                color: "bg-gray-100 text-gray-800"
            };
    }
};

export function UploadThingUpload({
    endpoint,
    title,
    description,
    onUploadComplete,
    onUploadError,
    variant = "dropzone",
    className = ""
}: UploadThingUploadProps) {
    const fileTypeInfo = getFileTypeInfo(endpoint);
    const IconComponent = fileTypeInfo.icon;

    const handleUploadComplete = (files: UploadedFile[]) => {
        toast.success(`Successfully uploaded ${files.length} file(s)`);
        onUploadComplete?.(files);
    };

    const handleUploadError = (error: Error) => {
        toast.error(`Upload failed: ${error.message}`);
        onUploadError?.(error);
    };

    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${fileTypeInfo.color}`}>
                        <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle className="text-lg">{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* File Type Information */}
                <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">
                        {fileTypeInfo.allowedTypes}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                        Max {fileTypeInfo.maxSize}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                        Up to {fileTypeInfo.maxFiles} file{fileTypeInfo.maxFiles > 1 ? 's' : ''}
                    </Badge>
                </div>

                {/* Upload Component */}
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6">
                    {variant === "dropzone" ? (
                        <UploadDropzone
                            endpoint={endpoint}
                            onClientUploadComplete={handleUploadComplete}
                            onUploadError={handleUploadError}
                            appearance={{
                                container: "w-full",
                                uploadIcon: "text-gray-400",
                                label: "text-gray-600 font-medium",
                                allowedContent: "text-gray-500 text-sm",
                                button: "bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-md font-medium transition-colors"
                            }}
                        />
                    ) : (
                        <div className="text-center">
                            <UploadButton
                                endpoint={endpoint}
                                onClientUploadComplete={handleUploadComplete}
                                onUploadError={handleUploadError}
                                appearance={{
                                    button: "bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-md font-medium transition-colors",
                                    allowedContent: "text-gray-500 text-sm mt-2"
                                }}
                            />
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
} 