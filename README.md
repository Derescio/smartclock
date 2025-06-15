# SmartClock SaaS - Time Tracking Platform

A comprehensive multi-tenant time tracking SaaS platform built with Next.js 15, featuring GPS-based clock-in, real-time team management, and enterprise-grade security.

🌐 **Live Demo**: [https://clockwizard.vercel.app/](https://clockwizard.vercel.app/)

## 🚀 Features

### Core Time Tracking
- **GPS-Based Clock In/Out** - Location-verified time tracking with 10m precision
- **Real-Time Dashboard** - Live time display with automatic status updates
- **Break Management** - Start/end breaks with automatic time calculations
- **Recent Activity** - Live feed of clock events with location details
- **Today's Hours** - Real-time calculation of work hours including breaks

### Enhanced User Onboarding
- **Progressive Registration Flow** - 3-step guided onboarding with visual progress tracking
- **Organization Discovery** - Smart company code lookup with helpful error guidance
- **Welcome Experience** - Personalized welcome page with confetti animations and next steps
- **Guided Tour** - Interactive feature tour for new users with step-by-step walkthroughs
- **File Upload Integration** - Seamless avatar and document uploads during registration
- **Authentication-Free Uploads** - Temporary file storage for pre-registration uploads

### Marketing & Public Pages
- **Comprehensive Features Page** - Detailed showcase of all platform capabilities
- **Responsive Navigation** - Consistent navigation across landing, features, pricing, and resources
- **Modern UI Design** - Professional design with hover effects and visual feedback
- **Call-to-Action Integration** - Strategic placement of trial signup and pricing links

### Multi-Tenant Architecture
- **Organization Isolation** - Complete data separation between organizations
- **Role-Based Access** - Employee, Manager, Admin, and Super Admin roles
- **Team Management** - Manager dashboard with team overview and analytics
- **Location Management** - Multiple work locations with GPS geofencing

### Enterprise Features
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
├── actions/                 # Centralized server actions hub
│   ├── auth.ts             # Authentication actions
│   ├── clock.ts            # Time tracking actions
│   ├── team.ts             # Team management actions
│   ├── locations.ts        # Location management actions
│   ├── organizations.ts    # Organization actions
│   └── index.ts            # Unified exports
├── app/
│   ├── (auth)/             # Authentication and onboarding flows
│   │   ├── join/           # Progressive registration flow
│   │   └── welcome/        # Post-registration welcome experience
│   ├── api/                # API routes for client-side operations
│   ├── components/         # Reusable UI components
│   │   ├── onboarding-tour.tsx    # Interactive guided tour
│   │   ├── uploadthing-upload.tsx # Enhanced file uploads
│   │   └── ...             # Other components
│   ├── features/           # Comprehensive features showcase page
│   ├── pricing/            # Pricing plans and subscription information
│   ├── resources/          # Help center and documentation
│   ├── manager/            # Manager dashboard
│   └── page.tsx            # Employee dashboard
├── docs/                   # Comprehensive documentation
│   ├── ONBOARDING_IMPROVEMENTS.md # Onboarding feature documentation
│   └── lessons.md          # Development lessons and best practices
├── lib/                    # Utilities and configurations
├── prisma/                 # Database schema and migrations
├── types/                  # TypeScript type definitions
└── README.md
```

## 🏗 Architecture Highlights

### Centralized Actions Hub
All business logic is organized in a centralized actions folder with 1,500+ lines of code:
- **auth.ts** (110 lines) - User authentication and session management
- **clock.ts** (456 lines) - Time tracking with GPS validation
- **team.ts** (361 lines) - Team management and analytics
- **locations.ts** (280 lines) - Location management with geofencing
- **organizations.ts** (331 lines) - Multi-tenant organization handling

### Mixed Architecture Pattern
Strategic combination of server actions and API routes:
- **Server Actions**: Data mutations with `revalidatePath` for cache management
- **API Routes**: Client-side fetching for real-time updates
- **Client State**: Immediate UI feedback and component coordination

### Type Safety
Comprehensive TypeScript implementation with 278 lines of type definitions:
- Zero `any` types in production code
- Extended NextAuth types for multi-tenant sessions
- Prisma-generated types for database operations
- Custom interfaces for all API contracts

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
- **Phase 2 (Core Features)**: ✅ 95% Complete
- **Overall Completion**: ~75%

### Recent Achievements
- ✅ Fixed production clock-in functionality
- ✅ Implemented real-time recent activity updates
- ✅ Optimized cache invalidation for multi-tenant environment
- ✅ Achieved 100% TypeScript type safety
- ✅ Deployed to production with automatic CI/CD
- ✅ Enhanced user onboarding with progressive registration flow
- ✅ Added welcome page with guided tour functionality
- ✅ Implemented authentication-free file uploads for registration
- ✅ Created visual progress tracking for multi-step onboarding
- ✅ Added comprehensive features page with detailed capability showcase
- ✅ Fixed navigation across all public pages (landing, features, pricing, resources)
- ✅ Implemented consistent UI design with proper accessibility features

### Remaining Features
- Employee Management System
- Advanced Reporting Dashboard
- Location Management UI
- Mobile App Optimization
- Email Notifications System
- Advanced API Development

## 🔧 Key Features Deep Dive

### Enhanced User Onboarding
```typescript
// Progressive 3-step registration with visual progress tracking
const getProgress = () => {
  switch (activeTab) {
    case "organization": return organizationInfo ? 33 : 10
    case "account": return isFormValid() ? 66 : 40
    case "files": return 100
    default: return 0
  }
}

// Smart organization lookup with helpful error handling
const lookupOrganization = async () => {
  const response = await fetch(`/api/organizations/lookup?slug=${slug}`)
  const data = await response.json()
  
  if (response.ok && data.organization) {
    setOrganizationInfo(data.organization)
    toast.success(`Found ${data.organization.name}! 🎉`)
    // Auto-advance to next step
    setTimeout(() => setActiveTab("account"), 1500)
  }
}

// Welcome page with guided tour
const handleStartTour = () => {
  setShowTour(true)
  // Interactive walkthrough of key features
}
```

### GPS Time Tracking
```typescript
// Automatic location validation with 10m precision
const validation = await validateUserLocation(
  user.organizationId,
  latitude,
  longitude
)

if (!validation.isValid) {
  return { 
    success: false, 
    error: `You are ${validation.distance}m away. Must be within ${validation.radius}m.` 
  }
}
```

### Real-Time Updates
```typescript
// Smart refresh strategy for live data
useEffect(() => {
  const timer = setInterval(() => {
    setCurrentTime(new Date())
    if (clockStatus?.currentStatus === "CLOCKED_IN" && new Date().getSeconds() === 0) {
      loadClockStatus() // Refresh on minute boundaries
    }
  }, 1000)
  return () => clearInterval(timer)
}, [clockStatus])
```

### Multi-Tenant Security
```typescript
// Organization isolation in all queries
const clockEvents = await prisma.clockEvent.findMany({
  where: {
    userId: user.id,
    organizationId: user.organizationId, // Critical for data isolation
    timestamp: { gte: startOfDay, lte: endOfDay }
  }
})
```

## 📚 Documentation

Comprehensive documentation totaling 2,674+ lines:

- **[Technical Documentation](docs/TECHNICAL.md)** (342 lines) - Architecture and implementation details
- **[API Reference](docs/API.md)** (485 lines) - Complete API documentation
- **[User Guide](docs/USER_GUIDE.md)** (249 lines) - End-user documentation
- **[Testing Guide](docs/TESTING_GUIDE.md)** (393 lines) - Testing strategies and scenarios
- **[Features Roadmap](docs/FEATURES_ROADMAP.md)** (215 lines) - Development roadmap
- **[Development Lessons](docs/lessons.md)** (259 lines) - Key learnings and best practices

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Key testing areas:
- Multi-tenant data isolation
- GPS location validation
- Real-time state synchronization
- Role-based access controls
- Time calculation accuracy

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Connect to Vercel**
   ```bash
   npm i -g vercel
   vercel
   ```

2. **Configure Environment Variables**
   Set up your production environment variables in the Vercel dashboard

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Database ORM by [Prisma](https://prisma.io/)
- Authentication by [NextAuth.js](https://next-auth.js.org/)
- Deployed on [Vercel](https://vercel.com/)

---

**SmartClock** - Revolutionizing time tracking for modern teams 🕐
