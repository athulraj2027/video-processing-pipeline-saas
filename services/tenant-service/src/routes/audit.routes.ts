import { Router } from 'express';
import { listAuditLogs } from '../controllers/audit.controller.js';
import {
  authenticate,
  requireRole,
  requireTenantAccess,
} from '../middlewares/auth.js';

const router = Router();

// Audit Log Routes (Super Admin or Tenant Admin)
router.get('/:id/audit-logs', authenticate, requireTenantAccess, requireRole(['super_admin', 'tenant_admin']), listAuditLogs);

export default router;
