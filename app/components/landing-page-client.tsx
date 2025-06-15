'use client'

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Clock, MapPin, Users, BarChart3, Shield, Zap, Menu } from "lucide-react"


export default function LandingPageClient() {

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="bg-white border-b sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <Link href="/" className="flex items-center">
                                <Clock className="h-8 w-8 text-blue-600" />
                                <span className="ml-2 text-xl font-bold text-gray-900">SmartClock</span>
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                <Link href="/features" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                                    Features
                                </Link>
                                <Link href="/pricing" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                                    Pricing
                                </Link>
                                <Link href="/resources" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                                    Resources
                                </Link>
                                <Link href="/login" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                                    Sign In
                                </Link>
                                <Link href="/join">
                                    <Button>Get Started</Button>
                                </Link>
                            </div>
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="text-gray-500 hover:text-gray-900 focus:outline-none focus:text-gray-900 p-2"
                                        aria-label="Toggle menu"
                                    >
                                        <Menu className="h-6 w-6" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                                    <SheetHeader>
                                        <SheetTitle className="flex items-center space-x-2">
                                            <Clock className="h-6 w-6 text-blue-600" />
                                            <span className="text-lg font-bold text-gray-900">SmartClock</span>
                                        </SheetTitle>
                                    </SheetHeader>
                                    <nav className="flex flex-col gap-4 mt-6">

                                        <Link
                                            href="/features"
                                            className="text-gray-700 hover:text-blue-600 block px-3 py-3 rounded-md text-base font-medium transition-colors"
                                        >
                                            Features
                                        </Link>
                                        <Link
                                            href="/pricing"
                                            className="text-gray-700 hover:text-blue-600 block px-3 py-3 rounded-md text-base font-medium transition-colors"
                                        >
                                            Pricing
                                        </Link>
                                        <Link
                                            href="/resources"
                                            className="text-gray-700 hover:text-blue-600 block px-3 py-3 rounded-md text-base font-medium transition-colors"
                                        >
                                            Resources
                                        </Link>
                                        <Link
                                            href="/login"
                                            className="text-gray-700 hover:text-blue-600 block px-3 py-3 rounded-md text-base font-medium transition-colors"
                                        >
                                            Sign In
                                        </Link>

                                        <div className="mt-6 space-y-3">
                                            <Link href="/join" className="block">
                                                <Button className="w-full" size="lg">
                                                    Get Started
                                                </Button>
                                            </Link>
                                        </div>
                                    </nav>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className=" bg-gradient-to-r from-blue-600 to-indigo-900  rounded-xl  md:py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 shadow-black shadow-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ">
                        <div>
                            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                                Smart Time Tracking for Modern Teams
                            </h1>
                            <p className="text-xl text-blue-100 mb-8">
                                Transform your workforce management with GPS-verified clock-ins, real-time tracking, and powerful analytics. Built for teams that value precision and productivity.
                            </p>
                            <div className="flex flex-row sm:flex-row gap-4">

                                <Link href="/join">
                                    <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                                        Start Free Trial
                                    </Button>
                                </Link>
                                <Link href="/demo">
                                    <Button size="lg" variant="outline" className="border-white text-blue-600 hover:bg-white hover:text-blue-600">
                                        Watch Demo
                                    </Button>
                                </Link>
                            </div>
                        </div>
                        <div className="relative">
                            <Image
                                src="/images/musemind-ux-agency-qp9LPDZAOpE-unsplash.jpg"
                                alt="Modern workplace with time tracking"
                                width={600}
                                height={400}
                                className="rounded-lg  shadow-black shadow-2xl"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Everything you need for accurate time tracking
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            From GPS verification to real-time analytics, SmartClock provides comprehensive workforce management tools.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-lg shadow-sm">
                            <MapPin className="h-12 w-12 text-blue-600 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">GPS Verification</h3>
                            <p className="text-gray-600">
                                Ensure accurate attendance with precise GPS location verification. 10-meter accuracy for reliable tracking.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-lg shadow-sm">
                            <Clock className="h-12 w-12 text-blue-600 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-Time Tracking</h3>
                            <p className="text-gray-600">
                                Live clock status updates, break tracking, and automatic hours calculation with real-time synchronization.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-lg shadow-sm">
                            <Users className="h-12 w-12 text-blue-600 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Team Management</h3>
                            <p className="text-gray-600">
                                Complete team oversight with manager dashboards, employee status monitoring, and team analytics.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-lg shadow-sm">
                            <BarChart3 className="h-12 w-12 text-blue-600 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Advanced Analytics</h3>
                            <p className="text-gray-600">
                                Comprehensive reporting, productivity insights, and customizable analytics for data-driven decisions.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-lg shadow-sm">
                            <Shield className="h-12 w-12 text-blue-600 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Enterprise Security</h3>
                            <p className="text-gray-600">
                                Multi-tenant architecture with complete data isolation, role-based access, and enterprise-grade security.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-lg shadow-sm">
                            <Zap className="h-12 w-12 text-blue-600 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Lightning Fast</h3>
                            <p className="text-gray-600">
                                Built with Next.js 15 and modern architecture for instant loading and real-time updates.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            How SmartClock works
                        </h2>
                        <p className="text-xl text-gray-600">
                            Simple, powerful, and designed for modern workplaces
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className="text-center">
                            <div className="relative mb-8">
                                <Image
                                    src="/images/christina-wocintechchat-com-vzfgh3RAPzM-unsplash.jpg"
                                    alt="Easy setup and onboarding"
                                    width={400}
                                    height={300}
                                    className="rounded-lg mx-auto"
                                />
                                <div className="absolute -top-4 -left-4 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                                    1
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Quick Setup</h3>
                            <p className="text-gray-600">
                                Get started in minutes with our streamlined onboarding process. Set up your organization and invite team members.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="relative mb-8">
                                <Image
                                    src="/images/proxyclick-visitor-management-system-3h7j04-6y3Q-unsplash.jpg"
                                    alt="Clock in with GPS verification"
                                    width={400}
                                    height={300}
                                    className="rounded-lg mx-auto"
                                />
                                <div className="absolute -top-4 -left-4 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                                    2
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Clock In/Out</h3>
                            <p className="text-gray-600">
                                Employees clock in with GPS verification, ensuring accurate location tracking and preventing time theft.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="relative mb-8">
                                <Image
                                    src="/images/ninthgrid-SXqdHPpmWzQ-unsplash.jpg"
                                    alt="Analytics and reporting dashboard"
                                    width={400}
                                    height={300}
                                    className="rounded-lg mx-auto"
                                />
                                <div className="absolute -top-4 -left-4 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                                    3
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Analyze & Optimize</h3>
                            <p className="text-gray-600">
                                Get insights with real-time analytics, generate reports, and optimize your workforce management.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-blue-600">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Ready to transform your time tracking?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                        Join thousands of teams already using SmartClock to improve productivity and streamline workforce management.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/join">
                            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                                Start Free Trial
                            </Button>
                        </Link>
                        <Link href="/pricing">
                            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                                View Pricing
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center mb-4">
                                <Clock className="h-8 w-8 text-blue-400" />
                                <span className="ml-2 text-xl font-bold">SmartClock</span>
                            </div>
                            <p className="text-gray-400">
                                Modern time tracking for modern teams.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Product</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li><Link href="/features" className="hover:text-white">Features</Link></li>
                                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                                <li><Link href="/demo" className="hover:text-white">Demo</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Resources</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li><Link href="/resources" className="hover:text-white">Resources</Link></li>
                                <li><Link href="/support" className="hover:text-white">Support</Link></li>
                                <li><Link href="/docs" className="hover:text-white">Documentation</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Company</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li><Link href="/about" className="hover:text-white">About</Link></li>
                                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                                <li><Link href="/privacy" className="hover:text-white">Privacy</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                        <p>&copy; 2024 SmartClock. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
} 