"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateLocation, deleteLocation, generateLocationQRCode } from "@/actions/locations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    MapPinIcon,
    SearchIcon,
    MoreVerticalIcon,
    EditIcon,
    TrashIcon,
    QrCodeIcon,
    UsersIcon,
    ClockIcon,
    RadarIcon,
    MapIcon,
    CheckCircleIcon,
    XCircleIcon
} from "lucide-react"
import { toast } from "sonner"

interface Location {
    id: string
    name: string
    address: string
    latitude: number
    longitude: number
    radius: number
    qrCode: string | null
    isActive: boolean
    users: {
        id: string
        name: string | null
        email: string
    }[]
    _count: {
        users: number
        clockEvents: number
    }
}

interface LocationManagementClientProps {
    locations: Location[]
}

export function LocationManagementClient({ locations }: LocationManagementClientProps) {
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState("")
    // const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [locationToDelete, setLocationToDelete] = useState<Location | null>(null)

    // Filter locations based on search term
    const filteredLocations = locations.filter(location =>
        location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.address.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleToggleStatus = async (location: Location) => {
        setIsLoading(true)
        try {
            const result = await updateLocation(location.id, {
                isActive: !location.isActive
            })

            if (result.success) {
                toast.success(`Location ${location.isActive ? 'deactivated' : 'activated'} successfully`)
                router.refresh()
            } else {
                toast.error(result.error || 'Failed to update location')
            }
        } catch (error) {
            toast.error('An unexpected error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    const openDeleteDialog = (location: Location) => {
        setLocationToDelete(location)
        setDeleteDialogOpen(true)
    }

    const handleDeleteLocation = async () => {
        if (!locationToDelete) return

        setIsLoading(true)
        try {
            const result = await deleteLocation(locationToDelete.id)

            if (result.success) {
                toast.success('Location deleted successfully')
                router.refresh()
                setDeleteDialogOpen(false)
                setLocationToDelete(null)
            } else {
                toast.error(result.error || 'Failed to delete location')
            }
        } catch (error) {
            toast.error('An unexpected error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    const handleGenerateQR = async (location: Location) => {
        setIsLoading(true)
        try {
            const result = await generateLocationQRCode(location.id)

            if (result.success) {
                toast.success('QR Code generated successfully')
                router.refresh()
            } else {
                toast.error(result.error || 'Failed to generate QR code')
            }
        } catch (error) {
            toast.error('An unexpected error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    const formatCoordinates = (lat: number, lng: number) => {
        return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    }

    return (
        <div className="space-y-6">
            {/* Search and Filters */}
            <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                        placeholder="Search locations by name or address..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Locations Grid */}
            {filteredLocations.length === 0 ? (
                <div className="text-center py-12">
                    <MapPinIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No locations found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first location.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLocations.map((location) => (
                        <Card key={location.id} className={`relative ${!location.isActive ? 'opacity-60' : ''}`}>
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-lg flex items-center space-x-2">
                                            <MapPinIcon className="h-5 w-5 text-blue-600" />
                                            <span>{location.name}</span>
                                        </CardTitle>
                                        <p className="text-sm text-gray-600 mt-1">{location.address}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Badge variant={location.isActive ? "default" : "secondary"}>
                                            {location.isActive ? (
                                                <CheckCircleIcon className="h-3 w-3 mr-1" />
                                            ) : (
                                                <XCircleIcon className="h-3 w-3 mr-1" />
                                            )}
                                            {location.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreVerticalIcon className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() => router.push(`/manager/locations/${location.id}/edit`)}
                                                >
                                                    <EditIcon className="h-4 w-4 mr-2" />
                                                    Edit Location
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleGenerateQR(location)}
                                                    disabled={isLoading}
                                                >
                                                    <QrCodeIcon className="h-4 w-4 mr-2" />
                                                    Generate QR Code
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleToggleStatus(location)}
                                                    disabled={isLoading}
                                                >
                                                    {location.isActive ? (
                                                        <>
                                                            <XCircleIcon className="h-4 w-4 mr-2" />
                                                            Deactivate
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircleIcon className="h-4 w-4 mr-2" />
                                                            Activate
                                                        </>
                                                    )}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => openDeleteDialog(location)}
                                                    disabled={isLoading || location._count.users > 0}
                                                    className="text-red-600"
                                                >
                                                    <TrashIcon className="h-4 w-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Location Details */}
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center space-x-2">
                                        <RadarIcon className="h-4 w-4 text-gray-400" />
                                        <span className="text-gray-600">Radius: {location.radius}m</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <MapIcon className="h-4 w-4 text-gray-400" />
                                        <span className="text-gray-600 truncate">
                                            {formatCoordinates(location.latitude, location.longitude)}
                                        </span>
                                    </div>
                                </div>

                                {/* Statistics */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center space-x-2">
                                        <UsersIcon className="h-4 w-4 text-purple-600" />
                                        <span className="text-sm">
                                            <span className="font-medium">{location._count.users}</span>
                                            <span className="text-gray-600 ml-1">users</span>
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <ClockIcon className="h-4 w-4 text-orange-600" />
                                        <span className="text-sm">
                                            <span className="font-medium">{location._count.clockEvents}</span>
                                            <span className="text-gray-600 ml-1">events</span>
                                        </span>
                                    </div>
                                </div>

                                {/* QR Code Status */}
                                {location.qrCode && (
                                    <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-md">
                                        <QrCodeIcon className="h-4 w-4 text-green-600" />
                                        <span className="text-sm text-green-700">QR Code Available</span>
                                    </div>
                                )}

                                {/* Assigned Users Preview */}
                                {location.users.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-700">Assigned Users:</p>
                                        <div className="space-y-1">
                                            {location.users.slice(0, 3).map((user) => (
                                                <div key={user.id} className="text-xs text-gray-600">
                                                    {user.name || user.email}
                                                </div>
                                            ))}
                                            {location.users.length > 3 && (
                                                <div className="text-xs text-gray-500">
                                                    +{location.users.length - 3} more
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Location</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{locationToDelete?.name}"? This action cannot be undone.
                            {locationToDelete && locationToDelete._count.users > 0 && (
                                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                                    Warning: This location has {locationToDelete._count.users} assigned users.
                                </div>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteLocation}
                            disabled={isLoading}
                        >
                            {isLoading ? "Deleting..." : "Delete Location"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
} 