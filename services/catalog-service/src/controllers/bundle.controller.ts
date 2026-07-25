import { Request, Response } from 'express';
import { bundleService } from '../services/bundle.service.js';
import catchAsync from '../utils/catchAsync.js';

export const createBundle = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const bundle = await bundleService.createBundle(tenantId, req.body);
  res.status(201).json({
    message: 'Bundle created successfully',
    bundle,
  });
});

export const getBundle = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const { id } = req.params;
  const bundle = await bundleService.getBundleById(tenantId, id, req.user?.role);
  res.json({ bundle });
});

export const getBundleBySlug = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const { slug } = req.params;
  const bundle = await bundleService.getBundleBySlug(tenantId, slug, req.user?.role);
  res.json({ bundle });
});

export const updateBundle = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const { id } = req.params;
  const bundle = await bundleService.updateBundle(tenantId, id, req.body);
  res.json({
    message: 'Bundle details updated successfully',
    bundle,
  });
});

export const deleteBundle = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const { id } = req.params;
  await bundleService.deleteBundle(tenantId, id);
  res.json({ message: 'Bundle deleted successfully' });
});

export const listBundles = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const bundles = await bundleService.listBundles(tenantId, req.user?.role);
  res.json({ bundles });
});
