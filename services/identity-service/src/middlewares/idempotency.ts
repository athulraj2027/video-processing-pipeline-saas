import type { Request, Response, NextFunction } from 'express';
import { idempotencyRepository } from '../repositories/idempotency.repository.js';
import { ConflictError } from '../errors/appError.js';

/**
 * Express middleware to enforce request idempotency.
 * Checks for case-insensitive `Idempotency-Key` or `X-Idempotency-Key` in POST/PUT/PATCH requests.
 */
export async function idempotency(req: Request, res: Response, next: NextFunction) {
  // Only apply to state-modifying requests
  if (req.method !== 'POST' && req.method !== 'PUT' && req.method !== 'PATCH') {
    return next();
  }

  const keyHeader = req.headers['idempotency-key'] || req.headers['x-idempotency-key'];
  if (!keyHeader) {
    return next();
  }

  const key = Array.isArray(keyHeader) ? keyHeader[0] : keyHeader;
  if (!key.trim()) {
    return next();
  }

  // Set TTL/Expiry for the cached request (default: 24 hours)
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  try {
    // 1. Attempt lock acquisition via raw SQL INSERT ... ON CONFLICT DO NOTHING
    const acquired = await idempotencyRepository.createRecord(key, expiresAt);

    if (!acquired) {
      // 2. Lock failed. Fetch the existing record to see status
      const record = await idempotencyRepository.getRecord(key);

      if (!record) {
        // Record was either expired or cleared. Try acquiring the lock one more time.
        const retryAcquired = await idempotencyRepository.createRecord(key, expiresAt);
        if (!retryAcquired) {
          throw new ConflictError('Concurrent request with this key is already processing');
        }
      } else if (record.status === 'processing') {
        throw new ConflictError('A request with this idempotency key is already processing');
      } else {
        // Request was completed, respond with the cached payload
        const cachedStatus = parseInt(record.status, 10) || 200;
        res.status(cachedStatus);
        res.setHeader('x-cache-lookup', 'HIT - IDEMPOTENT');

        let bodyParsed: any;
        try {
          bodyParsed = record.response ? JSON.parse(record.response) : null;
        } catch {
          bodyParsed = record.response;
        }

        return res.json(bodyParsed);
      }
    }

    // 3. Lock acquired successfully. Override send to intercept controller response
    const originalSend = res.send;
    let isSaved = false;

    res.send = function (body: any) {
      if (isSaved) {
        return originalSend.call(this, body);
      }

      const statusCode = res.statusCode;

      if (statusCode >= 500) {
        // Clear lock on server error to let client retry later
        idempotencyRepository.deleteRecord(key).catch((err) => {
          console.error('Failed to clear idempotency lock on error:', err);
        });
      } else {
        // Cache response for successful operations or client failures (4xx)
        const responseStr = typeof body === 'string' ? body : JSON.stringify(body);
        idempotencyRepository.updateRecord(key, statusCode.toString(), responseStr).catch((err) => {
          console.error('Failed to update idempotency cache:', err);
        });
      }

      isSaved = true;
      return originalSend.call(this, body);
    };

    next();
  } catch (err) {
    next(err);
  }
}
