"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ClockIcon,
    MapPinIcon,
    UsersIcon,
    FileTextIcon,
    ArrowRightIcon,
    ArrowLeftIcon,
    XIcon,
    CheckIcon
} from "lucide-react";

interface TourStep {
    id: string;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    target?: string;
    position?: "top" | "bottom" | "left" | "right";
    action?: {
        label: string;
        href?: string;
        onClick?: () => void;
    };
}

interface OnboardingTourProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: () => void;
}

const tourSteps: TourStep[] = [
    {
        id: "welcome",
        title: "Welcome to SmartClock! 🎉",
        description: "Let's take a quick tour of the key features that will help you track your time efficiently.",
        icon: ClockIcon,
    },
    {
        id: "clock-in-out",
        title: "Clock In & Out",
        description: "Use the time clock to track your work hours. You can clock in manually or use GPS-based location tracking.",
        icon: ClockIcon,
        target: ".clock-widget",
        position: "right",
        action: {
            label: "Try Clock In",
            onClick: () => {
                // This would trigger a demo clock-in
                console.log("Demo clock-in triggered");
            }
        }
    },
    {
        id: "gps-locations",
        title: "GPS Location Tracking",
        description: "Set up work locations for automatic GPS-based clock-ins. Perfect for field work or multiple office locations.",
        icon: MapPinIcon,
        action: {
            label: "Set Up Locations",
            href: "/manager"
        }
    },
    {
        id: "team-activity",
        title: "Team Activity",
        description: "See who's currently clocked in, recent team activity, and collaborate with your colleagues.",
        icon: UsersIcon,
        target: ".recent-activity",
        position: "left"
    },
    {
        id: "profile-documents",
        title: "Profile & Documents",
        description: "Complete your profile, upload documents, and manage your personal information.",
        icon: FileTextIcon,
        action: {
            label: "Complete Profile",
            href: "/profile"
        }
    }
];

export function OnboardingTour({ isOpen, onClose, onComplete }: OnboardingTourProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            setCurrentStep(0);
        }
    }, [isOpen]);

    const handleNext = () => {
        if (currentStep < tourSteps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleComplete();
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleComplete = () => {
        setIsVisible(false);
        onComplete();
        onClose();
    };

    const handleSkip = () => {
        setIsVisible(false);
        onClose();
    };

    if (!isOpen || !isVisible) return null;

    const step = tourSteps[currentStep];
    const IconComponent = step.icon;

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/50 z-40" onClick={handleSkip} />

            {/* Tour Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md mx-auto">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <IconComponent className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">{step.title}</CardTitle>
                                    <Badge variant="outline" className="text-xs">
                                        Step {currentStep + 1} of {tourSteps.length}
                                    </Badge>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={handleSkip}>
                                <XIcon className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <p className="text-gray-600">{step.description}</p>

                        {/* Action Button */}
                        {step.action && (
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm text-blue-800 mb-2">Try it out:</p>
                                {step.action.href ? (
                                    <a href={step.action.href} target="_blank" rel="noopener noreferrer">
                                        <Button variant="outline" size="sm" className="w-full">
                                            {step.action.label}
                                            <ArrowRightIcon className="h-4 w-4 ml-2" />
                                        </Button>
                                    </a>
                                ) : (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={step.action.onClick}
                                    >
                                        {step.action.label}
                                    </Button>
                                )}
                            </div>
                        )}

                        {/* Progress Indicator */}
                        <div className="flex space-x-2">
                            {tourSteps.map((_, index) => (
                                <div
                                    key={index}
                                    className={`h-2 flex-1 rounded-full ${index <= currentStep ? "bg-blue-500" : "bg-gray-200"
                                        }`}
                                />
                            ))}
                        </div>

                        {/* Navigation */}
                        <div className="flex justify-between">
                            <Button
                                variant="outline"
                                onClick={handlePrevious}
                                disabled={currentStep === 0}
                            >
                                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                                Previous
                            </Button>

                            <div className="flex space-x-2">
                                <Button variant="ghost" onClick={handleSkip}>
                                    Skip Tour
                                </Button>
                                <Button onClick={handleNext}>
                                    {currentStep === tourSteps.length - 1 ? (
                                        <>
                                            <CheckIcon className="h-4 w-4 mr-2" />
                                            Complete
                                        </>
                                    ) : (
                                        <>
                                            Next
                                            <ArrowRightIcon className="h-4 w-4 ml-2" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
} 