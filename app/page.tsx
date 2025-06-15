import { ClockIcon, CalendarIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import ClockInOut from "./components/clock-in-out"
import RecentActivity from "./components/recent-activity"
import QuickStats from "./components/quick-stats"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import type { SessionUser } from "@/types"

export default async function Dashboard() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const user = session.user as SessionUser
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <h1 className="text-2xl font-bold text-blue-600 font-heading">SmartClock</h1>
                <p className="text-sm text-gray-600">{user.organizationName}</p>
              </div>
            </div>
            <nav className="flex space-x-4">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Button>
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                Timesheets
              </Button>
              {(['MANAGER', 'ADMIN'].includes(user.role)) && (
                <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                  <a href="/manager">Manager View</a>
                </Button>
              )}
              <Button variant="outline">Profile</Button>
              <form action="/api/auth/signout" method="post">
                <Button variant="ghost" type="submit" className="text-gray-600 hover:text-gray-900">
                  Sign Out
                </Button>
              </form>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 font-heading">Good morning, {user.name?.split(' ')[0] || 'there'}!</h2>
          <p className="text-gray-600 mt-1">Ready to start your day?</p>
          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
            <span>Role: {user.role}</span>
            <span>•</span>
            <span>Plan: {user.planType}</span>
            {user.billingStatus === 'TRIAL' && (
              <>
                <span>•</span>
                <span className="text-orange-600 font-medium">Free Trial</span>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Clock In/Out */}
          <div className="lg:col-span-2">
            <ClockInOut />
            <div className="mt-8">
              <RecentActivity />
            </div>
          </div>

          {/* Right Column - Stats and Info */}
          <div className="space-y-6">
            <QuickStats />

            {/* Today's Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center font-heading">
                  <CalendarIcon className="h-5 w-5 mr-2 text-blue-600" />
                  Today's Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Shift Start</span>
                    <span className="font-medium">9:00 AM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Lunch Break</span>
                    <span className="font-medium">12:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Shift End</span>
                    <span className="font-medium">5:00 PM</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full btn-secondary">View Timesheet</Button>
                <Button variant="outline" className="w-full">
                  Request Time Off
                </Button>
                <Button variant="outline" className="w-full">
                  Report Issue
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
