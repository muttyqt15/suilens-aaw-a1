import { db } from '../db';
import { notifications } from '../db/schema';

interface CreateNotificationInput {
  orderId: string;
  type: string;
  recipient: string;
  message: string;
}

export const NotificationService = {
  async createNotification(input: CreateNotificationInput) {
    const [notification] = await db.insert(notifications).values(input).returning();
    return notification;
  },
};
