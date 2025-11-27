# ServiceM8 Integration - Technical Reference

## Overview

ServiceM8 is integrated as the primary data source for jobs, companies, and attachments. The integration uses ServiceM8's REST API v1.0 with X-API-Key authentication.

---

## API Configuration

### ServiceM8 Client (`backend/src/config/servicem8.ts`)

**Authentication**: Uses `X-API-Key` header (not Basic Auth or Bearer token)

**Base URL**: `https://api.servicem8.com/api_1.0`

**Environment Variable**: `SERVICEM8_API_KEY` in `backend/.env`

### Available Methods

```typescript
class ServiceM8Client {
  // Get a single job by UUID
  async getJob(jobUuid: string): Promise<any>
  
  // Get all jobs for a company
  async getJobsByCompany(companyUuid: string): Promise<any[]>
  
  // Get attachments for a specific job
  async getJobAttachments(jobUuid: string): Promise<any[]>
  
  // Get a single company by UUID
  async getCompany(companyUuid: string): Promise<any>
  
  // Get all companies in the ServiceM8 account
  async getAllCompanies(): Promise<any[]>
  
  // Construct attachment download URL
  getAttachmentUrl(attachmentUuid: string): string
}
```

### Key Implementation Details

**Headers Used**:
```typescript
{
  'X-API-Key': process.env.SERVICEM8_API_KEY,
  'Content-Type': 'application/json'
}
```

**Attachment URLs**: ServiceM8 doesn't provide direct file URLs. Construct them as:
```
https://api.servicem8.com/api_1.0/attachment.json/${attachmentUuid}/file
```

---

## Database Models

### Customer Model
**ServiceM8 Field**: `servicem8_company_uuid`
- Links local customer to ServiceM8 company
- Used to fetch jobs for this customer
- Nullable (customers can exist without ServiceM8 link)

### Booking Model
**ServiceM8 Field**: `servicem8_job_uuid`
- Links local booking to ServiceM8 job
- Used to sync job updates and attachments
- Auto-populated during job sync

**Mapped Fields**:
```typescript
{
  servicem8_job_uuid: job.uuid,
  title: job.job_address || job.generated_job_id || 'ServiceM8 Job',
  description: job.job_description || '',
  status: mapServiceM8Status(job.status),
  scheduledDate: job.actual_start_time || job.scheduled_date,
  customerId: customer.id
}
```

**Status Mapping**:
- ServiceM8 "Quote" → Portal "pending"
- ServiceM8 "Work Order" / "In Progress" → Portal "confirmed"
- ServiceM8 "Completed" → Portal "completed"
- Default → "pending"

### FileAttachment Model
**ServiceM8 Field**: `servicem8_attachment_uuid`
- Links local attachment to ServiceM8 attachment
- Used to avoid duplicate attachment syncing

**Mapped Fields**:
```typescript
{
  servicem8_attachment_uuid: attachment.uuid,
  fileName: attachment.attachment_name,  // Note: NOT file_name
  fileUrl: `https://api.servicem8.com/api_1.0/attachment.json/${attachment.uuid}/file`,
  fileType: attachment.file_type,
  fileSize: 0  // ServiceM8 doesn't provide size directly
}
```

**Important**: ServiceM8 uses `attachment_name` field, not `file_name`.

---

## Controllers

### ServiceM8 Controller (`backend/src/controllers/servicem8.controller.ts`)

Admin endpoints for ServiceM8 management.

#### `testConnection()`
- **Route**: `GET /api/servicem8/test`
- **Purpose**: Verify API connection and list companies
- **Returns**: Success status and list of all companies

#### `getServiceM8Companies()`
- **Route**: `GET /api/admin/servicem8/companies`
- **Purpose**: List all ServiceM8 companies in the account
- **Returns**: Array of company objects with uuid and name

#### `linkCustomerToServiceM8()`
- **Route**: `POST /api/admin/customers/:id/link-servicem8`
- **Body**: `{ servicem8_company_uuid: string }`
- **Purpose**: Link a local customer to a ServiceM8 company
- **Action**: Updates customer's `servicem8_company_uuid` field

#### `syncCustomerJobs()`
- **Route**: `POST /api/admin/customers/:id/sync-jobs`
- **Purpose**: Sync all jobs for a specific customer from ServiceM8
- **Action**: 
  - Fetches jobs from ServiceM8 using company UUID
  - Creates/updates local bookings
  - Syncs attachments for each job
- **Returns**: Count of jobs synced

#### `syncAllCustomers()`
- **Route**: `POST /api/admin/sync-all`
- **Purpose**: Sync jobs for all customers with ServiceM8 links
- **Action**: Loops through all linked customers and syncs their jobs
- **Returns**: Total jobs synced and customers processed

#### `getCustomerServiceM8Info()`
- **Route**: `GET /api/admin/customers/:id/servicem8-info`
- **Purpose**: Get ServiceM8 link status and job count
- **Returns**: Company info and local booking count

### Booking Controller (`backend/src/controllers/booking.controller.ts`)

#### `syncServiceM8Jobs()` Helper
Internal helper function that syncs jobs for a customer:
```typescript
async function syncServiceM8Jobs(customer: Customer): Promise<number>
```
- Fetches jobs from ServiceM8
- Creates or updates bookings in database
- Syncs attachments for each job
- Returns count of synced jobs

**Attachment Sync Logic**:
```typescript
const attachments = await servicem8Client.getJobAttachments(job.uuid);
for (const attachment of attachments) {
  const fileUrl = `https://api.servicem8.com/api_1.0/attachment.json/${attachment.uuid}/file`;
  await FileAttachment.create({
    bookingId,
    servicem8_attachment_uuid: attachment.uuid,
    fileName: attachment.attachment_name,
    fileUrl: fileUrl,
    fileType: attachment.file_type,
    fileSize: 0
  });
}
```

#### `getBookings()`
- **Route**: `GET /api/bookings`
- **Enhancement**: Auto-syncs ServiceM8 jobs if customer is linked
- **Flow**:
  1. Get customer from JWT token
  2. If customer has `servicem8_company_uuid`, sync jobs
  3. Return all bookings for customer

#### `getBookingById()`
- **Route**: `GET /api/bookings/:id`
- **Enhancement**: Syncs attachments if booking is from ServiceM8
- **Flow**:
  1. Get booking by ID
  2. If booking has `servicem8_job_uuid`, sync attachments
  3. Return booking with attachments

---

## API Routes

### Public Routes (`backend/src/routes/servicem8.routes.ts`)

```typescript
router.get('/test', servicem8Controller.testConnection);
```

### Admin Routes
Mounted at `/api/admin/servicem8`:

```typescript
router.get('/companies', servicem8Controller.getServiceM8Companies);
router.post('/customers/:id/link-servicem8', servicem8Controller.linkCustomerToServiceM8);
router.post('/customers/:id/sync-jobs', servicem8Controller.syncCustomerJobs);
router.post('/sync-all', servicem8Controller.syncAllCustomers);
router.get('/customers/:id/servicem8-info', servicem8Controller.getCustomerServiceM8Info);
```

**Note**: Admin routes are NOT protected by authentication (they should be in production).

---

## Frontend Integration

### Bookings List (`frontend/src/app/bookings/page.tsx`)

**ServiceM8 Badge**:
```tsx
{booking.servicem8_job_uuid && (
  <span className={styles.servicem8Badge}>✓ ServiceM8</span>
)}
```

Shows visual indicator for jobs synced from ServiceM8.

### Auto-Sync Behavior
When user loads bookings page:
1. Frontend calls `GET /api/bookings`
2. Backend checks if customer has ServiceM8 link
3. If linked, syncs jobs from ServiceM8 automatically
4. Returns updated bookings list

This ensures customers always see latest ServiceM8 jobs without manual sync.

---

## ServiceM8 API Structure Reference

### Job Object Fields
```typescript
{
  uuid: string,
  job_address: string,
  generated_job_id: string,
  job_description: string,
  status: string, // "Quote", "Work Order", "In Progress", "Completed"
  actual_start_time: string,
  scheduled_date: string,
  // ... many other fields
}
```

### Attachment Object Fields
```typescript
{
  uuid: string,
  attachment_name: string,  // Primary filename field
  file_type: string,        // e.g., ".jpg", ".pdf"
  photo_width: string,      // For images
  photo_height: string,     // For images
  timestamp: string,
  related_object: string,   // Parent object type
  related_object_uuid: string, // Parent object UUID
  // Note: No file_url or url field provided by ServiceM8
}
```

### Company Object Fields
```typescript
{
  uuid: string,
  name: string,
  // ... other company fields
}
```

---

## Common Issues & Solutions

### Issue: Attachments Not Syncing
**Cause**: Using wrong field names from ServiceM8 response
**Solution**: Use `attachment.attachment_name` (not `file_name`) and construct URLs manually

### Issue: "Invalid username or password"
**Cause**: Using wrong authentication method
**Solution**: ServiceM8 requires `X-API-Key` header, not Basic Auth or Bearer token

### Issue: Routes returning 404
**Cause**: Routes mounted with duplicate `/admin` prefix
**Solution**: Routes are defined without prefix since they're mounted at `/api/admin/servicem8`

### Issue: Duplicate database indexes
**Cause**: Sequelize alter sync creating too many indexes
**Solution**: Set `alter: false` in database sync, run manual SQL cleanup if needed

---

## Testing Tools

### Admin Tool (`servicem8-admin-tool.html`)
Visual interface for:
- Testing API connection
- Listing ServiceM8 companies
- Linking customers to companies
- Syncing individual or all customers
- Viewing sync status

**Usage**: Open HTML file in browser, update API URL if needed (default: http://localhost:5000)

---

## Data Flow Summary

```
ServiceM8 → Backend API → Database → Frontend
   ↓            ↓            ↓          ↓
Companies    Sync Jobs   Bookings   Display
   ↓            ↓            ↓          ↓
Jobs      Map Fields   FileAttach   Show Badge
   ↓            ↓                       ↓
Attachments Construct URLs          View Jobs
```

**Sync Triggers**:
1. Manual: Admin tool sync button
2. Auto: Customer loads bookings page
3. Auto: Customer views individual booking (for attachments)
