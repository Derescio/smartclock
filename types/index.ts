import { User, Organization, Location, ClockEvent, UserRole, PlanType, BillingStatus } from '@prisma/client'

// ============================================================================
// AUTH & USER TYPES
// ============================================================================

export interface ExtendedUser extends User {
  organization: Organization
  location?: Location | null
}

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  locationId?: string
  organizationId: string
  organizationName: string
  organizationSlug: string
  planType: PlanType
  billingStatus: BillingStatus
}

export interface SessionUser extends AuthUser {
  image?: string | null
}

// ============================================================================
// CLOCK & TIME TRACKING TYPES
// ============================================================================

export interface ClockAction {
  method: 'MANUAL' | 'QR_CODE' | 'GEOFENCE'
  latitude?: number
  longitude?: number
  locationId?: string
  notes?: string
}

export interface ClockInData extends ClockAction {}
export interface ClockOutData extends ClockAction {}
export interface BreakStartData extends Pick<ClockAction, 'method' | 'notes'> {}
export interface BreakEndData extends Pick<ClockAction, 'method' | 'notes'> {}

export interface ClockStatus {
  currentStatus: 'CLOCKED_IN' | 'CLOCKED_OUT' | 'ON_BREAK'
  clockedInAt?: string
  lastBreakStart?: string
  todayHours: number
  breakTime: number
  location?: {
    id: string
    name: string
  }
}

export interface ClockActionResult {
  success: boolean
  error?: string
  details?: string
  data?: ClockStatus
}

// ============================================================================
// TEAM & MANAGER TYPES
// ============================================================================

export interface TeamMember {
  id: string
  name: string
  email: string
  role: UserRole
  currentStatus: 'CLOCKED_IN' | 'CLOCKED_OUT' | 'ON_BREAK'
  clockedInAt?: string
  lastBreakStart?: string
  todayHours: number
  breakTime: number
  location?: {
    id: string
    name: string
  }
}

export interface TeamStats {
  totalEmployees: number
  currentlyWorking: number
  onBreak: number
  clockedOut: number
  totalHoursToday: number
  averageHoursPerEmployee: number
}

export interface TeamActivity {
  id: string
  userId: string
  userName: string
  action: string
  timestamp: string
  location?: string
  notes?: string
}

// ============================================================================
// LOCATION & ORGANIZATION TYPES
// ============================================================================

export interface LocationData {
  name: string
  address: string
  latitude: number
  longitude: number
  radius: number
  isActive: boolean
}

export interface LocationWithAnalytics extends Location {
  _count?: {
    clockEvents: number
    users: number
  }
  recentActivity?: ClockEvent[]
}

export interface OrganizationStats {
  totalEmployees: number
  totalLocations: number
  totalHoursThisMonth: number
  activeEmployees: number
  planType: PlanType
  billingStatus: BillingStatus
  trialEndsAt?: Date | null
}

export interface OrganizationUsage {
  employeeCount: number
  locationCount: number
  monthlyHours: number
  planLimits: {
    maxEmployees: number
    maxLocations: number
    features: string[]
  }
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ============================================================================
// FORM & VALIDATION TYPES
// ============================================================================

export interface RegisterOrganizationData {
  organizationName: string
  organizationSlug: string
  adminName: string
  adminEmail: string
  adminPassword: string
  planType: PlanType
}

export interface JoinOrganizationData {
  organizationSlug: string
  employeeName: string
  employeeEmail: string
  employeePassword: string
  employeeId?: string
}

export interface CreateLocationData extends LocationData {
  organizationId: string
}

export interface UpdateLocationData extends Partial<LocationData> {
  id: string
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type ActionResult<T = any> = {
  success: true
  data: T
} | {
  success: false
  error: string
  details?: string
}

export interface GeolocationCoordinates {
  latitude: number
  longitude: number
  accuracy?: number
}

export interface QRCodeData {
  locationId: string
  organizationId: string
  timestamp: number
  signature: string
}

// ============================================================================
// NEXT-AUTH TYPE EXTENSIONS
// ============================================================================

declare module 'next-auth' {
  interface User {
    id: string
    role: UserRole
    locationId?: string
    organizationId: string
    organizationName: string
    organizationSlug: string
    planType: PlanType
    billingStatus: BillingStatus
  }
  
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: UserRole
      locationId?: string
      organizationId: string
      organizationName: string
      organizationSlug: string
      planType: PlanType
      billingStatus: BillingStatus
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole
    locationId?: string
    organizationId: string
    organizationName: string
    organizationSlug: string
    planType: PlanType
    billingStatus: BillingStatus
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  UserRole,
  PlanType,
  BillingStatus,
  User,
  Organization,
  Location,
  ClockEvent
} from '@prisma/client' 