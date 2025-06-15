import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import LandingPageClient from "./landing-page-client"

export default async function LandingPageWrapper() {
    const session = await getServerSession(authOptions)

    // Redirect authenticated users to their dashboard
    if (session) {
        redirect("/dashboard")
    }

    return <LandingPageClient />
} 