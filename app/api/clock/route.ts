import { NextRequest, NextResponse } from "next/server"
import { clockIn, clockOut, startBreak, endBreak, getCurrentStatus } from "@/actions"

export async function GET() {
  try {
    const result = await getCurrentStatus()
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Clock status error:", error)
    return NextResponse.json({ error: "Failed to get clock status" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, method, latitude, longitude, locationId, notes } = body

    let result

    switch (action) {
      case "CLOCK_IN":
        result = await clockIn({ method, latitude, longitude, locationId, notes })
        break
      case "CLOCK_OUT":
        result = await clockOut({ method, latitude, longitude, locationId, notes })
        break
      case "BREAK_START":
        result = await startBreak({ method, notes })
        break
      case "BREAK_END":
        result = await endBreak({ method, notes })
        break
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    if (!result.success) {
      return NextResponse.json({ 
        error: result.error, 
        ...('details' in result && result.details ? { details: result.details } : {})
      }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Clock action error:", error)
    return NextResponse.json({ error: "Failed to process clock action" }, { status: 500 })
  }
} 