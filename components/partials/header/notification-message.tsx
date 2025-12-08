"use client";

import React from "react";
import { Bell, Clock, AlertCircle, CheckCircle2, XCircle, UserPlus, MapPin, DollarSign, Trash2, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import shortImage from "@/public/images/all-img/short-image-2.png";
import { useNotifications } from "@/hooks/use-notifications";
import type { Notification as NotificationType } from "@/lib/api/notifications";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const NotificationMessage = () => {
  const router = useRouter();
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, deleteNotification, isMarkingAllAsRead, isDeleting } = useNotifications(10);

  const handleNotificationClick = (notification: any, e?: React.MouseEvent) => {
    // Don't navigate if clicking on action buttons
    if (e && (e.target as HTMLElement).closest('.notification-action')) {
      return;
    }

    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.type === "booking-expired" && notification.bookingId) {
      router.push(`/bookings?tab=expired`);
    } else if (notification.type === "booking-created" && notification.bookingId) {
      // Navigate to live bookings tab for new bookings
      router.push(`/bookings?tab=live`);
    } else if (notification.type === "booking-assigned" && notification.bookingId) {
      router.push(`/bookings?tab=assigned`);
    } else if (notification.type === "booking-completed" && notification.bookingId) {
      // Navigate to completed bookings or booking details
      router.push(`/bookings/${notification.bookingId}`);
    } else if (notification.bookingId) {
      // Default: navigate to booking details
      router.push(`/bookings/${notification.bookingId}`);
    } else {
      // Fallback: navigate to bookings page
      router.push(`/bookings`);
    }
  };

  const handleMarkAsReadClick = (e: React.MouseEvent, notification: any) => {
    e.stopPropagation();
    // MongoDB returns _id, but we normalize it to id in the API
    // Check both just in case
    const notificationId = notification.id || notification._id || (notification as any)?._id?.toString();

    if (!notificationId) {
      toast.error("Invalid notification ID");
      console.error("Notification ID is missing. Full notification object:", notification);
      return;
    }

    // Ensure it's a string
    const idString = String(notificationId);
    markAsRead(idString);
  };

  const handleDeleteClick = (e: React.MouseEvent, notification: any) => {
    e.stopPropagation();
    // MongoDB returns _id, but we normalize it to id in the API
    // Check both just in case
    const notificationId = notification.id || notification._id || (notification as any)?._id?.toString();

    if (!notificationId) {
      toast.error("Invalid notification ID");
      console.error("Notification ID is missing. Full notification object:", notification);
      return;
    }

    // Ensure it's a string
    const idString = String(notificationId);

    if (window.confirm("Are you sure you want to delete this notification?")) {
      deleteNotification(idString);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "booking-expired":
        return <Clock className="h-5 w-5 text-orange-500" />;
      case "booking-assigned":
        return <UserPlus className="h-5 w-5 text-blue-500" />;
      case "booking-created":
        return <Bell className="h-5 w-5 text-green-500" />;
      case "booking-completed":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "booking-cancelled":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string, priority?: string) => {
    if (priority === "high") {
      return "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300";
    }
    switch (type) {
      case "booking-expired":
        return "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300";
      case "booking-assigned":
        return "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300";
      case "booking-created":
        return "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300";
      case "booking-completed":
        return "bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300";
      case "booking-cancelled":
        return "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  const getNotificationInitials = (notification: any) => {
    if (notification.bookingDetails?.user_name) {
      const initials = notification.bookingDetails.user_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
      return initials;
    }
    return "BK";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative md:h-9 md:w-9 h-8 w-8 hover:bg-default-100 dark:hover:bg-default-200 
 data-[state=open]:bg-default-100 dark:data-[state=open]:bg-default-200 
 hover:text-primary text-default-500 dark:text-default-800 rounded-full "
        >
          <Bell className="h-5 w-5 " />
          {unreadCount > 0 && (
            <Badge className="w-4 h-4 p-0 text-xs font-medium items-center justify-center absolute left-[calc(100%-18px)] bottom-[calc(100%-16px)] ring-2 ring-primary-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className=" z-[999] mx-4 lg:w-[412px] p-0"
      >
        <DropdownMenuLabel
          style={{ backgroundImage: `url(${shortImage.src})` }}
          className="w-full h-full bg-cover bg-no-repeat p-4 flex items-center"
        >
          <span className="text-base font-semibold text-white flex-1">
            Notification
          </span>
          {unreadCount > 0 && (
            <span
              className="text-xs font-medium text-white flex-0 cursor-pointer hover:underline hover:decoration-default-100 dark:decoration-default-900"
              onClick={(e) => {
                e.preventDefault();
                markAllAsRead();
              }}
            >
              {isMarkingAllAsRead ? "Marking..." : "Mark all as read"}
            </span>
          )}
        </DropdownMenuLabel>
        <div className="h-[300px] xl:h-[350px]">
          <ScrollArea className="h-full">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4">
                <Bell className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground text-center">No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => {
                // Normalize ID - MongoDB returns _id, API should normalize to id
                const notificationWithId = notification as unknown as NotificationType & { _id?: string };
                const notificationId = notification.id || notificationWithId._id || '';

                return (
                  <DropdownMenuItem
                    key={notificationId || `notification-${Math.random()}`}
                    className={cn(
                      "flex gap-3 py-3 px-4 cursor-pointer transition-colors relative group",
                      !notification.isRead && "bg-primary/5 dark:bg-primary/10 border-l-2 border-l-primary"
                    )}
                    onClick={(e) => handleNotificationClick(notification, e)}
                  >
                    <div className="flex-1 flex items-center gap-3">
                      <Avatar className="h-11 w-11 rounded-lg flex-shrink-0">
                        <AvatarFallback className={cn(
                          "text-xs font-semibold rounded-lg",
                          getNotificationColor(notification.type, notification.priority)
                        )}>
                          {getNotificationIcon(notification.type)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="text-sm font-semibold text-default-900 line-clamp-1 flex-1">
                            {notification.title}
                          </div>
                          {!notification.isRead && (
                            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                          )}
                        </div>
                        <div className="text-xs text-default-600 line-clamp-2 mb-1">
                          {notification.message}
                        </div>
                        {notification.bookingDetails && (
                          <div className="flex flex-col gap-1 mt-2">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span className="line-clamp-1">
                                {notification.bookingDetails.from_location} → {notification.bookingDetails.to_location}
                              </span>
                            </div>
                            {notification.bookingDetails.price && (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <DollarSign className="h-3 w-3" />
                                <span>€{parseFloat(notification.bookingDetails.price || "0").toFixed(2)}</span>
                              </div>
                            )}
                            {/* Show driver information for completed bookings */}
                            {notification.type === "booking-completed" && notification.data?.driverDetails && (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                                <UserPlus className="h-3 w-3" />
                                <span className="line-clamp-1">
                                  Driver: {notification.data.driverDetails.name || 'N/A'}
                                  {notification.data.driverDetails.phone && ` (${notification.data.driverDetails.phone})`}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity notification-action">
                        {!notification.isRead && (
                          <button
                            onClick={(e) => handleMarkAsReadClick(e, notification)}
                            className="p-1.5 rounded-md hover:bg-primary/10 text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Mark as read"
                            disabled={isDeleting}
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => handleDeleteClick(e, notification)}
                          className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete notification"
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <div
                        className={cn(
                          "text-xs whitespace-nowrap",
                          notification.isRead ? "text-muted-foreground" : "text-default-700 font-medium"
                        )}
                      >
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                  </DropdownMenuItem>
                );
              })
            )}
          </ScrollArea>
        </div>
        <DropdownMenuSeparator />
        <div className="m-4 mt-5">
          <Button asChild className="w-full">
            <Link href="/notifications">View All Notifications</Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationMessage;


