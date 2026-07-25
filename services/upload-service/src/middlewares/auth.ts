import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../errors/appError.js';
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
 * Enforces tenant-level isolation boundaries.
 */
export function requireTenantAccess(req: Request, res: Response, next: NextFunction) {
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
