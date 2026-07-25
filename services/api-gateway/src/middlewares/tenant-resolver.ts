import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';

// Extend the Express Request interface to store tenant context
declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
    }
  }
}

const localTenantMap = new Map<string, string>();

if (env.TENANT_MAPPING) {
  const pairs = env.TENANT_MAPPING.split(',');
  for (const pair of pairs) {
    const [host, tenantId] = pair.split('=');
    if (host && tenantId) {
      localTenantMap.set(host.trim().toLowerCase(), tenantId.trim());
    }
  }
}

export function tenantResolver(req: Request, res: Response, next: NextFunction) {
  // 1. Resolve host from headers
  const rawHost = req.headers['x-tenant-host'] || req.headers['host'];
  
  if (!rawHost) {
    console.warn('Missing Host header for tenant resolution');
    res.status(400).json({
      error: 'Bad Request',
      message: 'Could not resolve tenant: Missing Host header.',
    });
    return;
  }

  const host = Array.isArray(rawHost) 
    ? rawHost[0].toLowerCase() 
    : rawHost.toLowerCase();

  // 2. Perform mapping lookup
  let tenantId = localTenantMap.get(host);

  // Fallback: strip port if host has it
  if (!tenantId && host.includes(':')) {
    const [hostname] = host.split(':');
    tenantId = localTenantMap.get(hostname);
  }

  // 3. Handle mapping failure
  if (!tenantId) {
    res.status(404).json({
      error: 'Not Found',
      message: `Tenant configuration for host '${host}' was not found.`,
    });
    return;
  }

  // 4. Attach context and set downstream response header
  req.tenantId = tenantId;
  res.setHeader('X-Tenant-Id', tenantId);

  next();
}
