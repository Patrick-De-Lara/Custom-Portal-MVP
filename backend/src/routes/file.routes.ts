import { Router } from 'express';
import { fileController } from '../controllers/file.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All file routes require authentication
router.use(authenticateToken);

router.get('/:bookingId', fileController.getFiles);
router.post('/:bookingId', fileController.addFile);

export default router;
