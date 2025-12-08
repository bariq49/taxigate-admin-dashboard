"use client";

import { useEffect, useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification, type Notification } from "@/lib/api/notifications";
import { useAuth } from "@/hooks/use-auth";
import { useAbly } from "@/contexts/ably-context";
import toast from "react-hot-toast";

/**
 * Play notification sound
 */
const playNotificationSound = () => {
  try {
    // Create audio context for notification sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Set a pleasant notification sound (two-tone chime)
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    console.warn("Could not play notification sound:", error);
  }
};

/**
 * Hook to manage notifications with real-time updates via Ably
 */
export const useNotifications = (limit: number = 20) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { subscribe, isConnected } = useAbly();

  // Fetch notifications (unread only for dropdown)
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["notifications", "dropdown", limit],
    queryFn: () => getNotifications({ limit, isRead: false }),
    enabled: !!user,
    staleTime: 60000, // Cache for 1 minute
    refetchInterval: false, // Disable automatic refetch - rely on Ably for real-time updates
  });

  // Fetch unread count
  const {
    data: unreadCountData,
    refetch: refetchUnreadCount,
  } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: getUnreadCount,
    enabled: !!user,
    staleTime: 60000, // Cache for 1 minute
    refetchInterval: false, // Disable automatic refetch - rely on Ably for real-time updates
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      refetchUnreadCount();
      toast.success("Notification marked as read");
    },
    onError: (error: any) => {
      console.error("Error marking notification as read:", error);
      toast.error(error?.response?.data?.message || "Failed to mark notification as read");
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      refetchUnreadCount();
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      refetchUnreadCount();
      toast.success("Notification deleted successfully");
    },
    onError: (error: any) => {
      console.error("Error deleting notification:", error);
      toast.error(error?.response?.data?.message || "Failed to delete notification");
    },
  });

  // Subscribe to Ably events for real-time notifications
  useEffect(() => {
    if (!user || !isConnected) {
      console.log("⏸️ [NOTIFICATIONS] Not subscribing - user:", !!user, "isConnected:", isConnected);
      return;
    }
    
    console.log("✅ [NOTIFICATIONS] Setting up Ably subscriptions for admin notifications...");

    // Helper function to update notifications cache optimistically
    const updateNotificationsCache = (newNotification: Partial<Notification>) => {
      // Update notifications list cache
      queryClient.setQueryData(
        ["notifications", "dropdown", limit],
        (oldData: { notifications: Notification[] } | undefined) => {
          if (!oldData) return oldData;
          
          // Check if notification already exists (avoid duplicates)
          const exists = oldData.notifications.some(
            (n) => n.bookingId === newNotification.bookingId && n.type === newNotification.type
          );
          
          if (exists) return oldData;
          
          // Add new notification at the beginning
          const notification: Notification = {
            id: newNotification.id || `temp-${Date.now()}`,
            type: newNotification.type || "booking-created",
            title: newNotification.title || "New Notification",
            message: newNotification.message || "",
            bookingId: newNotification.bookingId,
            bookingDetails: newNotification.bookingDetails,
            isRead: false,
            priority: newNotification.priority || "medium",
            data: newNotification.data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          return {
            ...oldData,
            notifications: [notification, ...oldData.notifications].slice(0, limit),
          };
        }
      );

      // Update unread count cache
      queryClient.setQueryData(
        ["notifications", "unread-count"],
        (oldCount: number | undefined) => {
          return (oldCount || 0) + 1;
        }
      );
    };

    // Subscribe to booking-expired-admin event
    const unsubscribeExpired = subscribe("booking-expired-admin", (message: any) => {
      console.log("🔔 Received booking-expired-admin notification:", message.data);
      
      // Play notification sound
      playNotificationSound();
      
      // Update cache optimistically
      if (message.data) {
        updateNotificationsCache({
          id: message.data.bookingId || `expired-${Date.now()}`,
          type: "booking-expired",
          title: message.data.message || "Booking Expired - Manual Assignment Required",
          message: message.data.detailedMessage || message.data.message || "A booking has expired and requires manual assignment.",
          bookingId: message.data.bookingId,
          bookingDetails: message.data.bookingDetails || {
            from_location: message.data.from_location,
            to_location: message.data.to_location,
            price: message.data.price,
            user_name: message.data.user_name || "",
            email: message.data.email || "",
          },
          priority: message.data.priority || "high",
          data: message.data,
        });
      }
    });

    // Subscribe to booking-created-admin event
    const unsubscribeCreated = subscribe("booking-created-admin", (message: any) => {
      console.log("🔔 Received booking-created-admin notification:", message.data);
      
      // Play notification sound
      playNotificationSound();
      
      // Update cache optimistically
      if (message.data) {
        updateNotificationsCache({
          id: message.data.bookingId || `created-${Date.now()}`,
          type: "booking-created",
          title: message.data.title || "New Booking Created",
          message: message.data.message || `A new booking from ${message.data.from_location} to ${message.data.to_location} has been created.`,
          bookingId: message.data.bookingId,
          bookingDetails: {
            from_location: message.data.from_location,
            to_location: message.data.to_location,
            price: message.data.price,
            user_name: message.data.user_name || "",
            email: message.data.email || "",
          },
          priority: message.data.priority || "medium",
          data: message.data,
        });
      }
    });

    // Subscribe to booking-completed event (with driver information)
    const unsubscribeCompleted = subscribe("booking-completed", (message: any) => {
      console.log("🔔 Received booking-completed notification:", message.data);
      
      // Play notification sound
      playNotificationSound();
      
      // Update cache optimistically
      if (message.data) {
        const driverInfo = message.data.driver 
          ? ` by ${message.data.driver.name || 'Driver'} (${message.data.driver.phone || 'N/A'})`
          : '';
        
        updateNotificationsCache({
          id: message.data.id || message.data.bookingId || `completed-${Date.now()}`,
          type: "booking-completed",
          title: message.data.title || "Booking Completed",
          message: message.data.message || message.data.detailedMessage || `Booking from ${message.data.from_location} to ${message.data.to_location} has been completed${driverInfo}.`,
          bookingId: message.data.id || message.data.bookingId,
          bookingDetails: {
            from_location: message.data.from_location,
            to_location: message.data.to_location,
            price: message.data.price,
            user_name: message.data.user_name || "",
            email: message.data.email || "",
            completedAt: message.data.completedAt,
          },
          priority: message.data.priority || "medium",
          data: {
            ...message.data,
            driverDetails: message.data.driver, // Include driver information in data
          },
        });
      }
    });

    // Subscribe to booking-assigned event (when admin assigns booking to driver)
    const unsubscribeAssigned = subscribe("booking-assigned", (message: any) => {
      console.log("🔔 Received booking-assigned notification:", message.data);
      
      // Play notification sound
      playNotificationSound();
      
      // Update cache optimistically
      if (message.data) {
        updateNotificationsCache({
          id: message.data.id || message.data.bookingId || `assigned-${Date.now()}`,
          type: "booking-assigned",
          title: message.data.title || "Booking Assigned to Driver",
          message: message.data.message || `Booking from ${message.data.from_location} to ${message.data.to_location} has been assigned to a driver.`,
          bookingId: message.data.id || message.data.bookingId,
          bookingDetails: {
            from_location: message.data.from_location,
            to_location: message.data.to_location,
            price: message.data.price,
            user_name: message.data.user_name || "",
            email: message.data.email || "",
            driverId: message.data.assignedTo,
          },
          priority: message.data.priority || "medium",
          data: {
            ...message.data,
            assignedTo: message.data.assignedTo,
            assignmentType: message.data.assignmentType,
          },
        });
      }
    });

    // Subscribe to booking-accepted-admin event (when driver accepts admin-assigned booking)
    console.log("📡 [NOTIFICATIONS] Subscribing to 'booking-accepted-admin' event...");
    const unsubscribeAcceptedAdmin = subscribe("booking-accepted-admin", (message: any) => {
      console.log("🔔 [DASHBOARD] Received booking-accepted-admin notification:", message);
      console.log("🔔 [DASHBOARD] Message data:", message.data);
      console.log("🔔 [DASHBOARD] Full message:", JSON.stringify(message, null, 2));
      
      // Play notification sound
      playNotificationSound();
      
      // Show toast notification
      toast.success(
        `Driver accepted assigned booking: ${message.data?.from_location || 'N/A'} → ${message.data?.to_location || 'N/A'}`,
        {
          duration: 5000,
          position: 'top-right',
        }
      );
      
      // Update cache optimistically
      if (message.data) {
        updateNotificationsCache({
          id: message.data.id || message.data.bookingId || `accepted-admin-${Date.now()}`,
          type: "booking-accepted-admin",
          title: message.data.title || "Driver Accepted Assigned Booking",
          message: message.data.message || `Driver accepted the admin-assigned booking from ${message.data.from_location} to ${message.data.to_location}.`,
          bookingId: message.data.id || message.data.bookingId,
          bookingDetails: {
            from_location: message.data.from_location,
            to_location: message.data.to_location,
            price: message.data.price,
            user_name: message.data.user_name || "",
            email: message.data.email || "",
            driverId: message.data.acceptedBy,
          },
          priority: message.data.priority || "high",
          data: {
            ...message.data,
            acceptedBy: message.data.acceptedBy,
            assignmentType: message.data.assignmentType,
          },
        });
      } else {
        console.warn("⚠️ [DASHBOARD] booking-accepted-admin notification received but message.data is missing");
      }
    });

    // Subscribe to booking-rejected-admin event (when driver rejects admin-assigned booking)
    const unsubscribeRejectedAdmin = subscribe("booking-rejected-admin", (message: any) => {
      console.log("🔔 Received booking-rejected-admin notification:", message.data);
      
      // Play notification sound
      playNotificationSound();
      
      // Update cache optimistically
      if (message.data) {
        const rejectionReason = message.data.rejectionReason 
          ? ` Reason: ${message.data.rejectionReason}`
          : '';
        
        updateNotificationsCache({
          id: message.data.id || message.data.bookingId || `rejected-admin-${Date.now()}`,
          type: "booking-rejected-admin",
          title: message.data.title || "Driver Rejected Assigned Booking",
          message: message.data.message || `Driver rejected the admin-assigned booking from ${message.data.from_location} to ${message.data.to_location}.${rejectionReason}`,
          bookingId: message.data.id || message.data.bookingId,
          bookingDetails: {
            from_location: message.data.from_location,
            to_location: message.data.to_location,
            price: message.data.price,
            user_name: message.data.user_name || "",
            email: message.data.email || "",
            driverId: message.data.rejectedBy,
            rejectionReason: message.data.rejectionReason,
          },
          priority: message.data.priority || "high",
          data: {
            ...message.data,
            rejectedBy: message.data.rejectedBy,
            rejectionReason: message.data.rejectionReason,
            assignmentType: message.data.assignmentType,
          },
        });
      }
    });

    // Cleanup subscriptions
    return () => {
      unsubscribeExpired();
      unsubscribeCreated();
      unsubscribeCompleted();
      unsubscribeAssigned();
      unsubscribeAcceptedAdmin();
      unsubscribeRejectedAdmin();
    };
  }, [user, isConnected, subscribe, queryClient, limit]);

  const notifications = data?.notifications || [];
  const unreadCount = unreadCountData || 0;

  const handleMarkAsRead = useCallback((notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  }, [markAsReadMutation]);

  const handleMarkAllAsRead = useCallback(() => {
    markAllAsReadMutation.mutate();
  }, [markAllAsReadMutation]);

  const handleDeleteNotification = useCallback((notificationId: string) => {
    deleteNotificationMutation.mutate(notificationId);
  }, [deleteNotificationMutation]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    refetch,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    deleteNotification: handleDeleteNotification,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    isDeleting: deleteNotificationMutation.isPending,
  };
};



