# SmartClock User Guide

Welcome to SmartClock, the modern time tracking solution for teams. This guide will help you get started and make the most of all features.

## 🚀 Getting Started

### Accessing SmartClock

**Production URL**: [https://clockwizard.vercel.app/](https://clockwizard.vercel.app/)

### First Time Setup

1. **Join Your Organization**
   - Use the invitation link provided by your administrator
   - Or visit the login page and enter your organization's slug
   - Create your account with email and password

2. **Enable Location Services**
   - Allow GPS access when prompted
   - This enables location-verified clock-in/out
   - You can still use manual clock-in if GPS is unavailable

3. **Complete Your Profile**
   - Verify your email address
   - Set up your profile information
   - Review your organization's time tracking policies

## 👤 Employee Dashboard

### Main Interface

The employee dashboard is your central hub for time tracking:

- **Current Time Display** - Live clock with your local time
- **Clock Status** - Shows if you're clocked in, out, or on break
- **Today's Hours** - Real-time calculation of work hours
- **Recent Activity** - Live feed of your clock events
- **Location Status** - GPS accuracy and location verification

### Clock In/Out Process

#### GPS-Based Clock In (Recommended)

1. **Ensure GPS is Enabled**
   - Allow location access in your browser
   - Wait for "Location found ✓" indicator
   - Check that you're "In range of [Location Name]"

2. **Clock In**
   - Click the "Clock In" button
   - System verifies you're within 10 meters of work location
   - Confirmation message appears with location details

3. **Clock Out**
   - Click "Clock Out" when your work day ends
   - System calculates total hours worked
   - Break time is automatically deducted

#### Manual Clock In (Backup)

If GPS is unavailable:
1. Click "Clock In" button
2. Select "Manual" method
3. Add optional notes about your location
4. Manager may need to approve manual entries

### Break Management

#### Starting a Break

1. Click "Start Break" button
2. Break timer begins automatically
3. Status changes to "On Break"
4. Break time is tracked separately

#### Ending a Break

1. Click "End Break" button
2. Return to "Clocked In" status
3. Break time is deducted from total hours
4. Continue normal work tracking

### Understanding Your Status

| Status | Description | Actions Available |
|--------|-------------|-------------------|
| **Clocked Out** | Not currently working | Clock In |
| **Clocked In** | Currently working | Clock Out, Start Break |
| **On Break** | Taking a break | End Break |

### Recent Activity Feed

The recent activity section shows:
- **Clock Events** - In, out, break start/end
- **Timestamps** - Exact time of each action
- **Location** - Where the action occurred
- **Method** - GPS, Manual, or QR Code
- **Auto-Refresh** - Updates automatically when you perform actions

### Today's Hours Calculation

Your hours are calculated in real-time:
- **Work Time** = Clock In to Clock Out
- **Break Time** = Total break duration
- **Net Hours** = Work Time - Break Time
- **Live Updates** - Refreshes every minute while clocked in

## 👔 Manager Dashboard

### Accessing Manager Features

Managers and Admins can access additional features:
1. Navigate to `/manager` or use the navigation menu
2. View real-time team status
3. Monitor team activity and performance

### Team Status Overview

The manager dashboard provides:

#### Real-Time Team View
- **Employee List** - All team members
- **Current Status** - Who's working, on break, or out
- **Today's Hours** - Hours worked by each employee
- **Location** - Where each employee clocked in
- **Last Activity** - Most recent clock event

#### Team Statistics
- **Total Employees** - Team size
- **Currently Working** - Active employees
- **On Break** - Employees taking breaks
- **Clocked Out** - Employees not working
- **Total Hours Today** - Combined team hours
- **Average Hours** - Per employee average

### Team Activity Monitoring

#### Activity Feed
- **Real-Time Updates** - Live team activity
- **Employee Actions** - Clock in/out events
- **Location Verification** - GPS validation results
- **Time Stamps** - Precise timing of events

#### Filtering and Search
- **Date Range** - View historical activity
- **Employee Filter** - Focus on specific team members
- **Action Type** - Filter by clock in, out, breaks
- **Location Filter** - View activity by work site

## 📍 Location Features

### GPS Verification

SmartClock uses GPS to verify your location:

#### How It Works
1. **Location Request** - Browser asks for GPS permission
2. **Coordinate Capture** - System gets your exact location
3. **Distance Calculation** - Measures distance to work locations
4. **Validation** - Confirms you're within allowed radius (typically 10m)

#### GPS Status Indicators

| Indicator | Meaning | Action |
|-----------|---------|---------|
| 🔍 **Getting location...** | Requesting GPS | Wait for location |
| ✅ **Location found** | GPS successful | Ready to clock in |
| ❌ **GPS Error** | Location failed | Try manual clock in |
| 📍 **In range of [Location]** | Within work area | Can clock in with GPS |
| ⚠️ **[X]m away from [Location]** | Outside work area | Move closer or use manual |

### Multiple Locations

Organizations can have multiple work sites:
- **Automatic Detection** - System finds closest location
- **Distance Display** - Shows distance to each site
- **Range Validation** - Each location has its own radius
- **Location Names** - Clear identification of work sites

### Troubleshooting GPS Issues

#### Common Problems and Solutions

**GPS Not Working**
- Enable location services in browser settings
- Refresh the page and allow location access
- Try using a different browser
- Use manual clock-in as backup

**"Outside Range" Error**
- Move closer to the designated work area
- Check if you're at the correct location
- Contact your manager if location settings are incorrect
- Use manual clock-in with explanation

**Slow GPS Response**
- Wait up to 30 seconds for GPS lock
- Ensure you're not indoors with poor signal
- Try moving to a window or outside briefly
- GPS accuracy improves with time

## 🔧 Settings and Preferences

### Profile Settings

Access your profile settings to:
- **Update Personal Information** - Name, email, contact details
- **Change Password** - Secure password updates
- **Notification Preferences** - Email and browser notifications
- **Time Zone Settings** - Ensure accurate time tracking

### Privacy Settings

Control your data and privacy:
- **Location Data** - Understand how GPS data is used
- **Activity Tracking** - What information is recorded
- **Data Retention** - How long data is stored
- **Export Data** - Download your personal data

## 📱 Mobile Usage

### Mobile Browser Experience

SmartClock is optimized for mobile browsers:
- **Responsive Design** - Works on all screen sizes
- **Touch-Friendly** - Large buttons and easy navigation
- **GPS Integration** - Full location features on mobile
- **Offline Indicators** - Shows when connection is lost

### Mobile Best Practices

1. **Add to Home Screen** - Create app-like experience
2. **Enable Notifications** - Get clock-in reminders
3. **Keep GPS Enabled** - For accurate location tracking
4. **Use WiFi When Available** - Faster loading and updates

## 🚨 Troubleshooting

### Common Issues

#### Can't Clock In
**Symptoms**: Clock In button doesn't work or shows error
**Solutions**:
1. Check your current status - you might already be clocked in
2. Verify GPS location if using location-based clock in
3. Try refreshing the page
4. Contact your manager if problem persists

#### GPS Not Accurate
**Symptoms**: System says you're outside range when you're at work
**Solutions**:
1. Wait for GPS to get better accuracy (up to 1 minute)
2. Move to an area with better sky visibility
3. Try refreshing location by reloading the page
4. Use manual clock-in and notify your manager

#### Hours Not Calculating Correctly
**Symptoms**: Today's hours seem wrong
**Solutions**:
1. Check if you have any incomplete clock events
2. Verify break times are properly ended
3. Look at recent activity for any missing events
4. Contact your manager to review your timesheet

#### Page Won't Load
**Symptoms**: SmartClock won't open or loads slowly
**Solutions**:
1. Check your internet connection
2. Try a different browser or incognito mode
3. Clear browser cache and cookies
4. Contact IT support if problem continues

### Getting Help

#### Self-Service Options
1. **Check Recent Activity** - Review your clock events
2. **Refresh the Page** - Solves many temporary issues
3. **Try Different Browser** - Rules out browser-specific problems
4. **Check GPS Settings** - Ensure location services are enabled

#### Contact Support
- **Manager** - For time tracking questions and approvals
- **HR Department** - For policy and procedure questions
- **IT Support** - For technical issues and access problems
- **System Administrator** - For organization settings and user management

## 📊 Understanding Reports

### Personal Time Reports

View your time tracking data:
- **Daily Summary** - Hours worked each day
- **Weekly Totals** - Total hours per week
- **Monthly Overview** - Monthly time tracking summary
- **Break Analysis** - Break patterns and duration

### Accessing Your Data

1. **Recent Activity** - Last 5 clock events on dashboard
2. **Today's Summary** - Current day hours and status
3. **Historical Data** - Request reports from your manager
4. **Export Options** - Download your time data (coming soon)

## 🔒 Security and Privacy

### Data Protection

SmartClock protects your information:
- **Encrypted Data** - All data is encrypted in transit and at rest
- **Organization Isolation** - Your data is separate from other companies
- **Access Controls** - Only authorized users can see your information
- **Audit Trails** - All actions are logged for security

### Location Privacy

Your GPS data is handled responsibly:
- **Minimal Storage** - Only necessary location precision is stored
- **Work Use Only** - Location is only tracked during work hours
- **No Personal Tracking** - System doesn't track you outside work
- **Data Retention** - Location data follows company retention policies

### Your Rights

You have the right to:
- **View Your Data** - See all information stored about you
- **Correct Errors** - Request corrections to inaccurate data
- **Data Export** - Download your personal time tracking data
- **Privacy Questions** - Contact your organization's privacy officer

## 🆕 Recent Updates

### Latest Improvements

**Real-Time Activity Updates**
- Recent activity now refreshes automatically when you clock in/out
- No need to manually refresh the page
- Live synchronization between dashboard components

**Improved GPS Handling**
- Better error messages for GPS issues
- Faster location detection
- More accurate distance calculations

**Enhanced User Experience**
- Smoother transitions between clock states
- Better visual feedback for actions
- Improved mobile responsiveness

**Performance Optimizations**
- Faster page loading
- Reduced data usage
- Better offline handling

### Coming Soon

- **QR Code Clock-In** - Alternative to GPS for indoor locations
- **Push Notifications** - Browser notifications for clock-in reminders
- **Offline Mode** - Limited functionality when internet is unavailable
- **Advanced Reporting** - Detailed personal time analytics

---

## 📞 Support Information

**Need Help?**
- **Documentation**: Check this user guide first
- **Manager**: Contact your direct supervisor
- **HR**: Reach out to your HR department
- **Technical Issues**: Contact your IT support team

**Emergency Contact**
If you cannot clock in/out due to system issues, immediately notify your manager and document your work hours manually.

---

**SmartClock** - Making time tracking simple and accurate for everyone 🕐 