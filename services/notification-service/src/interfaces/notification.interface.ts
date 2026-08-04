export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface INotificationRepository {
  createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Notification>;
  getNotificationsByUserId(userId: string): Promise<Notification[]>;
  markAsRead(id: string, userId: string): Promise<Notification>;
}
