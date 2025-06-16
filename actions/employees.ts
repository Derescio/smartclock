'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { requireRole } from "./auth"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"

// Employee Management Actions

export async function createEmployee(data: {
  name: string
  email: string
  password: string
  role: 'EMPLOYEE' | 'MANAGER' | 'ADMIN'
  phoneNumber?: string
  employeeId?: string
  departmentId?: string
  locationId?: string
}) {
  try {
    const user = await requireRole(['MANAGER', 'ADMIN'])
    
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    })
    
    if (existingUser) {
      return { success: false, error: 'Email already exists' }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12)
    
    // Create employee
    const employee = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        organizationId: user.organizationId,
        role: data.role,
        phoneNumber: data.phoneNumber,
        employeeId: data.employeeId,
        departmentId: data.departmentId,
        locationId: data.locationId,
        isActive: true,
      },
      include: {
        organization: true,
        location: true,
        department: true
      }
    })

    revalidatePath('/manager/employees')
    revalidatePath('/manager')
    
    return { success: true, employee }
  } catch (error) {
    console.error('Create employee error:', error)
    return { success: false, error: 'Failed to create employee' }
  }
}

export async function updateEmployee(
  employeeId: string, 
  data: {
    name?: string
    email?: string
    role?: 'EMPLOYEE' | 'MANAGER' | 'ADMIN'
    phoneNumber?: string
    employeeId?: string
    departmentId?: string
    locationId?: string
    isActive?: boolean
  }
) {
  try {
    const user = await requireRole(['MANAGER', 'ADMIN'])
    
    // Check if email already exists (if email is being updated)
    if (data.email) {
      const existingUser = await prisma.user.findFirst({
        where: { 
          email: data.email,
          id: { not: employeeId }
        }
      })
      
      if (existingUser) {
        return { success: false, error: 'Email already exists' }
      }
    }

    // Ensure the employee belongs to the same organization
    const employee = await prisma.user.findFirst({
      where: {
        id: employeeId,
        organizationId: user.organizationId
      }
    })

    if (!employee) {
      return { success: false, error: 'Employee not found' }
    }

    // Update employee
    const updatedEmployee = await prisma.user.update({
      where: { id: employeeId },
      data,
      include: {
        organization: true,
        location: true,
        department: true
      }
    })

    revalidatePath('/manager/employees')
    revalidatePath('/manager')
    
    return { success: true, employee: updatedEmployee }
  } catch (error) {
    console.error('Update employee error:', error)
    return { success: false, error: 'Failed to update employee' }
  }
}

export async function getEmployee(employeeId: string) {
  try {
    const user = await requireRole(['MANAGER', 'ADMIN'])
    
    const employee = await prisma.user.findFirst({
      where: {
        id: employeeId,
        organizationId: user.organizationId
      },
      include: {
        organization: true,
        location: true,
        department: true
      }
    })

    if (!employee) {
      return { success: false, error: 'Employee not found' }
    }

    return { success: true, employee }
  } catch (error) {
    console.error('Get employee error:', error)
    return { success: false, error: 'Failed to fetch employee' }
  }
}

export async function toggleEmployeeStatus(employeeId: string) {
  try {
    const user = await requireRole(['MANAGER', 'ADMIN'])
    
    // Get current employee status
    const employee = await prisma.user.findFirst({
      where: {
        id: employeeId,
        organizationId: user.organizationId
      }
    })

    if (!employee) {
      return { success: false, error: 'Employee not found' }
    }

    // Toggle status
    const updatedEmployee = await prisma.user.update({
      where: { id: employeeId },
      data: { isActive: !employee.isActive },
      include: {
        organization: true,
        location: true,
        department: true
      }
    })

    revalidatePath('/manager/employees')
    revalidatePath('/manager')
    
    return { 
      success: true, 
      employee: updatedEmployee,
      action: updatedEmployee.isActive ? 'activated' : 'deactivated'
    }
  } catch (error) {
    console.error('Toggle employee status error:', error)
    return { success: false, error: 'Failed to update employee status' }
  }
}

// Department Management Actions

export async function getDepartments() {
  try {
    const user = await requireRole(['MANAGER', 'ADMIN'])
    
    const departments = await prisma.department.findMany({
      where: {
        organizationId: user.organizationId,
        isActive: true
      },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            employees: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return { success: true, departments }
  } catch (error) {
    console.error('Get departments error:', error)
    return { success: false, error: 'Failed to fetch departments' }
  }
}

export async function createDepartment(data: {
  name: string
  description?: string
  color?: string
  managerId?: string
}) {
  try {
    const user = await requireRole(['MANAGER', 'ADMIN'])
    
    // Check if department name already exists
    const existingDept = await prisma.department.findFirst({
      where: {
        organizationId: user.organizationId,
        name: data.name
      }
    })

    if (existingDept) {
      return { success: false, error: 'Department name already exists' }
    }

    const department = await prisma.department.create({
      data: {
        name: data.name,
        description: data.description,
        color: data.color || '#6B7280', // Default gray
        managerId: data.managerId,
        organizationId: user.organizationId,
        isActive: true,
      },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            employees: true
          }
        }
      }
    })

    revalidatePath('/manager/employees')
    revalidatePath('/manager')
    
    return { success: true, department }
  } catch (error) {
    console.error('Create department error:', error)
    return { success: false, error: 'Failed to create department' }
  }
}

export async function updateDepartment(
  departmentId: string,
  data: {
    name?: string
    description?: string
    color?: string
    managerId?: string
    isActive?: boolean
  }
) {
  try {
    const user = await requireRole(['MANAGER', 'ADMIN'])
    
    // Check if department belongs to organization
    const department = await prisma.department.findFirst({
      where: {
        id: departmentId,
        organizationId: user.organizationId
      }
    })

    if (!department) {
      return { success: false, error: 'Department not found' }
    }

    // Check if name already exists (if name is being updated)
    if (data.name) {
      const existingDept = await prisma.department.findFirst({
        where: {
          organizationId: user.organizationId,
          name: data.name,
          id: { not: departmentId }
        }
      })

      if (existingDept) {
        return { success: false, error: 'Department name already exists' }
      }
    }

    const updatedDepartment = await prisma.department.update({
      where: { id: departmentId },
      data,
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            employees: true
          }
        }
      }
    })

    revalidatePath('/manager/employees')
    revalidatePath('/manager')
    
    return { success: true, department: updatedDepartment }
  } catch (error) {
    console.error('Update department error:', error)
    return { success: false, error: 'Failed to update department' }
  }
}

// Bulk Operations

export async function bulkUpdateEmployees(
  employeeIds: string[],
  action: 'activate' | 'deactivate' | 'delete' | 'changeDepartment',
  data?: { departmentId?: string }
) {
  try {
    const user = await requireRole(['MANAGER', 'ADMIN'])
    
    // Verify all employees belong to the organization
    const employees = await prisma.user.findMany({
      where: {
        id: { in: employeeIds },
        organizationId: user.organizationId
      }
    })

    if (employees.length !== employeeIds.length) {
      return { success: false, error: 'Some employees not found' }
    }

    let updateData: any = {}
    
    switch (action) {
      case 'activate':
        updateData = { isActive: true }
        break
      case 'deactivate':
        updateData = { isActive: false }
        break
      case 'changeDepartment':
        updateData = { departmentId: data?.departmentId }
        break
      case 'delete':
        // For safety, we'll deactivate instead of hard delete
        updateData = { isActive: false }
        break
    }

    const result = await prisma.user.updateMany({
      where: {
        id: { in: employeeIds },
        organizationId: user.organizationId
      },
      data: updateData
    })

    revalidatePath('/manager/employees')
    revalidatePath('/manager')
    
    return { 
      success: true, 
      message: `Successfully updated ${result.count} employees`,
      action 
    }
  } catch (error) {
    console.error('Bulk update employees error:', error)
    return { success: false, error: 'Failed to update employees' }
  }
} 