import { Request, Response } from 'express';
import { Customer, Booking, FileAttachment } from '../models';
import servicem8Client from '../config/servicem8';

// Test ServiceM8 connection
export const testConnection = async (req: Request, res: Response) => {
  try {
    // Try to fetch companies to verify connection
    const companies = await servicem8Client.getAllCompanies();
    
    res.json({
      success: true,
      message: 'ServiceM8 connection successful',
      data: {
        companies: companies.slice(0, 5), // Return first 5 for testing
        totalCompanies: companies.length
      }
    });
  } catch (error: any) {
    console.error('ServiceM8 connection test failed:', error);
    res.status(500).json({
      success: false,
      message: 'ServiceM8 connection failed',
      error: error.response?.data || error.message
    });
  }
};

// Get all ServiceM8 companies
export const getServiceM8Companies = async (req: Request, res: Response) => {
  try {
    const companies = await servicem8Client.getAllCompanies();
    
    res.json({
      success: true,
      data: companies.map((company: any) => ({
        uuid: company.uuid,
        name: company.name,
        email: company.email,
        phone: company.phone,
        address: company.address
      }))
    });
  } catch (error: any) {
    console.error('Error fetching ServiceM8 companies:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching companies from ServiceM8',
      error: error.message
    });
  }
};

// Link customer to ServiceM8 company
export const linkCustomerToServiceM8 = async (req: Request, res: Response) => {
  try {
    const customerId = parseInt(req.params.customerId);
    const { servicem8_company_uuid } = req.body;

    if (!servicem8_company_uuid) {
      return res.status(400).json({
        success: false,
        message: 'servicem8_company_uuid is required'
      });
    }

    // Verify company exists in ServiceM8
    try {
      await servicem8Client.getCompany(servicem8_company_uuid);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: 'Company not found in ServiceM8'
      });
    }

    // Update customer
    const customer = await Customer.findByPk(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    await customer.update({ servicem8_company_uuid });

    res.json({
      success: true,
      message: 'Customer linked to ServiceM8 company successfully',
      data: {
        customerId: customer.id,
        servicem8_company_uuid: customer.servicem8_company_uuid
      }
    });
  } catch (error: any) {
    console.error('Error linking customer to ServiceM8:', error);
    res.status(500).json({
      success: false,
      message: 'Error linking customer to ServiceM8',
      error: error.message
    });
  }
};

// Sync jobs from ServiceM8 for a specific customer
export const syncCustomerJobs = async (req: Request, res: Response) => {
  try {
    const customerId = parseInt(req.params.customerId);

    const customer = await Customer.findByPk(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    if (!customer.servicem8_company_uuid) {
      return res.status(400).json({
        success: false,
        message: 'Customer not linked to ServiceM8 company'
      });
    }

    // Fetch jobs from ServiceM8
    const jobs = await servicem8Client.getJobsByCompany(customer.servicem8_company_uuid);

    let created = 0;
    let updated = 0;

    // Sync each job
    for (const job of jobs) {
      // Log job data to see available fields
      console.log('📋 ServiceM8 Job:', JSON.stringify(job, null, 2).substring(0, 500));
      
      const jobData = {
        customerId: customer.id,
        servicem8_job_uuid: job.uuid,
        title: job.job_address || job.generated_job_id || 'Untitled Job',
        description: job.job_description || job.job_notes || '',
        status: mapServiceM8Status(job.status, job.job_is_quoted),
        scheduledDate: job.work_start_date || job.date_created ? new Date(job.work_start_date || job.date_created) : undefined,
        completedDate: job.work_end_date || job.date_completed ? new Date(job.work_end_date || job.date_completed) : undefined,
        address: job.job_address || job.billing_address || '',
        total: parseFloat(job.total_price || job.job_price || job.invoice_total || '0')
      };

      // Check if booking already exists
      const existingBooking = await Booking.findOne({
        where: {
          servicem8_job_uuid: job.uuid,
          customerId: customer.id
        }
      });

      if (existingBooking) {
        await existingBooking.update(jobData);
        updated++;

        // Sync attachments
        await syncJobAttachments(existingBooking.id, job.uuid);
      } else {
        const newBooking = await Booking.create(jobData);
        created++;

        // Sync attachments
        await syncJobAttachments(newBooking.id, job.uuid);
      }
    }

    res.json({
      success: true,
      message: 'Jobs synced successfully',
      data: {
        customerId: customer.id,
        totalJobs: jobs.length,
        created,
        updated
      }
    });
  } catch (error: any) {
    console.error('Error syncing customer jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Error syncing customer jobs',
      error: error.message
    });
  }
};

// Sync all customers with ServiceM8
export const syncAllCustomers = async (req: Request, res: Response) => {
  try {
    const customers = await Customer.findAll({
      where: {
        servicem8_company_uuid: {
          [require('sequelize').Op.ne]: null
        }
      }
    });

    if (customers.length === 0) {
      return res.json({
        success: true,
        message: 'No customers linked to ServiceM8',
        data: { synced: 0 }
      });
    }

    let totalCreated = 0;
    let totalUpdated = 0;
    const errors: any[] = [];

    for (const customer of customers) {
      try {
        const jobs = await servicem8Client.getJobsByCompany(customer.servicem8_company_uuid!);

        for (const job of jobs) {
          const jobData = {
            customerId: customer.id,
            servicem8_job_uuid: job.uuid,
            title: job.job_address || job.generated_job_id || 'Untitled Job',
            description: job.job_description || job.job_notes || '',
            status: mapServiceM8Status(job.status, job.job_is_quoted),
            scheduledDate: job.work_start_date || job.date_created ? new Date(job.work_start_date || job.date_created) : undefined,
            completedDate: job.work_end_date || job.date_completed ? new Date(job.work_end_date || job.date_completed) : undefined,
            address: job.job_address || job.billing_address || '',
            total: parseFloat(job.total_price || job.job_price || job.invoice_total || '0')
          };

          const existingBooking = await Booking.findOne({
            where: {
              servicem8_job_uuid: job.uuid,
              customerId: customer.id
            }
          });

          if (existingBooking) {
            await existingBooking.update(jobData);
            totalUpdated++;
            await syncJobAttachments(existingBooking.id, job.uuid);
          } else {
            const newBooking = await Booking.create(jobData);
            totalCreated++;
            await syncJobAttachments(newBooking.id, job.uuid);
          }
        }
      } catch (error: any) {
        errors.push({
          customerId: customer.id,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: 'Bulk sync completed',
      data: {
        customersSynced: customers.length,
        totalCreated,
        totalUpdated,
        errors: errors.length > 0 ? errors : undefined
      }
    });
  } catch (error: any) {
    console.error('Error syncing all customers:', error);
    res.status(500).json({
      success: false,
      message: 'Error syncing all customers',
      error: error.message
    });
  }
};

// Get customer ServiceM8 info
export const getCustomerServiceM8Info = async (req: Request, res: Response) => {
  try {
    const customerId = parseInt(req.params.customerId);

    const customer = await Customer.findByPk(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    if (!customer.servicem8_company_uuid) {
      return res.json({
        success: true,
        data: {
          linked: false,
          servicem8_company_uuid: null
        }
      });
    }

    // Fetch company details from ServiceM8
    try {
      const company = await servicem8Client.getCompany(customer.servicem8_company_uuid);
      const jobs = await servicem8Client.getJobsByCompany(customer.servicem8_company_uuid);

      res.json({
        success: true,
        data: {
          linked: true,
          servicem8_company_uuid: customer.servicem8_company_uuid,
          company: {
            name: company.name,
            email: company.email,
            phone: company.phone,
            address: company.address
          },
          jobCount: jobs.length
        }
      });
    } catch (error: any) {
      res.json({
        success: true,
        data: {
          linked: true,
          servicem8_company_uuid: customer.servicem8_company_uuid,
          error: 'Could not fetch ServiceM8 data: ' + error.message
        }
      });
    }
  } catch (error: any) {
    console.error('Error fetching customer ServiceM8 info:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer ServiceM8 info',
      error: error.message
    });
  }
};

// Helper: Sync job attachments
async function syncJobAttachments(bookingId: number, jobUuid: string) {
  try {
    const attachments = await servicem8Client.getJobAttachments(jobUuid);

    for (const attachment of attachments) {
      // Check if attachment already exists
      const existing = await FileAttachment.findOne({
        where: {
          bookingId,
          servicem8_attachment_uuid: attachment.uuid
        }
      });

      if (!existing && attachment.file_url) {
        await FileAttachment.create({
          bookingId,
          servicem8_attachment_uuid: attachment.uuid,
          fileName: attachment.file_name || 'Attachment',
          fileUrl: attachment.file_url,
          fileType: attachment.file_type || 'unknown',
          fileSize: attachment.file_size || 0
        });
      }
    }
  } catch (error) {
    console.error('Error syncing attachments for job:', jobUuid, error);
  }
}

// Helper: Map ServiceM8 status to our status
function mapServiceM8Status(status: string, isQuoted: boolean): string {
  if (isQuoted) return 'pending';
  
  switch (status?.toLowerCase()) {
    case 'quote':
      return 'pending';
    case 'work order':
      return 'scheduled';
    case 'in progress':
      return 'in_progress';
    case 'completed':
      return 'completed';
    case 'cancelled':
      return 'cancelled';
    default:
      return 'pending';
  }
}
