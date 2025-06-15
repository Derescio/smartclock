# SmartClock Actions Hub

This directory contains all server actions for the SmartClock SaaS platform, organized by functionality for better maintainability and troubleshooting.

## Architecture Overview

The actions hub centralizes all server-side business logic into reusable, well-tested functions that can be imported throughout the application. This approach provides:

- **Single Source of Truth**: All business logic in one place
- **Better Testing**: Isolated functions are easier to test
- **Improved Debugging**: Centralized error handling and logging
- **Code Reusability**: Actions can be used in multiple components
- **Type Safety**: Consistent TypeScript interfaces

## File Structure

```
actions/
├── index.ts              # Main export hub - import all actions from here
├── auth.ts               # Authentication & user management
├── clock.ts              # Time tracking & clock operations
├── team.ts               # Team management (manager dashboard)
├── locations.ts          # Location & geofencing management
├── organizations.ts      # Organization settings & stats
└── README.md            # This documentation
```

## Action Categories

### 🔐 Authentication (`auth.ts`)
- `getCurrentUser()` - Get current authenticated user
- `requireAuth()` - Require authentication (throws if not authenticated)
- `requireRole(roles)` - Require specific role(s)
- `createUser(data)` - Create new user account
- `updateUserProfile(userId, data)` - Update user profile
- `deactivateUser(userId)` - Deactivate user account

### ⏰ Clock Operations (`clock.ts`)
- `clockIn(data)` - Clock in with location validation
- `clockOut(data)` - Clock out and calculate hours
- `startBreak(data)` - Start break period
- `endBreak(data)` - End break period
- `getCurrentStatus()` - Get current clock status
- `getTodaysClockEvents(date?)` - Get clock events for a date

### 👥 Team Management (`team.ts`)
- `getTeamStatus()` - Real-time team member status
- `getTeamStats()` - Aggregated team statistics
- `getTeamActivity()` - Recent team activity feed
- `getAllTeamMembers()` - List all team members
- `updateTeamMemberRole(userId, role)` - Update member role
- `refreshManagerDashboard()` - Refresh manager dashboard cache

### 📍 Location Management (`locations.ts`)
- `getOrganizationLocations()` - Get all organization locations
- `createLocation(data)` - Create new work location
- `updateLocation(locationId, data)` - Update location details
- `deleteLocation(locationId)` - Soft delete location
- `validateLocationCoordinates(lat, lng)` - Validate GPS coordinates
- `generateLocationQRCode(locationId)` - Generate QR code for location
- `getLocationAnalytics(locationId, days)` - Location usage analytics

### 🏢 Organization Management (`organizations.ts`)
- `getOrganizationDetails()` - Get organization info
- `updateOrganizationSettings(data)` - Update org settings
- `getOrganizationStats(days)` - Organization analytics
- `lookupOrganizationBySlug(slug)` - Find org by slug
- `createOrganization(data)` - Create new organization
- `getOrganizationUsage()` - Usage limits and billing info

## Usage Examples

### Basic Import
```typescript
import { clockIn, getCurrentUser, getTeamStatus } from '@/actions'
```

### Using in Server Components
```typescript
export default async function Dashboard() {
  const user = await getCurrentUser()
  const status = await getCurrentStatus()
  
  return <div>Welcome {user.name}!</div>
}
```

### Using in Client Components (via Server Actions)
```typescript
'use client'
import { clockIn } from '@/actions'

export default function ClockButton() {
  async function handleClockIn() {
    const result = await clockIn({
      method: 'GEOFENCE',
      latitude: 40.7128,
      longitude: -74.0060
    })
    
    if (result.success) {
      // Handle success
    }
  }
  
  return <button onClick={handleClockIn}>Clock In</button>
}
```

### Error Handling
All actions return a consistent response format:
```typescript
{
  success: boolean
  error?: string
  data?: any
  // ... additional fields specific to the action
}
```

## Security & Authorization

### Role-Based Access Control
Actions automatically enforce role-based permissions:
- `requireAuth()` - Any authenticated user
- `requireRole(['EMPLOYEE'])` - Employees only
- `requireRole(['MANAGER', 'ADMIN'])` - Managers and admins
- `requireRole(['ADMIN'])` - Admins only

### Multi-Tenant Isolation
All actions automatically filter data by `organizationId` to ensure users can only access their organization's data.

### Input Validation
Actions validate input parameters and return descriptive error messages for invalid data.

## Performance Optimizations

### Automatic Cache Revalidation
Actions automatically revalidate relevant pages using `revalidatePath()`:
```typescript
revalidatePath('/manager')  // Refresh manager dashboard
revalidatePath('/')         // Refresh main dashboard
```

### Database Query Optimization
- Uses Prisma's `include` for efficient joins
- Implements proper indexing strategies
- Batches related queries where possible

## Debugging & Troubleshooting

### Action Categories Helper
Use the `getAvailableActions()` helper to see all available actions:
```typescript
import { getAvailableActions } from '@/actions'

console.log(getAvailableActions())
// Returns categorized list of all actions
```

### Error Logging
All actions include comprehensive error logging:
```typescript
console.error('Clock in error:', error)
```

### Common Issues

1. **Authentication Errors**: Ensure user is logged in and has proper session
2. **Permission Errors**: Check user role matches action requirements
3. **Validation Errors**: Verify input data matches expected format
4. **Database Errors**: Check Prisma connection and schema

## Migration Guide

### From API Routes
Replace API route calls with direct action imports:
```typescript
// Before
const response = await fetch('/api/clock', { method: 'POST', ... })

// After
import { clockIn } from '@/actions'
const result = await clockIn(data)
```

### From Inline Logic
Move business logic from components to actions:
```typescript
// Before (in component)
const user = await prisma.user.findUnique(...)

// After
import { getCurrentUser } from '@/actions'
const user = await getCurrentUser()
```

## Testing

Actions are designed to be easily testable:
```typescript
import { clockIn } from '@/actions/clock'

test('should clock in successfully', async () => {
  const result = await clockIn({
    method: 'MANUAL',
    notes: 'Test clock in'
  })
  
  expect(result.success).toBe(true)
})
```

## Contributing

When adding new actions:
1. Place in appropriate category file
2. Export from `index.ts`
3. Add to `ActionCategories` constant
4. Include comprehensive error handling
5. Add JSDoc comments
6. Update this README

## Future Enhancements

- [ ] Add action middleware for logging/metrics
- [ ] Implement action caching strategies
- [ ] Add action rate limiting
- [ ] Create action testing utilities
- [ ] Add action performance monitoring 