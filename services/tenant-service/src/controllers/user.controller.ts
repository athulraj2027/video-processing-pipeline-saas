import { Request, Response } from 'express';
import { userService } from '../services/user.service.js';
import catchAsync from '../utils/catchAsync.js';

export const addTenantUser = catchAsync(async (req: Request, res: Response) => {
  const { id: tenantId } = req.params;
  const { userId, role } = req.body;
  const member = await userService.addTenantUser(tenantId, userId, role);
  res.status(201).json({
    message: 'User team membership added successfully',
    member,
  });
});

export const updateTenantUserRole = catchAsync(async (req: Request, res: Response) => {
  const { id: tenantId, userId } = req.params;
  const { role } = req.body;
  const member = await userService.updateTenantUserRole(tenantId, userId, role);
  res.json({
    message: 'User team role updated successfully',
    member,
  });
});

export const removeTenantUser = catchAsync(async (req: Request, res: Response) => {
  const { id: tenantId, userId } = req.params;
  await userService.removeTenantUser(tenantId, userId);
  res.json({ message: 'User team membership removed successfully' });
});

export const listTenantUsers = catchAsync(async (req: Request, res: Response) => {
  const { id: tenantId } = req.params;
  const users = await userService.listTenantUsers(tenantId);
  res.json({ users });
});

export const syncUser = catchAsync(async (req: Request, res: Response) => {
  const { id, email } = req.body;
  const user = await userService.syncUser(id, email);
  res.status(200).json({
    success: true,
    user,
  });
});
