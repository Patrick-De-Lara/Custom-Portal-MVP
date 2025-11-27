import { Router } from 'express';
import healthRoutes from './health';
import authRoutes from './auth.routes';
import bookingRoutes from './booking.routes';
import messageRoutes from './message.routes';
import fileRoutes from './file.routes';
import servicem8Routes from './servicem8.routes';

const router = Router();

// Mount route modules
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/bookings', bookingRoutes);
router.use('/messages', messageRoutes);
router.use('/files', fileRoutes);
router.use('/servicem8', servicem8Routes);

export default router;
