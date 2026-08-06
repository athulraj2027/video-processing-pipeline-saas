import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { UserPayload } from '../config/jwt.js';



// Helper to extract JWT token from Request Authorization header
function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

// Sanitize user context headers to prevent spoofing
function sanitizeHeaders(req: Request) {
  delete req.headers['x-user-id'];
  delete req.headers['x-user-role'];
  delete req.headers['x-user-email'];
  delete req.headers['x-tenant-id'];
}

// Strict Auth: Blocks and returns 401 if token is missing or invalid
export function authenticate(req: Request, res: Response, next: NextFunction) {
  sanitizeHeaders(req);
  const token = extractToken(req);

  if (!token) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Access token is missing',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as UserPayload;
    req.user = decoded;

    // Inject identity headers for downstream microservices
    if (decoded.id) req.headers['x-user-id'] = decoded.id;
    if (decoded.role) req.headers['x-user-role'] = decoded.role;
    if (decoded.email) req.headers['x-user-email'] = decoded.email;
    if (decoded.tenantId) req.headers['x-tenant-id'] = decoded.tenantId;

    next();
  } catch (err) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired access token',
    });
  }
}

// Optional Auth: Decodes token if present, lets guest pass if missing
export function optionalAuthenticate(req: Request, res: Response, next: NextFunction) {
  sanitizeHeaders(req);
  const token = extractToken(req);

  if (!token) {
    next();
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as UserPayload;
    req.user = decoded;

    // Inject identity headers for downstream microservices
    if (decoded.id) req.headers['x-user-id'] = decoded.id;
    if (decoded.role) req.headers['x-user-role'] = decoded.role;
    if (decoded.email) req.headers['x-user-email'] = decoded.email;
  } catch (err) {
    // If token verification fails, do not throw. Just strip any mock headers
    delete req.headers['x-user-id'];
    delete req.headers['x-user-role'];
    delete req.headers['x-user-email'];
  }

  next();
}
