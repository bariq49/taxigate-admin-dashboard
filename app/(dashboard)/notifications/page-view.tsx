"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotifications, markAsRead, markAllAsRead, deleteNotification, type Notification } from "@/lib/api/notifications";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";
import { 
  Bell, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Trash2, 
  CheckCheck,
  Loader2,
  Calendar,
  MapPin,
  DollarSign,
  User
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const NotificationsPageView = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 20;

  // Fetch notifications based on active tab
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["notifications", "all", activeTab, page, limit],
    queryFn: () => getNotifications({ 
      page, 
      limit,
      isRead: activeTab === "unread" ? false : undefined 
    }),
    staleTime: 30000,
    refetchInterval: 60000,
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Notification marked as read");
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All notifications marked as read");
      if (activeTab === "unread") {
        setActiveTab("all");
      }
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Notification deleted");
      setDeleteDialogOpen(false);
      setNotificationToDelete(null);
    },
  });

  const notifications = data?.notifications || [];
  const pagination = data?.pagination;
  const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }

    // Navigate based on notification type
    if (notification.type === "booking-expired" && notification.bookingId) {
      router.push(`/bookings?tab=expired`);
    } else if (notification.type === "booking-assigned" && notification.bookingId) {
      router.push(`/bookings/${notification.bookingId}`);
    } else if (notification.type === "booking-created" && notification.bookingId) {
      router.push(`/bookings/${notification.bookingId}`);
    }
  };

  const handleDelete = (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotificationToDelete(notificationId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (notificationToDelete) {
      deleteNotificationMutation.mutate(notificationToDelete);
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass = cn(
      "h-5 w-5",
      priority === "high" && "text-orange-500",
      priority === "urgent" && "text-red-500",
      priority === "medium" && "text-blue-500",
      priority === "low" && "text-gray-500"
    );

    switch (type) {
      case "booking-expired":
        return <Clock className={iconClass} />;
      case "booking-assigned":
        return <CheckCircle2 className={iconClass} />;
      case "booking-created":
        return <Bell className={iconClass} />;
      case "booking-cancelled":
        return <AlertCircle className={iconClass} />;
      default:
        return <Bell className={iconClass} />;
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === "high" || priority === "urgent") {
      return "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300";
    }
    switch (type) {
      case "booking-expired":
        return "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300";
      case "booking-assigned":
        return "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300";
      case "booking-created":
        return "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            Manage and view all your notifications
          </p>
        </div>
        {unreadCount > 0 && activeTab === "unread" && (
          <Button
            onClick={handleMarkAllAsRead}
            disabled={markAllAsReadMutation.isPending}
            variant="outline"
            className="gap-2"
          >
            {markAllAsReadMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Marking...
              </>
            ) : (
              <>
                <CheckCheck className="h-4 w-4" />
                Mark All as Read
              </>
            )}
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "all" | "unread")}>
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="all" className="gap-2">
                  All
                  {pagination && (
                    <Badge color="secondary" className="ml-1">
                      {pagination.total}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="unread" className="gap-2">
                  Unread
                  {unreadCount > 0 && (
                    <Badge color="destructive" className="ml-1">
                      {unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={activeTab} className="mt-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                  <p className="text-destructive">Error loading notifications</p>
                  <Button onClick={() => refetch()} variant="outline" className="mt-4">
                    Retry
                  </Button>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Bell className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">
                    No {activeTab === "unread" ? "unread " : ""}notifications
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    You're all caught up!
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[600px]">
                  <div className="space-y-2">
                    {notifications.map((notification: Notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          "group relative rounded-lg border p-4 transition-all hover:shadow-md cursor-pointer",
                          !notification.isRead && "bg-muted/50 border-primary/20",
                          notification.isRead && "bg-background border-border"
                        )}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-4">
                          <Avatar className={cn("h-12 w-12 rounded-lg", getNotificationColor(notification.type, notification.priority))}>
                            <AvatarFallback className="bg-transparent">
                              {getNotificationIcon(notification.type, notification.priority)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className={cn(
                                    "text-sm font-semibold",
                                    !notification.isRead && "text-foreground",
                                    notification.isRead && "text-muted-foreground"
                                  )}>
                                    {notification.title}
                                  </h3>
                                  {!notification.isRead && (
                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {notification.message}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => handleDelete(notification.id, e)}
                              >
                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </div>

                            {notification.bookingDetails && (
                              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span className="font-medium">{notification.bookingDetails.from_location}</span>
                                  <span>→</span>
                                  <span className="font-medium">{notification.bookingDetails.to_location}</span>
                                </div>
                                {notification.bookingDetails.price && (
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="h-3 w-3" />
                                    <span>{notification.bookingDetails.price}</span>
                                  </div>
                                )}
                                {notification.bookingDetails.user_name && (
                                  <div className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    <span>{notification.bookingDetails.user_name}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-2">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                </span>
                                <span>•</span>
                                <span>
                                  {format(new Date(notification.createdAt), "MMM d, yyyy 'at' h:mm a")}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {notification.priority}
                                </Badge>
                                {notification.isRead ? (
                                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsReadMutation.mutate(notification.id);
                                    }}
                                  >
                                    Mark as read
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {pagination && pagination.pages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Page {pagination.page} of {pagination.pages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                        disabled={page === pagination.pages}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </ScrollArea>
              )}
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Notification</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this notification? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteNotificationMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default NotificationsPageView;

