import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service.js';
import catchAsync from '../utils/catchAsync.js';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../errors/appError.js';

const notificationService = new NotificationService();

export const sendNotification = catchAsync(async (req: Request, res: Response) => {
  const { channel, recipient, subject, body, html, template, data, userId, title, type } = req.body;

  if (channel === 'email') {
    if (!recipient) {
      throw new BadRequestError('Missing recipient email address');
    }

    let success = false;
    if (template === 'otp') {
      if (!data?.otpCode || !data?.otpType) {
        throw new BadRequestError('Missing OTP code or type parameters');
      }
      success = await notificationService.sendOtp(recipient, data.otpCode, data.otpType);
    } else if (template === 'welcome') {
      success = await notificationService.sendWelcome(recipient, data?.name || 'User');
    } else {
      if (!subject || !body) {
        throw new BadRequestError('Missing email subject or body content');
      }
      success = await notificationService.sendEmail(recipient, subject, body, html);
    }

    if (success) {
      res.status(200).json({ success: true, message: 'Email notification sent' });
    } else {
      res.status(500).json({ error: 'Failed to send email notification' });
    }
    return;
  }

  if (channel === 'in-app') {
    if (!userId || !title || !body) {
      throw new BadRequestError('Missing userId, title, or body parameters for in-app notification');
    }

    const notification = await notificationService.createInAppNotification({
      userId,
      title,
      message: body,
      type,
    });

    res.status(201).json({ success: true, data: notification });
    return;
  }

  throw new BadRequestError(`Unsupported channel: ${channel}. Must be 'email' or 'in-app'`);
});

export const getUserNotifications = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError('User context is missing');
  }

  const notifications = await notificationService.getInAppNotifications(userId);
  res.status(200).json({ success: true, data: notifications });
});

export const markAsRead = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) {
    throw new UnauthorizedError('User context is missing');
  }

  try {
    const updated = await notificationService.markAsRead(id, userId);
    res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    throw new NotFoundError(error.message);
  }
});
