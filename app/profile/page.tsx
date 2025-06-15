"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/app/components/navigation";
import { UploadThingUpload } from "@/app/components/uploadthing-upload";
import { UserIcon, MailIcon, BuildingIcon, CalendarIcon } from "lucide-react";

interface UploadedFile {
    key: string;
    name: string;
    size: number;
    url: string;
    ufsUrl: string;
    type: string;
}

export default function ProfilePage() {
    const { data: session, update } = useSession();

    const handleAvatarUpload = async (files: UploadedFile[]) => {
        if (files.length > 0) {
            // Update the session with the new avatar URL
            await update({
                ...session,
                user: {
                    ...session?.user,
                    image: files[0].ufsUrl || files[0].url // Fallback for compatibility
                }
            });

            // Refresh the page to show the new avatar
            window.location.reload();
        }
    };

    if (!session) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navigation />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900">Please sign in</h1>
                        <p className="text-gray-600 mt-2">You need to be signed in to view your profile.</p>
                    </div>
                </div>
            </div>
        );
    }

    const user = session.user;
    const initials = user.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
        : user.email?.[0]?.toUpperCase() || 'U';

    return (
        <div className="min-h-screen bg-gray-50">
            <Navigation />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
                    <p className="text-gray-600 mt-2">
                        Manage your account settings and preferences
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Information */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Information</CardTitle>
                                <CardDescription>
                                    Your account details and organization information
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* User Details */}
                                <div className="flex items-center space-x-4">
                                    <Avatar className="h-16 w-16">
                                        <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
                                        <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900">{user.name}</h3>
                                        <p className="text-gray-600">{user.email}</p>
                                        <Badge variant="outline" className="mt-1">
                                            {user.role}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Profile Details Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <UserIcon className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Full Name</p>
                                            <p className="text-gray-900">{user.name || "Not provided"}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <MailIcon className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Email Address</p>
                                            <p className="text-gray-900">{user.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-purple-100 rounded-lg">
                                            <BuildingIcon className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Organization</p>
                                            <p className="text-gray-900">{user.organizationName || "Not available"}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-orange-100 rounded-lg">
                                            <CalendarIcon className="h-5 w-5 text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Member Since</p>
                                            <p className="text-gray-900">Not available</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Avatar Upload */}
                    <div>
                        <UploadThingUpload
                            endpoint="employeeAvatar"
                            title="Profile Picture"
                            description="Upload your profile picture"
                            variant="dropzone"
                            onUploadComplete={handleAvatarUpload}
                            className="h-fit"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
} 