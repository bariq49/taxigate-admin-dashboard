/**
 * Notifications API Functions
 */

import { api } from "@/config/axios.config";
import type { ApiResponse } from "@/lib/types/auth.types";

export interface Notification {
  id: string;
  _id?: string; // MongoDB _id field (fallback)
  type: "booking-expired" | "booking-assigned" | "booking-cancelled" | "booking-created" | "booking-completed" | "booking-accepted-admin" | "booking-rejected-admin" | "system";
  title: string;
  message: string;
  bookingId?: string;
  bookingDetails?: {
    from_location: string;
    to_location: string;
    price: string;
    user_name: string;
    email: string;
    completedAt?: string;
    driverId?: string;
    rejectionReason?: string;
  };
  isRead: boolean;
  readBy?: string;
  readAt?: string;
  priority: "low" | "medium" | "high" | "urgent";
  data?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponseData {
  notifications: Notification[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

export interface UnreadCountResponseData {
  count: number;
}

export type NotificationsResponse = ApiResponse<NotificationsResponseData>;
export type UnreadCountResponse = ApiResponse<UnreadCountResponseData>;
export type NotificationResponse = ApiResponse<{ notification: Notification }>;

export interface GetNotificationsParams {
  page?: number;
  limit?: number;
  isRead?: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://taxigate-driver-panel.vercel.app';

/**
 * Get all notifications
 */
export const getNotifications = async (
  params?: GetNotificationsParams
): Promise<NotificationsResponseData> => {
  const response = await api.get<NotificationsResponse>(
    `${API_BASE_URL}/api/notifications`,
    { params }
  );
  return response.data.data;
};

/**
 * Get unread notifications count
 */
export const getUnreadCount = async (): Promise<number> => {
  const response = await api.get<UnreadCountResponse>(
    `${API_BASE_URL}/api/notifications/unread-count`
  );
  return response.data.data.count;
};

/**
 * Mark notification as read
 */
export const markAsRead = async (notificationId: string): Promise<Notification> => {
  const response = await api.patch<NotificationResponse>(
    `${API_BASE_URL}/api/notifications/${notificationId}/read`
  );
  return response.data.data.notification;
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (): Promise<void> => {
  await api.patch(`${API_BASE_URL}/api/notifications/all/read`);
};

/**
 * Delete notification
 */
export const deleteNotification = async (notificationId: string): Promise<void> => {
  await api.delete(`${API_BASE_URL}/api/notifications/${notificationId}`);
};

