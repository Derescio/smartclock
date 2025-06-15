import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import type { SessionUser } from "@/types"
import Providers from "../components/providers"
import Navigation from "../components/navigation"
import DashboardClient from "../components/dashboard-client"

export default async function Dashboard() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/login")
    }

    const user = session.user as SessionUser

    return (
        <Providers session={session}>
            <div className="min-h-screen bg-gray-50">
                <Navigation />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 font-heading">
                            Welcome back, {user.name}
                        </h1>
                        <p className="text-gray-600 mt-2">
                            {user.organizationName} • {user.role}
                        </p>
                    </div>

                    <DashboardClient />
                </div>
            </div>
        </Providers>
    )
} 