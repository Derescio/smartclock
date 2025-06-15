import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'

async function main() {
  // Create organization first
  const organization = await prisma.organization.create({
    data: {
      name: 'Demo Company',
      slug: 'demo-company',
      planType: 'BASIC',
      employeeLimit: 50,
      billingStatus: 'TRIAL',
      trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      isActive: true
    }
  })

  // Create locations
  const mainOffice = await prisma.location.create({
    data: {
      organizationId: organization.id,
      name: 'Main Office',
      address: '123 Business St, City, State 12345',
      latitude: 40.7128,
      longitude: -74.0060,
      radius: 100,
      qrCode: 'MAIN_OFFICE_QR_001'
    }
  })

  const warehouse = await prisma.location.create({
    data: {
      organizationId: organization.id,
      name: 'Warehouse',
      address: '456 Industrial Ave, City, State 12345',
      latitude: 40.7589,
      longitude: -73.9851,
      radius: 150,
      qrCode: 'WAREHOUSE_QR_002'
    }
  })

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const adminUser = await prisma.user.create({
    data: {
      organizationId: organization.id,
      name: 'Admin User',
      email: 'admin@smartclock.com',
      password: hashedPassword,
      role: 'ADMIN' as any,
      locationId: mainOffice.id
    }
  })

  // Create manager user
  const managerPassword = await bcrypt.hash('manager123', 12)
  
  const managerUser = await prisma.user.create({
    data: {
      organizationId: organization.id,
      name: 'John Manager',
      email: 'manager@smartclock.com',
      password: managerPassword,
      role: 'MANAGER' as any,
      locationId: mainOffice.id
    }
  })

  // Create employee users
  const employeePassword = await bcrypt.hash('employee123', 12)
  
  const employee1 = await prisma.user.create({
    data: {
      organizationId: organization.id,
      name: 'Alice Employee',
      email: 'alice@smartclock.com',
      password: employeePassword,
      role: 'EMPLOYEE' as any,
      locationId: mainOffice.id
    }
  })

  const employee2 = await prisma.user.create({
    data: {
      organizationId: organization.id,
      name: 'Bob Worker',
      email: 'bob@smartclock.com',
      password: employeePassword,
      role: 'EMPLOYEE' as any,
      locationId: warehouse.id
    }
  })

  console.log('✅ Seed data created successfully!')
  console.log('\n🏢 Organization:')
  console.log(`- ${organization.name} (${organization.slug})`)
  console.log('\n📍 Locations:')
  console.log(`- ${mainOffice.name} (${mainOffice.id})`)
  console.log(`- ${warehouse.name} (${warehouse.id})`)
  
  console.log('\n👤 Users created:')
  console.log(`- Admin: admin@smartclock.com / admin123`)
  console.log(`- Manager: manager@smartclock.com / manager123`)
  console.log(`- Employee: alice@smartclock.com / employee123`)
  console.log(`- Employee: bob@smartclock.com / employee123`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 