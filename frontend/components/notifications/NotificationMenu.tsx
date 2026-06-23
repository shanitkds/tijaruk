"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, LoaderCircle } from "lucide-react";

import api from "../../api/axios";
import { useNotificationSocket } from "../../hooks/useNotificationSocket";

type NotificationItem = {
  id: number;
  title: string;
  message: string;
  notification_type: "info" | "alert" | "warning" | "reminder";
  is_read: boolean;
  read_at: string | null;
  created_at: string;
};

type NotificationMenuProps = {
  buttonClassName?: string;
  iconClassName?: string;
  onNotificationReceived?: () => void;
};

function formatNotificationTime(value: string) {
  const date = new Date(value);
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));

  if (elapsedSeconds < 60) return "Just now";
  if (elapsedSeconds < 3600) return `${Math.floor(elapsedSeconds / 60)}m ago`;
  if (elapsedSeconds < 86400) return `${Math.floor(elapsedSeconds / 3600)}h ago`;
  if (elapsedSeconds < 604800) return `${Math.floor(elapsedSeconds / 86400)}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  });
}

export default function NotificationMenu({
  buttonClassName = "relative flex size-10 items-center justify-center rounded-full border border-[#e5e7eb] text-[#6b7280] transition hover:bg-[#f8f9fa]",
  iconClassName = "size-4",
  onNotificationReceived,
}: NotificationMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const unreadCount = notifications.filter((notification) => !notification.is_read).length;

  async function loadNotifications(markAsViewed = false) {
    setIsLoading(true);
    setLoadError("");

    try {
      const { data } = await api.get<NotificationItem[]>("/notifications/");
      setNotifications(data);

      if (markAsViewed && data.some((notification) => !notification.is_read)) {
        setNotifications((current) =>
          current.map((notification) => ({ ...notification, is_read: true }))
        );

        try {
          await api.patch("/notifications/read-all/");
        } catch {
          setNotifications(data);
        }
      }
    } catch {
      setLoadError("Unable to load notifications.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  useNotificationSocket(() => {
    loadNotifications();
    onNotificationReceived?.();
  });

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  return (
    <div ref={menuRef} className="relative shrink-0">
      <button
        aria-expanded={isOpen}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        className={buttonClassName}
        onClick={() => {
          const nextIsOpen = !isOpen;
          setIsOpen(nextIsOpen);
          if (nextIsOpen) loadNotifications(true);
        }}
        type="button"
      >
        <Bell aria-hidden="true" className={iconClassName} />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#e39b4d] px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-full z-[100] mt-3 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white text-left shadow-[0_18px_50px_rgba(31,17,35,0.18)]">
          <div className="flex items-center justify-between border-b border-[#eef0f3] px-4 py-3.5">
            <div>
              <h2 className="text-sm font-bold text-[#111827]">Notifications</h2>
              <p className="mt-0.5 text-xs text-[#9ca3af]">
                {unreadCount ? `${unreadCount} unread` : "You are all caught up"}
              </p>
            </div>
          </div>

          <div className="max-h-[380px] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-[#6b7280]">
                <LoaderCircle className="size-4 animate-spin" />
                Loading notifications...
              </div>
            ) : loadError ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-[#6b7280]">{loadError}</p>
                <button
                  className="mt-3 text-xs font-semibold text-[#65096c]"
                  onClick={() => loadNotifications(true)}
                  type="button"
                >
                  Try again
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <Bell className="mx-auto size-7 text-[#d1d5db]" />
                <p className="mt-3 text-sm font-semibold text-[#374151]">No notifications yet</p>
                <p className="mt-1 text-xs text-[#9ca3af]">New updates will appear here.</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  className={`flex w-full gap-3 border-b border-[#f1f2f4] px-4 py-3.5 text-left last:border-b-0 ${
                    notification.is_read ? "bg-white" : "bg-[#fbf5fb]"
                  }`}
                  key={notification.id}
                >
                  <span
                    className={`mt-1.5 size-2 shrink-0 rounded-full ${
                      notification.is_read ? "bg-[#d1d5db]" : "bg-[#e39b4d]"
                    }`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-[#111827]">
                      {notification.title}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-[#6b7280]">
                      {notification.message}
                    </span>
                    <span className="mt-1.5 block text-[11px] font-medium text-[#9ca3af]">
                      {formatNotificationTime(notification.created_at)}
                    </span>
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
