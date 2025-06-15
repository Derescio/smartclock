# SmartClock API Documentation

## Overview

SmartClock uses a **mixed architecture** combining server actions and API routes for optimal performance and developer experience:

- **Server Actions**: For data mutations with automatic cache invalidation
- **API Routes**: For client-side data fetching and real-time updates
- **Type Safety**: All endpoints are fully typed with TypeScript

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://clockwizard.vercel.app`

## Authentication

All API endpoints require authentication via NextAuth.js session cookies. The session includes organization context for multi-tenant isolation.

### Session Structure

```typescript
interface SessionUser {
  id: string
  email: string
  name: string
  role: UserRole
  organizationId: string
  organizationName: string
  organizationSlug: string
  planType: PlanType
  billingStatus: BillingStatus
}
```

## Server Actions

Server actions are the preferred method for data mutations as they provide automatic cache invalidation and type safety.

### Clock Actions

#### `clockIn(data: ClockInData)`

Clock in a user with optional GPS validation.

**Parameters:**
```typescript
interface ClockInData {
  method?: 'MANUAL' | 'QR_CODE' | 'GEOFENCE'
  latitude?: number
  longitude?: number
  locationId?: string
  notes?: string
}
```

**Response:**
```typescript
{
  success: boolean
  clockEvent?: ClockEvent
  currentStatus?: 'CLOCKED_IN'
  locationValidation?: {
    distance: number
    locationName: string
  }
  error?: string
}
```

**Example:**
```typescript
import { clockIn } from '@/actions'

const result = await clockIn({
  method: 'GEOFENCE',
  latitude: 40.7128,
  longitude: -74.0059
})

if (result.success) {
  console.log('Clocked in successfully')
} else {
  console.error(result.error)
}
```

#### `clockOut(data: ClockOutData)`

Clock out a user.

**Parameters:**
```typescript
interface ClockOutData {
  method?: 'MANUAL' | 'QR_CODE' | 'GEOFENCE'
  latitude?: number
  longitude?: number
  locationId?: string
  notes?: string
}
```

**Response:**
```typescript
{
  success: boolean
  clockEvent?: ClockEvent
  currentStatus?: 'CLOCKED_OUT'
  todaysHours?: number
  error?: string
}
```

#### `startBreak(data: BreakData)`

Start a break for the current user.

**Parameters:**
```typescript
interface BreakData {
  method?: 'MANUAL'
  notes?: string
}
```

**Response:**
```typescript
{
  success: boolean
  clockEvent?: ClockEvent
  currentStatus?: 'ON_BREAK'
  error?: string
}
```

#### `endBreak(data: BreakData)`

End the current break.

**Parameters:**
```typescript
interface BreakData {
  method?: 'MANUAL'
  notes?: string
}
```

**Response:**
```typescript
{
  success: boolean
  clockEvent?: ClockEvent
  currentStatus?: 'CLOCKED_IN'
  error?: string
}
```

#### `getCurrentStatus()`

Get the current clock status for the authenticated user.

**Response:**
```typescript
{
  success: boolean
  currentStatus: 'CLOCKED_IN' | 'CLOCKED_OUT' | 'ON_BREAK'
  todaysHours: number
  lastEvent?: ClockEvent
  error?: string
}
```

#### `getTodaysClockEvents(date?: string)`

Get all clock events for today (or specified date).

**Parameters:**
- `date` (optional): Date string in YYYY-MM-DD format

**Response:**
```typescript
{
  success: boolean
  clockEvents: ClockEvent[]
  error?: string
}
```

### Team Management Actions

#### `getTeamStatus()`

Get real-time status of all team members (Manager+ only).

**Response:**
```typescript
{
  success: boolean
  teamMembers: TeamMember[]
  teamStats: TeamStats
  error?: string
}
```

#### `getTeamActivity(date?: string)`

Get team activity for a specific date (Manager+ only).

**Response:**
```typescript
{
  success: boolean
  activities: TeamActivity[]
  error?: string
}
```

### Location Actions

#### `getOrganizationLocations()`

Get all locations for the current organization.

**Response:**
```typescript
{
  success: boolean
  locations: Location[]
  error?: string
}
```

#### `createLocation(data: LocationData)`

Create a new location (Admin only).

**Parameters:**
```typescript
interface LocationData {
  name: string
  address: string
  latitude: number
  longitude: number
  radius: number
  isActive: boolean
}
```

#### `updateLocation(id: string, data: Partial<LocationData>)`

Update an existing location (Admin only).

#### `deleteLocation(id: string)`

Delete a location (Admin only).

### Organization Actions

#### `getOrganizationStats()`

Get organization statistics (Admin only).

**Response:**
```typescript
{
  success: boolean
  stats: OrganizationStats
  error?: string
}
```

#### `updateOrganizationSettings(data: OrganizationSettings)`

Update organization settings (Admin only).

## API Routes

API routes are used for client-side data fetching and real-time updates.

### Clock API

#### `GET /api/clock`

Get current clock status for the authenticated user.

**Response:**
```json
{
  "success": true,
  "currentStatus": "CLOCKED_OUT",
  "todaysHours": 7.5,
  "lastEvent": {
    "id": "clk_123",
    "type": "CLOCK_OUT",
    "timestamp": "2024-01-15T17:00:00Z",
    "method": "GEOFENCE",
    "location": {
      "name": "Main Office"
    }
  }
}
```

#### `POST /api/clock`

Perform a clock action (in, out, break start/end).

**Request Body:**
```json
{
  "action": "CLOCK_IN",
  "method": "GEOFENCE",
  "latitude": 40.7128,
  "longitude": -74.0059,
  "locationId": "loc_123",
  "notes": "Starting work"
}
```

**Response:**
```json
{
  "success": true,
  "clockEvent": {
    "id": "clk_456",
    "type": "CLOCK_IN",
    "timestamp": "2024-01-15T09:00:00Z",
    "method": "GEOFENCE"
  },
  "currentStatus": "CLOCKED_IN",
  "locationValidation": {
    "distance": 5,
    "locationName": "Main Office"
  }
}
```

### Location API

#### `GET /api/locations`

Get organization locations with distance calculations.

**Query Parameters:**
- `latitude` (optional): User's latitude for distance calculation
- `longitude` (optional): User's longitude for distance calculation

**Response:**
```json
{
  "success": true,
  "locations": [
    {
      "id": "loc_123",
      "name": "Main Office",
      "address": "123 Business St",
      "latitude": 40.7128,
      "longitude": -74.0059,
      "radius": 10,
      "distance": 5,
      "inRange": true
    }
  ]
}
```

### Team API (Manager+ only)

#### `GET /api/team/status`

Get real-time team status.

**Response:**
```json
{
  "success": true,
  "teamMembers": [
    {
      "id": "user_123",
      "name": "John Doe",
      "email": "john@company.com",
      "role": "EMPLOYEE",
      "currentStatus": "CLOCKED_IN",
      "clockedInAt": "2024-01-15T09:00:00Z",
      "todayHours": 6.5,
      "location": {
        "id": "loc_123",
        "name": "Main Office"
      }
    }
  ],
  "teamStats": {
    "totalEmployees": 10,
    "currentlyWorking": 8,
    "onBreak": 1,
    "clockedOut": 1,
    "totalHoursToday": 52.5,
    "averageHoursPerEmployee": 5.25
  }
}
```

#### `GET /api/team/activity`

Get team activity for today or specified date.

**Query Parameters:**
- `date` (optional): Date in YYYY-MM-DD format

**Response:**
```json
{
  "success": true,
  "activities": [
    {
      "id": "activity_123",
      "userId": "user_123",
      "userName": "John Doe",
      "action": "CLOCK_IN",
      "timestamp": "2024-01-15T09:00:00Z",
      "location": "Main Office",
      "notes": "Starting work"
    }
  ]
}
```

## Authentication API

### `POST /api/auth/signin`

Sign in with credentials.

**Request Body:**
```json
{
  "email": "user@company.com",
  "password": "password123"
}
```

### `POST /api/auth/signout`

Sign out the current user.

### `GET /api/auth/session`

Get the current session information.

**Response:**
```json
{
  "user": {
    "id": "user_123",
    "email": "user@company.com",
    "name": "John Doe",
    "role": "EMPLOYEE",
    "organizationId": "org_123",
    "organizationName": "Acme Corp",
    "organizationSlug": "acme-corp",
    "planType": "PROFESSIONAL",
    "billingStatus": "ACTIVE"
  },
  "expires": "2024-02-15T12:00:00Z"
}
```

## Error Handling

All API endpoints follow a consistent error response format:

```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

### Common Error Codes

| HTTP Status | Error Type | Description |
|-------------|------------|-------------|
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Business logic conflict (e.g., already clocked in) |
| 500 | Internal Server Error | Server-side error |

### Clock-Specific Errors

```json
{
  "success": false,
  "error": "Cannot clock in from current status: CLOCKED_IN"
}
```

```json
{
  "success": false,
  "error": "You are 25m away from Main Office. You must be within 10m to clock in."
}
```

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Clock actions**: 10 requests per minute per user
- **Status checks**: 60 requests per minute per user
- **Location queries**: 30 requests per minute per user

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1642248000
```

## Webhooks (Planned)

Future webhook support for real-time integrations:

### Clock Events
- `clock.in` - User clocked in
- `clock.out` - User clocked out
- `break.start` - Break started
- `break.end` - Break ended

### Webhook Payload
```json
{
  "event": "clock.in",
  "timestamp": "2024-01-15T09:00:00Z",
  "organizationId": "org_123",
  "user": {
    "id": "user_123",
    "name": "John Doe",
    "email": "john@company.com"
  },
  "clockEvent": {
    "id": "clk_456",
    "type": "CLOCK_IN",
    "method": "GEOFENCE",
    "location": {
      "name": "Main Office"
    }
  }
}
```

## SDK Examples

### JavaScript/TypeScript

```typescript
// Using server actions (recommended)
import { clockIn, getCurrentStatus } from '@/actions'

// Clock in with GPS
const result = await clockIn({
  method: 'GEOFENCE',
  latitude: 40.7128,
  longitude: -74.0059
})

// Get current status
const status = await getCurrentStatus()
```

### Fetch API

```javascript
// Using API routes for client-side operations
const response = await fetch('/api/clock', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    action: 'CLOCK_IN',
    method: 'GEOFENCE',
    latitude: 40.7128,
    longitude: -74.0059
  })
})

const result = await response.json()
```

### React Hook Example

```typescript
// Custom hook for clock operations
function useClockActions() {
  const [loading, setLoading] = useState(false)
  
  const clockIn = async (method: ClockMethod, coordinates?: Coordinates) => {
    setLoading(true)
    try {
      const result = await clockInAction({
        method,
        latitude: coordinates?.latitude,
        longitude: coordinates?.longitude
      })
      
      if (result.success) {
        toast.success('Clocked in successfully')
        // Refresh UI components
        onClockAction?.()
      } else {
        toast.error(result.error)
      }
    } finally {
      setLoading(false)
    }
  }
  
  return { clockIn, loading }
}
```

## Testing

### Test Environment

- **Base URL**: `http://localhost:3000`
- **Test Organization**: Use the seeded demo data

### Example Test Scenarios

```typescript
// Test clock in with valid GPS
const result = await clockIn({
  method: 'GEOFENCE',
  latitude: 40.7128, // Within 10m of test location
  longitude: -74.0059
})

expect(result.success).toBe(true)
expect(result.currentStatus).toBe('CLOCKED_IN')

// Test clock in outside range
const invalidResult = await clockIn({
  method: 'GEOFENCE',
  latitude: 40.7200, // Outside 10m range
  longitude: -74.0100
})

expect(invalidResult.success).toBe(false)
expect(invalidResult.error).toContain('must be within')
```

## Migration Guide

### From API Routes to Server Actions

If migrating from pure API routes to the mixed architecture:

```typescript
// Old: API route only
const response = await fetch('/api/clock', {
  method: 'POST',
  body: JSON.stringify(data)
})

// New: Server action (preferred for mutations)
import { clockIn } from '@/actions'
const result = await clockIn(data)
```

### Maintaining Backward Compatibility

API routes are maintained for backward compatibility and client-side operations. Both approaches are supported and can be used based on your needs.

This API documentation provides comprehensive coverage of all SmartClock endpoints and integration patterns. The mixed architecture approach provides flexibility while maintaining type safety and performance. 