# SmartClock API Documentation

## 🔗 Base URL
```
Development: http://localhost:3000
Production: https://your-domain.com
```

## 🔐 Authentication
All API endpoints (except public ones) require authentication via NextAuth.js session cookies.

### Session Context
Every authenticated request includes organization context:
```typescript
{
  user: {
    id: string,
    email: string,
    name: string,
    role: "EMPLOYEE" | "MANAGER" | "ADMIN",
    organizationId: string,
    organizationName: string,
    organizationSlug: string,
    planType: "BASIC" | "PROFESSIONAL" | "ENTERPRISE",
    billingStatus: "TRIAL" | "ACTIVE" | "PAST_DUE"
  }
}
```

---

## 🏢 Organization Management

### Register Organization
Create a new organization with admin user.

**Endpoint**: `POST /api/auth/register-organization`

**Request Body**:
```json
{
  "organizationName": "Acme Corporation",
  "organizationSlug": "acme-corp",
  "planType": "PROFESSIONAL",
  "ownerName": "John Doe",
  "ownerEmail": "john@acme.com",
  "ownerPassword": "securepassword",
  "confirmPassword": "securepassword"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Organization created successfully",
  "data": {
    "organizationId": "uuid",
    "userId": "uuid"
  }
}
```

**Validation**:
- Organization slug must be unique
- Email must be unique globally
- Password minimum 6 characters
- Plan type must be valid enum

---

### Join Organization
Add employee to existing organization.

**Endpoint**: `POST /api/auth/join-organization`

**Request Body**:
```json
{
  "organizationSlug": "acme-corp",
  "employeeName": "Jane Smith",
  "employeeEmail": "jane@acme.com",
  "employeePassword": "securepassword",
  "confirmPassword": "securepassword",
  "employeeId": "EMP001"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Successfully joined organization",
  "data": {
    "userId": "uuid",
    "organizationName": "Acme Corporation"
  }
}
```

---

### Lookup Organization
Find organization by slug for join flow.

**Endpoint**: `GET /api/organizations/lookup?slug=acme-corp`

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Acme Corporation",
    "slug": "acme-corp",
    "planType": "PROFESSIONAL"
  }
}
```

---

## ⏰ Time Tracking

### Clock In/Out
Handle clock in, clock out, and break management.

**Endpoint**: `POST /api/clock`

**Request Body**:
```json
{
  "action": "CLOCK_IN" | "CLOCK_OUT" | "BREAK_START" | "BREAK_END",
  "method": "MANUAL" | "GEOFENCE" | "QR_CODE",
  "coordinates": {
    "latitude": 40.7128,
    "longitude": -74.0059
  },
  "locationId": "uuid" // optional, auto-detected if within range
}
```

**Response**:
```json
{
  "success": true,
  "message": "Clocked in successfully",
  "data": {
    "clockEvent": {
      "id": "uuid",
      "type": "CLOCK_IN",
      "timestamp": "2024-01-15T09:00:00Z",
      "method": "GEOFENCE",
      "locationId": "uuid",
      "coordinates": {
        "latitude": 40.7128,
        "longitude": -74.0059
      }
    },
    "newStatus": "CLOCKED_IN",
    "todayHours": 0,
    "breakTime": 0
  },
  "locationValidation": {
    "distance": 5.2,
    "locationName": "Main Office"
  }
}
```

**State Transitions**:
- `CLOCKED_OUT` → `CLOCK_IN` → `CLOCKED_IN`
- `CLOCKED_IN` → `BREAK_START` → `ON_BREAK`
- `ON_BREAK` → `BREAK_END` → `CLOCKED_IN`
- `CLOCKED_IN` → `CLOCK_OUT` → `CLOCKED_OUT`

**Validation**:
- GPS coordinates required for GEOFENCE method
- Must be within 10m of work location
- State transitions must be valid
- Cannot clock in if already clocked in

---

### Get Clock Status
Get current status and today's events.

**Endpoint**: `GET /api/clock`

**Response**:
```json
{
  "success": true,
  "data": {
    "currentStatus": "CLOCKED_IN",
    "todayEvents": [
      {
        "id": "uuid",
        "type": "CLOCK_IN",
        "timestamp": "2024-01-15T09:00:00Z",
        "method": "GEOFENCE",
        "location": {
          "name": "Main Office",
          "address": "123 Business St"
        }
      }
    ],
    "todayHours": 4.5,
    "breakTime": 0.5,
    "clockedInAt": "2024-01-15T09:00:00Z",
    "lastBreakStart": null
  }
}
```

---

## 📍 Location Management

### Get Locations
Get all organization locations with distance calculations.

**Endpoint**: `GET /api/locations`

**Query Parameters**:
- `lat` (optional): User latitude for distance calculation
- `lng` (optional): User longitude for distance calculation

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Main Office",
      "address": "123 Business St, City, State",
      "latitude": 40.7128,
      "longitude": -74.0059,
      "radius": 10,
      "qrCode": "QR_CODE_STRING",
      "distance": 5.2, // only if lat/lng provided
      "inRange": true   // only if lat/lng provided
    }
  ]
}
```

---

### Create Location
Create new work location (Admin/Manager only).

**Endpoint**: `POST /api/locations`

**Request Body**:
```json
{
  "name": "Branch Office",
  "address": "456 Branch Ave, City, State",
  "latitude": 40.7589,
  "longitude": -73.9851,
  "radius": 10
}
```

**Response**:
```json
{
  "success": true,
  "message": "Location created successfully",
  "data": {
    "id": "uuid",
    "name": "Branch Office",
    "qrCode": "GENERATED_QR_CODE"
  }
}
```

**Permissions**: MANAGER or ADMIN role required

---

### Verify Location
Test GPS coordinates against geofences.

**Endpoint**: `POST /api/locations/verify`

**Request Body**:
```json
{
  "latitude": 40.7128,
  "longitude": -74.0059
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "validLocations": [
      {
        "id": "uuid",
        "name": "Main Office",
        "distance": 5.2,
        "inRange": true
      }
    ],
    "nearestLocation": {
      "id": "uuid",
      "name": "Main Office",
      "distance": 5.2
    }
  }
}
```

---

## 🛠️ Setup & Demo

### Initialize Demo Data
Create demo organizations and users for testing.

**Endpoint**: `POST /api/setup`

**Response**:
```json
{
  "success": true,
  "message": "Demo data created successfully",
  "data": {
    "organizations": [
      {
        "name": "Acme Corporation",
        "slug": "acme-corp",
        "planType": "PROFESSIONAL",
        "users": 3,
        "locations": 2
      }
    ]
  }
}
```

**Demo Organizations Created**:
- **Acme Corporation** (`acme-corp`) - Professional Plan
- **TechStart Inc** (`techstart`) - Basic Plan
- **Enterprise Solutions** (`enterprise-sol`) - Enterprise Plan

**Demo Users** (password: `demo123`):
- `admin@acme-corp.com` (Admin)
- `manager@acme-corp.com` (Manager)
- `alice@acme-corp.com` (Employee)

---

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "data": any,
  "message": "Optional success message",
  "locationValidation": { // GPS endpoints only
    "distance": number,
    "locationName": string
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": any // Optional additional details
}
```

---

## 🚨 Error Codes

### Authentication Errors
- `401 Unauthorized`: No valid session
- `403 Forbidden`: Insufficient permissions

### Validation Errors
- `400 Bad Request`: Invalid input data
- `409 Conflict`: Duplicate resource (email, slug)

### Location Errors
- `400 GPS_OUT_OF_RANGE`: User not within geofence
- `400 INVALID_COORDINATES`: Invalid GPS coordinates
- `400 NO_LOCATIONS_FOUND`: No work locations configured

### Clock Errors
- `400 INVALID_STATE_TRANSITION`: Invalid clock action for current state
- `400 ALREADY_CLOCKED_IN`: Cannot clock in when already clocked in
- `400 NOT_CLOCKED_IN`: Cannot perform action when not clocked in

---

## 🧪 Testing

### GPS Testing Tool
**URL**: `/test-location`

Interactive tool for testing GPS geofencing with:
- Real-time coordinate input
- Distance calculations
- Validation results
- All organization locations

### Test Coordinates (10m radius)
```javascript
// Valid coordinates (within range)
const validCoords = { lat: 40.7128, lng: -74.0059 };

// Invalid coordinates (out of range)
const invalidCoords = { lat: 40.7129, lng: -74.0060 };
```

### Example API Calls
```bash
# Clock in with GPS
curl -X POST http://localhost:3000/api/clock \
  -H "Content-Type: application/json" \
  -d '{
    "action": "CLOCK_IN",
    "method": "GEOFENCE",
    "coordinates": {
      "latitude": 40.7128,
      "longitude": -74.0059
    }
  }'

# Get current status
curl -X GET http://localhost:3000/api/clock

# Verify location
curl -X POST http://localhost:3000/api/locations/verify \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 40.7128,
    "longitude": -74.0059
  }'
```

---

## 🔒 Security Notes

### GPS Validation
- All location validation happens server-side
- 10m precision prevents location spoofing
- Coordinates are validated against organization locations only

### Data Isolation
- All endpoints filter by organization context
- No cross-organization data access possible
- User can only access their organization's data

### Rate Limiting
- Clock endpoints: 1 request per second
- Location endpoints: 10 requests per minute
- Setup endpoint: 1 request per hour (development only)

---

## 📋 Future Endpoints

### Phase 3: Management Features
- `GET /api/team/status` - Real-time team status
- `GET /api/timesheets` - Get timesheets for approval
- `PUT /api/timesheets/:id/approve` - Approve timesheet
- `GET /api/reports/attendance` - Attendance reports

### Phase 4: Enterprise Features
- `GET /api/analytics/dashboard` - Advanced analytics
- `POST /api/integrations/webhook` - Webhook endpoints
- `GET /api/audit/logs` - Audit trail access 