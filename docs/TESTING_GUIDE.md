# SmartClock Testing Guide

## Overview

This comprehensive testing guide covers all aspects of testing the SmartClock SaaS platform, including multi-tenant isolation, GPS functionality, real-time features, and the mixed architecture pattern.

## Testing Environment Setup

### Local Development Testing

```bash
# Clone and setup
git clone https://github.com/Derescio/smartclock.git
cd smartclock
npm install

# Environment setup
cp .env.example .env
# Configure your test database URL

# Database setup
npx prisma generate
npx prisma db push
npx prisma db seed

# Start development server
npm run dev
```

### Test Database

Use a separate database for testing:
```env
# .env.test
DATABASE_URL="postgresql://username:password@localhost:5432/smartclock_test"
NEXTAUTH_SECRET="test-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### Production Testing

**Live Environment**: [https://clockwizard.vercel.app/](https://clockwizard.vercel.app/)

## Multi-Tenant Testing

### Organization Isolation Tests

#### Test 1: Data Separation
**Objective**: Ensure complete data isolation between organizations

**Setup**:
1. Create two test organizations: "Acme Corp" and "TechStart Inc"
2. Add employees to each organization
3. Create clock events for employees in both organizations

**Test Steps**:
```typescript
// Test organization A cannot see organization B's data
const orgAUser = await signIn('user@acme-corp.com', 'password')
const orgBUser = await signIn('user@techstart.com', 'password')

// Org A user should only see their organization's data
const orgAEvents = await getCurrentStatus() // Should only return Acme Corp data
const orgATeam = await getTeamStatus() // Should only return Acme Corp employees

// Verify no cross-organization data leakage
expect(orgAEvents.organizationId).toBe('acme-corp-id')
expect(orgATeam.teamMembers).not.toContain(orgBUser)
```

**Expected Results**:
- ✅ Organization A users cannot see Organization B data
- ✅ Database queries include `organizationId` filter
- ✅ Session context includes correct organization information
- ✅ API responses are scoped to user's organization

#### Test 2: Role-Based Access Control
**Objective**: Verify role permissions work correctly within organizations

**Test Matrix**:
| Role | Dashboard Access | Team View | Admin Functions |
|------|------------------|-----------|-----------------|
| Employee | ✅ Own data only | ❌ No access | ❌ No access |
| Manager | ✅ Own + team data | ✅ Team view | ❌ No access |
| Admin | ✅ All org data | ✅ All teams | ✅ Org settings |
| Super Admin | ✅ All data | ✅ All orgs | ✅ System admin |

**Test Steps**:
```typescript
// Test employee access
const employee = await signIn('employee@acme-corp.com', 'password')
const teamAccess = await getTeamStatus()
expect(teamAccess.success).toBe(false) // Should be denied

// Test manager access
const manager = await signIn('manager@acme-corp.com', 'password')
const managerTeamAccess = await getTeamStatus()
expect(managerTeamAccess.success).toBe(true) // Should be allowed
```

## Clock Functionality Testing

### GPS-Based Clock In/Out

#### Test 3: Location Validation
**Objective**: Test GPS geofencing accuracy

**Test Coordinates** (Main Office - 10m radius):
- **Valid Location**: `43.90973166684534, -78.83681245557024` (within range)
- **Invalid Location**: `43.91000000000000, -78.84000000000000` (outside range)

**Test Steps**:
```typescript
// Test valid location clock-in
const validResult = await clockIn({
  method: 'GEOFENCE',
  latitude: 43.90973166684534,
  longitude: -78.83681245557024
})

expect(validResult.success).toBe(true)
expect(validResult.locationValidation.distance).toBeLessThan(10)

// Test invalid location clock-in
const invalidResult = await clockIn({
  method: 'GEOFENCE',
  latitude: 43.91000000000000,
  longitude: -78.84000000000000
})

expect(invalidResult.success).toBe(false)
expect(invalidResult.error).toContain('must be within')
```

#### Test 4: Clock State Transitions
**Objective**: Verify valid state transitions and prevent invalid ones

**Valid Transitions**:
- CLOCKED_OUT → CLOCKED_IN ✅
- CLOCKED_IN → CLOCKED_OUT ✅
- CLOCKED_IN → ON_BREAK ✅
- ON_BREAK → CLOCKED_IN ✅

**Invalid Transitions**:
- CLOCKED_IN → CLOCKED_IN ❌
- CLOCKED_OUT → ON_BREAK ❌
- ON_BREAK → CLOCKED_OUT ❌

**Test Steps**:
```typescript
// Test valid transition: Clock in when clocked out
await clockOut() // Ensure starting state
const clockInResult = await clockIn({ method: 'MANUAL' })
expect(clockInResult.success).toBe(true)

// Test invalid transition: Clock in when already clocked in
const invalidClockIn = await clockIn({ method: 'MANUAL' })
expect(invalidClockIn.success).toBe(false)
expect(invalidClockIn.error).toContain('already clocked in')
```

### Break Management Testing

#### Test 5: Break Time Calculations
**Objective**: Verify break time is properly tracked and deducted

**Test Scenario**:
1. Clock in at 9:00 AM
2. Start break at 12:00 PM
3. End break at 12:30 PM
4. Clock out at 5:00 PM
5. Expected hours: 7.5 hours (8 hours - 0.5 hour break)

**Test Steps**:
```typescript
// Simulate full day with break
const clockInTime = new Date('2024-01-15T09:00:00Z')
const breakStartTime = new Date('2024-01-15T12:00:00Z')
const breakEndTime = new Date('2024-01-15T12:30:00Z')
const clockOutTime = new Date('2024-01-15T17:00:00Z')

// Mock time progression and verify calculations
const finalHours = await calculateTodaysHours(userId, organizationId)
expect(finalHours).toBe(7.5)
```

## Real-Time Features Testing

### Test 6: Component Synchronization
**Objective**: Verify real-time updates between dashboard components

**Test Steps**:
1. Open dashboard in browser
2. Perform clock-in action
3. Verify recent activity updates automatically
4. Verify status display changes immediately
5. Verify hours calculation updates

**Manual Testing**:
```javascript
// Browser console testing
// 1. Clock in and watch for automatic updates
await clockIn({ method: 'MANUAL' })

// 2. Verify recent activity refreshes without page reload
// Check that new clock event appears in recent activity

// 3. Verify status indicator updates
// Check that status changes from "Clocked Out" to "Clocked In"
```

### Test 7: Cache Invalidation Strategy
**Objective**: Test that cache invalidation affects correct user groups

**Test Scenario**:
- Employee A clocks in
- Employee B (same org) should not get cache invalidated
- Manager should get cache invalidated (team view needs update)

**Test Steps**:
```typescript
// Employee A clocks in
const employeeA = await signIn('employeeA@acme-corp.com', 'password')
await clockIn({ method: 'MANUAL' })

// Verify manager cache is invalidated (team view updates)
const manager = await signIn('manager@acme-corp.com', 'password')
const teamStatus = await getTeamStatus()
// Should show Employee A as clocked in

// Verify other employees don't get unnecessary cache invalidation
const employeeB = await signIn('employeeB@acme-corp.com', 'password')
// Employee B's dashboard should not auto-refresh
```

## API Testing

### Server Actions Testing

#### Test 8: Server Action Error Handling
**Objective**: Test server action error responses and validation

**Test Steps**:
```typescript
// Test authentication requirement
const unauthenticatedResult = await clockIn({ method: 'MANUAL' })
expect(unauthenticatedResult.success).toBe(false)
expect(unauthenticatedResult.error).toContain('Authentication required')

// Test invalid parameters
const invalidResult = await clockIn({
  method: 'GEOFENCE',
  latitude: 999, // Invalid latitude
  longitude: 999  // Invalid longitude
})
expect(invalidResult.success).toBe(false)
expect(invalidResult.error).toContain('Invalid')
```

### API Routes Testing

#### Test 9: API Endpoint Consistency
**Objective**: Verify API routes return consistent data with server actions

**Test Steps**:
```typescript
// Compare server action vs API route results
const serverActionResult = await getCurrentStatus()
const apiResult = await fetch('/api/clock').then(r => r.json())

expect(serverActionResult.currentStatus).toBe(apiResult.currentStatus)
expect(serverActionResult.todaysHours).toBe(apiResult.todaysHours)
```

## Performance Testing

### Test 10: Database Query Optimization
**Objective**: Ensure queries are efficient and properly indexed

**Test Steps**:
```sql
-- Test query performance
EXPLAIN ANALYZE SELECT * FROM "ClockEvent" 
WHERE "organizationId" = 'org_123' 
AND "userId" = 'user_456' 
AND "timestamp" >= '2024-01-15T00:00:00Z' 
AND "timestamp" <= '2024-01-15T23:59:59Z'
ORDER BY "timestamp" ASC;

-- Should use indexes and complete in <10ms
```

### Test 11: Real-Time Update Performance
**Objective**: Test performance with multiple concurrent users

**Load Testing**:
```javascript
// Simulate 10 concurrent users clocking in
const promises = Array.from({ length: 10 }, (_, i) => 
  clockIn({ 
    method: 'MANUAL',
    userId: `user_${i}`,
    organizationId: 'test_org'
  })
)

const results = await Promise.all(promises)
const successCount = results.filter(r => r.success).length
expect(successCount).toBe(10) // All should succeed
```

## Security Testing

### Test 12: Input Validation
**Objective**: Test all input validation and sanitization

**Test Cases**:
```typescript
// SQL injection attempts
const maliciousInput = "'; DROP TABLE ClockEvent; --"
const result = await clockIn({ 
  method: 'MANUAL',
  notes: maliciousInput 
})
expect(result.success).toBe(true) // Should be safely handled

// XSS attempts
const xssInput = "<script>alert('xss')</script>"
const xssResult = await clockIn({ 
  method: 'MANUAL',
  notes: xssInput 
})
// Should be sanitized in database
```

### Test 13: Organization Boundary Security
**Objective**: Attempt to access data across organization boundaries

**Test Steps**:
```typescript
// Try to access another organization's data
const orgAUser = await signIn('user@acme-corp.com', 'password')

// Attempt to access org B's clock events directly
const unauthorizedAccess = await prisma.clockEvent.findMany({
  where: { organizationId: 'org_b_id' } // Different org
})

// Should be prevented by application logic
expect(unauthorizedAccess).toHaveLength(0)
```

## Mobile Testing

### Test 14: Mobile GPS Functionality
**Objective**: Test GPS features on mobile devices

**Test Devices**:
- iOS Safari
- Android Chrome
- Mobile Firefox

**Test Steps**:
1. Open SmartClock on mobile browser
2. Allow location permissions
3. Test GPS accuracy and speed
4. Test clock-in with GPS
5. Verify touch interactions work properly

**Expected Results**:
- GPS permission request appears
- Location accuracy within 10 meters
- Clock-in completes successfully
- UI is touch-friendly and responsive

### Test 15: Mobile Performance
**Objective**: Test performance on mobile devices

**Metrics to Test**:
- Page load time < 3 seconds
- GPS lock time < 30 seconds
- Clock action response < 2 seconds
- Smooth scrolling and animations

## Integration Testing

### Test 16: End-to-End User Workflows

#### Complete Employee Day Workflow
```typescript
describe('Complete Employee Day', () => {
  test('Full day workflow', async () => {
    // 1. Employee logs in
    await signIn('employee@acme-corp.com', 'password')
    
    // 2. Clock in with GPS
    const clockInResult = await clockIn({
      method: 'GEOFENCE',
      latitude: 43.90973166684534,
      longitude: -78.83681245557024
    })
    expect(clockInResult.success).toBe(true)
    
    // 3. Take a break
    const breakStart = await startBreak({ method: 'MANUAL' })
    expect(breakStart.success).toBe(true)
    
    // 4. End break
    const breakEnd = await endBreak({ method: 'MANUAL' })
    expect(breakEnd.success).toBe(true)
    
    // 5. Clock out
    const clockOut = await clockOut({ method: 'MANUAL' })
    expect(clockOut.success).toBe(true)
    
    // 6. Verify final hours calculation
    const status = await getCurrentStatus()
    expect(status.todaysHours).toBeGreaterThan(0)
  })
})
```

#### Manager Oversight Workflow
```typescript
describe('Manager Oversight', () => {
  test('Manager can monitor team', async () => {
    // 1. Manager logs in
    await signIn('manager@acme-corp.com', 'password')
    
    // 2. View team status
    const teamStatus = await getTeamStatus()
    expect(teamStatus.success).toBe(true)
    expect(teamStatus.teamMembers.length).toBeGreaterThan(0)
    
    // 3. View team activity
    const teamActivity = await getTeamActivity()
    expect(teamActivity.success).toBe(true)
    
    // 4. Verify real-time updates when employee clocks in
    // (This would require WebSocket testing or polling)
  })
})
```

## Automated Testing Setup

### Unit Tests
```bash
# Run unit tests
npm test

# Run with coverage
npm run test:coverage
```

### Integration Tests
```bash
# Run integration tests
npm run test:integration

# Run specific test suite
npm run test -- --grep "Clock functionality"
```

### E2E Tests (Planned)
```bash
# Run end-to-end tests with Playwright
npm run test:e2e

# Run specific browser
npm run test:e2e -- --project=chromium
```

## Test Data Management

### Seeded Test Data

The database seed includes:
- 3 test organizations
- 10+ test users with different roles
- Multiple locations with GPS coordinates
- Sample clock events for testing

### Test Data Reset
```bash
# Reset test database
npx prisma db push --force-reset
npx prisma db seed
```

### Custom Test Data
```typescript
// Create custom test scenarios
async function createTestScenario() {
  const org = await prisma.organization.create({
    data: {
      name: 'Test Organization',
      slug: 'test-org',
      planType: 'PROFESSIONAL'
    }
  })
  
  const user = await prisma.user.create({
    data: {
      email: 'test@test-org.com',
      name: 'Test User',
      organizationId: org.id,
      role: 'EMPLOYEE'
    }
  })
  
  return { org, user }
}
```

## Continuous Testing

### GitHub Actions (Planned)
```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run test
      - run: npm run test:integration
```

### Pre-commit Hooks
```bash
# Install pre-commit hooks
npm install --save-dev husky lint-staged

# Add to package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": ["npm run test:related", "npm run lint"]
  }
}
```

## Testing Checklist

### Before Each Release
- [ ] All unit tests pass
- [ ] Integration tests pass
- [ ] Multi-tenant isolation verified
- [ ] GPS functionality tested on multiple devices
- [ ] Performance benchmarks met
- [ ] Security tests pass
- [ ] Mobile compatibility verified
- [ ] Cross-browser testing completed

### Production Deployment Testing
- [ ] Smoke tests on production environment
- [ ] Database migrations successful
- [ ] Environment variables configured
- [ ] SSL certificates valid
- [ ] CDN and caching working
- [ ] Monitoring and alerts active

This comprehensive testing guide ensures SmartClock maintains high quality and reliability across all features and use cases. 