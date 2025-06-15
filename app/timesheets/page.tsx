import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon } from "lucide-react"
import Providers from "../components/providers"
import Navigation from "../components/navigation"

export default async function TimesheetsPage() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/login")
    }

    return (
        <Providers session={session}>
            <div className="min-h-screen bg-gray-50">
                <Navigation />
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 font-heading">Timesheets</h1>
                        <p className="text-gray-600 mt-2">View and manage your time records</p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center font-heading">
                                <CalendarIcon className="h-5 w-5 mr-2 text-blue-600" />
                                Time Records
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <p className="text-gray-600">Timesheets page coming soon...</p>
                                <p className="text-sm text-gray-500">
                                    This page will display your daily, weekly, and monthly time records
                                    with detailed breakdowns of hours worked, breaks taken, and overtime.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Providers>
    )
} 