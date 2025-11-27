"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";

type Notification = {
  id: string;
  type: "booking" | "package" | "user" | "system";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: "high" | "medium" | "low";
};

// Helper function to format relative time
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const typeColors = {
  booking: "bg-blue-100 text-blue-700",
  package: "bg-green-100 text-green-700",
  user: "bg-purple-100 text-purple-700",
  system: "bg-orange-100 text-orange-700",
};

const priorityColors = {
  high: "bg-red-500",
  medium: "bg-yellow-500",
  low: "bg-gray-400",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | Notification["type"]>("all");
  const [showRead, setShowRead] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dynamic notifications
  useEffect(() => {
    loadNotifications();
    // Refresh notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch bookings, packages, and users to generate notifications
      const [bookingsResponse, packagesResponse] = await Promise.all([
        api.getBookings({ all: true }).catch(() => []),
        api.getPackages({ limit: 50 }).catch(() => ({ data: [] })),
      ]);

      const bookings = Array.isArray(bookingsResponse) ? bookingsResponse : (bookingsResponse as any).data || [];
      const packages = (packagesResponse as any).data || [];

      // Generate notifications from bookings
      const bookingNotifications: Notification[] = bookings
        .slice(0, 20) // Limit to recent 20 bookings
        .map((booking: any, index: number) => {
          const bookingDate = booking.created_at ? new Date(booking.created_at) : new Date();
          const isRecent = Date.now() - bookingDate.getTime() < 24 * 60 * 60 * 1000; // Last 24 hours
          
          let title = "";
          let message = "";
          let priority: "high" | "medium" | "low" = "medium";
          
          if (booking.payment_status === "paid") {
            title = "Payment Received";
            message = `Payment of ${booking.total_amount ? `₹${Math.round(booking.total_amount)}` : "amount"} received for booking #BK-${String(booking.id).padStart(4, "0")}`;
            priority = "high";
          } else if (booking.status?.toLowerCase() === "cancelled") {
            title = "Booking Cancelled";
            message = `Booking #BK-${String(booking.id).padStart(4, "0")} for ${booking.package_name || "package"} has been cancelled`;
            priority = "medium";
          } else {
            title = "New Booking Received";
            const travelers = booking.adults || booking.travelers || 1;
            const children = booking.children || 0;
            message = `${booking.package_name || "Package"} - ${travelers} adult${travelers > 1 ? "s" : ""}${children > 0 ? `, ${children} child${children > 1 ? "ren" : ""}` : ""}`;
            priority = isRecent ? "high" : "medium";
          }

          return {
            id: `booking-${booking.id}`,
            type: "booking" as const,
            title,
            message,
            timestamp: formatRelativeTime(bookingDate),
            timestampDate: bookingDate, // Store actual date for sorting
            read: !isRecent,
            priority,
          };
        });

      // Generate notifications from packages
      const packageNotifications: Notification[] = packages
        .slice(0, 10) // Limit to recent 10 packages
        .map((pkg: any, index: number) => {
          const packageDate = pkg.created_at ? new Date(pkg.created_at) : new Date();
          const isRecent = Date.now() - packageDate.getTime() < 7 * 24 * 60 * 60 * 1000; // Last 7 days

          return {
            id: `package-${pkg.id}`,
            type: "package" as const,
            title: "Package Published",
            message: `${pkg.name || "Package"} has been ${pkg.is_featured ? "featured and " : ""}published successfully`,
            timestamp: formatRelativeTime(packageDate),
            timestampDate: packageDate, // Store actual date for sorting
            read: !isRecent,
            priority: pkg.is_featured ? "high" : "medium" as const,
          };
        });

      // Combine and sort by actual date (newest first)
      const allNotifications = [...bookingNotifications, ...packageNotifications]
        .sort((a, b) => {
          const aTime = (a as any).timestampDate?.getTime() || 0;
          const bTime = (b as any).timestampDate?.getTime() || 0;
          return bTime - aTime;
        })
        .map((notif) => {
          const { timestampDate, ...rest } = notif as any;
          return rest as Notification;
        }); // Remove timestampDate before setting state

      // Load read status from localStorage
      const readNotifications = JSON.parse(localStorage.getItem("readNotifications") || "[]");
      const notificationsWithReadStatus = allNotifications.map((notif) => ({
        ...notif,
        read: readNotifications.includes(notif.id) || notif.read,
      }));

      setNotifications(notificationsWithReadStatus);
    } catch (err: any) {
      console.error("Error loading notifications:", err);
      setError(err.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (filter !== "all" && notif.type !== filter) return false;
    if (!showRead && notif.read) return false;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)),
    );
    // Store read status in localStorage
    const readNotifications = JSON.parse(localStorage.getItem("readNotifications") || "[]");
    if (!readNotifications.includes(id)) {
      readNotifications.push(id);
      localStorage.setItem("readNotifications", JSON.stringify(readNotifications));
    }
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
    // Store all notification IDs as read
    const allIds = notifications.map((n) => n.id);
    localStorage.setItem("readNotifications", JSON.stringify(allIds));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    // Remove from read notifications if present
    const readNotifications = JSON.parse(localStorage.getItem("readNotifications") || "[]");
    const updated = readNotifications.filter((nid: string) => nid !== id);
    localStorage.setItem("readNotifications", JSON.stringify(updated));
  };


  const getTypeIcon = (type: Notification["type"]) => {
    switch (type) {
      case "booking":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
            <rect x="3.5" y="5" width="17" height="15" rx="2" />
            <path d="M8 3.5V6" strokeLinecap="round" />
            <path d="M16 3.5V6" strokeLinecap="round" />
            <path d="M3.5 9.5h17" strokeLinecap="round" />
          </svg>
        );
      case "package":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
            <rect x="4" y="4" width="7" height="7" rx="1.5" />
            <rect x="13" y="4" width="7" height="7" rx="1.5" />
            <rect x="4" y="13" width="7" height="7" rx="1.5" />
            <rect x="13" y="13" width="7" height="7" rx="1.5" />
          </svg>
        );
      case "user":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
            <circle cx="12" cy="8.5" r="3.5" />
            <path d="M5 19c0-3.314 3.134-6 7-6s7 2.686 7 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case "system":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 9h6M9 15h6" strokeLinecap="round" />
          </svg>
        );
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Notifications</h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage and view all system notifications and alerts
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Mark all as read
            </button>
          )}
          <div className="flex items-center gap-2 rounded-lg bg-(--color-brand-50) px-4 py-2">
            <span className="text-sm font-semibold text-(--color-brand-700)">
              {unreadCount} unread
            </span>
          </div>
        </div>
      </header>

      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                <rect x="3.5" y="5" width="17" height="15" rx="2" />
                <path d="M8 3.5V6" strokeLinecap="round" />
                <path d="M16 3.5V6" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-slate-500">Booking Notifications</p>
              <p className="text-lg font-semibold text-slate-900">
                {notifications.filter((n) => n.type === "booking").length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-700">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                <rect x="4" y="4" width="7" height="7" rx="1.5" />
                <rect x="13" y="4" width="7" height="7" rx="1.5" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-slate-500">Package Notifications</p>
              <p className="text-lg font-semibold text-slate-900">
                {notifications.filter((n) => n.type === "package").length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                <circle cx="12" cy="8.5" r="3.5" />
                <path d="M5 19c0-3.314 3.134-6 7-6s7 2.686 7 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-slate-500">User Notifications</p>
              <p className="text-lg font-semibold text-slate-900">
                {notifications.filter((n) => n.type === "user").length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-700">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-slate-500">System Notifications</p>
              <p className="text-lg font-semibold text-slate-900">
                {notifications.filter((n) => n.type === "system").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-slate-700">Filter:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 focus:border-(--color-brand-400) focus:outline-none focus:ring-2 focus:ring-(--color-brand-200)"
          >
            <option value="all">All Types</option>
            <option value="booking">Bookings</option>
            <option value="package">Packages</option>
            <option value="user">Users</option>
            <option value="system">System</option>
          </select>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showRead}
            onChange={(e) => setShowRead(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-(--color-brand-600) focus:ring-(--color-brand-200)"
          />
          <span className="text-sm text-slate-700">Show read notifications</span>
        </label>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-(--color-brand-600)"></div>
            <p className="mt-4 text-sm font-semibold text-slate-900">Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-12 text-center">
            <p className="text-sm font-semibold text-red-900">Error loading notifications</p>
            <p className="mt-1 text-sm text-red-700">{error}</p>
            <button
              onClick={loadNotifications}
              className="mt-4 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
            >
              Retry
            </button>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="mx-auto h-12 w-12 text-slate-400"
            >
              <path
                d="M18 11c0-3.314-2.686-6-6-6s-6 2.686-6 6c0 2.586-.516 4.016-1.268 4.912-.52.617-.78.926-.772 1.201.008.276.286.52.842 1.008C5.14 18.919 5.57 19 6 19h12c.43 0 .86-.081 1.198-.879.556-.488.834-.732.842-1.008.008-.275-.252-.584-.772-1.201C18.516 15.016 18 13.586 18 11Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M10 20a2 2 0 1 0 4 0" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="mt-4 text-sm font-semibold text-slate-900">No notifications found</p>
            <p className="mt-1 text-sm text-slate-600">Try adjusting your filters</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`group relative rounded-xl border bg-white p-5 transition hover:shadow-md ${
                notification.read
                  ? "border-slate-200"
                  : "border-brand-200 bg-brand-50/30"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${typeColors[notification.type]}`}
                >
                  {getTypeIcon(notification.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3
                          className={`text-sm font-semibold ${
                            notification.read ? "text-slate-700" : "text-slate-900"
                          }`}
                        >
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <span className="h-2 w-2 rounded-full bg-(--color-brand-600)" />
                        )}
                      </div>
                      <p className="mt-1 text-sm text-slate-600">{notification.message}</p>
                      <p className="mt-2 text-xs text-slate-500">{notification.timestamp}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${priorityColors[notification.priority]}`}
                        title={notification.priority}
                      />
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="opacity-0 transition group-hover:opacity-100"
                        title="Delete notification"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          className="h-4 w-4 text-slate-400 hover:text-red-600"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="mt-2 text-xs font-semibold text-(--color-brand-600) hover:text-(--color-brand-700)"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

