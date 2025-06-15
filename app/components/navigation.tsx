"use client"

import { useState, useRef, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    ClockIcon,
    MenuIcon,
    HomeIcon,
    CalendarIcon,
    SettingsIcon,
    UsersIcon,
    LogOutIcon,
    UserIcon,
    XIcon,
    ChevronDownIcon
} from "lucide-react"
import type { SessionUser } from "@/types"

export default function Navigation() {
    const { data: session } = useSession()
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const user = session?.user as SessionUser

    // Main navigation items (left side)
    const mainNavigationItems = [
        { href: "/", label: "Dashboard", icon: HomeIcon },
        ...(user && ['MANAGER', 'ADMIN'].includes(user.role)
            ? [{ href: "/manager", label: "Manager View", icon: UsersIcon }]
            : []
        ),
    ]

    // User dropdown items
    const userDropdownItems = [
        { href: "/timesheets", label: "Timesheets", icon: CalendarIcon },
        { href: "/profile", label: "Profile", icon: UserIcon },
        { href: "/settings", label: "Settings", icon: SettingsIcon },
    ]

    // All navigation items for mobile
    const allNavigationItems = [
        ...mainNavigationItems,
        ...userDropdownItems,
    ]

    const handleSignOut = () => {
        signOut({ callbackUrl: "/login" })
    }

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    if (!user) return null

    return (
        <>
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <Link href="/" className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                                <ClockIcon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-blue-600 font-heading">SmartClock</h1>
                                <p className="text-xs text-gray-500 hidden sm:block">{user.organizationName}</p>
                            </div>
                        </Link>

                        {/* Desktop Navigation - Main Items */}
                        <nav className="hidden md:flex items-center space-x-2">
                            {mainNavigationItems.map((item) => {
                                const Icon = item.icon
                                const isActive = pathname === item.href

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`
                                            flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                            ${isActive
                                                ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                            }
                                        `}
                                    >
                                        <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                                        <span>{item.label}</span>
                                    </Link>
                                )
                            })}
                        </nav>

                        {/* User Profile Dropdown - Desktop */}
                        <div className="hidden md:flex items-center space-x-4">
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                                        <span className="text-white font-semibold text-sm">
                                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                        </span>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                        <div className="flex items-center space-x-2">
                                            <p className="text-xs text-gray-500 capitalize">{user.role.toLowerCase()}</p>
                                            {user.billingStatus === 'TRIAL' && (
                                                <>
                                                    <span className="text-xs text-gray-400">•</span>
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                                        Free Trial
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <ChevronDownIcon className={`h-4 w-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown Menu */}
                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                        {userDropdownItems.map((item) => {
                                            const Icon = item.icon
                                            const isActive = pathname === item.href

                                            return (
                                                <Link
                                                    key={item.href}
                                                    href={item.href}
                                                    onClick={() => setIsDropdownOpen(false)}
                                                    className={`
                                                        flex items-center space-x-3 px-4 py-2 text-sm transition-colors
                                                        ${isActive
                                                            ? 'bg-blue-50 text-blue-700'
                                                            : 'text-gray-700 hover:bg-gray-50'
                                                        }
                                                    `}
                                                >
                                                    <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                                                    <span>{item.label}</span>
                                                </Link>
                                            )
                                        })}

                                        <hr className="my-2 border-gray-200" />

                                        <button
                                            onClick={handleSignOut}
                                            className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 w-full text-left transition-colors"
                                        >
                                            <LogOutIcon className="h-4 w-4" />
                                            <span>Sign Out</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsOpen(!isOpen)}
                            >
                                <MenuIcon className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Menu Panel */}
                    <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl">
                        <div className="flex flex-col h-full">
                            {/* Mobile Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                <div className="flex items-center space-x-3">
                                    <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                                        <ClockIcon className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-blue-600 font-heading">SmartClock</h2>
                                        <p className="text-sm text-gray-500">{user.organizationName}</p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsOpen(false)}
                                    className="h-8 w-8 p-0"
                                >
                                    <XIcon className="h-5 w-5" />
                                </Button>
                            </div>

                            {/* User Profile Section - Mobile */}
                            <div className="p-6 bg-gray-50 border-b border-gray-100">
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                                        <span className="text-white font-bold text-lg">
                                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 text-lg">{user.name}</h3>
                                        <p className="text-sm text-gray-600 capitalize">{user.role.toLowerCase()}</p>
                                        <div className="mt-2">
                                            {user.billingStatus === 'TRIAL' ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                                    Free Trial
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    {user.planType}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Navigation */}
                            <nav className="flex-1 py-4">
                                <div className="px-4 space-y-1">
                                    {allNavigationItems.map((item) => {
                                        const Icon = item.icon
                                        const isActive = pathname === item.href

                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={() => setIsOpen(false)}
                                                className={`
                                                    flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                                                    ${isActive
                                                        ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                                                    }
                                                `}
                                            >
                                                <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                                                <span>{item.label}</span>
                                            </Link>
                                        )
                                    })}
                                </div>
                            </nav>

                            {/* Sign Out Button - Mobile */}
                            <div className="p-4 border-t border-gray-100">
                                <Button
                                    variant="ghost"
                                    onClick={handleSignOut}
                                    className="w-full flex items-center justify-center space-x-2 text-gray-600 hover:text-red-600 hover:bg-red-50 py-3 rounded-xl transition-colors"
                                >
                                    <LogOutIcon className="h-5 w-5" />
                                    <span>Sign Out</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
} 