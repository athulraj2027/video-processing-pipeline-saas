import { z } from 'zod';

export const TenantRoleEnum = z.enum(['OWNER', 'ADMIN', 'STAFF', 'SUPPORT', 'ANALYST', 'VIEWER']);

export const addUserSchema = z.object({
  userId: z.string().uuid('User ID must be a valid UUID'),
  role: TenantRoleEnum,
});

export const updateUserRoleSchema = z.object({
  role: TenantRoleEnum,
});

export type AddUserDto = z.infer<typeof addUserSchema>;
export type UpdateUserRoleDto = z.infer<typeof updateUserRoleSchema>;
