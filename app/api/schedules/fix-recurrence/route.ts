import { NextRequest, NextResponse } from 'next/server'
import { fixCorruptedRecurrenceDays } from '@/actions'

export async function POST(request: NextRequest) {
  try {
    const result = await fixCorruptedRecurrenceDays()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Fix recurrence days API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fix recurrence days' },
      { status: 500 }
    )
  }
} 