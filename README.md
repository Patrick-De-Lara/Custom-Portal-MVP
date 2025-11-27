# Custom Portal MVP

A full-stack customer portal application with ServiceM8 integration. Built with Next.js frontend and Express.js backend, featuring job management, file attachments, and real-time syncing with ServiceM8.

## Project Structure

```
Custom Portal MVP/
├── frontend/                 # Next.js 14 frontend application
│   ├── src/
│   │   ├── app/             # Next.js app directory
│   │   │   ├── bookings/    # Bookings list and detail pages
│   │   │   ├── login/       # Authentication page
│   │   │   └── page.tsx     # Home page
│   │   └── services/        # API service layer
│   ├── package.json
│   └── tsconfig.json
├── backend/                  # Express.js backend API
│   ├── src/
│   │   ├── server.ts        # Main server entry point
│   │   ├── config/          # Configuration files
│   │   │   ├── database.ts  # MySQL/Sequelize setup
│   │   │   └── servicem8.ts # ServiceM8 API client
│   │   ├── controllers/     # Route handlers
│   │   │   ├── auth.controller.ts
│   │   │   ├── booking.controller.ts
│   │   │   ├── file.controller.ts
│   │   │   ├── message.controller.ts
│   │   │   └── servicem8.controller.ts
│   │   ├── middleware/      # Express middleware
│   │   │   └── auth.ts      # JWT authentication
│   │   ├── models/          # Sequelize models
│   │   │   ├── Customer.ts
│   │   │   ├── Booking.ts
│   │   │   ├── FileAttachment.ts
│   │   │   └── Message.ts
│   │   └── routes/          # API routes
│   ├── package.json
│   └── tsconfig.json
├── servicem8-admin-tool.html # Visual admin interface for ServiceM8
├── SERVICEM8_TECHNICAL_REFERENCE.md # Technical documentation
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- MySQL database (XAMPP recommended)
- ServiceM8 account with API key (optional, for ServiceM8 integration)

### Installation

1. **Clone and setup database:**
   - Start MySQL server (via XAMPP or similar)
   - Create database: `custom_portal`
   - Run `fix-database.sql` if needed to clean indexes

2. **Install backend dependencies:**
```bash
cd backend
npm install
```

3. **Configure backend environment:**
   - Copy `backend/.env.example` to `backend/.env`
   - Update database credentials
   - Add ServiceM8 API key if using ServiceM8 integration

4. **Install frontend dependencies:**
```bash
cd frontend
npm install
```

### Running the Application

#### Development Mode

1. Start the backend server (from `backend/` directory):
```bash
npm run dev
```
The API will be available at http://localhost:5000

2. Start the frontend application (from `frontend/` directory):
```bash
npm run dev
```
The app will be available at http://localhost:3000

### Production Build

#### Backend
```bash
cd backend
npm run build
npm start
```

#### Frontend
```bash
cd frontend
npm run build
npm start
```

## Technologies Used

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **React 18** - UI library
- **Axios** - HTTP client for API calls
- **CSS Modules** - Scoped component styling

### Backend
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Sequelize** - ORM for MySQL
- **MySQL** - Database
- **JWT** - Authentication tokens (7-day expiry)
- **bcrypt** - Password hashing
- **ServiceM8 API** - External job management integration
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security headers
- **Morgan** - HTTP logging

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new customer
- `POST /api/auth/login` - Login and get JWT token

### Bookings
- `GET /api/bookings` - Get all bookings for authenticated customer (auto-syncs ServiceM8)
- `GET /api/bookings/:id` - Get single booking by ID (syncs attachments if ServiceM8 job)
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Delete booking

### Files
- `GET /api/files/booking/:bookingId` - Get all files for a booking
- `POST /api/files/upload` - Upload file attachment
- `DELETE /api/files/:id` - Delete file attachment

### Messages
- `GET /api/messages/booking/:bookingId` - Get all messages for a booking
- `POST /api/messages` - Send new message

### ServiceM8 (Admin)
- `GET /api/servicem8/test` - Test ServiceM8 API connection
- `GET /api/admin/servicem8/companies` - List all ServiceM8 companies
- `POST /api/admin/customers/:id/link-servicem8` - Link customer to ServiceM8 company
- `POST /api/admin/customers/:id/sync-jobs` - Sync jobs from ServiceM8 for specific customer
- `POST /api/admin/sync-all` - Sync all customers with ServiceM8 links
- `GET /api/admin/customers/:id/servicem8-info` - Get ServiceM8 info for customer

### Health
- `GET /api/health` - Health check endpoint

## Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=custom_portal
DB_USER=root
DB_PASSWORD=

# JWT
JWT_SECRET=your-secret-key-here

# ServiceM8 (optional)
SERVICEM8_API_KEY=your-servicem8-api-key
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Features

### Core Features
- ✅ Customer authentication with JWT tokens
- ✅ Booking management (create, read, update, delete)
- ✅ File attachments for bookings
- ✅ Messaging system for booking communication
- ✅ Real-time data display with auto-refresh

### ServiceM8 Integration
- ✅ Automatic job syncing from ServiceM8
- ✅ Company linking for customers
- ✅ Attachment syncing from ServiceM8 jobs
- ✅ Status mapping (Quote → Pending, Work Order → Confirmed, etc.)
- ✅ Visual badges for ServiceM8-synced bookings
- ✅ Admin tool for ServiceM8 management

### Technical Features
- ✅ TypeScript support for both frontend and backend
- ✅ Hot reloading in development mode
- ✅ MySQL database with Sequelize ORM
- ✅ JWT authentication middleware
- ✅ Password hashing with bcrypt
- ✅ CORS enabled for cross-origin requests
- ✅ Security headers with Helmet
- ✅ Request logging with Morgan
- ✅ Error handling middleware
- ✅ Database models with relationships

## Development

### Database Models

The application uses Sequelize ORM with the following models:

- **Customer**: User accounts with authentication
  - Fields: `email`, `password`, `firstName`, `lastName`, `phone`, `servicem8_company_uuid`
  - Relations: Has many Bookings and Messages

- **Booking**: Job/appointment records
  - Fields: `title`, `description`, `status`, `scheduledDate`, `servicem8_job_uuid`
  - Relations: Belongs to Customer, has many FileAttachments and Messages

- **FileAttachment**: Uploaded files and ServiceM8 attachments
  - Fields: `fileName`, `fileUrl`, `fileType`, `fileSize`, `servicem8_attachment_uuid`
  - Relations: Belongs to Booking

- **Message**: Communication threads for bookings
  - Fields: `message`, `senderType` (customer/admin)
  - Relations: Belongs to Booking and Customer

### ServiceM8 Integration

The application integrates with ServiceM8 as a data source:

1. **Authentication**: Uses `X-API-Key` header
2. **API Client**: `backend/src/config/servicem8.ts`
3. **Auto-Sync**: Jobs automatically sync when customers view bookings
4. **Field Mapping**: ServiceM8 jobs map to local Booking model
5. **Attachments**: ServiceM8 attachments sync with constructed download URLs

See `SERVICEM8_TECHNICAL_REFERENCE.md` for detailed technical documentation.

### Adding New API Routes

1. Create a new route file in `backend/src/routes/`
2. Create corresponding controller in `backend/src/controllers/`
3. Import and register route in `backend/src/routes/index.ts`

### Adding New Pages

1. Create new page files in `frontend/src/app/`
2. Follow Next.js App Router conventions
3. Use API service layer from `frontend/src/services/api.ts`

## Testing Tools

- **servicem8-admin-tool.html**: Visual admin interface for ServiceM8 operations
  - Test API connection
  - List companies
  - Link customers to ServiceM8
  - Sync jobs manually
  - View sync status

## Documentation

- **SERVICEM8_TECHNICAL_REFERENCE.md**: Complete technical documentation for ServiceM8 integration
- **SERVICEM8_API_REFERENCE.md**: (If exists) ServiceM8 API documentation

## License

ISC
