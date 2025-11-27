import { Router } from 'express';
import { bookingController } from '../controllers/booking.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All booking routes require authentication
router.use(authenticateToken);

router.get('/', bookingController.getBookings);
router.get('/:id', bookingController.getBookingById);
router.post('/', bookingController.createBooking);

export default router;
