# SmartClock - User Guide

## 📱 Getting Started

### System Requirements
- **Mobile**: iOS 12+ Safari, Android 8+ Chrome
- **Desktop**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Internet**: Required for initial setup, optional for clock in/out (future offline mode)

### First Time Login
1. Navigate to your SmartClock URL
2. Click "Sign In"
3. Enter your email and password provided by your administrator
4. You'll be redirected to your personalized dashboard

### Demo Accounts (Development)
- **Employee**: alice@smartclock.com / employee123
- **Manager**: manager@smartclock.com / manager123
- **Admin**: admin@smartclock.com / admin123

## 👤 Employee Features

### 🕐 Clocking In/Out

#### Standard Clock In
1. From the dashboard, locate the large "Clock In" button
2. The system automatically captures:
   - Current time and date
   - Your location (if GPS enabled)
   - Clock-in method used
3. Click "Clock In" - you'll see confirmation and status change

#### Clock Out Process
1. When ready to leave, click the "Clock Out" button
2. System calculates your work hours for the day
3. Confirmation shows total hours worked

#### Break Management
1. **Start Break**: Click "Start Break" when taking lunch/breaks
2. **End Break**: Click "End Break" when returning to work
3. Break time is automatically deducted from total hours

### 📍 Location-Based Clock In

#### GPS Clock In
- Ensure location services are enabled
- System verifies you're within the allowed work location radius
- Automatic approval if within geofence boundaries

#### QR Code Clock In
1. Click "QR Code" option
2. Scan the QR code posted at your work location
3. Instant verification and clock in

### 📊 Viewing Your Timesheet
1. Navigate to "Timesheets" (or scroll down on dashboard)
2. View current week's hours
3. See breakdown of:
   - Regular hours
   - Overtime hours  
   - Break time
   - Total hours

### ✅ Submitting Timesheet
1. At end of pay period, review your timesheet
2. Click "Submit for Approval"
3. Wait for manager approval
4. Receive notification of approval/rejection

## 👔 Manager Features

### 📈 Team Dashboard
- **Live Status**: See who's currently clocked in/out
- **Today's Summary**: Overview of team attendance
- **Recent Activity**: Latest clock events from your team

### ✅ Timesheet Approval
1. Navigate to "Timesheets" section
2. Review pending timesheets from your team
3. Options for each timesheet:
   - **Approve**: Accept timesheet as-is
   - **Reject**: Send back with comments
   - **Edit**: Modify hours before approval

### 📝 Editing Clock Events
1. Find the employee's timesheet
2. Click "Edit" on specific clock events
3. Adjust time, add notes, or correct location
4. Save changes and notify employee

### 👥 Team Management
- View all employees assigned to your locations
- Monitor attendance patterns
- Generate reports for HR/payroll

## 🔧 Admin Features

### 👤 User Management
1. **Add New User**:
   - Go to Admin Panel > Users
   - Click "Add User"
   - Fill in employee details, assign role and location
   - Generate temporary password

2. **Edit User**:
   - Find user in list
   - Update role, location, or status
   - Deactivate users who leave company

### 📍 Location Management
1. **Create Location**:
   - Go to Admin Panel > Locations
   - Enter location details
   - Set geofence radius
   - Generate QR code

2. **Edit Geofence**:
   - Adjust location coordinates
   - Modify allowed radius
   - Test geofence accuracy

### ⚙️ System Settings
- Configure overtime rules
- Set break time requirements
- Manage holiday calendar
- Export settings for payroll integration

## 📱 Mobile Usage Tips

### Best Practices
- **Enable Location Services**: For accurate GPS tracking
- **Add to Home Screen**: For quick access like a native app
- **Keep App Open**: During clock-in for better GPS accuracy
- **Check Connection**: Ensure stable internet for syncing

### Offline Mode (Future Feature)
- Clock events saved locally when offline
- Automatic sync when connection restored
- Visual indicator when operating offline

## 🆘 Troubleshooting

### Common Issues

#### Can't Clock In
**Problem**: Clock In button not working
**Solutions**:
1. Check internet connection
2. Refresh the page
3. Clear browser cache
4. Try different browser
5. Contact IT if issue persists

#### GPS Not Working
**Problem**: Location not detected
**Solutions**:
1. Enable location services in browser
2. Allow location access when prompted
3. Try QR code method as alternative
4. Move to area with better GPS signal

#### Login Issues
**Problem**: Can't sign in
**Solutions**:
1. Verify email and password
2. Check caps lock
3. Try password reset (if available)
4. Contact administrator for account issues

#### Timesheet Problems
**Problem**: Hours look incorrect
**Solutions**:
1. Check all clock in/out times
2. Verify break times are correct
3. Contact manager for corrections
4. Don't submit until verified

### Getting Help

#### For Employees
1. Check this user guide first
2. Ask your direct manager
3. Contact IT/HR department
4. Use in-app help (future feature)

#### For Managers
1. Refer to admin documentation
2. Contact system administrator
3. Review audit logs for issues
4. Escalate to IT if technical problem

#### For Admins
1. Check technical documentation
2. Review system logs
3. Contact development team
4. Check GitHub issues (if open source)

## 🔒 Privacy & Security

### Data Protection
- All data encrypted in transit and at rest
- GPS coordinates only stored for work verification
- Personal information protected per company policy
- Regular security audits and updates

### Privacy Controls
- Employees can view all their own data
- Managers only see their team's data
- Admins have full system access
- Audit logs track all data access

### GDPR Compliance (If Applicable)
- Right to view personal data
- Right to correct inaccurate data
- Right to delete data (with limitations)
- Data portability options

## 🔄 Updates & Maintenance

### System Updates
- Automatic updates during off-hours
- No action required from users
- Notification of new features
- Minimal downtime during updates

### Browser Updates
- Keep browsers updated for best experience
- Clear cache after major updates
- Report any issues with new browser versions

### Feature Requests
- Submit via feedback form (future)
- Discuss with administrator
- Prioritized based on user needs
- Regular feature releases planned

## 📞 Support Contacts

### Internal Support
- **IT Help Desk**: [Your IT contact]
- **HR Department**: [Your HR contact]
- **Manager**: [Direct supervisor]
- **System Admin**: [Admin contact]

### Technical Support
- **Developer**: [Development team contact]
- **Documentation**: Check GitHub/docs folder
- **Bug Reports**: [Bug reporting process]
- **Feature Requests**: [Feature request process] 