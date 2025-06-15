'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Clock, Check, X, Menu } from "lucide-react"

export default function PricingPage() {
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
                                <Link href="/pricing" className="text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
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
                                            className="text-blue-600 block px-3 py-3 rounded-md text-base font-medium font-semibold"
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
                        Simple, transparent pricing
                    </h1>
                    <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                        Choose the perfect plan for your team. Start with our free trial and upgrade as you grow.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/join">
                            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                                Start Free Trial
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                        {/* Basic Plan */}
                        <div className="bg-white rounded-lg shadow-sm border p-8">
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Basic</h3>
                                <p className="text-gray-600 mb-4">Perfect for small teams getting started</p>
                                <div className="mb-4">
                                    <span className="text-4xl font-bold text-gray-900">$5</span>
                                    <span className="text-gray-600">/user/month</span>
                                </div>
                                <p className="text-sm text-gray-500">14-day free trial</p>
                            </div>

                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center">
                                    <Check className="h-5 w-5 text-green-500 mr-3" />
                                    <span className="text-gray-700">Up to 10 employees</span>
                                </li>
                                <li className="flex items-center">
                                    <Check className="h-5 w-5 text-green-500 mr-3" />
                                    <span className="text-gray-700">GPS clock in/out</span>
                                </li>
                                <li className="flex items-center">
                                    <Check className="h-5 w-5 text-green-500 mr-3" />
                                    <span className="text-gray-700">Basic time tracking</span>
                                </li>
                                <li className="flex items-center">
                                    <Check className="h-5 w-5 text-green-500 mr-3" />
                                    <span className="text-gray-700">Employee dashboard</span>
                                </li>
                                <li className="flex items-center">
                                    <Check className="h-5 w-5 text-green-500 mr-3" />
                                    <span className="text-gray-700">Basic reporting</span>
                                </li>
                                <li className="flex items-center">
                                    <Check className="h-5 w-5 text-green-500 mr-3" />
                                    <span className="text-gray-700">Email support</span>
                                </li>
                                <li className="flex items-center">
                                    <X className="h-5 w-5 text-gray-400 mr-3" />
                                    <span className="text-gray-500">Advanced analytics</span>
                                </li>
                                <li className="flex items-center">
                                    <X className="h-5 w-5 text-gray-400 mr-3" />
                                    <span className="text-gray-500">API access</span>
                                </li>
                            </ul>

                            <Link href="/join">
                                <Button className="w-full" variant="outline">
                                    Start Free Trial
                                </Button>
                            </Link>
                        </div>

                        {/* Professional Plan */}
                        <div className="bg-white rounded-lg shadow-lg border-2 border-blue-500 p-8 relative">
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                                    Most Popular
                                </span>
                            </div>

                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Professional</h3>
                                <p className="text-gray-600 mb-4">For growing teams that need more features</p>
                                <div className="mb-4">
                                    <span className="text-4xl font-bold text-gray-900">$12</span>
                                    <span className="text-gray-600">/user/month</span>
                                </div>
                                <p className="text-sm text-gray-500">14-day free trial</p>
                            </div>

                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center">
                                    <Check className="h-5 w-5 text-green-500 mr-3" />
                                    <span className="text-gray-700">Up to 50 employees</span>
                                </li>
                                <li className="flex items-center">
                                    <Check className="h-5 w-5 text-green-500 mr-3" />
                                    <span className="text-gray-700">Everything in Basic</span>
                                </li>
                                <li className="flex items-center">
                                    <Check className="h-5 w-5 text-green-500 mr-3" />
                                    <span className="text-gray-700">Advanced analytics</span>
                                </li>
                                <li className="flex items-center">
                                    <Check className="h-5 w-5 text-green-500 mr-3" />
                                    <span className="text-gray-700">Team management</span>
                                </li>
                                <li className="flex items-center">
                                    <Check className="h-5 w-5 text-green-500 mr-3" />
                                    <span className="text-gray-700">Multiple locations</span>
                                </li>
                                <li className="flex items-center">
                                    <Check className="h-5 w-5 text-green-500 mr-3" />
                                    <span className="text-gray-700">Custom reports</span>
                                </li>
                                <li className="flex items-center">
                                    <Check className="h-5 w-5 text-green-500 mr-3" />
                                    <span className="text-gray-700">Priority support</span>
                                </li>
                                <li className="flex items-center">
                                    <X className="h-5 w-5 text-gray-400 mr-3" />
                                    <span className="text-gray-500">API access</span>
                                </li>
                            </ul>

                            <Link href="/join">
                                <Button className="w-full">
                                    Start Free Trial
                                </Button>
                            </Link>
                        </div>

                        {/* Enterprise Plan */}
                        <div className="bg-white rounded-lg shadow-sm border p-8">
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
                                <p className="text-gray-600 mb-4">For large organizations with advanced needs</p>
                                <div className="mb-4">
                                    <span className="text-4xl font-bold text-gray-900">$25</span>
                                    <span className="text-gray-600">/user/month</span>
                                </div>
                                <p className="text-sm text-gray-500">Custom enterprise solutions available</p>
                            </div>

                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center">
                                    <Check className="h-5 w-5 text-green-500 mr-3" />
                                    <span className="text-gray-700">Unlimited employees</span>
                                </li>
                                <li className="flex items-center">
                                    <Check className="h-5 w-5 text-green-500 mr-3" />
                                    <span className="text-gray-700">Everything in Professional</span>
                                </li>
                                <li className="flex items-center">
                                    <Check className="h-5 w-5 text-green-500 mr-3" />
                                    <span className="text-gray-700">Full API access</span>
                                </li>
                                <li className="flex items-center">
                                    <Check className="h-5 w-5 text-green-500 mr-3" />
                                    <span className="text-gray-700">SSO integration</span>
                                </li>
                                <li className="flex items-center">
                                    <Check className="h-5 w-5 text-green-500 mr-3" />
                                    <span className="text-gray-700">Advanced security</span>
                                </li>
                                <li className="flex items-center">
                                    <Check className="h-5 w-5 text-green-500 mr-3" />
                                    <span className="text-gray-700">Dedicated support</span>
                                </li>
                                <li className="flex items-center">
                                    <Check className="h-5 w-5 text-green-500 mr-3" />
                                    <span className="text-gray-700">Custom integrations</span>
                                </li>
                                <li className="flex items-center">
                                    <Check className="h-5 w-5 text-green-500 mr-3" />
                                    <span className="text-gray-700">On-premise option</span>
                                </li>
                            </ul>

                            <Link href="/contact">
                                <Button className="w-full" variant="outline">
                                    Contact Sales
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Frequently asked questions
                        </h2>
                        <p className="text-xl text-gray-600">
                            Everything you need to know about our pricing and plans
                        </p>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                What's included in the free trial?
                            </h3>
                            <p className="text-gray-600">
                                You get full access to your chosen plan for 14 days, no credit card required. This includes all features, unlimited usage, and full support.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Can I change my plan anytime?
                            </h3>
                            <p className="text-gray-600">
                                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate your billing accordingly.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Is there a setup fee?
                            </h3>
                            <p className="text-gray-600">
                                No setup fees, no hidden charges. You only pay the monthly subscription fee based on your chosen plan and number of users.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                What payment methods do you accept?
                            </h3>
                            <p className="text-gray-600">
                                We accept all major credit cards (Visa, MasterCard, American Express) and offer annual billing with a 20% discount.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Do you offer custom enterprise solutions?
                            </h3>
                            <p className="text-gray-600">
                                Yes! We offer custom solutions for large organizations including on-premise deployment, custom integrations, and dedicated support. Contact our sales team for details.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                What happens to my data if I cancel?
                            </h3>
                            <p className="text-gray-600">
                                You can export all your data at any time. After cancellation, we'll keep your data for 30 days before permanent deletion, giving you time to reconsider or migrate.
                            </p>
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
                        Join thousands of teams already using SmartClock. Start your free trial today.
                    </p>
                    <Link href="/join">
                        <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                            Start Free Trial
                        </Button>
                    </Link>
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