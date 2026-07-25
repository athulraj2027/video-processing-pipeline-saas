import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../errors/appError.js';
import {
  authenticate as jwtAuthenticate,
  optionalAuthenticate as jwtOptionalAuthenticate,
  requireRole as requireRoleBase,
} from '@saas-vod/auth-middleware';
import { apiKeyService } from '../services/apiKey.service.js';

/**
 * Custom authentication middleware.
 * Supports:
 * 1. x-api-key header authentication.
 * 2. Standard JWT token authentication (forwarded via Gateway or directly).
 */
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const apiKeyHeader = req.headers['x-api-key'];
  if (apiKeyHeader) {
    try {
      const apiKeyRecord = await apiKeyService.verifyApiKey(String(apiKeyHeader));
      req.user = {
        id: `api-key-${apiKeyRecord.id}`,
        role: 'tenant_admin', // Treat API Key actors as tenant_admin scope
        email: `apikey-${apiKeyRecord.keyPrefix}@tenant.com`,
        tenantId: apiKeyRecord.tenantId,
      };
      req.tenantId = apiKeyRecord.tenantId;
      return next();
    } catch (err: any) {
      return next(new UnauthorizedError(err.message || 'Invalid API Key'));
    }
  }

  jwtAuthenticate(req, res, next);
}

export async function optionalAuthenticate(req: Request, res: Response, next: NextFunction) {
  const apiKeyHeader = req.headers['x-api-key'];
  if (apiKeyHeader) {
    try {
      const apiKeyRecord = await apiKeyService.verifyApiKey(String(apiKeyHeader));
      req.user = {
        id: `api-key-${apiKeyRecord.id}`,
        role: 'tenant_admin',
        email: `apikey-${apiKeyRecord.keyPrefix}@tenant.com`,
        tenantId: apiKeyRecord.tenantId,
      };
      req.tenantId = apiKeyRecord.tenantId;
      return next();
    } catch (err) {
      // Treat invalid API key as unauthenticated guest in optional mode
    }
  }

  jwtOptionalAuthenticate(req, res, next);
}

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
