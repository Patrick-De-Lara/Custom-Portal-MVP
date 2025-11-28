# Technical Development Notes

## What Was Built

### Core Application
- **Full-stack Customer Portal** - Complete web application for service business customers
- **Authentication System** - JWT-based login with email, phone, and password
- **Booking Management** - Access available Booking data either in Local Database or Servicem8 Bookings
- **File Attachment System** - Upload and manage files per booking
- **Messaging System** - Customer-admin communication threads per booking
- **ServiceM8 Integration** - Two-way sync with ServiceM8 field service management platform

### Technology Stack
- **Frontend**: Next.js 14 with App Router, TypeScript, CSS Modules
- **Backend**: Express.js with TypeScript, Sequelize ORM
- **Database**: MySQL with auto-generated tables and relationships
- **Authentication**: JWT tokens (7-day expiry) with bcrypt password hashing
- **External API**: ServiceM8 REST API v1.0 integration
- **Admin Tools**: HTML-based ServiceM8 management interface

### Key Features Implemented
- Auto-sync ServiceM8 jobs when customers view bookings
- Visual badges for ServiceM8-synced vs local bookings
- Attachment syncing from ServiceM8 with constructed download URLs
- Status mapping between ServiceM8 and portal systems
- Admin endpoints for customer-company linking and bulk syncing
- Responsive UI with proper loading states and error handling

---

## Reasoning Behind Approach

### Architecture Decisions

**1. Separation of Concerns**
- Clear separation between frontend (Next.js) and backend (Express.js)
- API-first design allows for future mobile app or third-party integrations
- Modular controller structure for maintainable business logic

**2. Database Design**
- Nullable ServiceM8 fields (`servicem8_job_uuid`, `servicem8_company_uuid`) allow app to work standalone
- Dual-mode operation: pure local bookings OR ServiceM8-synced bookings
- Foreign key relationships maintain data integrity

**3. ServiceM8 Integration Strategy**
- **Pull-based sync** rather than webhooks for simplicity and reliability
- **Auto-sync on page load** ensures customers see latest data without manual refresh
- **Lazy attachment loading** - attachments sync only when viewing specific booking
- **Idempotent sync** - duplicate detection prevents data duplication

**4. Authentication Approach**
- Multi-factor login (email + phone + password) for enhanced security
- JWT tokens stored in localStorage for stateless backend
- Middleware-based route protection for clean separation

**5. Display Data only**
- because of no Onsite Create, Update, Delete on the page. Only Retrieving Data are implemented as to show the bookings both locally inserted Data and Servicem8 booking data.

### Technical Choices

**1. Next.js 14 with App Router**
- Modern React patterns with server components
- File-based routing for intuitive page organization
- Built-in optimization and performance benefits

**2. Sequelize ORM**
- Type-safe database operations with TypeScript
- Auto-migration capabilities for development
- Association handling for complex relationships

**3. CSS Modules**
- Scoped styling prevents conflicts
- Component-level organization
- Better than global CSS for maintainability
- Potential improvements of CSS is using TailwindCSS with enough time

---

## Assumptions Made

### Business Requirements
- **Customer-focused portal** - designed for end customers, not admin users
- **ServiceM8 as primary data source** - local bookings are secondary/fallback
- **Read-only ServiceM8 integration** - portal doesn't modify ServiceM8 data
- **Simple messaging** - basic customer-admin communication, no real-time chat

### Technical Assumptions
- **Development environment** - XAMPP for local MySQL, not production-ready
- **Single-tenant** - one ServiceM8 account per portal instance
- **Trust in ServiceM8 API** - minimal validation of incoming ServiceM8 data
- **No file uploads** - attachments are links/references, not actual file storage

### User Behavior
- **Customers primarily view data** - limited creation of new bookings
- **Admin manages ServiceM8 externally** - portal is for customer access
- **Internet connectivity** - ServiceM8 sync requires active connection
- **Modern browsers** - no legacy browser support considerations

### Security Context
- **Development security** - JWT secrets and API keys suitable for dev only
- **Trusted network** - no rate limiting or advanced security measures
- **Admin trust** - ServiceM8 admin endpoints unprotected (noted for production)

---

## Potential Improvements

### Immediate Enhancements
- **Real file uploads** - implement actual file storage vs URL references
- **Admin authentication** - protect ServiceM8 admin endpoints with proper auth
- **Error boundaries** - React error boundaries for better UX
- **Loading states** - skeleton screens during data fetching
- **Form validation** - client and server-side validation improvements

### ServiceM8 Integration
- **Webhook support** - real-time sync instead of pull-based
- **Bidirectional messaging** - sync portal messages to ServiceM8 activities/notes
- **Field mapping UI** - admin interface to customize ServiceM8 field mappings
- **Bulk operations** - batch processing for large data sets
- **Incremental sync** - only sync changed records since last update

### Architecture Improvements
- **Caching layer** - Redis for ServiceM8 data caching
- **Background jobs** - queue system for sync operations
- **Database migrations** - proper migration system instead of auto-sync
- **API versioning** - versioned endpoints for backward compatibility
- **Logging system** - structured logging with levels and rotation

### User Experience
- **Push notifications** - notify customers of new messages/updates
- **Mobile responsiveness** - better mobile experience
- **Dark mode** - theme switching capability
- **Accessibility** - WCAG compliance improvements
- **Offline support** - service worker for offline functionality
- **Tailwind Use** - Planned the use of Tailwind for CSS.
- **Google Login Authentication** - Using google 0Auth2 Authentication for the login of the system

### Production Readiness
- **Environment configs** - proper dev/staging/prod configurations
- **Security headers** - comprehensive security middleware
- **Rate limiting** - API rate limiting and abuse prevention
- **Monitoring** - health checks, metrics, and alerting
- **CI/CD pipeline** - automated testing and deployment

---

## How AI Assisted Workflow

### Code Generation & Architecture
- **Rapid prototyping** - AI generated initial project structure and boilerplate
- **Pattern consistency** - AI ensured consistent patterns across controllers and routes
- **TypeScript interfaces** - AI created type definitions for ServiceM8 API responses
- **Error handling** - AI implemented comprehensive try-catch patterns

### Problem Solving & Debugging
- **ServiceM8 API discovery** - AI helped decode ServiceM8 response structure from logs
- **Authentication troubleshooting** - AI identified X-API-Key vs Basic Auth issue
- **Database relationship mapping** - AI designed proper foreign key relationships
- **Field name mapping** - AI discovered `attachment_name` vs `file_name` discrepancy

### Documentation & Standards
- **Code comments** - AI added meaningful inline documentation
- **API documentation** - AI generated endpoint descriptions and parameter details
- **README structure** - AI organized comprehensive project documentation
- **Setup instructions** - AI created step-by-step installation guides

### Optimization & Best Practices
- **Security recommendations** - AI suggested JWT implementation and password hashing
- **Performance patterns** - AI recommended lazy loading for attachments
- **Code organization** - AI structured modular architecture with clear separation
- **Error handling** - AI implemented graceful degradation patterns

### Learning & Adaptation
- **Technology updates** - AI stayed current with Next.js 14 App Router patterns
- **ServiceM8 specifics** - AI learned ServiceM8 API quirks through iterative development
- **Business logic** - AI adapted to changing requirements (auth methods, field mappings)
- **Integration challenges** - AI solved complex sync logic with duplicate prevention

### Key AI Benefits Observed
1. **Accelerated development** - 10x faster than manual coding
2. **Consistent quality** - uniform code patterns and error handling
3. **Knowledge transfer** - AI bridged gaps in ServiceM8 API knowledge
4. **Comprehensive solutions** - AI considered edge cases and error scenarios
5. **Living documentation** - AI maintained up-to-date technical documentation
6. **Debugging** - with the assistnance of the AI. We can Pin point fast the bug and error. 

The AI assistance was particularly valuable for:
- **Unknown API integration** (ServiceM8)
- **Full-stack coordination** (ensuring frontend-backend compatibility)
- **Real-time problem solving** (debugging authentication and sync issues)
- **Documentation completeness** (technical references and setup guides)