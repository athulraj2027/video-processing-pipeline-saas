import { Request, Response } from 'express';
import { domainService } from '../services/domain.service.js';
import catchAsync from '../utils/catchAsync.js';

export const addDomain = catchAsync(async (req: Request, res: Response) => {
  const { id: tenantId } = req.params;
  const { host, type } = req.body;
  const domain = await domainService.addDomain(tenantId, host, type);
  res.status(201).json({
    message: 'Domain mapping added successfully',
    domain,
  });
});

export const listDomains = catchAsync(async (req: Request, res: Response) => {
  const { id: tenantId } = req.params;
  const domains = await domainService.listDomains(tenantId);
  res.json({ domains });
});

export const verifyDomain = catchAsync(async (req: Request, res: Response) => {
  const { domainId } = req.params;
  const domain = await domainService.verifyDomain(domainId);
  res.json({
    message: 'Domain verification succeeded',
    domain,
  });
});

export const deleteDomain = catchAsync(async (req: Request, res: Response) => {
  const { domainId } = req.params;
  await domainService.deleteDomain(domainId);
  res.json({ message: 'Domain mapping deleted successfully' });
});
