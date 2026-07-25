import { Router } from 'express';
import {
  createTenant,
  getTenant,
  updateTenant,
  updateBranding,
  updateSettings,
  updateLimits,
  updateFeatures,
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
  updateLimitsSchema,
  updateFeaturesSchema,
  updateStatusSchema,
} from '../schemas/tenant.schema.js';

const router = Router();

// Public resolution endpoint
router.get('/resolve', resolveTenant);

// Global Tenant Administration (Platform Super Admin only)
router.post('/', authenticate, requireRole(['super_admin']), validateBody(createTenantSchema), createTenant);
router.get('/', authenticate, requireRole(['super_admin']), listTenants);
router.patch('/:id/status', authenticate, requireRole(['super_admin']), validateBody(updateStatusSchema), updateStatus);
router.put('/:id/settings', authenticate, requireRole(['super_admin']), validateBody(updateSettingsSchema), updateSettings);
router.put('/:id/limits', authenticate, requireRole(['super_admin']), validateBody(updateLimitsSchema), updateLimits);
router.put('/:id/features', authenticate, requireRole(['super_admin']), validateBody(updateFeaturesSchema), updateFeatures);
router.delete('/:id', authenticate, requireRole(['super_admin']), deleteTenant);

// Isolated Tenant Operations (Super Admin or matching Tenant Admin / Staff)
router.get('/:id', authenticate, requireTenantAccess, getTenant);
router.put('/:id', authenticate, requireTenantAccess, requireRole(['super_admin', 'tenant_admin']), validateBody(updateTenantSchema), updateTenant);
router.put('/:id/branding', authenticate, requireTenantAccess, requireRole(['super_admin', 'tenant_admin']), validateBody(updateBrandingSchema), updateBranding);

export default router;
