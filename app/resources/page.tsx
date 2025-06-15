'use client'

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Clock, BookOpen, Video, Download, Users, MessageCircle, FileText, PlayCircle, Menu } from "lucide-react"

export default function ResourcesPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="bg-white border-b">
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
                                <Link href="/resources" className="text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
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
                                            className="text-blue-600 block px-3 py-3 rounded-md text-base font-medium font-semibold"
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
            <section className="py-24 bg-gradient-to-r from-blue-600 to-indigo-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                        Resources & Support
                    </h1>
                    <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                        Everything you need to get the most out of SmartClock. From setup guides to best practices, we've got you covered.
                    </p>
                </div>
            </section>

            {/* Resource Categories */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                        <div className="text-center">
                            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <BookOpen className="h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Guides</h3>
                            <p className="text-gray-600">Step-by-step tutorials and best practices</p>
                        </div>

                        <div className="text-center">
                            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <Video className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Videos</h3>
                            <p className="text-gray-600">Video tutorials and feature demos</p>
                        </div>

                        <div className="text-center">
                            <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <Download className="h-8 w-8 text-purple-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Downloads</h3>
                            <p className="text-gray-600">Templates, guides, and resources</p>
                        </div>

                        <div className="text-center">
                            <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <MessageCircle className="h-8 w-8 text-orange-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Support</h3>
                            <p className="text-gray-600">Get help when you need it</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Resources */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Featured Resources
                        </h2>
                        <p className="text-xl text-gray-600">
                            Popular guides and resources to help you succeed
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Getting Started Guide */}
                        <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-lg transition-shadow">
                            <div className="relative mb-4">
                                <Image
                                    src="/images/christina-wocintechchat-com-vzfgh3RAPzM-unsplash.jpg"
                                    alt="Getting started with SmartClock"
                                    width={400}
                                    height={200}
                                    className="rounded-lg w-full h-48 object-cover"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-medium">
                                        Guide
                                    </span>
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Getting Started with SmartClock
                            </h3>
                            <p className="text-gray-600 mb-4">
                                A comprehensive guide to setting up your organization and getting your team started with time tracking.
                            </p>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">5 min read</span>
                                <Button variant="outline" size="sm">Read Guide</Button>
                            </div>
                        </div>

                        {/* GPS Setup Guide */}
                        <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-lg transition-shadow">
                            <div className="relative mb-4">
                                <Image
                                    src="/images/moein-ghezelbash-J0uTfdQ_Qnc-unsplash.jpg"
                                    alt="GPS location setup"
                                    width={400}
                                    height={200}
                                    className="rounded-lg w-full h-48 object-cover"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="bg-green-600 text-white px-2 py-1 rounded text-sm font-medium">
                                        Tutorial
                                    </span>
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Setting Up GPS Locations
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Learn how to configure GPS locations for accurate time tracking and geofencing.
                            </p>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">3 min read</span>
                                <Button variant="outline" size="sm">Read Guide</Button>
                            </div>
                        </div>

                        {/* Manager Dashboard Guide */}
                        <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-lg transition-shadow">
                            <div className="relative mb-4">
                                <Image
                                    src="/images/ninthgrid-SXqdHPpmWzQ-unsplash.jpg"
                                    alt="Manager dashboard overview"
                                    width={400}
                                    height={200}
                                    className="rounded-lg w-full h-48 object-cover"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="bg-purple-600 text-white px-2 py-1 rounded text-sm font-medium">
                                        Guide
                                    </span>
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Manager Dashboard Overview
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Discover how to use the manager dashboard to monitor your team and generate reports.
                            </p>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">7 min read</span>
                                <Button variant="outline" size="sm">Read Guide</Button>
                            </div>
                        </div>

                        {/* Video Tutorial */}
                        <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-lg transition-shadow">
                            <div className="relative mb-4">
                                <Image
                                    src="/images/rc-xyz-nft-gallery-UqILKDhWiFw-unsplash.jpg"
                                    alt="SmartClock video tutorial"
                                    width={400}
                                    height={200}
                                    className="rounded-lg w-full h-48 object-cover"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="bg-red-600 text-white px-2 py-1 rounded text-sm font-medium">
                                        Video
                                    </span>
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <PlayCircle className="h-16 w-16 text-white opacity-80" />
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                SmartClock Complete Walkthrough
                            </h3>
                            <p className="text-gray-600 mb-4">
                                A complete video walkthrough of all SmartClock features and capabilities.
                            </p>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">15 min video</span>
                                <Button variant="outline" size="sm">Watch Video</Button>
                            </div>
                        </div>

                        {/* Best Practices */}
                        <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-lg transition-shadow">
                            <div className="relative mb-4">
                                <Image
                                    src="/images/proxyclick-visitor-management-system-3h7j04-6y3Q-unsplash.jpg"
                                    alt="Time tracking best practices"
                                    width={400}
                                    height={200}
                                    className="rounded-lg w-full h-48 object-cover"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="bg-indigo-600 text-white px-2 py-1 rounded text-sm font-medium">
                                        Best Practices
                                    </span>
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Time Tracking Best Practices
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Learn the best practices for implementing time tracking in your organization.
                            </p>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">6 min read</span>
                                <Button variant="outline" size="sm">Read Guide</Button>
                            </div>
                        </div>

                        {/* API Documentation */}
                        <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-lg transition-shadow">
                            <div className="relative mb-4">
                                <Image
                                    src="/images/adrian-hernandez-7BcHkouw6Uc-unsplash.jpg"
                                    alt="API documentation"
                                    width={400}
                                    height={200}
                                    className="rounded-lg w-full h-48 object-cover"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="bg-gray-600 text-white px-2 py-1 rounded text-sm font-medium">
                                        Technical
                                    </span>
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                API Documentation
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Complete API reference for developers building integrations with SmartClock.
                            </p>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Technical</span>
                                <Button variant="outline" size="sm">View Docs</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Support Section */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Need Help?
                        </h2>
                        <p className="text-xl text-gray-600">
                            We're here to help you succeed with SmartClock
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center p-8 bg-white rounded-lg shadow-sm">
                            <MessageCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Live Chat</h3>
                            <p className="text-gray-600 mb-4">
                                Get instant help from our support team during business hours.
                            </p>
                            <Button>Start Chat</Button>
                        </div>

                        <div className="text-center p-8 bg-white rounded-lg shadow-sm">
                            <FileText className="h-12 w-12 text-green-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Knowledge Base</h3>
                            <p className="text-gray-600 mb-4">
                                Search our comprehensive knowledge base for quick answers.
                            </p>
                            <Button variant="outline">Browse Articles</Button>
                        </div>

                        <div className="text-center p-8 bg-white rounded-lg shadow-sm">
                            <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Community</h3>
                            <p className="text-gray-600 mb-4">
                                Connect with other SmartClock users and share best practices.
                            </p>
                            <Button variant="outline">Join Community</Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-blue-600">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Ready to get started?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                        Start your free trial today and see how SmartClock can transform your time tracking.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/join">
                            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                                Start Free Trial
                            </Button>
                        </Link>
                        <Link href="/demo">
                            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                                Watch Demo
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