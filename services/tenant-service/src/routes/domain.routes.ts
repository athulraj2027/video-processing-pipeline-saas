import { Router } from 'express';
import {
  addDomain,
  listDomains,
  verifyDomain,
  deleteDomain,
} from '../controllers/domain.controller.js';
import {
  authenticate,
  requireRole,
  requireTenantAccess,
} from '../middlewares/auth.js';
import { validateBody } from '../middlewares/validation.js';
import { addDomainSchema } from '../schemas/domain.schema.js';

const router = Router();

// Domain Management Operations (Super Admin or matching Tenant Admin)
router.post('/:id/domains', authenticate, requireTenantAccess, requireRole(['super_admin', 'tenant_admin']), validateBody(addDomainSchema), addDomain);
router.get('/:id/domains', authenticate, requireTenantAccess, requireRole(['super_admin', 'tenant_admin', 'tenant_staff']), listDomains);
router.patch('/domains/:domainId/verify', authenticate, requireRole(['super_admin', 'tenant_admin']), verifyDomain);
router.delete('/domains/:domainId', authenticate, requireRole(['super_admin', 'tenant_admin']), deleteDomain);

export default router;
