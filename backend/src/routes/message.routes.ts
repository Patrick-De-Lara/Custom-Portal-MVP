import { Router } from 'express';
import { messageController } from '../controllers/message.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All message routes require authentication
router.use(authenticateToken);

router.get('/:bookingId', messageController.getMessages);
router.post('/:bookingId', messageController.sendMessage);

export default router;
