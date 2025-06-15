"use client"

import { Button } from "@/components/ui/button"
import { RefreshCwIcon } from "lucide-react"
import { refreshManagerDashboard } from "@/actions"
import { useState } from "react"

export default function RefreshButton() {
    const [isRefreshing, setIsRefreshing] = useState(false)

    const handleRefresh = async () => {
        setIsRefreshing(true)
        try {
            await refreshManagerDashboard()
        } catch (error) {
            console.error('Failed to refresh:', error)
        } finally {
            setIsRefreshing(false)
        }
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8 w-8 p-0"
        >
            <RefreshCwIcon className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
    )
} 