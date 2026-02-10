import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validation';
import * as apiController from '../controllers/apiController';
import { createApiSchema, updateApiSchema } from '../middleware/schemas';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// CRUD endpoints for API management
// Requirements: 1.1, 2.1, 3.1, 4.1, 8.1

// Create new API wrapper
router.post('/', validate(createApiSchema), apiController.createApi);

// List all APIs for authenticated user
router.get('/', apiController.listApis);

// Get single API by ID
router.get('/:id', apiController.getApi);

// Get metrics for an API
router.get('/:id/metrics', apiController.getApiMetrics);

// Update API configuration
router.patch('/:id', validate(updateApiSchema), apiController.updateApi);

// Delete API
router.delete('/:id', apiController.deleteApi);

export default router;
