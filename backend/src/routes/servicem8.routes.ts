import { Router } from 'express';
import {
  testConnection,
  getServiceM8Companies,
  linkCustomerToServiceM8,
  syncCustomerJobs,
  syncAllCustomers,
  getCustomerServiceM8Info
} from '../controllers/servicem8.controller';

const router = Router();

// Test ServiceM8 connection (public for testing)
router.get('/test', testConnection);

// Admin routes for ServiceM8 management
// TODO: Add admin authentication middleware
router.get('/companies', getServiceM8Companies);
router.post('/customers/:customerId/link', linkCustomerToServiceM8);
router.post('/customers/:customerId/sync', syncCustomerJobs);
router.post('/sync-all', syncAllCustomers);
router.get('/customers/:customerId/info', getCustomerServiceM8Info);

export default router;
