"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ClockIcon,
    CheckCircleIcon,
    SparklesIcon,
    LogInIcon,
    ArrowRightIcon,
    Mail,
    Shield,
    Zap
} from "lucide-react";
import Link from "next/link";

function WelcomeContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [showConfetti, setShowConfetti] = useState(false); // Start false to prevent hydration mismatch
    const [countdown, setCountdown] = useState(10);
    const [shouldRedirect, setShouldRedirect] = useState(false);

    const userName = searchParams.get("name") || "there";
    const organizationName = searchParams.get("org") || "your organization";

    // Handle redirect outside of render cycle
    useEffect(() => {
        if (shouldRedirect) {
            router.push("/login");
        }
    }, [shouldRedirect, router]);

    useEffect(() => {
        // Show confetti only on client side to prevent hydration mismatch
        setShowConfetti(true);

        // Hide confetti effect after 4 seconds
        const confettiTimer = setTimeout(() => setShowConfetti(false), 4000);

        // Start countdown for auto-redirect
        const countdownInterval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    setShouldRedirect(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            clearTimeout(confettiTimer);
            clearInterval(countdownInterval);
        };
    }, []);

    const benefits = [
        {
            icon: Shield,
            title: "Secure GPS Tracking",
            description: "Your location data is encrypted and secure"
        },
        {
            icon: Zap,
            title: "Real-time Updates",
            description: "Instant clock-in notifications and status updates"
        },
        {
            icon: Mail,
            title: "Smart Notifications",
            description: "Get notified about important updates via email and SMS"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 flex items-center justify-center p-4 relative overflow-hidden">

            {/* Animated Background Elements */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full animate-pulse"></div>
                <div className="absolute bottom-40 right-32 w-24 h-24 bg-white rounded-full animate-bounce"></div>
                <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white rounded-full animate-ping"></div>
            </div>

            {/* Enhanced Confetti Effect */}
            {showConfetti && (
                <div className="fixed inset-0 pointer-events-none z-10">
                    <div className="absolute top-1/4 left-1/4 animate-bounce" style={{ animationDelay: '0ms' }}>
                        <SparklesIcon className="h-6 w-6 text-yellow-300" />
                    </div>
                    <div className="absolute top-1/3 right-1/4 animate-bounce" style={{ animationDelay: '200ms' }}>
                        <SparklesIcon className="h-4 w-4 text-blue-300" />
                    </div>
                    <div className="absolute top-1/2 left-1/3 animate-bounce" style={{ animationDelay: '400ms' }}>
                        <SparklesIcon className="h-5 w-5 text-green-300" />
                    </div>
                    <div className="absolute top-2/3 right-1/3 animate-bounce" style={{ animationDelay: '600ms' }}>
                        <SparklesIcon className="h-4 w-4 text-purple-300" />
                    </div>
                    <div className="absolute top-1/5 right-1/5 animate-bounce" style={{ animationDelay: '800ms' }}>
                        <SparklesIcon className="h-6 w-6 text-pink-300" />
                    </div>
                    <div className="absolute bottom-1/4 left-1/5 animate-bounce" style={{ animationDelay: '1000ms' }}>
                        <SparklesIcon className="h-5 w-5 text-indigo-300" />
                    </div>
                    <div className="absolute bottom-1/3 right-1/6 animate-bounce" style={{ animationDelay: '1200ms' }}>
                        <SparklesIcon className="h-4 w-4 text-yellow-300" />
                    </div>
                    <div className="absolute top-3/4 left-2/3 animate-bounce" style={{ animationDelay: '1400ms' }}>
                        <SparklesIcon className="h-6 w-6 text-blue-300" />
                    </div>
                </div>
            )}

            <div className="w-full max-w-2xl relative z-20">

                {/* Success Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-8">
                        <div className="relative">
                            <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-75"></div>
                            <div className="relative bg-white rounded-full p-6">
                                <ClockIcon className="h-16 w-16 text-blue-600" />
                                <CheckCircleIcon className="h-10 w-10 text-green-500 absolute -top-2 -right-2 bg-white rounded-full border-4 border-white" />
                            </div>
                        </div>
                    </div>

                    <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
                        Welcome to SmartClock!
                    </h1>

                    <p className="text-2xl text-blue-100 mb-6">
                        🎉 Hi <span className="font-bold text-white">{userName}</span>!
                    </p>

                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
                        <Badge className="bg-green-500 text-white px-4 py-2 text-lg font-semibold mb-4">
                            ✅ Account Created Successfully
                        </Badge>
                        <p className="text-xl text-blue-50">
                            You've successfully joined{" "}
                            <span className="font-bold text-white bg-white/20 px-3 py-1 rounded-lg">
                                {organizationName}
                            </span>
                        </p>
                    </div>
                </div>

                {/* What You Get Section */}
                <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl mb-8">
                    <CardContent className="p-8">
                        <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
                            What You Get with SmartClock
                        </h2>
                        <div className="grid gap-6">
                            {benefits.map((benefit, index) => (
                                <div key={index} className="flex items-center space-x-4 p-4 bg-blue-50 rounded-xl">
                                    <div className="bg-blue-600 p-3 rounded-full">
                                        <benefit.icon className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{benefit.title}</h3>
                                        <p className="text-gray-600 text-sm">{benefit.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Call to Action */}
                <div className="text-center">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-6">
                        <h3 className="text-2xl font-bold text-white mb-4">
                            Ready to Get Started?
                        </h3>
                        <p className="text-blue-100 mb-6">
                            Sign in to your new account and start tracking your time!
                        </p>

                        {/* Auto-redirect countdown */}
                        <div className="bg-white/20 rounded-lg p-4 mb-6">
                            <p className="text-blue-100 text-sm">
                                Automatically redirecting to sign in page in{" "}
                                <span className="font-bold text-white text-lg">{countdown}</span> seconds
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/login">
                                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-bold px-8 py-4 text-lg w-full sm:w-auto">
                                    <LogInIcon className="h-5 w-5 mr-2" />
                                    Sign In Now
                                    <ArrowRightIcon className="h-5 w-5 ml-2" />
                                </Button>
                            </Link>
                            <Link href="/">
                                <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-bold px-8 py-4 text-lg w-full sm:w-auto">
                                    Learn More
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Help Footer */}
                    <p className="text-blue-200 text-sm">
                        Having trouble? Contact your manager or{" "}
                        <Link href="/resources" className="text-white font-semibold underline hover:text-blue-100">
                            visit our help center
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function WelcomePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 flex items-center justify-center">
                <div className="text-center">
                    <ClockIcon className="h-16 w-16 text-white mx-auto mb-4 animate-spin" />
                    <p className="text-blue-100 text-lg">Preparing your welcome experience...</p>
                </div>
            </div>
        }>
            <WelcomeContent />
        </Suspense>
    );
} 