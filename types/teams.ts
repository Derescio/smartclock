export interface TeamMember {
  id: string
  userId: string
  teamId: string
  user: {
    id: string
    name: string | null
    email: string
    employeeId?: string | null
    department?: {
      id: string
      name: string
      color?: string | null
    } | null
  }
}

export interface Team {
  id: string
  name: string
  description?: string | null
  color?: string | null
  organizationId: string
  managerId?: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  manager?: {
    id: string
    name: string | null
    email: string
  } | null
  members: TeamMember[]
  _count: {
    members: number
  }
}

export interface TeamStats {
  totalTeams: number
  activeTeams: number
  totalMembers: number
  avgTeamSize: number
}

export interface Employee {
  id: string
  name: string | null
  email: string
  employeeId?: string | null
  role: string
  isActive: boolean
  organizationId: string
  locationId?: string | null
  departmentId?: string | null
  location?: {
    id: string
    name: string
    address?: string | null
  } | null
  organization: {
    id: string
    name: string
  }
  department?: {
    id: string
    name: string
    color?: string | null
  } | null
} 