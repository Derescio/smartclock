import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import type { PlanType } from "@/types"

export async function POST() {
  try {
    // Check if organizations already exist
    const existingOrgs = await prisma.organization.count()
    if (existingOrgs > 0) {
      return NextResponse.json({ message: "Demo data already exists" })
    }

    // Create demo organizations
    const demoOrganizations = [
      {
        name: "Acme Corporation",
        slug: "acme-corp",
        planType: "PROFESSIONAL" as PlanType,
        employeeLimit: 100,
      },
      {
        name: "TechStart Inc",
        slug: "techstart",
        planType: "BASIC" as PlanType, 
        employeeLimit: 50,
      },
      {
        name: "Enterprise Solutions",
        slug: "enterprise-sol",
        planType: "ENTERPRISE" as PlanType,
        employeeLimit: 999999,
      }
    ]

    // Calculate trial end date (14 days from now)
    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + 14)

    const results = []

    for (const orgData of demoOrganizations) {
      const result = await prisma.$transaction(async (tx) => {
        // Create organization
        const organization = await tx.organization.create({
          data: {
            name: orgData.name,
            slug: orgData.slug,
            planType: orgData.planType,
            employeeLimit: orgData.employeeLimit,
            billingStatus: "TRIAL",
            trialEndsAt,
            isActive: true,
          }
        })

        // Create locations for this organization
        const locations = await Promise.all([
          tx.location.create({
            data: {
              organizationId: organization.id,
              name: "Main Office",
              address: "123 Business St, City, State 12345",
              latitude: 40.7128,
              longitude: -74.0060,
              radius: 10,
              qrCode: `${orgData.slug}-main-office`,
              isActive: true,
            }
          }),
          tx.location.create({
            data: {
              organizationId: organization.id,
              name: "Warehouse",
              address: "456 Industrial Ave, City, State 12345", 
              latitude: 40.7589,
              longitude: -73.9851,
              radius: 10,
              qrCode: `${orgData.slug}-warehouse`,
              isActive: true,
            }
          })
        ])

        // Create users for this organization
        const hashedPassword = await bcrypt.hash("demo123", 12)
        
        const users = await Promise.all([
          // Admin/Owner
          tx.user.create({
            data: {
              organizationId: organization.id,
              name: `${orgData.name} Admin`,
              email: `admin@${orgData.slug}.com`,
              password: hashedPassword,
              role: "ADMIN",
              isActive: true,
            }
          }),
          // Manager
          tx.user.create({
            data: {
              organizationId: organization.id,
              name: `${orgData.name} Manager`,
              email: `manager@${orgData.slug}.com`,
              password: hashedPassword,
              role: "MANAGER",
              locationId: locations[0].id,
              isActive: true,
            }
          }),
          // Employees
          tx.user.create({
            data: {
              organizationId: organization.id,
              name: "Alice Johnson",
              email: `alice@${orgData.slug}.com`,
              password: hashedPassword,
              role: "EMPLOYEE",
              locationId: locations[0].id,
              employeeId: "EMP001",
              isActive: true,
            }
          }),
          tx.user.create({
            data: {
              organizationId: organization.id,
              name: "Bob Smith",
              email: `bob@${orgData.slug}.com`,
              password: hashedPassword,
              role: "EMPLOYEE",
              locationId: locations[1].id,
              employeeId: "EMP002",
              isActive: true,
            }
          })
        ])

        // Create some sample clock events
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0)
        
        await Promise.all([
          tx.clockEvent.create({
            data: {
              organizationId: organization.id,
              userId: users[2].id, // Alice
              type: "CLOCK_IN",
              timestamp: today,
              method: "QR_CODE",
              locationId: locations[0].id,
              latitude: 40.7128,
              longitude: -74.0060,
            }
          }),
          tx.clockEvent.create({
            data: {
              organizationId: organization.id,
              userId: users[3].id, // Bob
              type: "CLOCK_IN", 
              timestamp: new Date(today.getTime() + 15 * 60000), // 15 minutes later
              method: "GEOFENCE",
              locationId: locations[1].id,
              latitude: 40.7589,
              longitude: -73.9851,
            }
          })
        ])

        return { organization, locations, users }
      })

      results.push(result)
    }

    return NextResponse.json({
      message: "Multi-tenant demo data created successfully",
      organizations: results.map(r => ({
        name: r.organization.name,
        slug: r.organization.slug,
        userCount: r.users.length,
        locationCount: r.locations.length
      }))
    })

  } catch (error) {
    console.error("Setup error:", error)
    return NextResponse.json(
      { message: "Failed to create demo data", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}