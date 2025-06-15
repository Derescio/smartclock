import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

interface DocumentUpload {
  name: string
  url: string
  size: number
  type: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      organizationSlug,
      employeeName,
      employeeEmail,
      phoneNumber,
      employeePassword,
      employeeId,
      avatarUrl,
      documents = []
    } = body

    // Validation
    if (!organizationSlug || !employeeName || !employeeEmail || !phoneNumber || !employeePassword) {
      return NextResponse.json(
        { message: "All required fields must be provided (organization, name, email, phone, password)" },
        { status: 400 }
      )
    }

    // Basic phone number validation (should contain digits and common phone characters)
    const phoneRegex = /^[\+]?[(]?[\d\s\-\(\)\.]{10,}$/
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
      return NextResponse.json(
        { message: "Please provide a valid phone number" },
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

    // Create employee user with avatar and phone number
    const employee = await prisma.user.create({
      data: {
        organizationId: organization.id,
        name: employeeName,
        email: employeeEmail,
        phoneNumber: phoneNumber,
        password: hashedPassword,
        role: "EMPLOYEE",
        employeeId: employeeId || null,
        avatarUrl: avatarUrl || null,
        isActive: true,
      }
    })

    // Create file records for uploaded documents
    if (documents && documents.length > 0) {
      const fileRecords = documents.map((doc: DocumentUpload) => ({
        fileName: doc.name,
        originalName: doc.name,
        filePath: doc.url,
        fileType: "DOCUMENT" as const,
        fileSize: doc.size,
        mimeType: doc.type,
        description: "Onboarding document uploaded during registration",
        uploadedById: employee.id,
        organizationId: organization.id,
        isActive: true
      }))

      await prisma.file.createMany({
        data: fileRecords
      })
    }

    // If avatar was uploaded, create a file record for it too
    if (avatarUrl) {
      await prisma.file.create({
        data: {
          fileName: `avatar-${employee.id}`,
          originalName: "Profile Picture",
          filePath: avatarUrl,
          fileType: "EMPLOYEE_AVATAR",
          fileSize: 0, // Size not available from registration
          mimeType: "image/*",
          description: "Profile picture uploaded during registration",
          uploadedById: employee.id,
          organizationId: organization.id,
          isActive: true
        }
      })
    }

    return NextResponse.json({
      message: "Employee account created successfully",
      userId: employee.id,
      organizationName: organization.name,
      filesUploaded: documents.length + (avatarUrl ? 1 : 0)
    })

  } catch (error) {
    console.error("Employee registration error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
} 