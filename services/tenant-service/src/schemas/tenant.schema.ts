import { z } from 'zod';

export const TenantStatusEnum = z.enum(['ONBOARDING', 'ACTIVE', 'SUSPENDED', 'DELETED']);
export const TenantPlanTypeEnum = z.enum(['STARTER', 'GROWTH', 'ENTERPRISE', 'CUSTOM']);
export const TenantBillingStatusEnum = z.enum(['TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'PAUSED']);

export const createTenantSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z.string().min(1, 'Slug is required').max(100).regex(/^[a-z0-9-]+$/, 'Slug must be alphanumeric or hyphens in lowercase'),
  status: TenantStatusEnum.optional(),
  planType: TenantPlanTypeEnum.optional(),
  billingStatus: TenantBillingStatusEnum.optional(),
  primarySubdomain: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Subdomain must be alphanumeric or hyphens in lowercase').optional(),
  primaryDomain: z.string().min(1).max(255).optional(),
  customDomain: z.string().min(1).max(255).optional(),
  stripeCustomerId: z.string().nullable().optional(),
  stripeConnectAcctId: z.string().nullable().optional(),
  billingEmail: z.string().email().nullable().optional(),
  supportEmail: z.string().email().nullable().optional(),
  trialEndsAt: z.preprocess((val) => (typeof val === 'string' ? new Date(val) : val), z.date()).optional(),
  branding: z.object({
    logoUrl: z.string().url().nullable().optional(),
    faviconUrl: z.string().url().nullable().optional(),
    primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color').optional(),
    secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color').optional(),
    backgroundColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color').optional(),
    playerSkin: z.string().optional(),
    customCss: z.string().nullable().optional(),
  }).optional(),
  settings: z.record(z.any()).optional(),
  limits: z.object({
    maxStorageBytes: z.number().nonnegative().optional(),
    maxBandwidthBytes: z.number().nonnegative().optional(),
    maxUsers: z.number().nonnegative().optional(),
  }).optional(),
  features: z.object({
    drmEnabled: z.boolean().optional(),
    geoRestrictionsEnabled: z.boolean().optional(),
    subtitlesEnabled: z.boolean().optional(),
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

export const updateSettingsSchema = z.record(z.any());

export const updateLimitsSchema = z.object({
  maxStorageBytes: z.number().nonnegative().optional(),
  maxBandwidthBytes: z.number().nonnegative().optional(),
  maxUsers: z.number().nonnegative().optional(),
});

export const updateFeaturesSchema = z.object({
  drmEnabled: z.boolean().optional(),
  geoRestrictionsEnabled: z.boolean().optional(),
  subtitlesEnabled: z.boolean().optional(),
});

export const updateStatusSchema = z.object({
  status: TenantStatusEnum,
});

export type CreateTenantDto = z.infer<typeof createTenantSchema>;
export type UpdateTenantDto = z.infer<typeof updateTenantSchema>;
export type UpdateBrandingDto = z.infer<typeof updateBrandingSchema>;
export type UpdateSettingsDto = z.infer<typeof updateSettingsSchema>;
export type UpdateLimitsDto = z.infer<typeof updateLimitsSchema>;
export type UpdateFeaturesDto = z.infer<typeof updateFeaturesSchema>;
export type UpdateStatusDto = z.infer<typeof updateStatusSchema>;
