import { Router } from 'express';
import { authenticate } from '@saas-vod/auth-middleware';
import { sendNotification, getUserNotifications, markAsRead } from '../controllers/notification.controller.js';
import { validateBody } from '../middlewares/validation.js';
import { sendNotificationSchema } from '../schemas/notification.schema.js';

const router = Router();

// Internal/External notification dispatch
router.post('/send', validateBody(sendNotificationSchema), sendNotification);

// User-facing in-app notifications
router.get('/', authenticate, getUserNotifications);
router.patch('/:id/read', authenticate, markAsRead);

export default router;
