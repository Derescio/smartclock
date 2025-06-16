# SmartClock SaaS - Time Tracking Platform

A comprehensive multi-tenant time tracking SaaS platform built with Next.js 15, featuring GPS-based clock-in, real-time team management, schedule management, and enterprise-grade timesheet generation.

🌐 **Live Demo**: [https://clockwizard.vercel.app/](https://clockwizard.vercel.app/)

## 🚀 Features

### ✅ Core Time Tracking (IMPLEMENTED)
- **GPS-Based Clock In/Out** - Location-verified time tracking with geofencing support
- **Real-Time Dashboard** - Live time display with automatic status updates
- **Break Management** - Start/end breaks with automatic time calculations
- **Recent Activity Feed** - Live feed of clock events with location details
- **Today's Hours Calculation** - Real-time calculation of work hours including breaks
- **Multiple Clock Methods** - Manual, QR Code, and Geofence-based time tracking
- **Status Management** - CLOCKED_IN, CLOCKED_OUT, ON_BREAK status tracking

### ✅ Schedule Management System (IMPLEMENTED)
- **Flexible Schedule Creation** - 4-step wizard for creating detailed work schedules
- **Multiple Assignment Types** - Individual, Team, Department, and Location-based assignments
- **Schedule Types** - Regular shifts, meetings, training, events, overtime, and on-call duty
- **Recurring Schedules** - Daily, weekly, bi-weekly, monthly, and custom recurrence patterns
- **Real-time Schedule Viewing** - Employees see their daily schedules with all assignment details
- **Schedule Approval Workflow** - Manager approval system with pending/approved/rejected statuses
- **Smart Schedule Filtering** - Automatic filtering by day-of-week for recurring schedules
- **Schedule Editing** - Full edit capabilities with pre-filled forms and validation

### ✅ Comprehensive Timesheet System (IMPLEMENTED)
- **Automatic Timesheet Generation** - Convert clock events into formal timesheets
- **Weekly Time Tracking** - Detailed daily breakdown with clock in/out times and breaks
- **Hours Calculation** - Automatic calculation of regular hours, overtime, and break time
- **Timesheet History** - Complete history with status tracking and approval workflow
- **Real-time Weekly Overview** - Live weekly hours display with daily breakdowns
- **Export Functionality** - Export timesheets for payroll and compliance
- **Status Management** - Draft, pending, approved, and rejected timesheet statuses
- **Employee Self-Service** - Employees can generate and view their own timesheets

### ✅ Team Management & Collaboration (IMPLEMENTED)
- **Team Creation & Management** - Create teams with managers, members, and custom colors
- **Bulk Schedule Assignment** - Assign schedules to entire teams for efficient management
- **Team-based Scheduling** - Employees automatically receive team-assigned schedules
- **Team Statistics** - Real-time team metrics including member counts and activity
- **Visual Team Organization** - Color-coded teams with member management interface
- **Team Member Management** - Add/remove members with role assignments

### ✅ Employee & Department Management (IMPLEMENTED)
- **Complete Employee CRUD** - Full employee lifecycle management
- **Department Organization** - Create, edit, and manage departments with custom colors
- **Advanced Search & Filtering** - Find employees by name, email, role, department, or status
- **Employee Status Management** - Activate/deactivate employees with visual indicators
- **Role-Based Access Control** - Employee, Manager, Admin, and Super Admin roles
- **Real-time Statistics** - Live employee counts, department breakdowns, and role distribution

### ✅ Manager Dashboard & Analytics (IMPLEMENTED)
- **Team Overview Dashboard** - Real-time team status and activity monitoring
- **Live Team Statistics** - Currently working, on break, and clocked out counts
- **Hours Tracking** - Total hours worked today across all employees
- **Attendance Analytics** - Attendance rates and employee participation metrics
- **Recent Activity Monitoring** - Live feed of all team clock events
- **Department Analytics** - Department-wise employee distribution and management
- **Schedule Management** - Create, edit, approve, and manage all organization schedules

### ✅ Enhanced User Onboarding (IMPLEMENTED)
- **Progressive Registration Flow** - 3-step guided onboarding with visual progress tracking
- **Organization Discovery** - Smart company code lookup with helpful error guidance
- **Welcome Experience** - Personalized welcome page with confetti animations and next steps
- **Guided Tour** - Interactive feature tour for new users with step-by-step walkthroughs
- **File Upload Integration** - Seamless avatar and document uploads during registration
- **Authentication-Free Uploads** - Temporary file storage for pre-registration uploads

### ✅ Marketing & Public Pages (IMPLEMENTED)
- **Comprehensive Features Page** - Detailed showcase of all platform capabilities
- **Responsive Navigation** - Consistent navigation across landing, features, pricing, and resources
- **Modern UI Design** - Professional design with hover effects and visual feedback
- **Call-to-Action Integration** - Strategic placement of trial signup and pricing links

### ✅ Multi-Tenant Architecture (IMPLEMENTED)
- **Organization Isolation** - Complete data separation between organizations
- **Location Management** - Multiple work locations with GPS geofencing
- **API Infrastructure** - Complete REST API with real-time capabilities
- **Database Schema** - Comprehensive Prisma schema with all relationships

### ✅ Enterprise Features (IMPLEMENTED)
- **Subscription Plans** - Basic, Professional, and Enterprise tiers
- **Trial Management** - Free trial with automatic billing transitions
- **Advanced Analytics** - Team performance metrics and reporting
- **Audit Logging** - Complete activity tracking for compliance

## 🛠 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with custom session management
- **Styling**: Tailwind CSS with shadcn/ui components
- **Deployment**: Vercel with automatic CI/CD
- **Type Safety**: 100% TypeScript with comprehensive type definitions

## 📁 Project Structure

```
smartclock/
├── actions/                 # Centralized server actions hub (2,000+ lines)
│   ├── auth.ts             # Authentication actions (110 lines)
│   ├── clock.ts            # Time tracking actions (456 lines) ✅ COMPLETE
│   ├── team.ts             # Team management actions (361 lines) ✅ COMPLETE
│   ├── employees.ts        # Employee CRUD operations ✅ COMPLETE
│   ├── schedules.ts        # Schedule management actions (535 lines) ✅ COMPLETE
│   ├── timesheets.ts       # Timesheet generation & management (379 lines) ✅ COMPLETE
│   ├── teams.ts            # Team creation & management (250 lines) ✅ COMPLETE
│   ├── locations.ts        # Location management actions (280 lines) ✅ COMPLETE
│   ├── organizations.ts    # Organization actions (331 lines) ✅ COMPLETE
│   └── index.ts            # Unified exports with role-based permissions
├── app/
│   ├── (auth)/             # Authentication and onboarding flows ✅ COMPLETE
│   │   ├── join/           # Progressive registration flow
│   │   └── welcome/        # Post-registration welcome experience
│   ├── api/                # API routes for client-side operations ✅ COMPLETE
│   │   ├── clock/          # Clock in/out API endpoints
│   │   ├── team/           # Team management APIs
│   │   └── locations/      # Location-based APIs
│   ├── components/         # Reusable UI components
│   │   ├── dashboard-client.tsx   # Enhanced employee dashboard with real schedules
│   │   ├── onboarding-tour.tsx    # Interactive guided tour
│   │   ├── uploadthing-upload.tsx # Enhanced file uploads
│   │   └── ...             # Other components
│   ├── timesheets/         # Employee timesheet management ✅ COMPLETE
│   │   ├── components/     # Timesheet UI components
│   │   │   └── timesheet-client.tsx # Full timesheet management interface
│   │   └── page.tsx        # Timesheet main page
│   ├── features/           # Comprehensive features showcase page ✅ COMPLETE
│   ├── pricing/            # Pricing plans and subscription information ✅ COMPLETE
│   ├── resources/          # Help center and documentation ✅ COMPLETE
│   ├── manager/            # Manager dashboard ✅ COMPLETE
│   │   ├── employees/      # Employee management system ✅ COMPLETE
│   │   ├── departments/    # Department management system ✅ COMPLETE
│   │   ├── schedules/      # Schedule management system ✅ COMPLETE
│   │   │   ├── create/     # Schedule creation wizard
│   │   │   ├── [id]/edit/  # Schedule editing interface
│   │   │   └── components/ # Schedule management components
│   │   ├── teams/          # Team management system ✅ COMPLETE
│   │   │   ├── create/     # Team creation interface
│   │   │   └── components/ # Team management components
│   │   └── page.tsx        # Manager overview dashboard ✅ COMPLETE
│   ├── dashboard/          # Employee dashboard ✅ COMPLETE
│   └── page.tsx            # Landing page ✅ COMPLETE
├── docs/                   # Comprehensive documentation
├── lib/                    # Utilities and configurations
├── prisma/                 # Database schema and migrations ✅ COMPLETE
├── types/                  # TypeScript type definitions ✅ COMPLETE
│   └── teams.ts            # Team-related type definitions
└── README.md
```

## 🏗 Architecture Highlights

### Centralized Actions Hub
All business logic is organized in a centralized actions folder with 2,000+ lines of code:
- **auth.ts** (110 lines) - User authentication and session management ✅
- **clock.ts** (456 lines) - Complete time tracking with GPS validation ✅
- **team.ts** (361 lines) - Team management and analytics ✅
- **schedules.ts** (535 lines) - Complete schedule management system ✅
- **timesheets.ts** (379 lines) - Timesheet generation and management ✅
- **teams.ts** (250 lines) - Team creation and collaboration features ✅
- **employees.ts** - Employee CRUD operations with department support ✅
- **locations.ts** (280 lines) - Location management with geofencing ✅
- **organizations.ts** (331 lines) - Multi-tenant organization handling ✅

### Mixed Architecture Pattern
Strategic combination of server actions and API routes:
- **Server Actions**: Data mutations with `revalidatePath` for cache management ✅
- **API Routes**: Client-side fetching for real-time updates ✅
- **Client State**: Immediate UI feedback and component coordination ✅

### Type Safety
Comprehensive TypeScript implementation with 300+ lines of type definitions:
- Zero `any` types in production code ✅
- Extended NextAuth types for multi-tenant sessions ✅
- Prisma-generated types for database operations ✅
- Custom interfaces for all API contracts ✅
- Dedicated type files for complex features (teams, schedules, timesheets) ✅

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Derescio/smartclock.git
   cd smartclock
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Configure your `.env` file:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/smartclock"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📊 Current Status

### Development Progress
- **Phase 1 (SaaS Foundation)**: ✅ 100% Complete
- **Phase 2 (Core Time Tracking)**: ✅ 100% Complete
- **Phase 3 (Employee Management)**: ✅ 100% Complete
- **Phase 4 (Manager Dashboard)**: ✅ 100% Complete
- **Phase 5 (Schedule Management)**: ✅ 100% Complete
- **Phase 6 (Timesheet System)**: ✅ 100% Complete
- **Phase 7 (Team Collaboration)**: ✅ 100% Complete
- **Overall Completion**: ~95%

### ✅ Recently Completed Features
- ✅ **Complete Schedule Management System** - 4-step wizard, multiple assignment types, recurring schedules
- ✅ **Employee Schedule Viewing** - Real-time schedule display on employee dashboard
- ✅ **Comprehensive Timesheet System** - Automatic generation from clock events, weekly tracking
- ✅ **Team Management & Collaboration** - Team creation, bulk assignment, team-based scheduling
- ✅ **Advanced Time Calculations** - Regular hours, overtime, break time tracking
- ✅ **Schedule Approval Workflow** - Manager approval system with status tracking
- ✅ **Type Safety Improvements** - Eliminated all `any` types, added comprehensive interfaces
- ✅ **Employee Self-Service** - Timesheet generation, schedule viewing, time tracking

### 🎯 Employee Workflow (Complete)
1. **Login** → Employee dashboard shows today's real schedule
2. **Clock In/Out** → GPS-verified time tracking with location validation
3. **View Schedule** → Real-time schedule with assignment details (individual/team/department/location)
4. **Track Time** → Automatic break tracking and hours calculation
5. **Generate Timesheet** → Convert clock events to formal timesheets
6. **Review History** → View timesheet history with approval status

### 🎯 Manager Workflow (Complete)
1. **Team Overview** → Real-time dashboard with team statistics
2. **Create Schedules** → 4-step wizard with flexible assignment options
3. **Manage Teams** → Create teams, assign members, set colors and managers
4. **Approve Schedules** → Review and approve/reject schedule requests
5. **Monitor Activity** → Live team activity feed and attendance tracking
6. **Analytics** → Comprehensive team performance and hours analytics

## 🔧 Key Technical Achievements

### Database Schema
- **Complete Multi-tenant Architecture** - Organization isolation with proper relationships
- **Schedule System** - Flexible scheduling with recurring patterns and multiple assignment types
- **Timesheet Integration** - Automatic timesheet generation from clock events
- **Team Collaboration** - Team-based assignments and management
- **Audit Trail** - Complete activity logging for compliance

### Performance Optimizations
- **Efficient Queries** - Optimized Prisma queries with proper includes and filtering
- **Real-time Updates** - Strategic use of `revalidatePath` for cache management
- **Type Safety** - Zero runtime type errors with comprehensive TypeScript coverage
- **Component Architecture** - Reusable components with proper state management

### User Experience
- **Intuitive Interfaces** - Modern UI with clear navigation and visual feedback
- **Progressive Enhancement** - Features work without JavaScript where possible
- **Mobile Responsive** - Full mobile support for all features
- **Accessibility** - WCAG compliant with proper ARIA labels and keyboard navigation

## 🚀 Production Ready Features

The SmartClock platform is now production-ready with:
- ✅ **Complete Time Tracking** - Clock in/out, breaks, GPS validation
- ✅ **Schedule Management** - Creation, editing, approval, assignment
- ✅ **Timesheet System** - Generation, tracking, export capabilities
- ✅ **Team Collaboration** - Team-based scheduling and management
- ✅ **Manager Analytics** - Real-time dashboards and reporting
- ✅ **Employee Self-Service** - Complete employee portal functionality
- ✅ **Enterprise Security** - Multi-tenant isolation and role-based access
- ✅ **Scalable Architecture** - Built for growth with proper database design

The platform successfully handles the complete employee lifecycle from onboarding to daily time tracking, schedule management, and timesheet generation - all with enterprise-grade security and performance.

## 🔧 API Documentation

### Clock API Endpoints
- `GET /api/clock` - Get current clock status ✅
- `POST /api/clock` - Perform clock actions (in/out/break) ✅

### Team Management API
- `GET /api/team/status` - Get real-time team status ✅
- `GET /api/team/stats` - Get team statistics ✅
- `GET /api/team/activity` - Get recent team activity ✅

### Location API
- `GET /api/locations` - Get nearby locations ✅

## 🎯 Immediate Next Steps

Based on the current implementation, the recommended next development priorities are:

1. **Advanced Reporting Dashboard** - Build comprehensive analytics and reporting
2. **QR Code Integration** - Implement QR code-based clock stations
3. **Shift Scheduling** - Add employee scheduling capabilities
4. **Mobile PWA Enhancements** - Improve mobile experience with offline support
5. **Location Management UI** - Create admin interface for location management

The core time tracking functionality is complete and working, so focus should shift to advanced features that enhance the user experience and provide additional business value.

## 📝 Development Notes

- All core time tracking functionality is implemented and tested ✅
- Employee and department management systems are complete ✅
- Manager dashboard provides real-time team monitoring ✅
- API infrastructure supports all current features ✅
- Database schema is comprehensive and scalable ✅
- TypeScript implementation ensures type safety ✅

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Database ORM by [Prisma](https://prisma.io/)
- Authentication by [NextAuth.js](https://next-auth.js.org/)
- Deployed on [Vercel](https://vercel.com/)

---

**SmartClock** - Revolutionizing time tracking for modern teams 🕐
