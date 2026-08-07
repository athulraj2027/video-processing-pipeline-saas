import { Router } from 'express';
import {
  addTenantUser,
  updateTenantUserRole,
  removeTenantUser,
  listTenantUsers,
  syncUser,
} from '../controllers/user.controller.js';
import {
  authenticate,
  requireRole,
  requireTenantAccess,
} from '../middlewares/auth.js';
import { validateBody } from '../middlewares/validation.js';
import {
  addUserSchema,
  updateUserRoleSchema,
} from '../schemas/user.schema.js';

const router = Router();

// Internal User Synchronization Route (Called by Identity Service)
router.post('/users/sync', syncUser);

// Team Membership Context Operations (Super Admin or matching Tenant Admin)
router.post('/:id/users', authenticate, requireTenantAccess, requireRole(['super_admin', 'tenant_admin']), validateBody(addUserSchema), addTenantUser);
router.get('/:id/users', authenticate, requireTenantAccess, requireRole(['super_admin', 'tenant_admin', 'tenant_staff']), listTenantUsers);
router.put('/:id/users/:userId', authenticate, requireTenantAccess, requireRole(['super_admin', 'tenant_admin']), validateBody(updateUserRoleSchema), updateTenantUserRole);
router.delete('/:id/users/:userId', authenticate, requireTenantAccess, requireRole(['super_admin', 'tenant_admin']), removeTenantUser);

export default router;
