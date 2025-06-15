# 🕐 SmartClock - SaaS Employee Time Tracking Platform

> Modern, multi-tenant SaaS platform for employee time tracking with GPS geofencing, real-time monitoring, and organization management.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.9-2D3748?logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

## 🚀 SaaS Pricing Tiers

- **Basic Plan**: 50 employees - $10/month
- **Professional Plan**: 100 employees - $20/month  
- **Enterprise Plan**: Unlimited employees - $65/month

### Enterprise Features
- Advanced analytics and reporting
- API access for integrations
- Custom branding/white-labeling
- Advanced geofencing capabilities
- Priority support

---

## ✨ Key Features

### 🏢 **Multi-Tenant SaaS Architecture**
- Organization-based data isolation
- Self-service organization registration
- Employee invitation system
- Plan-based feature limits and billing

### 📱 **Real-Time Clock In/Out System**
- Functional time tracking with database persistence
- Real-time employee status monitoring
- Break management (start/end breaks)
- Automatic time calculations with overtime detection

### 🗺️ **Advanced Location & GPS Features**
- GPS location verification with 10m precision geofencing
- Distance calculation and in-range detection
- Location-based restrictions and validation
- QR code scanning for check-in (planned)

### 👤 **Personal Dashboard**
- Real-time employee timesheet view
- Current status display with live updates
- Today's hours tracking with break time
- Recent activity history with location data

### 📊 **Mobile-Optimized Interface**
- Touch-friendly responsive design
- GPS permission handling
- Real-time data synchronization
- Progressive Web App capabilities (planned)

## 🏗️ Current Status

**Phase**: 🚧 Phase 2 - Core Employee Features (75% Complete)  
**Overall Progress**: 75% Complete

### ✅ **Phase 1 Complete - SaaS Foundation**
- Multi-tenant architecture with organization isolation
- Organization registration flow (3-step process)
- Employee join flow with company lookup
- NextAuth with organization context
- Trial period management (14 days)

### ✅ **Phase 2 Complete - Core Features**
- Real clock in/out system with state validation
- GPS geofencing with 10m precision
- Location verification and distance calculation
- Personal dashboard with real-time updates
- Break management and time calculations

### 📋 **Phase 3 Planned - Management Features**
- Manager dashboard and team oversight
- Timesheet approval workflows
- Employee management and reporting
- Organization settings and configuration

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | Next.js 15 (App Router) + React 19 |
| **Styling** | Tailwind CSS v3 + shadcn/ui |
| **Backend** | Next.js API Routes |
| **Database** | PostgreSQL + Prisma ORM |
| **Authentication** | NextAuth.js with JWT |
| **Deployment** | Vercel Ready |

## 🚦 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (Neon recommended)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/smartclock.git
cd smartclock

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your database credentials

# Setup database
npx prisma db push
npx prisma generate

# Create demo organizations and users
curl -X POST http://localhost:3000/api/setup

# Start development server
npm run dev
```

### Demo Credentials

**Organization Registration**: Visit `/register` to create a new organization

**Existing Demo Organizations**:
- **Acme Corporation**: `admin@acme-corp.com` / `demo123`
- **TechStart Inc**: `alice@techstart.com` / `demo123`
- **Enterprise Solutions**: `manager@enterprise-sol.com` / `demo123`

## 🎯 Core Workflows

### 🏢 **Organization Setup**
1. **Register Organization** → 3-step wizard (company → admin → plan)
2. **Invite Employees** → Share company join link
3. **Configure Locations** → Set GPS geofences and QR codes
4. **Start Tracking** → Employees can immediately clock in/out

### 👤 **Employee Experience**
1. **Join Organization** → Use company join link or slug
2. **Clock In** → GPS verification within 10m of work location
3. **Work & Breaks** → Real-time tracking with break management
4. **Clock Out** → Automatic hours calculation
5. **View Dashboard** → Real-time status and activity history

### 👔 **Manager Experience** (Phase 3)
1. **Team Dashboard** → Real-time employee status
2. **Review Timesheets** → Approve/reject with comments
3. **Manage Locations** → Configure geofences
4. **Generate Reports** → Export for payroll

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register-organization` - Create new organization
- `POST /api/auth/join-organization` - Join existing organization
- `GET /api/organizations/lookup` - Find organization by slug

### Time Tracking
- `POST /api/clock` - Clock in/out with GPS validation
- `GET /api/clock` - Get current status and today's events
- `GET /api/locations` - Get organization locations with distances
- `POST /api/locations/verify` - Test location validation

### Setup & Demo
- `POST /api/setup` - Create demo organizations and users

## 🧪 Testing

Visit `/test-location` for GPS geofencing testing tool.

**Test Coordinates** (10m radius):
- **Valid**: `40.7128, -74.0059` (within range)
- **Invalid**: `40.7129, -74.0060` (out of range)

See [Testing Guide](docs/TESTING_GUIDE.md) for comprehensive test scenarios.

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [📋 Features Roadmap](docs/FEATURES_ROADMAP.md) | Complete feature checklist and milestones |
| [🔧 Technical Docs](docs/TECHNICAL.md) | Architecture, database schema, and development |
| [🔌 API Documentation](docs/API.md) | Complete API reference with examples |
| [👤 User Guide](docs/USER_GUIDE.md) | End-user documentation for all roles |
| [🧪 Testing Guide](docs/TESTING_GUIDE.md) | Comprehensive testing scenarios |

## 🔐 Security Features

- 🔒 **Multi-tenant data isolation** - Complete organization separation
- 🎯 **10m GPS precision** - Prevents location spoofing
- 👤 **Role-based access control** - Employee/Manager/Admin permissions
- 📝 **Audit trails** - Complete activity logging
- 🛡️ **Input validation** - Server-side validation for all operations

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📖 **Documentation**: Check the [docs](docs/) folder
- 🐛 **Bug Reports**: Create an issue with bug template
- 💡 **Feature Requests**: Create an issue with feature template
- 💬 **Questions**: Use GitHub Discussions

---

**Made with ❤️ for modern workplaces**

*SmartClock - Enterprise-grade time tracking for the SaaS era*
