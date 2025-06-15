import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      organizationSlug,
      employeeName,
      employeeEmail,
      employeePassword,
      employeeId,
    } = body

    // Validation
    if (!organizationSlug || !employeeName || !employeeEmail || !employeePassword) {
      return NextResponse.json(
        { message: "All required fields must be provided" },
        { status: 400 }
      )
    }

    // Find organization
    const organization = await prisma.organization.findUnique({
      where: { 
        slug: organizationSlug,
        isActive: true
      },
      include: {
        _count: {
          select: {
            users: true
          }
        }
      }
    })

    if (!organization) {
      return NextResponse.json(
        { message: "Organization not found" },
        { status: 404 }
      )
    }

    // Check organization status
    if (organization.billingStatus === 'SUSPENDED' || organization.billingStatus === 'CANCELED') {
      return NextResponse.json(
        { message: "Organization is not currently accepting new employees" },
        { status: 403 }
      )
    }

    // Check employee limit
    if (organization._count.users >= organization.employeeLimit) {
      return NextResponse.json(
        { message: "Organization has reached its employee limit" },
        { status: 403 }
      )
    }

    // Check if email already exists in this organization
    const existingUser = await prisma.user.findFirst({
      where: {
        email: employeeEmail,
        organizationId: organization.id
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: "Email already registered in this organization" },
        { status: 400 }
      )
    }

    // Check if employee ID already exists in this organization (if provided)
    if (employeeId) {
      const existingEmployeeId = await prisma.user.findFirst({
        where: {
          employeeId: employeeId,
          organizationId: organization.id
        }
      })

      if (existingEmployeeId) {
        return NextResponse.json(
          { message: "Employee ID already exists in this organization" },
          { status: 400 }
        )
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(employeePassword, 12)

    // Create employee user
    const employee = await prisma.user.create({
      data: {
        organizationId: organization.id,
        name: employeeName,
        email: employeeEmail,
        password: hashedPassword,
        role: "EMPLOYEE",
        employeeId: employeeId || null,
        isActive: true,
      }
    })

    return NextResponse.json({
      message: "Employee account created successfully",
      userId: employee.id,
      organizationName: organization.name,
    })

  } catch (error) {
    console.error("Employee registration error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
} 