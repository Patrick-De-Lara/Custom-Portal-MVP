# Customer Portal - Setup Guide

Step-by-step instructions to set up and run the Customer Portal application.

## Prerequisites

1. **XAMPP** - For MySQL database
2. **Node.js** 18+ - Runtime environment
3. **Code Editor** - VS Code recommended
4. **ServiceM8 Account** (optional) - For ServiceM8 integration

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

   # ServiceM8 API Key (optional)
   SERVICEM8_API_KEY=your-servicem8-api-key-here
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

## Application URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Database Admin**: http://localhost/phpmyadmin
- **ServiceM8 Admin Tool**: Open `servicem8-admin-tool.html` in browser

## ServiceM8 Integration (Optional)

### Getting Your ServiceM8 API Key

If you want to test ServiceM8 integration, you need your own API key:

1. **Sign up for ServiceM8**: https://www.servicem8.com/
   - Create a free trial account or use existing account

2. **Navigate to API Settings**:
   - Log into your ServiceM8 account at https://go.servicem8.com/
   - Go to **Settings** → **API & Add-ons**
   - Click on **API Keys** tab

3. **Generate API Key**:
   - Click **"Create New API Key"**
   - Give it a descriptive name (e.g., "Customer Portal")
   - Select appropriate permissions (read access needed)
   - **Copy the generated API key** (starts with `sk_` or similar)

4. **Add to Environment Variables**:
   ```env
   SERVICEM8_API_KEY=your-actual-api-key-here
   ```

⚠️ **Important**: Keep your API key private and never commit it to version control!

### Testing ServiceM8 Integration

The app integrates with ServiceM8 API in:

1. **Auto-Sync**: When customers view bookings, jobs automatically sync from ServiceM8
2. **Admin Tools**: Use `servicem8-admin-tool.html` for:
   - Testing API connection
   - Linking customers to ServiceM8 companies
   - Syncing jobs and attachments

3. **ServiceM8 Features**:
   - Jobs sync with status mapping
   - Attachments download from ServiceM8
   - Visual badges show ServiceM8-synced bookings

### Without ServiceM8 Account

The app works perfectly without ServiceM8:
- All core features functional (login, bookings, messages, files)
- Use local bookings and data only
- Skip ServiceM8 configuration entirely

## First Time Setup Summary

1. **Install Prerequisites** (XAMPP, Node.js)
2. **Create Database** (`customer_portal`)
3. **Setup Backend** (install deps, configure .env, start server)
4. **Setup Frontend** (install deps, configure .env.local, start app)
5. **Test Application** (register, login, create bookings)
6. **Optional**: Configure ServiceM8 integration

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
- Verify API key is correct in `.env`
- Check if ServiceM8 account is active
- Test connection using `servicem8-admin-tool.html`
- Review ServiceM8 API documentation

**Frontend Can't Connect:**
- Ensure backend is running on port 5000
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Clear browser cache and cookies

## License

ISC
