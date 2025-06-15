import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import type { PlanType } from "@/types"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      organizationName,
      organizationSlug,
      planType,
      ownerName,
      ownerEmail,
      ownerPassword,
    } = body

    // Validation
    if (!organizationName || !organizationSlug || !ownerName || !ownerEmail || !ownerPassword) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      )
    }

    // Check if organization slug already exists
    const existingOrg = await prisma.organization.findUnique({
      where: { slug: organizationSlug }
    })

    if (existingOrg) {
      return NextResponse.json(
        { message: "Organization URL already exists" },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: ownerEmail }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(ownerPassword, 12)

    // Set employee limit based on plan
    const employeeLimits: Record<PlanType, number> = {
      BASIC: 50,
      PROFESSIONAL: 100,
      ENTERPRISE: 999999 // Unlimited
    }

    // Calculate trial end date (14 days from now)
    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + 14)

    // Create organization and owner in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create organization
      const organization = await tx.organization.create({
        data: {
          name: organizationName,
          slug: organizationSlug,
          planType: planType as PlanType,
          employeeLimit: employeeLimits[planType as PlanType],
          billingStatus: "TRIAL",
          trialEndsAt,
          isActive: true,
        }
      })

      // Create owner user
      const owner = await tx.user.create({
        data: {
          organizationId: organization.id,
          name: ownerName,
          email: ownerEmail,
          password: hashedPassword,
          role: "ADMIN",
          isActive: true,
        }
      })

      // Create default location for the organization
      const defaultLocation = await tx.location.create({
        data: {
          organizationId: organization.id,
          name: "Main Office",
          address: "To be updated",
          latitude: 0,
          longitude: 0,
          radius: 100,
          qrCode: `${organizationSlug}-main-office`,
          isActive: true,
        }
      })

      return { organization, owner, defaultLocation }
    })

    return NextResponse.json({
      message: "Organization created successfully",
      organizationId: result.organization.id,
      slug: result.organization.slug,
    })

  } catch (error) {
    console.error("Organization registration error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
} 