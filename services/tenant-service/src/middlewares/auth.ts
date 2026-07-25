import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../errors/appError.js';
import { requireRole as requireRoleBase } from '@saas-vod/auth-middleware';

export { authenticate, optionalAuthenticate } from '@saas-vod/auth-middleware';

/**
 * Middleware to enforce tenant-level isolation boundaries.
 * 1. super_admin has global access across all tenants.
 * 2. tenant_admin, tenant_staff, and viewers can only access resources matching their own tenantId.
 */
export function requireTenantAccess(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication required'));
  }

  // Super admins have unrestricted platform-wide access
  if (req.user.role === 'super_admin') {
    return next();
  }

  // Validate the resolved tenant context (from gateway/header mapping)
  if (req.tenantId && req.tenantId !== req.user.tenantId) {
    return next(new ForbiddenError('Access denied: User does not belong to this tenant'));
  }

  // Validate path parameter boundaries (e.g., /api/v1/tenants/:id)
  const pathTenantId = req.params.id;
  if (pathTenantId && pathTenantId !== req.user.tenantId) {
    return next(new ForbiddenError('Access denied: Cannot access or modify another tenant profile'));
  }

  next();
}

export function requireRole(allowedRoles: string[]) {
  return requireRoleBase(allowedRoles);
}
