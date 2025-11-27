# Customer Portal - Complete Setup Guide

A full-stack Customer Portal with Next.js, Express.js, MySQL, and ServiceM8 API integration.

## Prerequisites

1. **XAMPP** installed with MySQL running
2. **Node.js** 18+ installed
3. **ServiceM8 API credentials** (username and password)

## Database Setup

### Step 1: Create MySQL Database

1. Start XAMPP and ensure MySQL is running
2. Open phpMyAdmin (http://localhost/phpmyadmin)
3. Create a new database named `customer_portal`
4. The tables will be auto-created when you start the backend

## Backend Setup

### Step 2: Install Dependencies

```bash
cd backend
npm install
```

### Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```

2. Edit `.env` with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development

   # MySQL Database (XAMPP default settings)
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=customer_portal
   DB_USER=root
   DB_PASSWORD=

   # JWT Secret (change in production!)
   JWT_SECRET=your-super-secret-jwt-key-change-this

   # ServiceM8 API Credentials
   SERVICEM8_USERNAME=your-servicem8-username
   SERVICEM8_PASSWORD=your-servicem8-password
   ```

### Step 4: Start Backend Server

```bash
npm run dev
```

The backend will:
- Connect to MySQL database
- Auto-create all required tables
- Start on http://localhost:5000

## Frontend Setup

### Step 5: Install Dependencies

```bash
cd frontend
npm install
```

### Step 6: Configure Environment Variables

Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Step 7: Start Frontend

```bash
npm run dev
```

Frontend will start on http://localhost:3000

## Testing the POC

### 1. Register a Test Customer

1. Navigate to http://localhost:3000
2. Click "Register" tab
3. Fill in:
   - Full Name: `Test Customer`
   - Email: `test@example.com`
   - Phone: `+1234567890`
   - Password: `password123`
4. Click "Register"

### 2. Add Sample Data (Optional)

Run this SQL in phpMyAdmin to add sample bookings:

```sql
-- Get the customer ID first
SELECT id FROM customers WHERE email = 'test@example.com';

-- Insert sample bookings (replace CUSTOMER_ID with the actual ID)
INSERT INTO bookings (customerId, title, description, status, scheduledDate, address, total, createdAt, updatedAt) 
VALUES 
(CUSTOMER_ID, 'Air Conditioning Service', 'Annual AC maintenance and inspection', 'scheduled', '2025-12-05 10:00:00', '123 Main St, City, State', 150.00, NOW(), NOW()),
(CUSTOMER_ID, 'Plumbing Repair', 'Fix leaking kitchen faucet', 'completed', '2025-11-15 14:00:00', '123 Main St, City, State', 85.50, NOW(), NOW());

-- Get booking IDs
SELECT id FROM bookings WHERE customerId = CUSTOMER_ID;

-- Add sample file attachments (replace BOOKING_ID)
INSERT INTO file_attachments (bookingId, fileName, fileUrl, fileType, fileSize, createdAt, updatedAt)
VALUES 
(BOOKING_ID, 'invoice.pdf', 'https://example.com/invoice.pdf', 'application/pdf', 245678, NOW(), NOW()),
(BOOKING_ID, 'photo.jpg', 'https://example.com/photo.jpg', 'image/jpeg', 1245678, NOW(), NOW());
```

### 3. Test All Features

✅ **Login**: Login with email + phone + password
✅ **View Bookings**: See list of all bookings
✅ **Booking Details**: Click on a booking to see details
✅ **View Attachments**: See and download file attachments
✅ **Send Messages**: Send messages related to a booking

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new customer
- `POST /api/auth/login` - Login with email, phone, and password
- `GET /api/auth/profile` - Get customer profile (protected)

### Bookings
- `GET /api/bookings` - Get all bookings for logged-in customer
- `GET /api/bookings/:id` - Get single booking with attachments and messages
- `POST /api/bookings` - Create new booking

### Messages
- `GET /api/messages/:bookingId` - Get messages for a booking
- `POST /api/messages/:bookingId` - Send a message

### Files
- `GET /api/files/:bookingId` - Get file attachments for a booking

## ServiceM8 Integration

The POC integrates with ServiceM8 API in:

1. **Booking Controller** (`backend/src/controllers/booking.controller.ts`):
   - Fetches jobs from ServiceM8 when viewing bookings
   - Syncs job details and attachments
   - Uses `servicem8_job_uuid` to link local bookings with ServiceM8 jobs

2. **Configuration** (`backend/src/config/servicem8.ts`):
   - API client with Basic Auth
   - Methods for getting jobs, attachments, and company details

To test ServiceM8 integration:
1. Add your ServiceM8 credentials to `.env`
2. Create a booking with a valid `servicem8_job_uuid`
3. View the booking - it will fetch live data from ServiceM8

## Database Schema

### Customers
- id, email, phone, password (hashed), name, servicem8_company_uuid

### Bookings
- id, customerId, servicem8_job_uuid, title, description, status, scheduledDate, completedDate, address, total

### File Attachments
- id, bookingId, servicem8_attachment_uuid, fileName, fileUrl, fileType, fileSize

### Messages
- id, bookingId, customerId, content, senderType (customer/admin), isRead

## Tech Stack

### Backend
- Express.js with TypeScript
- MySQL with Sequelize ORM
- JWT authentication
- bcryptjs for password hashing
- ServiceM8 API integration

### Frontend
- Next.js 15 with App Router
- TypeScript
- Axios for API calls
- CSS Modules

## Production Checklist

- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Update CORS settings in backend
- [ ] Set `NODE_ENV=production`
- [ ] Use environment-specific database
- [ ] Enable HTTPS
- [ ] Add rate limiting
- [ ] Implement file upload for attachments
- [ ] Add email notifications
- [ ] Set up proper logging

## Troubleshooting

**MySQL Connection Error:**
- Ensure XAMPP MySQL is running
- Check database credentials in `.env`
- Verify database `customer_portal` exists

**ServiceM8 API Error:**
- Verify credentials are correct
- Check API endpoint is accessible
- Review ServiceM8 API documentation

**Frontend Can't Connect:**
- Ensure backend is running on port 5000
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Clear browser cache and cookies

## License

ISC
