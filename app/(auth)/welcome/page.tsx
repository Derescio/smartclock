"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ClockIcon,
    CheckCircleIcon,
    MapPinIcon,
    UsersIcon,
    FileTextIcon,
    ArrowRightIcon,
    SparklesIcon,
    PlayIcon
} from "lucide-react";
import Link from "next/link";
import { OnboardingTour } from "@/app/components/onboarding-tour";

function WelcomeContent() {
    const searchParams = useSearchParams();
    const [showConfetti, setShowConfetti] = useState(true);
    const [showTour, setShowTour] = useState(false);

    const userName = searchParams.get("name") || "there";
    const organizationName = searchParams.get("org") || "your organization";

    useEffect(() => {
        // Hide confetti effect after 3 seconds
        const timer = setTimeout(() => setShowConfetti(false), 3000);
        return () => clearTimeout(timer);
    }, []);

    const handleStartTour = () => {
        setShowTour(true);
    };

    const handleTourComplete = () => {
        // Mark tour as completed in localStorage
        localStorage.setItem("smartclock-tour-completed", "true");
    };

    const nextSteps = [
        {
            icon: ClockIcon,
            title: "Clock In for the First Time",
            description: "Try your first clock-in using GPS or manual entry",
            action: "Start Clocking",
            href: "/",
            color: "bg-blue-100 text-blue-800"
        },
        {
            icon: MapPinIcon,
            title: "Set Up Work Locations",
            description: "Add your office locations for GPS-based clock-ins",
            action: "Add Locations",
            href: "/manager",
            color: "bg-green-100 text-green-800"
        },
        {
            icon: UsersIcon,
            title: "Meet Your Team",
            description: "See who else is clocked in and team activity",
            action: "View Team",
            href: "/manager",
            color: "bg-purple-100 text-purple-800"
        },
        {
            icon: FileTextIcon,
            title: "Review Your Profile",
            description: "Complete your profile and upload any missing documents",
            action: "Edit Profile",
            href: "/profile",
            color: "bg-orange-100 text-orange-800"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            {/* Confetti Effect */}
            {showConfetti && (
                <div className="fixed inset-0 pointer-events-none z-10">
                    <div className="absolute top-1/4 left-1/4 animate-bounce">
                        <SparklesIcon className="h-6 w-6 text-yellow-400" />
                    </div>
                    <div className="absolute top-1/3 right-1/4 animate-bounce delay-100">
                        <SparklesIcon className="h-4 w-4 text-blue-400" />
                    </div>
                    <div className="absolute top-1/2 left-1/3 animate-bounce delay-200">
                        <SparklesIcon className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="absolute top-2/3 right-1/3 animate-bounce delay-300">
                        <SparklesIcon className="h-4 w-4 text-purple-400" />
                    </div>
                </div>
            )}

            <div className="w-full max-w-4xl">
                {/* Welcome Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-6">
                        <div className="relative">
                            <ClockIcon className="h-16 w-16 text-blue-600" />
                            <CheckCircleIcon className="h-8 w-8 text-green-500 absolute -top-2 -right-2 bg-white rounded-full" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Welcome to SmartClock, {userName}! 🎉
                    </h1>
                    <p className="text-xl text-gray-600 mb-4">
                        You've successfully joined <span className="font-semibold text-blue-600">{organizationName}</span>
                    </p>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Account Created Successfully
                    </Badge>
                </div>

                {/* What's Next Section */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="text-center text-2xl">What's Next?</CardTitle>
                        <p className="text-center text-gray-600">
                            Here are some things you can do to get started with SmartClock
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {nextSteps.map((step, index) => (
                                <div key={index} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-start space-x-4">
                                        <div className={`p-3 rounded-lg ${step.color}`}>
                                            <step.icon className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                                            <p className="text-gray-600 text-sm mb-4">{step.description}</p>
                                            <Link href={step.href}>
                                                <Button variant="outline" size="sm" className="w-full">
                                                    {step.action}
                                                    <ArrowRightIcon className="h-4 w-4 ml-2" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Start Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button onClick={handleStartTour} variant="outline" size="lg" className="w-full sm:w-auto">
                        <PlayIcon className="h-5 w-5 mr-2" />
                        Take a Tour
                    </Button>
                    <Link href="/">
                        <Button size="lg" className="w-full sm:w-auto">
                            Go to Dashboard
                            <ArrowRightIcon className="h-5 w-5 ml-2" />
                        </Button>
                    </Link>
                    <Link href="/profile">
                        <Button variant="outline" size="lg" className="w-full sm:w-auto">
                            Complete Profile
                        </Button>
                    </Link>
                </div>

                {/* Help Section */}
                <div className="text-center mt-8 p-6 bg-white/50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Need Help Getting Started?</h3>
                    <p className="text-gray-600 text-sm mb-4">
                        Check out our quick start guide or contact your manager for assistance.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                        <Button variant="ghost" size="sm">
                            📖 Quick Start Guide
                        </Button>
                        <Button variant="ghost" size="sm">
                            💬 Contact Support
                        </Button>
                    </div>
                </div>
            </div>

            {/* Onboarding Tour */}
            <OnboardingTour
                isOpen={showTour}
                onClose={() => setShowTour(false)}
                onComplete={handleTourComplete}
            />
        </div>
    );
}

export default function WelcomePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <ClockIcon className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-spin" />
                    <p className="text-gray-600">Loading your welcome page...</p>
                </div>
            </div>
        }>
            <WelcomeContent />
        </Suspense>
    );
} 