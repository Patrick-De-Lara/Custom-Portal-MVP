import { Request, Response } from 'express';
import FileAttachment from '../models/FileAttachment';
import Booking from '../models/Booking';

export const fileController = {
  // Get files for a booking
  getFiles: async (req: Request, res: Response): Promise<void> => {
    try {
      const customer = req.customer;
      const bookingId = parseInt(req.params.bookingId);

      if (!customer) {
        res.status(401).json({
          success: false,
          message: 'Not authenticated',
        });
        return;
      }

      // Verify booking belongs to customer
      const booking = await Booking.findOne({
        where: {
          id: bookingId,
          customerId: customer.id,
        },
      });

      if (!booking) {
        res.status(404).json({
          success: false,
          message: 'Booking not found',
        });
        return;
      }

      const files = await FileAttachment.findAll({
        where: { bookingId },
        order: [['createdAt', 'DESC']],
      });

      res.status(200).json({
        success: true,
        data: files,
      });
    } catch (error) {
      console.error('Get files error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching files',
      });
    }
  },

  // Add file attachment (for POC - in production would handle actual file upload)
  addFile: async (req: Request, res: Response): Promise<void> => {
    try {
      const customer = req.customer;
      const bookingId = parseInt(req.params.bookingId);
      const { fileName, fileUrl, fileType, fileSize, servicem8_attachment_uuid } = req.body;

      if (!customer) {
        res.status(401).json({
          success: false,
          message: 'Not authenticated',
        });
        return;
      }

      if (!fileName || !fileUrl) {
        res.status(400).json({
          success: false,
          message: 'fileName and fileUrl are required',
        });
        return;
      }

      // Verify booking belongs to customer
      const booking = await Booking.findOne({
        where: {
          id: bookingId,
          customerId: customer.id,
        },
      });

      if (!booking) {
        res.status(404).json({
          success: false,
          message: 'Booking not found',
        });
        return;
      }

      const file = await FileAttachment.create({
        bookingId,
        fileName,
        fileUrl,
        fileType,
        fileSize,
        servicem8_attachment_uuid,
      });

      res.status(201).json({
        success: true,
        message: 'File added successfully',
        data: file,
      });
    } catch (error) {
      console.error('Add file error:', error);
      res.status(500).json({
        success: false,
        message: 'Error adding file',
      });
    }
  },
};
