import { Request, Response } from 'express';
import Message from '../models/Message';
import Booking from '../models/Booking';

export const messageController = {
  // Get messages for a booking
  getMessages: async (req: Request, res: Response): Promise<void> => {
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

      const messages = await Message.findAll({
        where: { bookingId },
        order: [['createdAt', 'ASC']],
      });

      res.status(200).json({
        success: true,
        data: messages,
      });
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching messages',
      });
    }
  },

  // Send a message
  sendMessage: async (req: Request, res: Response): Promise<void> => {
    try {
      const customer = req.customer;
      const bookingId = parseInt(req.params.bookingId);
      const { content } = req.body;

      if (!customer) {
        res.status(401).json({
          success: false,
          message: 'Not authenticated',
        });
        return;
      }

      if (!content || content.trim() === '') {
        res.status(400).json({
          success: false,
          message: 'Message content is required',
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

      const message = await Message.create({
        bookingId,
        customerId: customer.id,
        content,
        senderType: 'customer',
        isRead: false,
      });

      res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: message,
      });
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({
        success: false,
        message: 'Error sending message',
      });
    }
  },
};
