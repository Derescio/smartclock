# SmartClock Testing Guide

## Phase 1 SaaS Foundation Testing

This guide provides a concise test suite to validate our multi-tenant SaaS implementation.

---

## 🚀 Quick Setup

1. **Start the server**: `npm run dev`
2. **Initialize demo data**: POST to `/api/setup`
3. **Base URL**: `http://localhost:3000`

---

## 🔧 Recent Fixes Applied

**✅ Email Constraint Fixed**: 
- Removed global email unique constraint
- Now allows same email across different organizations
- Users can be `john@company.com` in multiple organizations

**✅ Toast Notifications**: 
- Replaced alert() with toast notifications using Sonner
- Better UX for error messages

**✅ Organization Context on Homepage**:
- Shows organization name in header
- Displays user role and plan type
- Shows trial status if applicable
- Personalized greeting with user's first name

---

## ✅ Test Suite: SaaS Foundation

### Test 1: Multi-Tenant Data Setup
**Objective**: Verify demo organizations are created correctly

**Steps**:
1. POST `http://localhost:3000/api/setup`
2. **Expected**: 200 response with 3 organizations created
3. **Verify**: Each org has 4 users, 2 locations

**Demo Organizations Created**:
- `acme-corp` (Professional Plan)
- `techstart` (Basic Plan) 
- `enterprise-sol` (Enterprise Plan)

---

### Test 2: Organization Registration Flow
**Objective**: Test new organization signup

**URL**: `http://localhost:3000/register`

**Test Steps**:
1. **Step 1 - Organization Details**:
   - Enter: "Test Company"
   - Verify: Auto-generates slug "test-company"
   - Click: Continue

2. **Step 2 - Admin Account**:
   - Name: "Test Admin"
   - Email: "admin@testcompany.com"
   - Password: "test123"
   - Confirm: "test123"
   - Click: Continue

3. **Step 3 - Plan Selection**:
   - Select: Any plan (Basic/Professional/Enterprise)
   - Click: "Start Free Trial"

**Expected Results**:
- ✅ Redirects to sign-in with success message
- ✅ Organization created in database
- ✅ Admin user created with ADMIN role
- ✅ 14-day trial period set
- ✅ Toast notifications instead of alerts

---

### Test 3: Employee Join Flow
**Objective**: Test employee registration

**URL**: `http://localhost:3000/join`

**Test Steps**:
1. **Step 1 - Find Organization**:
   - Enter company code: "acme-corp"
   - Click: "Find Organization"
   - Verify: Shows "Acme Corporation" info

2. **Step 2 - Employee Registration**:
   - Name: "Test Employee"
   - Email: "employee@acme-corp.com" (or any email, even if used in other orgs)
   - Employee ID: "EMP999" (optional)
   - Password: "test123"
   - Confirm: "test123"
   - Click: "Join Team"

**Expected Results**:
- ✅ Redirects to sign-in with success message
- ✅ Employee added to correct organization
- ✅ EMPLOYEE role assigned
- ✅ Employee count within limits
- ✅ Same email can be used across organizations
- ✅ Toast notifications for errors

---

### Test 4: Authentication & Session
**Objective**: Verify multi-tenant authentication

**URL**: `http://localhost:3000/login`

**Test Cases**:

**4a. Demo User Login**:
- Email: `admin@acme-corp.com`
- Password: `demo123`
- **Expected**: Login success, organization context in session

**4b. New Organization Admin**:
- Use credentials from Test 2
- **Expected**: Login success, correct organization data

**4c. New Employee**:
- Use credentials from Test 3  
- **Expected**: Login success, employee role, correct organization

**Session Verification**:
- Check browser dev tools → Application → Cookies
- Verify NextAuth session contains organization data

---

### Test 5: Organization Context Display ✨ **NEW**
**Objective**: Verify homepage shows organization information

**Test Steps**:
1. Login as any user (e.g., `admin@acme-corp.com`)
2. Check homepage displays:
   - Organization name in header ("Acme Corporation")
   - Personalized greeting with user's first name
   - User role (ADMIN/MANAGER/EMPLOYEE)
   - Plan type (Basic/Professional/Enterprise)
   - Trial status if applicable

**Expected Results**:
- ✅ Header shows "SmartClock" + organization name
- ✅ Greeting shows user's first name
- ✅ Role and plan information visible
- ✅ Trial status displayed for trial accounts
- ✅ Sign out button available

**Cross-Organization Test**:
1. Login as `admin@acme-corp.com` → Note organization context
2. Logout and login as `admin@techstart.com` → Verify different context
3. **Expected**: Each shows their respective organization info

---

### Test 6: API Endpoints
**Objective**: Test organization lookup and validation

**6a. Organization Lookup**:
```bash
GET /api/organizations/lookup?slug=acme-corp
```
**Expected**: Organization details, available slots

**6b. Invalid Organization**:
```bash
GET /api/organizations/lookup?slug=nonexistent
```
**Expected**: 404 error

**6c. Employee Limit Check**:
- Try joining organization at employee limit
- **Expected**: 403 error with limit message

**6d. Email Reuse Test** ✨ **NEW**:
- Register employee with email `test@example.com` in `acme-corp`
- Register employee with same email `test@example.com` in `techstart`
- **Expected**: Both registrations succeed (different organizations)

---

### Test 12: Enhanced Location Verification 🆕
**Objective**: Verify strict geofencing validation and location cross-referencing

**Steps**:
1. Navigate to `/test-location` (Location Testing Tool)
2. Click "Use Current Location" to get your GPS coordinates
3. Click "Test Location" to see validation results
4. Note which locations are "IN_RANGE" vs "OUT_OF_RANGE"
5. Try manually entering coordinates of a work location (from Prisma Studio)
6. Test coordinates that are slightly outside the radius
7. Go back to main dashboard and try GPS check-in
8. Verify GPS check-in only works when "IN_RANGE"

**Expected Results**:
- ✅ Location testing tool shows accurate distance calculations
- ✅ Clear IN_RANGE/OUT_OF_RANGE status for each location
- ✅ GPS check-in blocked when out of range with detailed error message
- ✅ GPS check-in succeeds only when within geofence radius
- ✅ Success messages include location name and distance

**Demo Location Coordinates** (from setup data):
- Main Office: 40.7128, -74.0060 (10m radius)
- Warehouse: 40.7589, -73.9851 (10m radius)

**Test Coordinates for 10m Radius**:
- **Valid (within 10m of Main Office)**: 40.7128, -74.0059 (~5m away)
- **Invalid (outside 10m of Main Office)**: 40.7129, -74.0060 (~11m away)
- **Edge case (exactly ~10m away)**: 40.71289, -74.0060 (~10m away)

**Test Scenarios**:
1. **Valid Location**: Use coordinates within 10m of Main Office
2. **Invalid Location**: Use coordinates 20m+ away from any location
3. **Edge Case**: Use coordinates exactly at the 10m radius boundary

---

## 🐛 Common Issues & Fixes

### Issue: "Module not found" errors
**Fix**: Restart dev server, clear Next.js cache

### Issue: Database connection errors
**Fix**: Check `.env` file, verify Neon database URL

### Issue: Registration fails
**Fix**: Check browser console, verify API endpoints responding

### Issue: Session not persisting
**Fix**: Check NEXTAUTH_SECRET in `.env`

### Issue: Email already exists error ✅ **FIXED**
**Fix**: Applied database migration to allow same email across organizations

---

## 📊 Success Criteria

**Phase 1 Complete When**:
- [ ] All 6 tests pass
- [ ] 3 demo organizations created
- [ ] Organization registration works end-to-end
- [ ] Employee join flow functional
- [ ] Multi-tenant authentication working
- [ ] Organization context displayed on homepage ✨ **NEW**
- [ ] Data isolation verified
- [ ] API endpoints responding correctly
- [ ] Toast notifications working
- [ ] Email reuse across organizations working

---

## 🔄 Quick Validation Script

**Browser Console Test**:
```javascript
// Test organization context in session
fetch('/api/auth/session')
  .then(r => r.json())
  .then(data => {
    console.log('Organization:', data.user?.organizationName);
    console.log('Plan:', data.user?.planType);
    console.log('Role:', data.user?.role);
    console.log('Billing Status:', data.user?.billingStatus);
  });
```

---

## 📝 Test Results Log

**Date**: ___________  
**Tester**: ___________

| Test | Status | Notes |
|------|--------|-------|
| 1. Data Setup | ⬜ Pass ⬜ Fail | |
| 2. Org Registration | ⬜ Pass ⬜ Fail | |
| 3. Employee Join | ⬜ Pass ⬜ Fail | |
| 4. Authentication | ⬜ Pass ⬜ Fail | |
| 5. Organization Context | ⬜ Pass ⬜ Fail | ✨ NEW |
| 6. API Endpoints | ⬜ Pass ⬜ Fail | |
| 12. Enhanced Location Verification | ⬜ Pass ⬜ Fail | |

**Overall Phase 1 Status**: ⬜ READY FOR PHASE 2 ⬜ NEEDS FIXES

---

**Next**: Once all tests pass, proceed to Phase 2: Core Employee Features 

## Phase 2: Core Employee Features Testing 🚧

### Test 7: Real Clock In/Out System
**Objective**: Verify functional time tracking with database persistence

**Steps**:
1. Sign in as any employee (e.g., `alice@acme-corp.com` / `demo123`)
2. Navigate to dashboard - should show "Clocked Out" status
3. Click "Clock In" button
4. Verify status changes to "Clocked In" with green indicator
5. Check "Today's Hours" starts tracking time
6. Click "Start Break" button
7. Verify status changes to "On Break" with yellow indicator
8. Click "End Break" button
9. Verify status returns to "Clocked In"
10. Click "Clock Out" button
11. Verify status changes to "Clocked Out" and hours are calculated

**Expected Results**:
- ✅ Status transitions work correctly
- ✅ Time calculations are accurate
- ✅ Database persistence (refresh page, status maintained)
- ✅ Real-time updates every second

### Test 8: GPS Location Features
**Objective**: Test GPS-based geofencing and location verification

**Steps**:
1. Sign in as employee and navigate to dashboard
2. Allow location permissions when prompted
3. Check GPS status in clock-in methods section
4. If in range of work location, "GPS Check-in" should be enabled
5. Click "GPS Check-in" button
6. Verify clock-in with location data
7. Check Recent Activity shows location name

**Expected Results**:
- ✅ GPS permission requested and handled
- ✅ Location distance calculated correctly
- ✅ Geofencing validation works
- ✅ Location data stored with clock events

### Test 9: Personal Dashboard Data
**Objective**: Verify real-time dashboard updates and data accuracy

**Steps**:
1. Sign in and clock in for some time
2. Check "Today's Hours" updates in real-time
3. Verify "Recent Activity" shows clock events
4. Check "Quick Stats" displays current data
5. Take a break and verify all components update
6. Clock out and verify final calculations

**Expected Results**:
- ✅ Real-time hour tracking
- ✅ Activity history with timestamps
- ✅ Statistics calculations
- ✅ Consistent data across components

### Test 10: State Transition Validation
**Objective**: Test business logic and invalid state prevention

**Steps**:
1. Try to clock out when already clocked out
2. Try to start break when clocked out
3. Try to end break when not on break
4. Verify error messages are clear
5. Test rapid button clicking (loading states)

**Expected Results**:
- ✅ Invalid transitions prevented
- ✅ Clear error messages
- ✅ Loading states prevent double-clicks
- ✅ Consistent state management

### Test 11: Multi-Organization Data Isolation
**Objective**: Verify data isolation between organizations

**Steps**:
1. Sign in as user from Organization A
2. Clock in and create some activity
3. Sign out and sign in as user from Organization B
4. Verify no data from Organization A is visible
5. Create activity in Organization B
6. Switch back to Organization A
7. Verify Organization A data is preserved

**Expected Results**:
- ✅ Complete data isolation
- ✅ No cross-organization data leakage
- ✅ Organization-specific locations
- ✅ Independent time tracking

--- 