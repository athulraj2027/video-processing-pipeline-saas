import { z } from 'zod';

export const createTenantSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z.string().min(1, 'Slug is required').max(100).regex(/^[a-z0-9-]+$/, 'Slug must be alphanumeric or hyphens in lowercase'),
  subdomain: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Subdomain must be alphanumeric or hyphens in lowercase').optional(),
  customDomain: z.string().min(1).max(255).optional(),
  status: z.enum(['onboarding', 'active', 'suspended', 'deleted']).optional(),
  branding: z.object({
    logoUrl: z.string().url().nullable().optional(),
    faviconUrl: z.string().url().nullable().optional(),
    primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color').optional(),
    secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color').optional(),
    backgroundColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color').optional(),
    playerSkin: z.string().optional(),
    customCss: z.string().nullable().optional(),
  }).optional(),
  settings: z.object({
    billingPlan: z.enum(['starter', 'growth', 'enterprise']).optional(),
    maxStorageBytes: z.number().nonnegative().optional(),
    maxBandwidthBytes: z.number().nonnegative().optional(),
    stripeCustomerId: z.string().nullable().optional(),
    stripeAccountId: z.string().nullable().optional(),
    features: z.object({
      drmEnabled: z.boolean().optional(),
      geoRestrictionsEnabled: z.boolean().optional(),
      subtitlesEnabled: z.boolean().optional(),
    }).optional(),
  }).optional(),
});

export const updateTenantSchema = createTenantSchema.partial().omit({ status: true });

export const updateBrandingSchema = z.object({
  logoUrl: z.string().url().nullable().optional(),
  faviconUrl: z.string().url().nullable().optional(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color').optional(),
  secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color').optional(),
  backgroundColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color').optional(),
  playerSkin: z.string().optional(),
  customCss: z.string().nullable().optional(),
});

export const updateSettingsSchema = z.object({
  billingPlan: z.enum(['starter', 'growth', 'enterprise']).optional(),
  maxStorageBytes: z.number().nonnegative().optional(),
  maxBandwidthBytes: z.number().nonnegative().optional(),
  stripeCustomerId: z.string().nullable().optional(),
  stripeAccountId: z.string().nullable().optional(),
  features: z.object({
    drmEnabled: z.boolean().optional(),
    geoRestrictionsEnabled: z.boolean().optional(),
    subtitlesEnabled: z.boolean().optional(),
  }).optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(['onboarding', 'active', 'suspended', 'deleted'], {
    errorMap: () => ({ message: 'Status must be one of: onboarding, active, suspended, deleted' }),
  }),
});
export type CreateTenantDto = z.infer<typeof createTenantSchema>;
export type UpdateTenantDto = z.infer<typeof updateTenantSchema>;
export type UpdateBrandingDto = z.infer<typeof updateBrandingSchema>;
export type UpdateSettingsDto = z.infer<typeof updateSettingsSchema>;
export type UpdateStatusDto = z.infer<typeof updateStatusSchema>;
