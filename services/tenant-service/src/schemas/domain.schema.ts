import { z } from 'zod';

export const DomainTypeEnum = z.enum(['SUBDOMAIN', 'CUSTOM_DOMAIN', 'PRIMARY_DOMAIN']);
export const DomainStatusEnum = z.enum(['PENDING', 'VERIFIED', 'ACTIVE', 'SUSPENDED', 'FAILED']);

export const addDomainSchema = z.object({
  host: z.string().min(1, 'Host domain name is required').max(255),
  type: DomainTypeEnum,
});

export type AddDomainDto = z.infer<typeof addDomainSchema>;
