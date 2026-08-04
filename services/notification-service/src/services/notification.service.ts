import { MailService } from './mail.service.js';
import { notificationRepository } from '../repositories/notification.repository.js';

export interface CreateNotificationInput {
  userId: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

export class NotificationService {
  private mailService: MailService;

  constructor() {
    this.mailService = new MailService();
  }

  // Send an email (external triggers)
  async sendEmail(to: string, subject: string, body: string, html?: string): Promise<boolean> {
    return this.mailService.sendEmail(to, subject, body, html);
  }

  // Send OTP validation code
  async sendOtp(to: string, otpCode: string, type: 'VERIFY_EMAIL' | 'RESET_PASSWORD'): Promise<boolean> {
    return this.mailService.sendOtpEmail(to, otpCode, type);
  }

  // Send welcome letter
  async sendWelcome(to: string, name: string): Promise<boolean> {
    return this.mailService.sendWelcomeEmail(to, name);
  }

  // In-app Notifications (Popups / Db entries)
  async createInAppNotification(input: CreateNotificationInput) {
    return notificationRepository.createNotification({
      userId: input.userId,
      title: input.title,
      message: input.message,
      type: input.type || 'info',
    });
  }

  async getInAppNotifications(userId: string) {
    return notificationRepository.getNotificationsByUserId(userId);
  }

  async markAsRead(id: string, userId: string) {
    return notificationRepository.markAsRead(id, userId);
  }
}
