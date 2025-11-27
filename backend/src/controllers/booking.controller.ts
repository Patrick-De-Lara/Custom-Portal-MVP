import { Request, Response } from 'express';
import Booking from '../models/Booking';
import FileAttachment from '../models/FileAttachment';
import Message from '../models/Message';
import servicem8Client from '../config/servicem8';

// Helper function to map ServiceM8 status
const mapServiceM8Status = (status: string, isQuoted: boolean): string => {
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
};

// Helper function to sync ServiceM8 jobs
const syncServiceM8Jobs = async (customerId: number, companyUuid: string) => {
  try {
    const servicem8Jobs = await servicem8Client.getJobsByCompany(companyUuid);
    console.log(`🔍 Found ${servicem8Jobs.length} jobs from ServiceM8`);
    
    for (const job of servicem8Jobs) {
      // Log the full job structure to see all available fields
      console.log('📋 Job data from ServiceM8:', JSON.stringify(job, null, 2));
      
      const jobData = {
        customerId,
        servicem8_job_uuid: job.uuid,
        title: job.job_address || job.generated_job_id || 'Untitled Job',
        description: job.job_description || job.job_notes || '',
        status: mapServiceM8Status(job.status, job.job_is_quoted),
        scheduledDate: job.work_start_date || job.date_created ? new Date(job.work_start_date || job.date_created) : undefined,
        completedDate: job.work_end_date || job.date_completed ? new Date(job.work_end_date || job.date_completed) : undefined,
        address: job.job_address || job.billing_address || '',
        total: parseFloat(job.total_price || job.job_price || job.invoice_total || '0')
      };
      
      console.log('💾 Saving job data:', jobData);

      // Check if booking already exists
      const existingBooking = await Booking.findOne({
        where: {
          servicem8_job_uuid: job.uuid,
          customerId
        }
      });

      let bookingId;
      if (existingBooking) {
        await existingBooking.update(jobData);
        bookingId = existingBooking.id;
      } else {
        const newBooking = await Booking.create(jobData);
        bookingId = newBooking.id;
      }

      // Sync attachments for this job
      try {
        const attachments = await servicem8Client.getJobAttachments(job.uuid);
        console.log(`📎 Found ${attachments.length} attachments for job ${job.uuid}`);
        
        for (const attachment of attachments) {
          // Log attachment structure to see what fields ServiceM8 provides
          console.log('Attachment data:', JSON.stringify(attachment, null, 2));
          
          const existing = await FileAttachment.findOne({
            where: {
              bookingId,
              servicem8_attachment_uuid: attachment.uuid
            }
          });

          if (!existing) {
            // Construct the ServiceM8 file URL
            const fileUrl = `https://api.servicem8.com/api_1.0/attachment.json/${attachment.uuid}/file`;
            
            await FileAttachment.create({
              bookingId,
              servicem8_attachment_uuid: attachment.uuid,
              fileName: attachment.attachment_name || attachment.file_name || 'Attachment',
              fileUrl: fileUrl,
              fileType: attachment.file_type || 'unknown',
              fileSize: 0 // ServiceM8 doesn't provide file size directly
            });
            console.log(`✅ Synced attachment: ${attachment.attachment_name || attachment.file_name}`);
          }
        }
      } catch (attachError) {
        console.error(`⚠️  Error syncing attachments for job ${job.uuid}:`, attachError);
      }
    }
    
    return servicem8Jobs.length;
  } catch (error) {
    console.error('ServiceM8 sync error:', error);
    throw error;
  }
};

export const bookingController = {
  // Get all bookings for logged-in customer
  getBookings: async (req: Request, res: Response): Promise<void> => {
    try {
      const customer = req.customer;

      if (!customer) {
        res.status(401).json({
          success: false,
          message: 'Not authenticated',
        });
        return;
      }

      // Sync with ServiceM8 if company UUID exists
      if (customer.servicem8_company_uuid) {
        try {
          const syncedCount = await syncServiceM8Jobs(customer.id, customer.servicem8_company_uuid);
          console.log(`✅ Synced ${syncedCount} jobs from ServiceM8 for customer ${customer.id}`);
        } catch (error) {
          console.error('⚠️  ServiceM8 sync error:', error);
          // Continue even if sync fails
        }
      }

      // Fetch all bookings from database (including newly synced ones)
      const bookings = await Booking.findAll({
        where: { customerId: customer.id },
        order: [['scheduledDate', 'DESC']],
      });

      res.status(200).json({
        success: true,
        data: bookings,
      });
    } catch (error) {
      console.error('Get bookings error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching bookings',
      });
    }
  },

  // Get single booking details
  getBookingById: async (req: Request, res: Response): Promise<void> => {
    try {
      const customer = req.customer;
      const bookingId = parseInt(req.params.id);

      if (!customer) {
        res.status(401).json({
          success: false,
          message: 'Not authenticated',
        });
        return;
      }

      const booking = await Booking.findOne({
        where: {
          id: bookingId,
          customerId: customer.id,
        },
        include: [
          {
            model: FileAttachment,
            as: 'attachments',
          },
          {
            model: Message,
            as: 'messages',
            order: [['createdAt', 'ASC']],
          },
        ],
      });

      if (!booking) {
        res.status(404).json({
          success: false,
          message: 'Booking not found',
        });
        return;
      }

      // Sync with ServiceM8 if job UUID exists
      if (booking.servicem8_job_uuid) {
        try {
          const servicem8Job = await servicem8Client.getJob(booking.servicem8_job_uuid);
          
          // Update booking with ServiceM8 data
          await booking.update({
            status: mapServiceM8Status(servicem8Job.status, servicem8Job.job_is_quoted),
            description: servicem8Job.job_description || booking.description,
          });

          // Sync attachments from ServiceM8
          const servicem8Attachments = await servicem8Client.getJobAttachments(
            booking.servicem8_job_uuid
          );

          console.log(`📎 Found ${servicem8Attachments.length} attachments from ServiceM8 for job ${booking.servicem8_job_uuid}`);

          // Save attachments to database
          for (const attachment of servicem8Attachments) {
            // Log attachment data for debugging
            console.log('Attachment:', JSON.stringify(attachment, null, 2));
            
            // Check if attachment already exists
            const existing = await FileAttachment.findOne({
              where: {
                bookingId: booking.id,
                servicem8_attachment_uuid: attachment.uuid
              }
            });

            if (!existing) {
              // Get the file URL from ServiceM8
              const fileUrl = `https://api.servicem8.com/api_1.0/attachment.json/${attachment.uuid}/file`;
              
              await FileAttachment.create({
                bookingId: booking.id,
                servicem8_attachment_uuid: attachment.uuid,
                fileName: attachment.attachment_name || attachment.file_name || 'Attachment',
                fileUrl: fileUrl,
                fileType: attachment.file_type || 'unknown',
                fileSize: parseInt(attachment.photo_width || '0') // ServiceM8 doesn't provide file size
              });
              console.log(`✅ Saved attachment: ${attachment.attachment_name}`);
            }
          }

          // Reload booking with updated attachments
          await booking.reload({
            include: [
              { model: FileAttachment, as: 'attachments' },
              { model: Message, as: 'messages', order: [['createdAt', 'ASC']] }
            ]
          });
        } catch (error) {
          console.error('❌ ServiceM8 sync error:', error);
        }
      }

      res.status(200).json({
        success: true,
        data: booking,
      });
    } catch (error) {
      console.error('Get booking error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching booking',
      });
    }
  },

  // Create a new booking
  createBooking: async (req: Request, res: Response): Promise<void> => {
    try {
      const customer = req.customer;

      if (!customer) {
        res.status(401).json({
          success: false,
          message: 'Not authenticated',
        });
        return;
      }

      const { title, description, scheduledDate, address, servicem8_job_uuid } = req.body;

      if (!title) {
        res.status(400).json({
          success: false,
          message: 'Title is required',
        });
        return;
      }

      const booking = await Booking.create({
        customerId: customer.id,
        title,
        description,
        scheduledDate,
        address,
        servicem8_job_uuid,
        status: 'pending',
      });

      res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        data: booking,
      });
    } catch (error) {
      console.error('Create booking error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating booking',
      });
    }
  },
};
