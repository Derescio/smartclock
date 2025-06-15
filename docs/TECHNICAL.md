# SmartClock - Technical Documentation

## 🏗️ Architecture Overview

### Multi-Tenant SaaS Platform
SmartClock is built as a **multi-tenant SaaS platform** with complete data isolation between organizations. Each organization operates independently with their own users, locations, and time tracking data.

### Tech Stack
- **Frontend**: Next.js 15 (App Router) + React 19
- **Styling**: Tailwind CSS v3 + shadcn/ui components
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Neon) + Prisma ORM
- **Authentication**: NextAuth.js with JWT + Organization Context
- **Deployment**: Vercel Ready

### Project Structure
```
smartclock/
├── app/                    # Next.js App Router
│   ├── api/               # API endpoints
│   │   ├── auth/          # Authentication (register, join, signin)
│   │   ├── clock/         # Time tracking endpoints
│   │   ├── locations/     # Location management & verification
│   │   ├── organizations/ # Organization lookup
│   │   └── setup/         # Demo data initialization
│   ├── auth/              # Authentication pages
│   ├── components/        # React components
│   ├── test-location/     # GPS testing tool
│   └── page.tsx           # Main dashboard
├── components/ui/         # shadcn/ui components
├── lib/                   # Utilities and configurations
├── prisma/               # Database schema and migrations
├── docs/                 # Documentation
└── types/                # TypeScript definitions
```

## 🗄️ Multi-Tenant Database Schema

### Core Models

#### Organizations (Tenants)
- **Purpose**: Root tenant entity with billing and plan information
- **Key Fields**: name, slug, planType, employeeLimit, billingStatus, trialEndsAt
- **Plans**: BASIC (50 employees), PROFESSIONAL (100), ENTERPRISE (unlimited)
- **Billing**: TRIAL (14 days), ACTIVE, PAST_DUE, CANCELED, SUSPENDED

#### Users (Organization-Scoped)
- **Purpose**: Employees, managers, and admins within organizations
- **Key Fields**: organizationId, email, role, locationId, isActive
- **Roles**: EMPLOYEE, MANAGER, ADMIN, SUPER_ADMIN
- **Uniqueness**: Email unique within organization (not globally)

#### Locations (GPS Geofencing)
- **Purpose**: Physical work locations with 10m precision geofencing
- **Key Fields**: organizationId, name, address, latitude, longitude, radius (10m)
- **Features**: QR code generation, distance calculation, in-range validation

#### ClockEvents (Time Tracking)
- **Purpose**: Individual clock in/out/break events with GPS validation
- **Key Fields**: organizationId, userId, type, timestamp, method, coordinates, locationId
- **Types**: CLOCK_IN, CLOCK_OUT, BREAK_START, BREAK_END
- **Methods**: MANUAL, QR_CODE, GEOFENCE
- **Validation**: State transitions, location verification

#### Timesheets (Payroll Integration)
- **Purpose**: Weekly/monthly time summaries for payroll
- **Key Fields**: organizationId, userId, date range, hours breakdown, status
- **Status**: PENDING, APPROVED, REJECTED, DRAFT
- **Calculations**: Regular hours, overtime, break time deduction

### Data Isolation Strategy
- All models include `organizationId` foreign key
- Cascade deletes ensure data integrity
- API endpoints filter by organization context
- No cross-organization data access possible

## 🔌 API Design

### Authentication Endpoints
- `POST /api/auth/register-organization` - Create new organization (3-step wizard)
- `POST /api/auth/join-organization` - Join existing organization
- `GET /api/organizations/lookup` - Find organization by slug
- `POST /api/auth/callback/credentials` - User login with organization context
- `GET /api/auth/session` - Get current session with organization data

### Time Tracking Endpoints
- `POST /api/clock` - Clock in/out with GPS validation and state management
- `GET /api/clock` - Get current status, today's events, and calculated hours
- `GET /api/locations` - Get organization locations with distance calculations
- `POST /api/locations/verify` - Test GPS coordinates against geofences
- `POST /api/locations` - Create new location (Admin/Manager only)

### Setup & Demo
- `POST /api/setup` - Create demo organizations with sample data

### Response Format
```typescript
// Success Response
{
  success: true,
  data: any,
  message?: string,
  locationValidation?: {
    distance: number,
    locationName: string
  }
}

// Error Response
{
  success: false,
  error: string,
  details?: any
}
```

## 🔐 Multi-Tenant Authentication

### Organization Context in Sessions
```typescript
// JWT Token includes:
{
  sub: userId,
  role: "EMPLOYEE" | "MANAGER" | "ADMIN",
  organizationId: string,
  organizationName: string,
  organizationSlug: string,
  planType: "BASIC" | "PROFESSIONAL" | "ENTERPRISE",
  billingStatus: "TRIAL" | "ACTIVE" | "PAST_DUE"
}
```

### Role-Based Access Control
- **Employee**: Clock in/out, view own data, break management
- **Manager**: All employee permissions + team oversight, location management
- **Admin**: All permissions + user management, organization settings
- **Super Admin**: Platform administration (future)

### Security Features
- Organization-scoped data access
- Server-side GPS validation
- State transition validation
- Input sanitization and validation
- Audit trails for all operations

## 🗺️ GPS Geofencing Implementation

### Location Validation Algorithm
```typescript
// 10m precision geofencing
function validateUserLocation(
  organizationId: string,
  userLat: number,
  userLng: number,
  requestedLocationId?: string
): Promise<ValidationResult>

// Haversine distance calculation
function calculateDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number // meters
```

### Geofencing Features
- **10m Radius**: Extremely precise location validation
- **Distance Calculation**: Real-time distance to all work locations
- **In-Range Detection**: Automatic location selection
- **Error Messages**: Detailed feedback with exact distances
- **Testing Tool**: `/test-location` for GPS debugging

## 🚀 Real-Time Features

### Clock Status Management
- Real-time status updates (CLOCKED_OUT → CLOCKED_IN → ON_BREAK)
- State transition validation
- Automatic time calculations with break deduction
- Live dashboard updates every second when clocked in

### Time Calculations
```typescript
// Automatic calculations include:
- Total work time (excluding breaks)
- Break time tracking
- Overtime detection (>8 hours)
- Real-time hour updates
- Precise minute-level accuracy
```

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database (Neon recommended)
- Git

### Environment Variables
```env
DATABASE_URL="postgresql://user:pass@host:5432/smartclock"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

### Installation & Setup
```bash
# Clone and install
git clone <repository>
cd smartclock
npm install

# Database setup
npx prisma db push
npx prisma generate

# Create demo data
curl -X POST http://localhost:3000/api/setup

# Start development
npm run dev
```

### Database Migrations
```bash
# Create migration
npx prisma migrate dev --name description

# Apply migrations
npx prisma migrate deploy

# Reset database (development)
npx prisma migrate reset
```

## 📱 Mobile-First Design

### Responsive Strategy
- **Mobile First**: < 768px (primary target)
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile Optimizations
- Touch-friendly buttons (min 44px)
- GPS permission handling
- Real-time location tracking
- Offline-capable design (future)
- Progressive Web App features (planned)

## 🧪 Testing & Debugging

### GPS Testing Tool
- **URL**: `/test-location`
- **Features**: Real-time GPS validation, distance calculations, geofence testing
- **Test Coordinates**: Provided in testing guide

### Demo Data
- 3 organizations with different plans
- Multiple users per organization
- Sample locations with 10m geofences
- Pre-configured clock events

### Testing Strategy
- Unit tests for business logic
- Integration tests for API endpoints
- GPS accuracy testing
- Multi-tenant isolation verification

## 🚀 Deployment

### Vercel Deployment
1. Connect GitHub repository
2. Configure environment variables
3. Deploy automatically on push
4. Run setup endpoint for demo data

### Database Hosting
- **Neon**: PostgreSQL with automatic scaling (recommended)
- **Supabase**: Alternative with built-in features
- **Railway**: Simple PostgreSQL hosting

### Production Checklist
- [ ] Set production environment variables
- [ ] Configure custom domain
- [ ] Run database migrations
- [ ] Initialize demo data
- [ ] Test GPS functionality
- [ ] Verify multi-tenant isolation

## 🔍 Monitoring & Performance

### Key Metrics
- Clock-in success rate
- GPS accuracy and validation time
- API response times
- Database query performance
- Multi-tenant data isolation

### Logging Strategy
- Clock events with GPS coordinates
- Authentication attempts
- API errors and validation failures
- Performance metrics

## 🔒 Security Considerations

### Multi-Tenant Security
- Complete data isolation by organization
- No cross-tenant data access
- Organization context validation on all operations

### GPS Security
- Server-side location validation
- 10m precision prevents spoofing
- Location data encrypted in transit
- Minimal GPS data retention

### Authentication Security
- JWT tokens with organization context
- Role-based access control
- Session management with NextAuth.js
- Password hashing with bcrypt

---

## 📋 Future Enhancements

### Phase 3: Management Features
- Manager dashboard with team oversight
- Timesheet approval workflows
- Advanced reporting and analytics
- Employee management tools

### Phase 4: Enterprise Features
- Stripe billing integration
- API access for integrations
- Custom branding and white-labeling
- Advanced compliance reporting

### Technical Improvements
- Offline capability with service workers
- Real-time notifications
- Advanced caching strategies
- Performance optimizations 