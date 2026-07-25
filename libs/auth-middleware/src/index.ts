import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface UserPayload {
  id: string;
  role: string;
  email: string;
  tenantId?: string;
}

// Extend Express Request namespace globally in this module context
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
      tenantId?: string;
    }
  }
}

// Helper to extract JWT token from Request Authorization header
function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_signing_key_at_least_8_chars';

  // 1. Check if gateway already injected the headers
  const headerUserId = req.headers['x-user-id'];
  const headerUserRole = req.headers['x-user-role'];
  const headerUserEmail = req.headers['x-user-email'];
  const headerTenantId = req.headers['x-tenant-id'];

  if (headerUserId && headerUserRole && headerUserEmail) {
    req.user = {
      id: String(headerUserId),
      role: String(headerUserRole),
      email: String(headerUserEmail),
      tenantId: headerTenantId ? String(headerTenantId) : undefined,
    };
    if (headerTenantId) {
      req.tenantId = String(headerTenantId);
    }
    return next();
  }

  // 2. If not, extract and verify the token
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Access token is missing',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    req.user = decoded;
    if (decoded.tenantId) {
      req.tenantId = decoded.tenantId;
    }
    next();
  } catch (err) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired access token',
    });
  }
}

export function optionalAuthenticate(req: Request, res: Response, next: NextFunction) {
  const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_signing_key_at_least_8_chars';

  // 1. Check if gateway already injected the headers
  const headerUserId = req.headers['x-user-id'];
  const headerUserRole = req.headers['x-user-role'];
  const headerUserEmail = req.headers['x-user-email'];
  const headerTenantId = req.headers['x-tenant-id'];

  if (headerUserId && headerUserRole && headerUserEmail) {
    req.user = {
      id: String(headerUserId),
      role: String(headerUserRole),
      email: String(headerUserEmail),
      tenantId: headerTenantId ? String(headerTenantId) : undefined,
    };
    if (headerTenantId) {
      req.tenantId = String(headerTenantId);
    }
    return next();
  }

  // 2. If not, check token
  const token = extractToken(req);
  if (!token) {
    // If tenant-id header is present, still inject it
    if (headerTenantId) {
      req.tenantId = String(headerTenantId);
    }
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    req.user = decoded;
    if (decoded.tenantId) {
      req.tenantId = decoded.tenantId;
    }
  } catch (err) {
    // Treat invalid token as unauthenticated guest
  }
  next();
}

export function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to perform this action',
      });
      return;
    }

    next();
  };
}
