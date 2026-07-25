import { Request, Response } from 'express';
import { apiKeyService } from '../services/apiKey.service.js';
import catchAsync from '../utils/catchAsync.js';

export const createApiKey = catchAsync(async (req: Request, res: Response) => {
  const { id: tenantId } = req.params;
  const { name, scopes, expiresAt } = req.body;
  const apiKey = await apiKeyService.createApiKey(tenantId, name, scopes, expiresAt);
  res.status(201).json({
    message: 'API Key generated successfully. Save it now, it will not be shown again.',
    apiKey,
  });
});

export const listApiKeys = catchAsync(async (req: Request, res: Response) => {
  const { id: tenantId } = req.params;
  const apiKeys = await apiKeyService.listApiKeys(tenantId);
  res.json({ apiKeys });
});

export const revokeApiKey = catchAsync(async (req: Request, res: Response) => {
  const { id: tenantId, keyId } = req.params;
  await apiKeyService.revokeApiKey(tenantId, keyId);
  res.json({ message: 'API Key revoked successfully' });
});
