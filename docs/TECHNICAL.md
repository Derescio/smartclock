# SmartClock Technical Documentation

## Architecture Overview

SmartClock is a multi-tenant SaaS time tracking platform built with Next.js 15, featuring a sophisticated architecture that combines server actions and API routes for optimal performance and user experience.

### Core Architecture Principles

1. **Multi-Tenant Isolation** - Complete data separation between organizations
2. **Mixed Action Pattern** - Strategic use of server actions and API routes
3. **Real-Time Updates** - Live data synchronization with smart caching
4. **Type Safety** - 100% TypeScript with comprehensive type definitions
5. **Centralized Business Logic** - All operations organized in actions hub

## Technology Stack

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **Framework** | Next.js | 15.3.3 | Full-stack React framework with App Router |
| **Runtime** | React | 19 | UI library with concurrent features |
| **Database** | PostgreSQL | Latest | Primary data store |
| **ORM** | Prisma | 6.9+ | Type-safe database access |
| **Authentication** | NextAuth.js | 5.0+ | Session management and auth |
| **Styling** | Tailwind CSS | 3.4+ | Utility-first CSS framework |
| **UI Components** | shadcn/ui | Latest | Accessible component library |
| **TypeScript** | TypeScript | 5.0+ | Type safety and developer experience |
| **Deployment** | Vercel | Latest | Serverless deployment platform |

## Project Structure

```
smartclock/
├── actions/                    # Centralized server actions hub (1,500+ lines)
│   ├── auth.ts                # Authentication & session management (110 lines)
│   ├── clock.ts               # Time tracking & GPS validation (456 lines)
│   ├── team.ts                # Team management & analytics (361 lines)
│   ├── locations.ts           # Location & geofencing (280 lines)
│   ├── organizations.ts       # Multi-tenant operations (331 lines)
│   ├── index.ts               # Unified exports (75 lines)
│   └── README.md              # Actions documentation (230 lines)
├── app/
│   ├── api/                   # API routes for client-side operations
│   │   ├── auth/              # NextAuth.js configuration
│   │   ├── clock/             # Time tracking endpoints
│   │   └── locations/         # Location services
│   ├── components/            # Reusable UI components
│   │   ├── clock-in-out.tsx   # Main time tracking interface
│   │   ├── recent-activity.tsx # Live activity feed
│   │   ├── dashboard-client.tsx # Client-side dashboard coordinator
│   │   └── ...
│   ├── manager/               # Manager dashboard
│   │   └── page.tsx           # Team management interface
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout with providers
│   └── page.tsx               # Employee dashboard
├── docs/                      # Comprehensive documentation (2,674+ lines)
│   ├── TECHNICAL.md           # Architecture & implementation (342 lines)
│   ├── API.md                 # Complete API reference (485 lines)
│   ├── USER_GUIDE.md          # End-user documentation (249 lines)
│   ├── TESTING_GUIDE.md       # Testing strategies (393 lines)
│   ├── FEATURES_ROADMAP.md    # Development roadmap (215 lines)
│   └── lessons.md             # Development lessons (259 lines)
├── lib/                       # Utilities and configurations
│   ├── auth.ts                # NextAuth configuration
│   ├── prisma.ts              # Database client
│   └── utils.ts               # Utility functions
├── prisma/                    # Database schema and migrations
│   ├── schema.prisma          # Database schema (215 lines)
│   └── seed.ts                # Database seeding
├── types/                     # TypeScript type definitions
│   └── index.ts               # Comprehensive types (278 lines)
└── README.md                  # Project overview (223 lines)
```

## Centralized Actions Hub

### Architecture Pattern

All business logic is centralized in the `actions/` folder, providing a single source of truth for all operations:

```typescript
// actions/index.ts - Unified exports
export * from './auth'
export * from './clock'
export * from './team'
export * from './locations'
export * from './organizations'
```

### Key Benefits

1. **Consistency** - All operations follow the same patterns
2. **Maintainability** - Business logic is centralized and organized
3. **Type Safety** - Shared types and interfaces
4. **Reusability** - Actions can be used across different components
5. **Testing** - Easier to test business logic in isolation

### Action Structure

Each action file follows a consistent pattern:

```typescript
// actions/clock.ts
'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

async function requireAuth() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error("Authentication required")
  }
  return session.user
}

export async function clockIn(data: ClockInData) {
  try {
    const user = await requireAuth()
    
    // Business logic with organization isolation
    const clockEvent = await prisma.clockEvent.create({
      data: {
        organizationId: user.organizationId, // Critical for multi-tenancy
        userId: user.id,
        type: 'CLOCK_IN',
        // ... other fields
      }
    })
    
    // Strategic cache invalidation
    revalidatePath('/manager') // Only invalidate manager dashboard
    
    return { success: true, data: clockEvent }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
```

## Mixed Architecture Pattern

### Server Actions vs API Routes

SmartClock uses a strategic combination of server actions and API routes:

#### Server Actions (Preferred for Mutations)
- **Purpose**: Data mutations with cache invalidation
- **Benefits**: Direct database access, automatic revalidation, type safety
- **Use Cases**: Clock in/out, user management, organization operations

```typescript
// Server action with revalidation
export async function clockIn(data: ClockInData) {
  // ... mutation logic
  revalidatePath('/manager') // Cache invalidation
  return { success: true, data }
}
```

#### API Routes (For Client-Side Operations)
- **Purpose**: Client-side data fetching, real-time updates
- **Benefits**: Standard HTTP interface, easier client-side integration
- **Use Cases**: Status polling, location services, real-time updates

```typescript
// API route for client-side fetching
export async function GET() {
  const result = await getCurrentStatus()
  return NextResponse.json(result)
}
```

### Component Communication Pattern

```typescript
// Parent component coordinates updates
const DashboardClient = () => {
  const recentActivityRef = useRef<{ refresh: () => void }>(null)
  
  const handleClockAction = () => {
    // Refresh related components
    recentActivityRef.current?.refresh()
  }
  
  return (
    <>
      <ClockInOut onClockAction={handleClockAction} />
      <RecentActivity ref={recentActivityRef} />
    </>
  )
}
```

## Database Schema

### Multi-Tenant Design

The database is designed with organization-level isolation:

```prisma
model Organization {
  id                String        @id @default(cuid())
  name              String
  slug              String        @unique
  planType          PlanType      @default(BASIC)
  billingStatus     BillingStatus @default(TRIAL)
  
  // Relations
  users       User[]
  locations   Location[]
  clockEvents ClockEvent[]
  timesheets  Timesheet[]
}

model User {
  id             String   @id @default(cuid())
  organizationId String   // Critical for multi-tenancy
  email          String   @unique
  role           UserRole @default(EMPLOYEE)
  
  // Relations
  organization Organization @relation(fields: [organizationId], references: [id])
  clockEvents  ClockEvent[]
}

model ClockEvent {
  id             String      @id @default(cuid())
  organizationId String      // Ensures data isolation
  userId         String
  type           ClockType
  timestamp      DateTime    @default(now())
  method         ClockMethod @default(MANUAL)
  latitude       Float?
  longitude      Float?
  locationId     String?
  
  // Relations with organization isolation
  organization Organization @relation(fields: [organizationId], references: [id])
  user         User         @relation(fields: [userId], references: [id])
  location     Location?    @relation(fields: [locationId], references: [id])
}
```

### Key Design Principles

1. **Organization Isolation** - Every table includes `organizationId`
2. **Audit Trail** - All events are logged with timestamps
3. **Flexible Relationships** - Support for multiple locations per organization
4. **Type Safety** - Enums for consistent data types

## Authentication & Authorization

### NextAuth.js Configuration

```typescript
// lib/auth.ts
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        // Custom authentication logic
        const user = await validateUser(credentials)
        return user ? {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          organizationId: user.organizationId,
          organizationName: user.organization.name,
          // ... other organization data
        } : null
      }
    })
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        // Store organization data in JWT
        token.role = user.role
        token.organizationId = user.organizationId
        token.organizationName = user.organizationName
        // ... other fields
      }
      return token
    },
    session: async ({ session, token }) => {
      if (session.user && token) {
        // Add organization context to session
        session.user.id = token.sub!
        session.user.role = token.role as UserRole
        session.user.organizationId = token.organizationId as string
        // ... other fields
      }
      return session
    }
  }
}
```

### Role-Based Access Control

```typescript
// Middleware for role-based access
export function requireRole(allowedRoles: UserRole[]) {
  return async (req: Request) => {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      throw new Error("Authentication required")
    }
    
    if (!allowedRoles.includes(session.user.role)) {
      throw new Error("Insufficient permissions")
    }
    
    return session.user
  }
}
```

## GPS & Location Services

### Location Validation Algorithm

```typescript
async function validateUserLocation(
  organizationId: string,
  userLatitude: number,
  userLongitude: number
): Promise<LocationValidationResult> {
  // Get organization locations
  const locations = await prisma.location.findMany({
    where: { organizationId, isActive: true }
  })
  
  // Find closest location
  let closestLocation = null
  let minDistance = Infinity
  
  for (const location of locations) {
    const distance = calculateDistance(
      userLatitude, userLongitude,
      location.latitude, location.longitude
    )
    
    if (distance < minDistance) {
      minDistance = distance
      closestLocation = location
    }
  }
  
  // Validate within radius
  const isValid = minDistance <= (closestLocation?.radius || 10)
  
  return {
    isValid,
    distance: Math.round(minDistance),
    locationName: closestLocation?.name,
    error: isValid ? undefined : `You are ${Math.round(minDistance)}m away. Must be within ${closestLocation?.radius}m.`
  }
}
```

### Distance Calculation (Haversine Formula)

```typescript
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lng2 - lng1) * Math.PI) / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distance in meters
}
```

## Real-Time Features

### Smart Refresh Strategy

```typescript
// Real-time clock updates with optimization
useEffect(() => {
  const timer = setInterval(() => {
    setCurrentTime(new Date())
    
    // Only refresh data on minute boundaries when clocked in
    if (clockStatus?.success && 
        (clockStatus.currentStatus === "CLOCKED_IN" || clockStatus.currentStatus === "ON_BREAK") &&
        new Date().getSeconds() === 0) {
      loadClockStatus()
    }
  }, 1000)
  
  return () => clearInterval(timer) // Prevent memory leaks
}, [clockStatus])
```

### Component Synchronization

```typescript
// Ref-based component communication
const RecentActivity = forwardRef<{ refresh: () => void }>((props, ref) => {
  const loadRecentActivity = async () => {
    const result = await getTodaysClockEvents()
    if (result.success) {
      setActivities(result.clockEvents.slice(-5).reverse())
    }
  }
  
  useImperativeHandle(ref, () => ({
    refresh: loadRecentActivity
  }))
  
  // ... component logic
})
```

## Time Calculation Engine

### Work Hours Calculation

```typescript
async function calculateTodaysHours(userId: string, organizationId: string): Promise<number> {
  const startOfDay = new Date(new Date().toISOString().split("T")[0] + "T00:00:00.000Z")
  const endOfDay = new Date(new Date().toISOString().split("T")[0] + "T23:59:59.999Z")

  const events = await prisma.clockEvent.findMany({
    where: {
      userId,
      organizationId, // Organization isolation
      timestamp: { gte: startOfDay, lte: endOfDay }
    },
    orderBy: { timestamp: "asc" }
  })

  let totalMinutes = 0
  let clockInTime: Date | null = null
  let breakStartTime: Date | null = null

  // Process events chronologically
  for (const event of events) {
    switch (event.type) {
      case "CLOCK_IN":
        clockInTime = event.timestamp
        break
      case "CLOCK_OUT":
        if (clockInTime) {
          totalMinutes += (event.timestamp.getTime() - clockInTime.getTime()) / (1000 * 60)
          clockInTime = null
        }
        break
      case "BREAK_START":
        breakStartTime = event.timestamp
        break
      case "BREAK_END":
        if (breakStartTime && clockInTime) {
          const breakMinutes = (event.timestamp.getTime() - breakStartTime.getTime()) / (1000 * 60)
          totalMinutes -= breakMinutes
          breakStartTime = null
        }
        break
    }
  }

  // Handle ongoing sessions
  if (clockInTime) {
    const now = new Date()
    totalMinutes += (now.getTime() - clockInTime.getTime()) / (1000 * 60)
    
    // Subtract ongoing break time
    if (breakStartTime) {
      const breakMinutes = (now.getTime() - breakStartTime.getTime()) / (1000 * 60)
      totalMinutes -= breakMinutes
    }
  }

  return Math.max(0, totalMinutes / 60) // Return hours
}
```

## Type Safety Implementation

### Comprehensive Type Definitions

```typescript
// types/index.ts - 278 lines of type definitions

// Authentication & User Types
export interface SessionUser extends AuthUser {
  image?: string | null
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

// Clock & Time Tracking Types
export interface ClockAction {
  method: 'MANUAL' | 'QR_CODE' | 'GEOFENCE'
  latitude?: number
  longitude?: number
  locationId?: string
  notes?: string
}

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

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// NextAuth Type Extensions
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
}
```

## Performance Optimizations

### Cache Management Strategy

1. **Strategic revalidatePath Usage**
   ```typescript
   // Only invalidate manager dashboard for team updates
   revalidatePath('/manager') // Affects managers only
   
   // Use client-side refresh for individual users
   onClockAction?.() // Callback-based updates
   ```

2. **Smart Data Fetching**
   ```typescript
   // Fetch only necessary date ranges
   const startOfDay = new Date(targetDate + "T00:00:00.000Z")
   const endOfDay = new Date(targetDate + "T23:59:59.999Z")
   
   const events = await prisma.clockEvent.findMany({
     where: {
       userId,
       organizationId,
       timestamp: { gte: startOfDay, lte: endOfDay }
     }
   })
   ```

3. **Component Optimization**
   ```typescript
   // Memoized calculations
   const formatHours = useCallback((hours: number) => {
     const h = Math.floor(hours)
     const m = Math.floor((hours - h) * 60)
     return `${h}h ${m}m`
   }, [])
   ```

## Security Considerations

### Multi-Tenant Data Isolation

Every database query includes organization filtering:

```typescript
// Always include organizationId in queries
const clockEvents = await prisma.clockEvent.findMany({
  where: {
    userId: user.id,
    organizationId: user.organizationId, // Critical for security
    timestamp: { gte: startOfDay, lte: endOfDay }
  }
})
```

### Input Validation

```typescript
// Server-side validation for all inputs
export async function clockIn(data: ClockInData) {
  // Validate required fields
  if (!data.method) {
    return { success: false, error: "Method is required" }
  }
  
  // Validate GPS coordinates if provided
  if (data.latitude && (data.latitude < -90 || data.latitude > 90)) {
    return { success: false, error: "Invalid latitude" }
  }
  
  // ... rest of validation
}
```

### Location Data Privacy

```typescript
// Only store necessary location precision
const clockEvent = await prisma.clockEvent.create({
  data: {
    latitude: data.latitude ? Math.round(data.latitude * 1000000) / 1000000 : null, // 6 decimal places
    longitude: data.longitude ? Math.round(data.longitude * 1000000) / 1000000 : null,
    // ... other fields
  }
})
```

## Deployment Architecture

### Vercel Configuration

```json
// package.json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate"
  }
}
```

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://your-domain.com"

# Optional: External Services
RESEND_API_KEY="your-resend-key"
STRIPE_SECRET_KEY="your-stripe-key"
```

### Build Optimization

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client']
  }
}

module.exports = nextConfig
```

This technical documentation provides a comprehensive overview of the SmartClock architecture, implementation details, and best practices. The system is designed for scalability, maintainability, and security in a multi-tenant SaaS environment. 