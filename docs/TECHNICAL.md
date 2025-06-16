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
├── actions/                    # Centralized server actions hub (2,000+ lines)
│   ├── auth.ts                # Authentication & session management (110 lines)
│   ├── clock.ts               # Time tracking & GPS validation (456 lines)
│   ├── team.ts                # Team management & analytics (361 lines)
│   ├── schedules.ts           # Schedule management system (652 lines)
│   ├── timesheets.ts          # Timesheet generation & management (379 lines)
│   ├── teams.ts               # Team creation & collaboration (250 lines)
│   ├── employees.ts           # Employee CRUD operations (200+ lines)
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
│   ├── timesheets/            # Employee timesheet management
│   │   ├── components/        # Timesheet UI components
│   │   │   └── timesheet-client.tsx # Full timesheet management interface
│   │   └── page.tsx           # Timesheet main page
│   ├── manager/               # Manager dashboard
│   │   ├── employees/         # Employee management system
│   │   ├── departments/       # Department management system
│   │   ├── schedules/         # Schedule management system
│   │   │   ├── create/        # Schedule creation wizard
│   │   │   ├── [id]/edit/     # Schedule editing interface
│   │   │   └── components/    # Schedule management components
│   │   ├── teams/             # Team management system
│   │   │   ├── create/        # Team creation interface
│   │   │   └── components/    # Team management components
│   │   └── page.tsx           # Team management interface
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout with providers
│   └── page.tsx               # Employee dashboard
├── docs/                      # Comprehensive documentation (2,674+ lines)
│   ├── TECHNICAL.md           # Architecture & implementation (689 lines)
│   ├── API.md                 # Complete API reference (485 lines)
│   ├── USER_GUIDE.md          # End-user documentation (249 lines)
│   ├── TESTING_GUIDE.md       # Testing strategies (572 lines)
│   ├── FEATURES_ROADMAP.md    # Development roadmap (280 lines)
│   └── lessons.md             # Development lessons (259 lines)
├── lib/                       # Utilities and configurations
│   ├── auth.ts                # NextAuth configuration
│   ├── prisma.ts              # Database client
│   └── utils.ts               # Utility functions
├── prisma/                    # Database schema and migrations
│   ├── schema.prisma          # Database schema (215 lines)
│   └── seed.ts                # Database seeding
├── types/                     # TypeScript type definitions
│   ├── index.ts               # Comprehensive types (278 lines)
│   └── teams.ts               # Team-related type definitions
└── README.md                  # Project overview (360 lines)
```

## Centralized Actions Hub

### Architecture Pattern

All business logic is centralized in the `actions/` folder, providing a single source of truth for all operations:

```typescript
// actions/index.ts - Unified exports
export * from './auth'
export * from './clock'
export * from './team'
export * from './schedules'
export * from './timesheets'
export * from './teams'
export * from './employees'
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

## Advanced Feature Architecture

### Schedule Management System

The schedule management system provides comprehensive scheduling capabilities:

```typescript
// actions/schedules.ts - Core scheduling functions
export async function getTodaysSchedule() {
  // Fetches schedules for current user including:
  // - Direct user assignments
  // - Department-wide assignments
  // - Location-based assignments
  // - Team assignments (via TeamMember relationships)
  // - Recurring schedule support with day-of-week filtering
}

export async function createSchedule(data: ScheduleData) {
  // 4-step wizard creation with:
  // - Multiple assignment types
  // - Recurring patterns
  // - Approval workflow
  // - Smart validation
}
```

### Timesheet System

Automated timesheet generation from clock events:

```typescript
// actions/timesheets.ts - Timesheet management
export async function generateTimesheetFromClockEvents(
  userId: string, 
  startDate: Date, 
  endDate: Date
) {
  // Advanced calculations:
  // - Total hours worked per day/week
  // - Regular hours (≤8 hours per day)
  // - Overtime hours (>8 hours per day)
  // - Break time tracking and deduction
  // - Clock in/out time tracking
}

export async function getWeeklyTimesheet(userId: string, weekStart: Date) {
  // Detailed weekly breakdown with:
  // - Daily hours breakdown
  // - Clock in/out times
  // - Break duration
  // - Status tracking
}
```

### Team Management & Collaboration

Team-based scheduling and management:

```typescript
// actions/teams.ts - Team collaboration
export async function createTeam(data: TeamData) {
  // Team creation with:
  // - Managers and members
  // - Custom colors
  // - Bulk assignment capabilities
}

export async function assignScheduleToTeam(scheduleId: string, teamId: string) {
  // Bulk schedule assignment:
  // - Assign to entire teams
  // - Automatic member inclusion
  // - Efficient management
}
```

## Database Schema

### Multi-Tenant Design

Every table includes `organizationId` for complete data isolation:

```sql
-- Core tables with organization isolation
CREATE TABLE Organization (
  id VARCHAR(30) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  subdomain VARCHAR(50) UNIQUE, -- For Phase 8
  plan SubscriptionPlan DEFAULT 'BASIC',
  trialEndsAt TIMESTAMP,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE User (
  id VARCHAR(30) PRIMARY KEY,
  organizationId VARCHAR(30) REFERENCES Organization(id),
  email VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(100),
  role UserRole DEFAULT 'EMPLOYEE',
  departmentId VARCHAR(30) REFERENCES Department(id),
  locationId VARCHAR(30) REFERENCES Location(id),
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Schedule management tables
CREATE TABLE Schedule (
  id VARCHAR(30) PRIMARY KEY,
  organizationId VARCHAR(30) REFERENCES Organization(id),
  title VARCHAR(200) NOT NULL,
  scheduleType ScheduleType NOT NULL,
  startDate DATE NOT NULL,
  endDate DATE,
  startTime TIME NOT NULL,
  endTime TIME NOT NULL,
  isRecurring BOOLEAN DEFAULT false,
  recurrence RecurrenceType,
  recurrenceDays TEXT, -- JSON array
  userId VARCHAR(30) REFERENCES User(id),
  departmentId VARCHAR(30) REFERENCES Department(id),
  locationId VARCHAR(30) REFERENCES Location(id),
  teamId VARCHAR(30) REFERENCES Team(id),
  status ScheduleStatus DEFAULT 'PENDING',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Timesheet management
CREATE TABLE Timesheet (
  id VARCHAR(30) PRIMARY KEY,
  organizationId VARCHAR(30) REFERENCES Organization(id),
  userId VARCHAR(30) REFERENCES User(id),
  startDate DATE NOT NULL,
  endDate DATE NOT NULL,
  totalHours DECIMAL(5,2) DEFAULT 0,
  regularHours DECIMAL(5,2) DEFAULT 0,
  overtimeHours DECIMAL(5,2) DEFAULT 0,
  breakHours DECIMAL(5,2) DEFAULT 0,
  status TimesheetStatus DEFAULT 'DRAFT',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team collaboration
CREATE TABLE Team (
  id VARCHAR(30) PRIMARY KEY,
  organizationId VARCHAR(30) REFERENCES Organization(id),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6',
  managerId VARCHAR(30) REFERENCES User(id),
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE TeamMember (
  id VARCHAR(30) PRIMARY KEY,
  teamId VARCHAR(30) REFERENCES Team(id),
  userId VARCHAR(30) REFERENCES User(id),
  role TeamRole DEFAULT 'MEMBER',
  joinedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(teamId, userId)
);
```

### Advanced Relationships

The schema supports complex relationships for flexible scheduling:

```sql
-- Schedule assignment flexibility
-- A schedule can be assigned to:
-- 1. Individual user (userId)
-- 2. Entire department (departmentId)
-- 3. Specific location (locationId)
-- 4. Team (teamId)

-- Query example: Get all schedules for a user
SELECT s.* FROM Schedule s
WHERE s.organizationId = ? AND s.isActive = true
AND (
  s.userId = ? OR                    -- Direct assignment
  s.departmentId = ? OR              -- Department assignment
  s.locationId = ? OR                -- Location assignment
  s.teamId IN (                      -- Team assignment
    SELECT tm.teamId FROM TeamMember tm 
    WHERE tm.userId = ?
  )
)
```

## Performance Optimizations

### Database Query Optimization

```typescript
// Efficient queries with strategic includes
const schedules = await prisma.schedule.findMany({
  where: {
    organizationId: user.organizationId,
    isActive: true,
    // Complex OR conditions for assignment types
  },
  include: {
    location: { select: { id: true, name: true, address: true } },
    department: { select: { id: true, name: true, color: true } },
    Team: { select: { id: true, name: true, color: true } }
  },
  orderBy: { startTime: 'asc' }
})
```

### Cache Management Strategy

```typescript
// Strategic cache invalidation
export async function clockIn(data: ClockInData) {
  // ... business logic
  
  // Only invalidate relevant paths
  revalidatePath('/manager') // Manager dashboard
  // Don't invalidate employee dashboard - uses API routes
  
  return result
}
```

### Real-Time Updates

```typescript
// Component-level real-time updates
const RecentActivity = forwardRef<{ refresh: () => void }>((props, ref) => {
  const [activities, setActivities] = useState([])
  
  const refresh = useCallback(async () => {
    const response = await fetch('/api/clock')
    const data = await response.json()
    setActivities(data.recentActivity)
  }, [])
  
  useImperativeHandle(ref, () => ({ refresh }))
  
  return <ActivityList activities={activities} />
})
```

## Type Safety Implementation

### Comprehensive Type Definitions

```typescript
// types/index.ts - Core types
export interface User {
  id: string
  organizationId: string
  email: string
  name: string | null
  role: UserRole
  departmentId: string | null
  locationId: string | null
  isActive: boolean
  createdAt: Date
}

export interface Schedule {
  id: string
  organizationId: string
  title: string
  scheduleType: ScheduleType
  startDate: Date
  endDate: Date | null
  startTime: string
  endTime: string
  isRecurring: boolean
  recurrence: RecurrenceType | null
  recurrenceDays: string | null
  userId: string | null
  departmentId: string | null
  locationId: string | null
  teamId: string | null
  status: ScheduleStatus
}

// types/teams.ts - Team-specific types
export interface Team {
  id: string
  organizationId: string
  name: string
  description: string | null
  color: string
  managerId: string | null
  isActive: boolean
  createdAt: Date
  manager?: User
  members?: TeamMember[]
}
```

### Extended NextAuth Types

```typescript
// types/next-auth.d.ts
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: UserRole
      organizationId: string
      organizationName: string
      departmentId?: string
      locationId?: string
    }
  }
}
```

## Security Implementation

### Multi-Tenant Data Isolation

```typescript
// Every action includes organization filtering
export async function requireRole(allowedRoles: UserRole[]) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    throw new Error("Authentication required")
  }
  
  if (!allowedRoles.includes(session.user.role)) {
    throw new Error("Insufficient permissions")
  }
  
  return session.user // Includes organizationId
}

// All database queries include organization filter
const result = await prisma.clockEvent.findMany({
  where: {
    organizationId: user.organizationId, // Critical for isolation
    // ... other conditions
  }
})
```

### Input Validation

```typescript
// Server-side validation for all inputs
export async function createSchedule(data: ScheduleData) {
  // Validate input data
  if (!data.title || data.title.length < 3) {
    return { success: false, error: "Title must be at least 3 characters" }
  }
  
  if (!data.startTime || !data.endTime) {
    return { success: false, error: "Start and end times are required" }
  }
  
  // Additional business logic validation
  const user = await requireRole(['MANAGER', 'ADMIN'])
  
  // ... create schedule
}
```

## Deployment Architecture

### Vercel Deployment

```yaml
# vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### Environment Configuration

```bash
# Production environment variables
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://clockwizard.vercel.app"

# Development environment variables
DATABASE_URL="postgresql://localhost:5432/smartclock_dev"
NEXTAUTH_SECRET="dev-secret"
NEXTAUTH_URL="http://localhost:3000"
```

## Monitoring & Observability

### Error Handling

```typescript
// Consistent error handling pattern
export async function clockIn(data: ClockInData) {
  try {
    // Business logic
    return { success: true, data: result }
  } catch (error) {
    console.error('Clock in error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
```

### Performance Monitoring

```typescript
// Performance tracking for critical operations
export async function generateTimesheetFromClockEvents(
  userId: string, 
  startDate: Date, 
  endDate: Date
) {
  const startTime = Date.now()
  
  try {
    // Complex timesheet generation logic
    const result = await processClockEvents(userId, startDate, endDate)
    
    const duration = Date.now() - startTime
    console.log(`Timesheet generation took ${duration}ms`)
    
    return { success: true, data: result }
  } catch (error) {
    console.error('Timesheet generation error:', error)
    return { success: false, error: error.message }
  }
}
```

## Future Architecture Considerations

### Phase 8: SaaS Commercialization

```typescript
// Subdomain routing middleware
export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host')
  const subdomain = hostname?.split('.')[0]
  
  if (subdomain && subdomain !== 'www') {
    // Route to organization-specific pages
    return NextResponse.rewrite(
      new URL(`/org/${subdomain}${request.nextUrl.pathname}`, request.url)
    )
  }
  
  return NextResponse.next()
}

// Payment integration structure
export async function createSubscription(
  organizationId: string, 
  priceId: string
) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  
  // Create customer and subscription
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    trial_period_days: 14
  })
  
  // Update organization with subscription info
  await prisma.organization.update({
    where: { id: organizationId },
    data: {
      stripeSubscriptionId: subscription.id,
      plan: getPlanFromPriceId(priceId)
    }
  })
}
```

This technical architecture provides a solid foundation for scaling SmartClock into a commercial SaaS platform with enterprise-grade features and performance. 