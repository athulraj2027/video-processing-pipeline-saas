import { Router } from 'express';
import {
  createTenant,
  getTenant,
  updateTenant,
  updateBranding,
  updateSettings,
  updateStatus,
  deleteTenant,
  listTenants,
  resolveTenant,
} from '../controllers/tenant.controller.js';
import {
  authenticate,
  requireRole,
  requireTenantAccess,
} from '../middlewares/auth.js';
import { validateBody } from '../middlewares/validation.js';
import {
  createTenantSchema,
  updateTenantSchema,
  updateBrandingSchema,
  updateSettingsSchema,
  updateStatusSchema,
} from '../schemas/tenant.schema.js';

const router = Router();

// 1. Public resolution endpoint (used by API Gateway or Storefront)
router.get('/resolve', resolveTenant);

// 2. Global Tenant Management (Platform Super Admin only)
router.post('/', authenticate, requireRole(['super_admin']), validateBody(createTenantSchema), createTenant);
router.get('/', authenticate, requireRole(['super_admin']), listTenants);
router.patch('/:id/status', authenticate, requireRole(['super_admin']), validateBody(updateStatusSchema), updateStatus);
router.put('/:id/settings', authenticate, requireRole(['super_admin']), validateBody(updateSettingsSchema), updateSettings);
router.delete('/:id', authenticate, requireRole(['super_admin']), deleteTenant);

// 3. Isolated Tenant Operations (Super Admin or matching Tenant Admin / Staff)
router.get('/:id', authenticate, requireTenantAccess, getTenant);
router.put('/:id', authenticate, requireTenantAccess, requireRole(['super_admin', 'tenant_admin']), validateBody(updateTenantSchema), updateTenant);
router.put('/:id/branding', authenticate, requireTenantAccess, requireRole(['super_admin', 'tenant_admin']), validateBody(updateBrandingSchema), updateBranding);

export default router;
