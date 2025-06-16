import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getOrganizationLocations } from "@/actions/locations"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeftIcon, MapPinIcon } from "lucide-react"
import { EditLocationForm } from "./components/edit-location-form"

interface EditLocationPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function EditLocationPage({ params }: EditLocationPageProps) {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect("/login")
    }

    if (session.user.role !== "MANAGER" && session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
        redirect("/dashboard")
    }

    // Await params in Next.js 15
    const { id } = await params

    // Get all locations and find the one we're editing
    const locations = await getOrganizationLocations()
    const location = locations.find(loc => loc.id === id)

    if (!location) {
        redirect("/manager/locations")
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/manager/locations"
                                className="flex items-center text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors"
                            >
                                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                                Back to Locations
                            </Link>
                            <div className="h-6 border-l border-gray-300" />
                            <h1 className="text-xl font-semibold text-gray-900 flex items-center">
                                <MapPinIcon className="h-5 w-5 mr-2 text-blue-600" />
                                Edit Location: {location.name}
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Location Information</CardTitle>
                        <p className="text-sm text-gray-600">
                            Update the location information below. Changes will be saved immediately.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <EditLocationForm location={location} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 