import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (!slug) {
      return NextResponse.json(
        { error: "Organization slug is required" },
        { status: 400 }
      )
    }

    const organization = await prisma.organization.findUnique({
      where: { 
        slug: slug,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        slug: true,
        planType: true,
        employeeLimit: true,
        billingStatus: true,
        _count: {
          select: {
            users: true
          }
        }
      }
    })

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      )
    }

    // Check if organization is accepting new employees
    if (organization.billingStatus === 'SUSPENDED' || organization.billingStatus === 'CANCELED') {
      return NextResponse.json(
        { error: "Organization is not currently accepting new employees" },
        { status: 403 }
      )
    }

    // Check employee limit
    if (organization._count.users >= organization.employeeLimit) {
      return NextResponse.json(
        { error: "Organization has reached its employee limit" },
        { status: 403 }
      )
    }

    //Check if email already in use by another user
    const user = await prisma.user.findFirst({
      where: {
        email: request.headers.get('email') || '',
        organizationId: organization.id
      }
    })

    if (user) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 })
    }

    return NextResponse.json({
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        planType: organization.planType
      },
      availableSlots: organization.employeeLimit - organization._count.users
    })

  } catch (error) {
    console.error("Organization lookup error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 