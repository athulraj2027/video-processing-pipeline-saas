import { Router } from 'express';
import {
  createApiKey,
  listApiKeys,
  revokeApiKey,
} from '../controllers/apiKey.controller.js';
import {
  authenticate,
  requireRole,
  requireTenantAccess,
} from '../middlewares/auth.js';
import { validateBody } from '../middlewares/validation.js';
import { createApiKeySchema } from '../schemas/apiKey.schema.js';

const router = Router();

// API Key Management Routes (Super Admin or Tenant Admin)
router.post('/:id/keys', authenticate, requireTenantAccess, requireRole(['super_admin', 'tenant_admin']), validateBody(createApiKeySchema), createApiKey);
router.get('/:id/keys', authenticate, requireTenantAccess, requireRole(['super_admin', 'tenant_admin']), listApiKeys);
router.delete('/:id/keys/:keyId', authenticate, requireTenantAccess, requireRole(['super_admin', 'tenant_admin']), revokeApiKey);

export default router;
