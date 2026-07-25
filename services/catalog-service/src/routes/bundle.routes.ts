import { Router } from 'express';
import {
  createBundle,
  getBundle,
  getBundleBySlug,
  updateBundle,
  deleteBundle,
  listBundles,
} from '../controllers/bundle.controller.js';
import {
  authenticate,
  optionalAuthenticate,
  requireRole,
  requireTenantAccess,
} from '../middlewares/auth.js';
import { validateBody } from '../middlewares/validation.js';
import { createBundleSchema, updateBundleSchema } from '../schemas/bundle.schema.js';

const router = Router();

// Public Reading Endpoints
router.get('/', optionalAuthenticate, requireTenantAccess, listBundles);
router.get('/:id', optionalAuthenticate, requireTenantAccess, getBundle);
router.get('/slug/:slug', optionalAuthenticate, requireTenantAccess, getBundleBySlug);

// Tenant Administration Modification Endpoints
const writeRoles = requireRole(['super_admin', 'tenant_admin']);
router.post('/', authenticate, requireTenantAccess, writeRoles, validateBody(createBundleSchema), createBundle);
router.put('/:id', authenticate, requireTenantAccess, writeRoles, validateBody(updateBundleSchema), updateBundle);
router.delete('/:id', authenticate, requireTenantAccess, writeRoles, deleteBundle);

export default router;
