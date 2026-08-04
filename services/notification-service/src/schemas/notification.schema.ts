import { z } from 'zod';

export const sendNotificationSchema = z.object({
  channel: z.enum(['email', 'in-app']),
  recipient: z.string().email('Invalid email address').optional(),
  subject: z.string().optional(),
  body: z.string().optional(),
  html: z.string().optional(),
  template: z.enum(['otp', 'welcome']).optional(),
  data: z.record(z.any()).optional(),
  userId: z.string().optional(),
  title: z.string().optional(),
  type: z.enum(['info', 'success', 'warning', 'error']).optional(),
}).refine((data) => {
  if (data.channel === 'email' && !data.recipient) {
    return false;
  }
  return true;
}, {
  message: 'recipient is required when channel is email',
  path: ['recipient'],
}).refine((data) => {
  if (data.channel === 'in-app' && (!data.userId || !data.title || !data.body)) {
    return false;
  }
  return true;
}, {
  message: 'userId, title, and body are required when channel is in-app',
  path: ['userId'],
});
