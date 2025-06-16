# SmartClock Testing Guide

## Overview

This comprehensive testing guide covers all aspects of testing the SmartClock SaaS platform, including multi-tenant isolation, GPS functionality, real-time features, schedule management, timesheet system, team collaboration, and the mixed architecture pattern.

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

## Schedule Management Testing

### Schedule Creation & Assignment

#### Test 6: Schedule Creation Wizard
**Objective**: Test 4-step schedule creation process

**Test Steps**:
1. **Step 1**: Basic Information
   ```typescript
   const scheduleData = {
     title: "Morning Shift",
     description: "Regular morning shift",
     scheduleType: "SHIFT"
   }
   ```

2. **Step 2**: Time & Recurrence
   ```typescript
   const timeData = {
     startDate: "2024-01-15",
     endDate: "2024-12-31",
     startTime: "09:00",
     endTime: "17:00",
     breakDuration: 30,
     isRecurring: true,
     recurrence: "WEEKLY",
     recurrenceDays: ["MON", "TUE", "WED", "THU", "FRI"]
   }
   ```

3. **Step 3**: Assignment
   ```typescript
   const assignmentData = {
     assignmentType: "TEAM",
     teamId: "team-123"
   }
   ```

4. **Step 4**: Review & Create
   ```typescript
   const result = await createSchedule({
     ...scheduleData,
     ...timeData,
     ...assignmentData
   })
   expect(result.success).toBe(true)
   ```

#### Test 7: Multiple Assignment Types
**Objective**: Verify all assignment types work correctly

**Assignment Types to Test**:
- Individual user assignment
- Department-wide assignment
- Location-based assignment
- Team assignment

**Test Steps**:
```typescript
// Test individual assignment
const individualSchedule = await createSchedule({
  title: "John's Schedule",
  assignmentType: "INDIVIDUAL",
  userId: "user-123"
})

// Test department assignment
const deptSchedule = await createSchedule({
  title: "Engineering Schedule",
  assignmentType: "DEPARTMENT",
  departmentId: "dept-123"
})

// Test location assignment
const locationSchedule = await createSchedule({
  title: "Office A Schedule",
  assignmentType: "LOCATION",
  locationId: "location-123"
})

// Test team assignment
const teamSchedule = await createSchedule({
  title: "Team Alpha Schedule",
  assignmentType: "TEAM",
  teamId: "team-123"
})
```

#### Test 8: Recurring Schedule Logic
**Objective**: Test recurring schedule day-of-week filtering

**Test Scenario**:
1. Create weekly recurring schedule for Monday-Friday
2. Test schedule appears on weekdays
3. Test schedule doesn't appear on weekends

**Test Steps**:
```typescript
// Create recurring schedule
const recurringSchedule = await createSchedule({
  title: "Weekday Schedule",
  isRecurring: true,
  recurrence: "WEEKLY",
  recurrenceDays: ["MON", "TUE", "WED", "THU", "FRI"]
})

// Test Monday (should appear)
const mondaySchedules = await getTodaysSchedule(userId, "2024-01-15") // Monday
expect(mondaySchedules.schedules).toContainEqual(
  expect.objectContaining({ title: "Weekday Schedule" })
)

// Test Saturday (should not appear)
const saturdaySchedules = await getTodaysSchedule(userId, "2024-01-20") // Saturday
expect(saturdaySchedules.schedules).not.toContainEqual(
  expect.objectContaining({ title: "Weekday Schedule" })
)
```

### Schedule Viewing & Integration

#### Test 9: Employee Schedule Dashboard
**Objective**: Test real-time schedule viewing on employee dashboard

**Test Steps**:
1. Create schedule assigned to employee
2. Login as employee
3. Verify schedule appears on dashboard
4. Verify schedule details are correct

```typescript
// Create schedule for employee
const schedule = await createSchedule({
  title: "Employee Shift",
  userId: employeeId,
  startTime: "09:00",
  endTime: "17:00"
})

// Login as employee and check dashboard
const dashboardData = await getTodaysSchedule(employeeId)
expect(dashboardData.schedules).toHaveLength(1)
expect(dashboardData.schedules[0].title).toBe("Employee Shift")
```

## Timesheet System Testing

### Timesheet Generation

#### Test 10: Clock Events to Timesheet Conversion
**Objective**: Test automatic timesheet generation from clock events

**Test Scenario**:
1. Create clock events for a week
2. Generate timesheet
3. Verify calculations are correct

**Test Steps**:
```typescript
// Create sample clock events
const clockEvents = [
  { type: 'CLOCK_IN', timestamp: '2024-01-15T09:00:00Z' },
  { type: 'BREAK_START', timestamp: '2024-01-15T12:00:00Z' },
  { type: 'BREAK_END', timestamp: '2024-01-15T12:30:00Z' },
  { type: 'CLOCK_OUT', timestamp: '2024-01-15T17:00:00Z' }
]

// Generate timesheet
const timesheet = await generateTimesheetFromClockEvents(
  userId,
  new Date('2024-01-15'),
  new Date('2024-01-19')
)

// Verify calculations
expect(timesheet.totalHours).toBe(7.5) // 8 hours - 0.5 hour break
expect(timesheet.regularHours).toBe(7.5)
expect(timesheet.overtimeHours).toBe(0)
expect(timesheet.breakHours).toBe(0.5)
```

#### Test 11: Overtime Calculation
**Objective**: Test overtime calculation (>8 hours per day)

**Test Steps**:
```typescript
// Create long work day (10 hours)
const longDayEvents = [
  { type: 'CLOCK_IN', timestamp: '2024-01-15T08:00:00Z' },
  { type: 'CLOCK_OUT', timestamp: '2024-01-15T18:00:00Z' }
]

const overtimeTimesheet = await generateTimesheetFromClockEvents(
  userId,
  new Date('2024-01-15'),
  new Date('2024-01-15')
)

expect(overtimeTimesheet.totalHours).toBe(10)
expect(overtimeTimesheet.regularHours).toBe(8)
expect(overtimeTimesheet.overtimeHours).toBe(2)
```

### Weekly Timesheet Overview

#### Test 12: Weekly Hours Breakdown
**Objective**: Test weekly timesheet with daily breakdown

**Test Steps**:
```typescript
// Create events for full week
const weeklyEvents = [
  // Monday: 8 hours
  { type: 'CLOCK_IN', timestamp: '2024-01-15T09:00:00Z' },
  { type: 'CLOCK_OUT', timestamp: '2024-01-15T17:00:00Z' },
  // Tuesday: 7 hours
  { type: 'CLOCK_IN', timestamp: '2024-01-16T09:00:00Z' },
  { type: 'CLOCK_OUT', timestamp: '2024-01-16T16:00:00Z' },
  // ... more days
]

const weeklyTimesheet = await getWeeklyTimesheet(
  userId,
  new Date('2024-01-15') // Week start
)

expect(weeklyTimesheet.totalWeekHours).toBe(40)
expect(weeklyTimesheet.dailyBreakdown).toHaveLength(7)
expect(weeklyTimesheet.dailyBreakdown[0].hours).toBe(8) // Monday
expect(weeklyTimesheet.dailyBreakdown[1].hours).toBe(7) // Tuesday
```

## Team Management Testing

### Team Creation & Management

#### Test 13: Team Creation
**Objective**: Test team creation with managers and members

**Test Steps**:
```typescript
// Create team
const teamData = {
  name: "Development Team",
  description: "Frontend and backend developers",
  color: "#3B82F6",
  managerId: "manager-123"
}

const team = await createTeam(teamData)
expect(team.success).toBe(true)
expect(team.team.name).toBe("Development Team")
expect(team.team.managerId).toBe("manager-123")
```

#### Test 14: Team Member Management
**Objective**: Test adding/removing team members

**Test Steps**:
```typescript
// Add team members
const addResult = await addTeamMember(teamId, userId, "MEMBER")
expect(addResult.success).toBe(true)

// Remove team member
const removeResult = await removeTeamMember(teamId, userId)
expect(removeResult.success).toBe(true)

// Verify member list
const teamMembers = await getTeamMembers(teamId)
expect(teamMembers.members).not.toContainEqual(
  expect.objectContaining({ userId })
)
```

### Team-Based Scheduling

#### Test 15: Bulk Schedule Assignment
**Objective**: Test assigning schedules to entire teams

**Test Steps**:
```typescript
// Create team with multiple members
const team = await createTeam({
  name: "Test Team",
  managerId: "manager-123"
})

await addTeamMember(team.id, "employee-1", "MEMBER")
await addTeamMember(team.id, "employee-2", "MEMBER")

// Create schedule assigned to team
const teamSchedule = await createSchedule({
  title: "Team Schedule",
  teamId: team.id,
  startTime: "09:00",
  endTime: "17:00"
})

// Verify all team members see the schedule
const employee1Schedules = await getTodaysSchedule("employee-1")
const employee2Schedules = await getTodaysSchedule("employee-2")

expect(employee1Schedules.schedules).toContainEqual(
  expect.objectContaining({ title: "Team Schedule" })
)
expect(employee2Schedules.schedules).toContainEqual(
  expect.objectContaining({ title: "Team Schedule" })
)
```

## Real-Time Features Testing

### Test 16: Component Synchronization
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
// 1. Open dashboard
// 2. Execute clock-in
await fetch('/api/clock', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'CLOCK_IN', method: 'MANUAL' })
})

// 3. Verify components update automatically
// - Recent activity should show new clock-in event
// - Status should change to "CLOCKED_IN"
// - Hours calculation should start
```

### Test 17: Manager Dashboard Real-Time Updates
**Objective**: Test live team status updates

**Test Steps**:
```typescript
// Manager views team dashboard
const initialTeamStatus = await getTeamStatus()
expect(initialTeamStatus.currentlyWorking).toBe(0)

// Employee clocks in
await clockIn({ userId: "employee-1", method: "MANUAL" })

// Manager dashboard should reflect change
const updatedTeamStatus = await getTeamStatus()
expect(updatedTeamStatus.currentlyWorking).toBe(1)
```

## Integration Testing

### Test 18: End-to-End Employee Workflow
**Objective**: Test complete employee experience

**Workflow Steps**:
1. Employee logs in
2. Views today's schedule
3. Clocks in
4. Takes break
5. Ends break
6. Clocks out
7. Generates timesheet
8. Views timesheet history

**Test Implementation**:
```typescript
// Complete workflow test
const employeeWorkflow = async () => {
  // 1. Login
  const session = await signIn('employee@company.com', 'password')
  
  // 2. View schedule
  const schedule = await getTodaysSchedule(session.user.id)
  expect(schedule.schedules).toHaveLength(1)
  
  // 3. Clock in
  const clockInResult = await clockIn({ method: 'MANUAL' })
  expect(clockInResult.success).toBe(true)
  
  // 4. Take break
  const breakStart = await startBreak()
  expect(breakStart.success).toBe(true)
  
  // 5. End break
  const breakEnd = await endBreak()
  expect(breakEnd.success).toBe(true)
  
  // 6. Clock out
  const clockOutResult = await clockOut()
  expect(clockOutResult.success).toBe(true)
  
  // 7. Generate timesheet
  const timesheet = await generateTimesheetFromClockEvents(
    session.user.id,
    new Date(),
    new Date()
  )
  expect(timesheet.success).toBe(true)
  
  // 8. View history
  const history = await getEmployeeTimesheets(session.user.id)
  expect(history.timesheets).toHaveLength(1)
}
```

### Test 19: Manager Complete Workflow
**Objective**: Test complete manager experience

**Workflow Steps**:
1. Manager logs in
2. Views team dashboard
3. Creates new schedule
4. Assigns schedule to team
5. Approves timesheet
6. Views team analytics

**Test Implementation**:
```typescript
const managerWorkflow = async () => {
  // 1. Login as manager
  const session = await signIn('manager@company.com', 'password')
  
  // 2. View team dashboard
  const teamStatus = await getTeamStatus()
  expect(teamStatus.success).toBe(true)
  
  // 3. Create schedule
  const schedule = await createSchedule({
    title: "New Team Schedule",
    teamId: "team-123",
    startTime: "09:00",
    endTime: "17:00"
  })
  expect(schedule.success).toBe(true)
  
  // 4. Schedule automatically assigned to team
  const teamSchedules = await getTeamSchedules("team-123")
  expect(teamSchedules.schedules).toContainEqual(
    expect.objectContaining({ title: "New Team Schedule" })
  )
  
  // 5. Approve timesheet
  const approval = await approveTimesheet("timesheet-123")
  expect(approval.success).toBe(true)
  
  // 6. View analytics
  const analytics = await getTeamAnalytics("team-123")
  expect(analytics.success).toBe(true)
}
```

## Performance Testing

### Test 20: Database Query Performance
**Objective**: Ensure efficient database queries

**Test Scenarios**:
```typescript
// Test complex schedule query performance
const startTime = Date.now()
const schedules = await getTodaysSchedule(userId)
const queryTime = Date.now() - startTime

expect(queryTime).toBeLessThan(500) // Should complete in <500ms

// Test timesheet generation performance
const timesheetStartTime = Date.now()
const timesheet = await generateTimesheetFromClockEvents(
  userId,
  new Date('2024-01-01'),
  new Date('2024-01-31')
)
const timesheetTime = Date.now() - timesheetStartTime

expect(timesheetTime).toBeLessThan(1000) // Should complete in <1s
```

## Security Testing

### Test 21: Organization Data Isolation
**Objective**: Verify no data leakage between organizations

**Test Steps**:
```typescript
// Create data in Organization A
const orgAUser = await signIn('user@org-a.com', 'password')
const orgASchedule = await createSchedule({
  title: "Org A Schedule",
  userId: orgAUser.id
})

// Try to access from Organization B
const orgBUser = await signIn('user@org-b.com', 'password')
const orgBSchedules = await getTodaysSchedule(orgBUser.id)

// Verify Organization B cannot see Organization A's schedule
expect(orgBSchedules.schedules).not.toContainEqual(
  expect.objectContaining({ title: "Org A Schedule" })
)
```

### Test 22: Role-Based Access Control
**Objective**: Test permission enforcement

**Test Steps**:
```typescript
// Employee tries to access manager functions
const employee = await signIn('employee@company.com', 'password')
const teamAccess = await getTeamStatus()
expect(teamAccess.success).toBe(false)
expect(teamAccess.error).toContain('Insufficient permissions')

// Manager can access team functions
const manager = await signIn('manager@company.com', 'password')
const managerTeamAccess = await getTeamStatus()
expect(managerTeamAccess.success).toBe(true)
```

## Automated Testing Setup

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'actions/**/*.ts',
    'app/api/**/*.ts',
    '!**/*.d.ts'
  ]
}
```

### Test Database Setup

```javascript
// tests/setup.js
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL
    }
  }
})

beforeEach(async () => {
  // Clean database before each test
  await prisma.clockEvent.deleteMany()
  await prisma.schedule.deleteMany()
  await prisma.timesheet.deleteMany()
  await prisma.teamMember.deleteMany()
  await prisma.team.deleteMany()
  await prisma.user.deleteMany()
  await prisma.organization.deleteMany()
})

afterAll(async () => {
  await prisma.$disconnect()
})
```

## Testing Checklist

### Core Features ✅
- [ ] Multi-tenant data isolation
- [ ] GPS-based clock in/out
- [ ] Break management
- [ ] Real-time dashboard updates
- [ ] Role-based access control

### Schedule Management ✅
- [ ] Schedule creation wizard
- [ ] Multiple assignment types
- [ ] Recurring schedule logic
- [ ] Employee schedule viewing
- [ ] Schedule approval workflow

### Timesheet System ✅
- [ ] Clock events to timesheet conversion
- [ ] Overtime calculation
- [ ] Weekly timesheet breakdown
- [ ] Timesheet history
- [ ] Export functionality

### Team Management ✅
- [ ] Team creation and management
- [ ] Team member management
- [ ] Bulk schedule assignment
- [ ] Team-based scheduling
- [ ] Team analytics

### Integration Testing ✅
- [ ] End-to-end employee workflow
- [ ] Complete manager workflow
- [ ] Component synchronization
- [ ] Real-time updates

### Performance & Security ✅
- [ ] Database query performance
- [ ] Organization data isolation
- [ ] Permission enforcement
- [ ] Input validation

This comprehensive testing guide ensures all features of SmartClock are thoroughly tested and working correctly across all user roles and scenarios. 