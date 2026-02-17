import { Router } from 'express';
import { authenticateToken, authenticateFlexible } from '../middleware/auth';
import { validate } from '../middleware/validation';
import * as apiController from '../controllers/apiController';
import { createApiSchema, updateApiSchema } from '../middleware/schemas';

const router = Router();

// PUBLIC API Key Generation (NO authentication required!)
// Anyone can generate an API key by providing their wallet address
router.post('/keys/generate', apiController.generateApiKeyPublic);

// API Key Management (requires JWT authentication)
// Generate new API key for authenticated users (legacy)
router.post('/keys', authenticateToken, apiController.generateApiKey);

// List all API keys
router.get('/keys', authenticateToken, apiController.listApiKeys);

// Get API key usage stats
router.get('/keys/:id/usage', authenticateToken, apiController.getApiKeyUsage);

// Revoke an API key
router.delete('/keys/:id', authenticateToken, apiController.revokeApiKey);

// CRUD endpoints for API management
// Requirements: 1.1, 2.1, 3.1, 4.1, 8.1
// All endpoints support both JWT and API key authentication

// Create new API wrapper (supports both JWT and API key)
router.post('/', authenticateFlexible, validate(createApiSchema), apiController.createApi);

// List all APIs (supports both JWT and API key)
router.get('/', authenticateFlexible, apiController.listApis);

// Get single API by ID (supports both JWT and API key)
router.get('/:id', authenticateFlexible, apiController.getApi);

// Get metrics for an API (supports both JWT and API key)
router.get('/:id/metrics', authenticateFlexible, apiController.getApiMetrics);

// Update API configuration (supports both JWT and API key)
router.patch('/:id', authenticateFlexible, validate(updateApiSchema), apiController.updateApi);

// Delete API (supports both JWT and API key)
router.delete('/:id', authenticateFlexible, apiController.deleteApi);

export default router;
