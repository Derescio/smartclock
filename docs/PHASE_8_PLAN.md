# Phase 8: SaaS Commercialization Plan

## 🎯 Objective
Transform SmartClock from demo platform to commercial SaaS with:
1. **Subdomain Infrastructure** - Individual company subdomains (company.smartclock.com)
2. **Payment Integration** - Stripe/PayPal functionality with tier-based billing

---

## 📊 Current Status (End of Phase 7)
- ✅ **Overall Completion**: ~95%
- ✅ **Core Features**: Complete time tracking, schedules, timesheets, team management
- ✅ **Multi-tenant Architecture**: Organization isolation in place
- ✅ **Pricing Tiers**: Defined but not enforced (Basic, Professional, Enterprise)
- ✅ **Production Ready**: 2,000+ lines of business logic, zero TypeScript errors

---

## 🚀 Phase 8A: Subdomain Infrastructure (Week 1-2)

### **Priority 1: Subdomain Routing System**
**Files to Create/Modify:**
- `middleware.ts` - Subdomain detection and routing
- `lib/subdomain.ts` - Subdomain utilities and validation
- `actions/organizations.ts` - Add subdomain management functions

**Implementation Details:**
```typescript
// middleware.ts - Core subdomain routing
- Extract subdomain from request URL
- Resolve organization from subdomain
- Route to organization-specific pages
- Handle main domain vs subdomain logic
- Fallback for non-existent subdomains
```

### **Priority 2: Database Schema Updates**
**Migration Required:**
```sql
-- Add subdomain fields to Organization table
ALTER TABLE Organization ADD COLUMN subdomain VARCHAR(50) UNIQUE;
ALTER TABLE Organization ADD COLUMN customDomain VARCHAR(100);
ALTER TABLE Organization ADD COLUMN isSubdomainActive BOOLEAN DEFAULT false;
ALTER TABLE Organization ADD COLUMN subdomainCreatedAt TIMESTAMP;

-- Create index for fast subdomain lookups
CREATE INDEX idx_organization_subdomain ON Organization(subdomain);
```

### **Priority 3: Subdomain Management Interface**
**New Components to Create:**
- `app/admin/subdomains/page.tsx` - Subdomain management dashboard
- `components/subdomain-checker.tsx` - Real-time availability checker
- `app/(auth)/join/subdomain-setup.tsx` - Subdomain selection during signup

**Features:**
- Subdomain availability checking
- Subdomain validation (alphanumeric, length limits)
- Subdomain reservation system
- Custom domain support for enterprise

### **Priority 4: Infrastructure Requirements**
**DNS Configuration:**
- Wildcard DNS: `*.smartclock.com` → Application server
- SSL Certificate: Wildcard SSL for `*.smartclock.com`
- CDN Setup: Cloudflare or similar for subdomain routing

**Environment Variables:**
```env
NEXT_PUBLIC_APP_DOMAIN=smartclock.com
NEXT_PUBLIC_APP_URL=https://app.smartclock.com
SUBDOMAIN_ENABLED=true
```

---

## 💳 Phase 8B: Payment Integration (Week 2-3)

### **Priority 1: Stripe Integration**
**New Files to Create:**
- `lib/stripe.ts` - Stripe client configuration
- `actions/subscriptions.ts` - Subscription management actions
- `app/api/webhooks/stripe/route.ts` - Stripe webhook handler
- `app/billing/page.tsx` - Billing dashboard

**Core Stripe Features:**
```typescript
// Subscription lifecycle management
- createSubscription(organizationId, priceId)
- updateSubscription(subscriptionId, newPriceId)
- cancelSubscription(subscriptionId, cancelAtPeriodEnd)
- handleTrialExpiration()
- processWebhookEvents()
```

### **Priority 2: Database Schema for Billing**
**New Tables Required:**
```sql
-- Subscription management
CREATE TABLE Subscription (
  id VARCHAR(30) PRIMARY KEY,
  organizationId VARCHAR(30) REFERENCES Organization(id),
  stripeCustomerId VARCHAR(50) UNIQUE,
  stripeSubscriptionId VARCHAR(50) UNIQUE,
  stripePriceId VARCHAR(50),
  tier SubscriptionTier NOT NULL,
  status SubscriptionStatus NOT NULL,
  currentPeriodStart TIMESTAMP,
  currentPeriodEnd TIMESTAMP,
  trialEnd TIMESTAMP,
  cancelAtPeriodEnd BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment history tracking
CREATE TABLE PaymentHistory (
  id VARCHAR(30) PRIMARY KEY,
  organizationId VARCHAR(30) REFERENCES Organization(id),
  subscriptionId VARCHAR(30) REFERENCES Subscription(id),
  stripeInvoiceId VARCHAR(50),
  amount INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status PaymentStatus NOT NULL,
  paidAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Usage tracking for billing
CREATE TABLE UsageMetrics (
  id VARCHAR(30) PRIMARY KEY,
  organizationId VARCHAR(30) REFERENCES Organization(id),
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  employeeCount INTEGER DEFAULT 0,
  locationCount INTEGER DEFAULT 0,
  clockEventsCount INTEGER DEFAULT 0,
  storageUsedMB INTEGER DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Priority 3: Tier-Based Feature Gating**
**New Files:**
- `lib/feature-gates.ts` - Feature limitation logic
- `hooks/use-subscription.ts` - Subscription status hook
- `components/upgrade-prompt.tsx` - Upgrade prompts for limited features

**Feature Limits by Tier:**
```typescript
const TIER_LIMITS = {
  BASIC: {
    employees: 10,
    locations: 1,
    teams: 3,
    storage: 1000, // MB
    features: ['time_tracking', 'basic_reports']
  },
  PROFESSIONAL: {
    employees: 100,
    locations: 5,
    teams: 20,
    storage: 10000, // MB
    features: ['time_tracking', 'advanced_reports', 'integrations']
  },
  ENTERPRISE: {
    employees: -1, // unlimited
    locations: -1,
    teams: -1,
    storage: -1,
    features: ['all']
  }
}
```

### **Priority 4: Billing Dashboard & User Interface**
**New Pages/Components:**
- `app/billing/page.tsx` - Main billing dashboard
- `app/billing/invoices/page.tsx` - Invoice history
- `app/billing/payment-methods/page.tsx` - Payment method management
- `components/billing/subscription-card.tsx` - Current subscription display
- `components/billing/usage-chart.tsx` - Usage monitoring charts

---

## 🔧 Technical Implementation Order

### **Week 1: Subdomain Foundation**
**Day 1-2: Core Routing**
- [ ] Create `middleware.ts` with subdomain detection
- [ ] Add subdomain utilities in `lib/subdomain.ts`
- [ ] Test basic subdomain routing locally

**Day 3-4: Database & Backend**
- [ ] Run database migration for subdomain fields
- [ ] Update organization actions for subdomain management
- [ ] Create subdomain availability checker API

**Day 5-7: User Interface**
- [ ] Build subdomain selection during signup
- [ ] Create subdomain management dashboard
- [ ] Test end-to-end subdomain flow

### **Week 2: Payment Infrastructure**
**Day 1-3: Stripe Setup**
- [ ] Configure Stripe client and environment
- [ ] Create subscription management actions
- [ ] Build webhook handler for payment events

**Day 4-5: Database & Billing Logic**
- [ ] Run billing database migrations
- [ ] Implement subscription lifecycle functions
- [ ] Create usage tracking system

**Day 6-7: Basic Billing UI**
- [ ] Build billing dashboard
- [ ] Create subscription management interface
- [ ] Test payment flows in Stripe test mode

### **Week 3: Feature Gating & Polish**
**Day 1-3: Feature Limitations**
- [ ] Implement tier-based feature gates
- [ ] Add upgrade prompts throughout app
- [ ] Test feature restrictions by tier

**Day 4-5: PayPal Integration (Optional)**
- [ ] Add PayPal as alternative payment method
- [ ] Create PayPal webhook handlers
- [ ] Test PayPal subscription flows

**Day 6-7: Testing & Documentation**
- [ ] End-to-end testing of subdomain + billing
- [ ] Update documentation
- [ ] Prepare for production deployment

---

## 🌐 Infrastructure Requirements

### **Domain & DNS Setup**
- **Primary Domain**: smartclock.com
- **Wildcard DNS**: `*.smartclock.com` → Application server
- **SSL Certificate**: Wildcard SSL certificate
- **CDN**: Cloudflare for subdomain routing and caching

### **Payment Processor Accounts**
- **Stripe**: Business account with webhook endpoints
- **PayPal**: Business account for alternative payments
- **Tax Handling**: Stripe Tax or manual tax calculation

### **Environment Variables Needed**
```env
# Subdomain Configuration
NEXT_PUBLIC_APP_DOMAIN=smartclock.com
NEXT_PUBLIC_APP_URL=https://app.smartclock.com
SUBDOMAIN_ENABLED=true

# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs for each tier
STRIPE_BASIC_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...

# PayPal Configuration (Optional)
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_WEBHOOK_ID=...
```

---

## 🎯 Success Criteria

### **Subdomain System**
- [ ] Every organization accessible via `company.smartclock.com`
- [ ] Subdomain availability checking works in real-time
- [ ] Proper fallback for non-existent subdomains
- [ ] SSL certificates work for all subdomains

### **Payment Integration**
- [ ] Automated subscription creation during signup
- [ ] Successful payment processing via Stripe
- [ ] Webhook handling for all payment events
- [ ] Customer portal for self-service billing

### **Feature Gating**
- [ ] Tier limits enforced across all features
- [ ] Upgrade prompts appear when limits reached
- [ ] Usage tracking accurate for billing
- [ ] Smooth upgrade/downgrade flows

### **Business Readiness**
- [ ] Platform ready for commercial launch
- [ ] Automated revenue collection
- [ ] Scalable multi-tenant architecture
- [ ] Professional subdomain branding

---

## 📝 Notes for Tomorrow

**Current State**: SmartClock is 95% complete with full workforce management features
**Next Phase**: Transform into commercial SaaS with subdomains + payments
**Priority**: Start with subdomain infrastructure (foundation for everything else)
**Timeline**: 2-3 weeks for complete Phase 8 implementation
**Impact**: Transforms demo platform into revenue-generating SaaS business

**First Task Tomorrow**: Begin with `middleware.ts` subdomain routing implementation

---

*Phase 8 will complete the transformation of SmartClock from a sophisticated demo into a commercial-ready SaaS platform capable of generating revenue and scaling to thousands of organizations.* 