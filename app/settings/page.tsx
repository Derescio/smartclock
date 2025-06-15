"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SettingsIcon } from "lucide-react"
import Providers from "../components/providers"
import Navigation from "../components/navigation"
import { useSession } from "next-auth/react"

export default function SettingsPage() {
    const { data: session } = useSession();

    if (!session) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navigation />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900">Please sign in</h1>
                        <p className="text-gray-600 mt-2">You need to be signed in to access settings.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Providers session={session}>
            <div className="min-h-screen bg-gray-50">
                <Navigation />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 font-heading">Settings</h1>
                        <p className="text-gray-600 mt-2">Configure your SmartClock preferences</p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center font-heading">
                                <SettingsIcon className="h-5 w-5 mr-2 text-blue-600" />
                                Application Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <p className="text-gray-600">Settings page coming soon...</p>
                                <p className="text-sm text-gray-500">
                                    This page will include options for notifications, time zone settings,
                                    GPS preferences, and other application configurations.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Providers>
    )
} 