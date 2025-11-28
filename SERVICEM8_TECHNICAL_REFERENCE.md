# Customer Portal - Technical Reference

## Project Overview

A full-stack customer portal application with ServiceM8 integration. Built with Next.js frontend, Express.js backend, MySQL database, and ServiceM8 API integration.

---

## Project Structure

```
Custom Portal MVP/
├── frontend/                    # Next.js 14 Frontend Application
├── backend/                     # Express.js Backend API
├── servicem8-admin-tool.html   # ServiceM8 Management Interface
├── fix-database.sql            # Database Cleanup Script
├── SETUP_GUIDE.md             # Setup Instructions
├── SERVICEM8_TECHNICAL_REFERENCE.md # This File
└── README.md                  # Project Documentation
```

---

## Frontend Structure (`frontend/`)

### Core Files
- **`package.json`** - Dependencies and scripts
- **`next.config.js`** - Next.js configuration
- **`tsconfig.json`** - TypeScript configuration
- **`next-env.d.ts`** - Next.js type definitions

### Source Code (`frontend/src/`)

#### App Directory (`src/app/`)
**Purpose**: Next.js 14 App Router pages and layouts

- **`layout.tsx`** - Root layout component
- **`page.tsx`** - Home page (login/register)
- **`globals.css`** - Global styles
- **`page.module.css`** - Home page styles

#### Pages
- **`login/`** - Authentication page
  - `page.tsx` - Login/register form
  - `login.module.css` - Authentication styles

- **`bookings/`** - Booking management
  - `page.tsx` - Bookings list page
  - `bookings.module.css` - List page styles
  - `[id]/` - Dynamic booking detail page
    - `page.tsx` - Individual booking view
    - `booking-detail.module.css` - Detail page styles

#### Services (`src/services/`)
- **`api.ts`** - API service layer with axios client for backend communication

---

## Backend Structure (`backend/`)

### Core Files
- **`package.json`** - Dependencies and scripts
- **`tsconfig.json`** - TypeScript configuration

### Source Code (`backend/src/`)

#### Main Server
- **`server.ts`** - Express.js server entry point, middleware setup, route mounting

#### Configuration (`src/config/`)
- **`database.ts`** - MySQL/Sequelize ORM configuration and connection
- **`servicem8.ts`** - ServiceM8 API client with authentication and methods

#### Models (`src/models/`)
**Purpose**: Sequelize ORM models for database tables

- **`index.ts`** - Model exports and relationships
- **`Customer.ts`** - User accounts with authentication
- **`Booking.ts`** - Job/appointment records
- **`FileAttachment.ts`** - File uploads and ServiceM8 attachments
- **`Message.ts`** - Communication threads for bookings

#### Controllers (`src/controllers/`)
**Purpose**: Route handlers and business logic

- **`auth.controller.ts`** - Registration, login, profile management
- **`booking.controller.ts`** - CRUD operations, ServiceM8 job syncing
- **`file.controller.ts`** - File attachment management
- **`message.controller.ts`** - Messaging system for bookings
- **`servicem8.controller.ts`** - ServiceM8 admin operations and sync

#### Routes (`src/routes/`)
**Purpose**: API endpoint definitions

- **`index.ts`** - Main router combining all routes
- **`auth.routes.ts`** - Authentication endpoints
- **`booking.routes.ts`** - Booking management endpoints
- **`file.routes.ts`** - File attachment endpoints
- **`message.routes.ts`** - Messaging endpoints
- **`servicem8.routes.ts`** - ServiceM8 admin endpoints
- **`health.ts`** - Health check endpoint

#### Middleware (`src/middleware/`)
- **`auth.ts`** - JWT token authentication middleware

---

## Database Models

### Customer Model (`models/Customer.ts`)
**Purpose**: User account management

**Fields**:
- `id`, `email`, `password` (hashed), `firstName`, `lastName`, `phone`
- `servicem8_company_uuid` - Links to ServiceM8 company for job syncing

**Relationships**: Has many Bookings and Messages

### Booking Model (`models/Booking.ts`)
**Purpose**: Job/appointment records

**Fields**:
- `id`, `title`, `description`, `status`, `scheduledDate`, `address`, `total`
- `customerId` - Links to Customer
- `servicem8_job_uuid` - Links to ServiceM8 job for syncing

**Relationships**: Belongs to Customer, has many FileAttachments and Messages

### FileAttachment Model (`models/FileAttachment.ts`)
**Purpose**: File uploads and ServiceM8 attachments

**Fields**:
- `id`, `fileName`, `fileUrl`, `fileType`, `fileSize`
- `bookingId` - Links to Booking
- `servicem8_attachment_uuid` - Links to ServiceM8 attachment

**Relationships**: Belongs to Booking

### Message Model (`models/Message.ts`)
**Purpose**: Communication threads for bookings

**Fields**:
- `id`, `message`, `senderType` (customer/admin), `isRead`
- `bookingId` - Links to Booking
- `customerId` - Links to Customer

**Relationships**: Belongs to Booking and Customer

---

## Key Features

### Authentication System
- JWT token-based authentication (7-day expiry)
- Password hashing with bcrypt
- Protected routes with middleware
- Login with email, phone, and password

### Booking Management
- Create, read, update, delete bookings
- Auto-sync with ServiceM8 when customer is linked
- Status tracking and scheduling
- File attachment support

### ServiceM8 Integration
- Two-way sync between portal and ServiceM8
- Company linking for customers
- Job and attachment syncing
- Status mapping between systems
- Admin tools for management

### Messaging System
- Customer-admin communication per booking
- Message threading and timestamps
- Read/unread status tracking
- **Note**: Currently local only, not synced with ServiceM8

---

## Configuration Files

### Backend Configuration
- **`.env`** - Environment variables (database, JWT secret, ServiceM8 API key)
- **`tsconfig.json`** - TypeScript compiler settings
- **`package.json`** - Dependencies and npm scripts

### Frontend Configuration
- **`.env.local`** - Next.js environment variables (API URL)
- **`next.config.js`** - Next.js framework configuration
- **`tsconfig.json`** - TypeScript compiler settings
- **`next-env.d.ts`** - Next.js TypeScript definitions

### Database Configuration
- **`fix-database.sql`** - SQL script to fix duplicate indexes issue
- Auto-creates tables on first run via Sequelize sync

---

## ServiceM8 Integration

### ServiceM8 Client (`config/servicem8.ts`)
**Purpose**: API wrapper for ServiceM8 REST API v1.0

**Authentication**: X-API-Key header (not Basic Auth)
**Base URL**: `https://api.servicem8.com/api_1.0`

**Key Methods**:
- `getJob()` - Fetch single job by UUID
- `getJobsByCompany()` - Fetch all jobs for a company
- `getJobAttachments()` - Fetch attachments for a job
- `getAllCompanies()` - List all companies in account

### Admin Tool (`servicem8-admin-tool.html`)
**Purpose**: Visual interface for ServiceM8 management

**Features**:
- Test API connection
- List ServiceM8 companies
- Link customers to companies
- Sync jobs manually
- View sync status

**Usage**: Open in browser, works with local backend API

---

## Development Notes

### Technology Stack
- **Frontend**: Next.js 14, TypeScript, CSS Modules
- **Backend**: Express.js, TypeScript, Sequelize ORM
- **Database**: MySQL (via XAMPP)
- **Authentication**: JWT tokens with bcrypt password hashing
- **External API**: ServiceM8 REST API integration

### Data Relationships
```
Customer (1) ←→ (Many) Booking
Booking (1) ←→ (Many) FileAttachment
Booking (1) ←→ (Many) Message
Customer (1) ←→ (Many) Message
```

### Key Features
- ✅ User authentication and registration
- ✅ Booking management with CRUD operations
- ✅ File attachment system
- ✅ Messaging system (local database only)
- ✅ ServiceM8 integration with auto-sync
- ✅ Responsive UI with CSS modules
- ✅ TypeScript for type safety

### API Endpoints
- **Authentication**: `/api/auth/*`
- **Bookings**: `/api/bookings/*`
- **Files**: `/api/files/*`
- **Messages**: `/api/messages/*`
- **ServiceM8 Admin**: `/api/admin/servicem8/*`
- **Health Check**: `/api/health`

---

## For More Information

- **Setup Instructions**: See `SETUP_GUIDE.md`
- **Project Overview**: See `README.md`
- **Database Cleanup**: Use `fix-database.sql` if needed
- **ServiceM8 Testing**: Use `servicem8-admin-tool.html`
