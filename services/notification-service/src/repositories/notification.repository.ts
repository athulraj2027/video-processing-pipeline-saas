import { prisma } from '../config/db.js';
import type { Notification, INotificationRepository } from '../interfaces/index.js';

class PrismaNotificationRepository implements INotificationRepository {
  async createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Notification> {
    return await prisma.notification.create({
      data: {
        userId: notification.userId,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        status: 'unread',
      },
    });
  }

  async getNotificationsByUserId(userId: string): Promise<Notification[]> {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const found = await prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!found) {
      throw new Error('Notification not found or access denied');
    }

    return await prisma.notification.update({
      where: { id },
      data: { status: 'read' },
    });
  }
}

export const notificationRepository: INotificationRepository = new PrismaNotificationRepository();
export default notificationRepository;
