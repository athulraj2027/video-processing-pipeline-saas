import { Request, Response } from 'express';
import { tenantService } from '../services/tenant.service.js';
import catchAsync from '../utils/catchAsync.js';

export const createTenant = catchAsync(async (req: Request, res: Response) => {
  const tenant = await tenantService.createTenant(req.body);
  res.status(201).json({
    message: 'Tenant created successfully',
    tenant,
  });
});

export const getTenant = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const tenant = await tenantService.getTenantById(id);
  res.json({ tenant });
});

export const updateTenant = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const tenant = await tenantService.updateTenant(id, req.body);
  res.json({
    message: 'Tenant details updated successfully',
    tenant,
  });
});

export const updateBranding = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const tenant = await tenantService.updateBranding(id, req.body);
  res.json({
    message: 'Tenant branding updated successfully',
    tenant,
  });
});

export const updateSettings = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const tenant = await tenantService.updateSettings(id, req.body);
  res.json({
    message: 'Tenant settings updated successfully',
    tenant,
  });
});

export const updateStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const tenant = await tenantService.updateStatus(id, status);
  res.json({
    message: `Tenant status updated to '${status}' successfully`,
    tenant,
  });
});

export const deleteTenant = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await tenantService.deleteTenant(id);
  res.json({ message: 'Tenant deleted successfully' });
});

export const listTenants = catchAsync(async (req: Request, res: Response) => {
  const tenants = await tenantService.listTenants();
  res.json({ tenants });
});

export const resolveTenant = catchAsync(async (req: Request, res: Response) => {
  const host = req.query.host as string;
  const tenant = await tenantService.resolveTenantByHost(host);
  res.json({ tenant });
});
