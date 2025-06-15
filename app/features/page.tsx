'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import {
    Clock,
    MapPin,
    Users,
    BarChart3,
    Shield,
    Zap,
    Menu,
    CheckCircle,
    Smartphone,
    Globe,
    Calendar,
    FileText,
    Bell,
    Camera,
    Settings,
    TrendingUp
} from "lucide-react"

export default function FeaturesPage() {
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
                                <Link href="/features" className="text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
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
                                            className="text-blue-600 block px-3 py-3 rounded-md text-base font-medium font-semibold"
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
            <section className="py-24 bg-gradient-to-r from-blue-600 to-indigo-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                        Powerful Features for Modern Teams
                    </h1>
                    <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                        SmartClock combines cutting-edge technology with intuitive design to deliver the most comprehensive time tracking solution for businesses of all sizes.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/join">
                            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                                Start Free Trial
                            </Button>
                        </Link>
                        <Link href="/pricing">
                            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600">
                                View Pricing
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Core Features Grid */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Everything You Need to Track Time Effectively
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            From GPS tracking to advanced analytics, SmartClock provides all the tools your team needs to succeed.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* GPS Location Tracking */}
                        <div className="bg-white rounded-lg shadow-sm border p-8 hover:shadow-md transition-shadow">
                            <div className="bg-blue-100 rounded-lg p-3 w-fit mb-6">
                                <MapPin className="h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">GPS Location Tracking</h3>
                            <p className="text-gray-600 mb-4">
                                Accurate location-based time tracking with geofencing. Perfect for field workers, remote teams, and multiple office locations.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-center text-sm text-gray-600">
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                    Real-time GPS tracking
                                </li>
                                <li className="flex items-center text-sm text-gray-600">
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                    Geofencing capabilities
                                </li>
                                <li className="flex items-center text-sm text-gray-600">
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                    Multiple location support
                                </li>
                            </ul>
                        </div>

                        {/* Smart Clock In/Out */}
                        <div className="bg-white rounded-lg shadow-sm border p-8 hover:shadow-md transition-shadow">
                            <div className="bg-green-100 rounded-lg p-3 w-fit mb-6">
                                <Clock className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart Clock In/Out</h3>
                            <p className="text-gray-600 mb-4">
                                Multiple ways to track time with automatic detection, manual entry, and QR code scanning for maximum flexibility.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-center text-sm text-gray-600">
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                    One-click time tracking
                                </li>
                                <li className="flex items-center text-sm text-gray-600">
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                    QR code integration
                                </li>
                                <li className="flex items-center text-sm text-gray-600">
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                    Automatic break detection
                                </li>
                            </ul>
                        </div>

                        {/* Team Management */}
                        <div className="bg-white rounded-lg shadow-sm border p-8 hover:shadow-md transition-shadow">
                            <div className="bg-purple-100 rounded-lg p-3 w-fit mb-6">
                                <Users className="h-8 w-8 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Team Management</h3>
                            <p className="text-gray-600 mb-4">
                                Comprehensive team oversight with real-time status updates, activity monitoring, and role-based permissions.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-center text-sm text-gray-600">
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                    Real-time team status
                                </li>
                                <li className="flex items-center text-sm text-gray-600">
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                    Role-based access control
                                </li>
                                <li className="flex items-center text-sm text-gray-600">
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                    Team activity feeds
                                </li>
                            </ul>
                        </div>

                        {/* Advanced Analytics */}
                        <div className="bg-white rounded-lg shadow-sm border p-8 hover:shadow-md transition-shadow">
                            <div className="bg-orange-100 rounded-lg p-3 w-fit mb-6">
                                <BarChart3 className="h-8 w-8 text-orange-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Advanced Analytics</h3>
                            <p className="text-gray-600 mb-4">
                                Detailed insights and reporting with customizable dashboards, trend analysis, and exportable data.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-center text-sm text-gray-600">
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                    Custom dashboard views
                                </li>
                                <li className="flex items-center text-sm text-gray-600">
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                    Trend analysis
                                </li>
                                <li className="flex items-center text-sm text-gray-600">
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                    Export capabilities
                                </li>
                            </ul>
                        </div>

                        {/* Security & Compliance */}
                        <div className="bg-white rounded-lg shadow-sm border p-8 hover:shadow-md transition-shadow">
                            <div className="bg-red-100 rounded-lg p-3 w-fit mb-6">
                                <Shield className="h-8 w-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Security & Compliance</h3>
                            <p className="text-gray-600 mb-4">
                                Enterprise-grade security with data encryption, audit trails, and compliance features for regulated industries.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-center text-sm text-gray-600">
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                    End-to-end encryption
                                </li>
                                <li className="flex items-center text-sm text-gray-600">
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                    Audit trail logging
                                </li>
                                <li className="flex items-center text-sm text-gray-600">
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                    GDPR compliance
                                </li>
                            </ul>
                        </div>

                        {/* Mobile Optimization */}
                        <div className="bg-white rounded-lg shadow-sm border p-8 hover:shadow-md transition-shadow">
                            <div className="bg-indigo-100 rounded-lg p-3 w-fit mb-6">
                                <Smartphone className="h-8 w-8 text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Mobile Optimization</h3>
                            <p className="text-gray-600 mb-4">
                                Full-featured mobile experience with offline capabilities, push notifications, and native app performance.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-center text-sm text-gray-600">
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                    Progressive Web App
                                </li>
                                <li className="flex items-center text-sm text-gray-600">
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                    Offline functionality
                                </li>
                                <li className="flex items-center text-sm text-gray-600">
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                    Push notifications
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Additional Features Section */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Built for Every Business Need
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            SmartClock adapts to your workflow with powerful integrations and customization options.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        {/* Feature List */}
                        <div className="space-y-8">
                            <div className="flex items-start space-x-4">
                                <div className="bg-blue-100 rounded-lg p-2 mt-1">
                                    <Calendar className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Scheduling</h3>
                                    <p className="text-gray-600">
                                        Intelligent shift scheduling with automatic conflict detection and employee availability tracking.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="bg-green-100 rounded-lg p-2 mt-1">
                                    <FileText className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Automated Reporting</h3>
                                    <p className="text-gray-600">
                                        Generate comprehensive timesheets, payroll reports, and compliance documentation automatically.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="bg-purple-100 rounded-lg p-2 mt-1">
                                    <Bell className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Notifications</h3>
                                    <p className="text-gray-600">
                                        Customizable alerts for missed clock-ins, overtime warnings, and important team updates.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="bg-orange-100 rounded-lg p-2 mt-1">
                                    <Globe className="h-6 w-6 text-orange-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">API Integration</h3>
                                    <p className="text-gray-600">
                                        Connect with your existing tools through our robust API and pre-built integrations.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Feature Preview */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8">
                            <div className="text-center">
                                <div className="bg-white rounded-lg shadow-lg p-6 mb-6 max-w-sm mx-auto">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-2">
                                            <Clock className="h-5 w-5 text-blue-600" />
                                            <span className="text-sm font-medium text-gray-900">SmartClock Dashboard</span>
                                        </div>
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                                            <span className="text-sm text-gray-700">You're clocked in</span>
                                            <span className="text-sm font-medium text-green-600">2h 15m</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                                            <MapPin className="h-3 w-3" />
                                            <span>Main Office - Floor 2</span>
                                        </div>
                                        <Button size="sm" className="w-full">
                                            Clock Out
                                        </Button>
                                    </div>
                                </div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                    Intuitive User Experience
                                </h4>
                                <p className="text-gray-600">
                                    Clean, modern interface designed for ease of use across all devices and skill levels.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        Ready to Transform Your Time Tracking?
                    </h2>
                    <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                        Join thousands of businesses that trust SmartClock to manage their workforce efficiently and accurately.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/join">
                            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                                Start Free Trial
                            </Button>
                        </Link>
                        <Link href="/pricing">
                            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-gray-900">
                                View Pricing Plans
                            </Button>
                        </Link>
                    </div>
                    <p className="text-gray-400 mt-4">
                        No credit card required • 14-day free trial • Setup in minutes
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-800 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center mb-4">
                                <Clock className="h-8 w-8 text-blue-400" />
                                <span className="ml-2 text-xl font-bold">SmartClock</span>
                            </div>
                            <p className="text-gray-300 mb-4">
                                The modern time tracking solution for businesses of all sizes.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold mb-4">Product</h4>
                            <ul className="space-y-2">
                                <li><Link href="/features" className="hover:text-white">Features</Link></li>
                                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                                <li><Link href="/resources" className="hover:text-white">Resources</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold mb-4">Company</h4>
                            <ul className="space-y-2">
                                <li><Link href="/login" className="hover:text-white">Sign In</Link></li>
                                <li><Link href="/join" className="hover:text-white">Get Started</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold mb-4">Support</h4>
                            <ul className="space-y-2">
                                <li><Link href="/resources" className="hover:text-white">Help Center</Link></li>
                                <li><Link href="/resources" className="hover:text-white">Documentation</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-700 mt-8 pt-8 text-center">
                        <p className="text-gray-400">
                            © 2024 SmartClock. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
} 