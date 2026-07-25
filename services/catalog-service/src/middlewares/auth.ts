import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../errors/appError.js';
import {
  authenticate as jwtAuthenticate,
  optionalAuthenticate as jwtOptionalAuthenticate,
  requireRole as requireRoleBase,
} from '@saas-vod/auth-middleware';

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  jwtAuthenticate(req, res, next);
}

export async function optionalAuthenticate(req: Request, res: Response, next: NextFunction) {
  jwtOptionalAuthenticate(req, res, next);
}

/**
 * Middleware to enforce tenant-level isolation boundaries.
 * 1. super_admin has global access across all tenants.
 * 2. tenant_admin, tenant_staff, and viewers can only access resources matching their own tenantId.
 */
export function requireTenantAccess(req: Request, res: Response, next: NextFunction) {
  // If the gateway resolved a tenant ID, ensure it matches the user's tenantId (unless they are super_admin)
  if (!req.tenantId) {
    return next(new ForbiddenError('Tenant context is missing (X-Tenant-Id is required)'));
  }

  if (req.user) {
    if (req.user.role === 'super_admin') {
      return next();
    }
    if (req.user.tenantId && req.tenantId !== req.user.tenantId) {
      return next(new ForbiddenError('Access denied: User does not belong to this tenant'));
    }
  }

  next();
}

export function requireRole(allowedRoles: string[]) {
  return requireRoleBase(allowedRoles);
}
