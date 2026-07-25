import { Request, Response } from 'express';
import { auditService } from '../services/audit.service.js';
import catchAsync from '../utils/catchAsync.js';

export const listAuditLogs = catchAsync(async (req: Request, res: Response) => {
  const { id: tenantId } = req.params;
  const auditLogs = await auditService.listAuditLogs(tenantId);
  res.json({ auditLogs });
});
