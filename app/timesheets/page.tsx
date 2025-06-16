import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeftIcon, ClockIcon, CalendarIcon } from "lucide-react"
import { TimesheetClient } from "./components/timesheet-client"

export default async function TimesheetsPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect("/login")
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/dashboard"
                                className="flex items-center text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors"
                            >
                                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                                Back to Dashboard
                            </Link>
                            <div className="h-6 border-l border-gray-300" />
                            <h1 className="text-xl font-semibold text-gray-900 flex items-center">
                                <ClockIcon className="h-5 w-5 mr-2 text-blue-600" />
                                My Timesheets
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <CalendarIcon className="h-5 w-5 mr-2 text-blue-600" />
                            Timesheet Management
                        </CardTitle>
                        <p className="text-sm text-gray-600">
                            View your work hours, generate timesheets from clock events, and track your time.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <TimesheetClient />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 