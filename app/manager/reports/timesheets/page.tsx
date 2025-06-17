import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeftIcon, CheckCircleIcon, ClockIcon } from "lucide-react"
import { TimesheetApprovalClient } from "./components/timesheet-approval-client"

export default async function TimesheetApprovalPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect("/login")
    }

    if (session.user.role !== "MANAGER" && session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
        redirect("/dashboard")
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/manager"
                                className="flex items-center text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors"
                            >
                                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                                Back to Manager Dashboard
                            </Link>
                            <div className="h-6 border-l border-gray-300" />
                            <h1 className="text-xl font-semibold text-gray-900 flex items-center">
                                <CheckCircleIcon className="h-5 w-5 mr-2 text-green-600" />
                                Timesheet Approval
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
                            <ClockIcon className="h-5 w-5 mr-2 text-blue-600" />
                            Pending Timesheet Approvals
                        </CardTitle>
                        <p className="text-sm text-gray-600">
                            Review and approve submitted timesheets from your team members.
                            {session.user.role === 'MANAGER' ? ' Note: You can only approve employee timesheets.' : ' As an admin, you can approve all timesheets including manager submissions.'}
                        </p>
                    </CardHeader>
                    <CardContent>
                        <TimesheetApprovalClient userRole={session.user.role} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 