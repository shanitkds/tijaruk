"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, FileText, XCircle } from "lucide-react";
import api from "../../api/axios";
import { dashboardToast } from "../admin/AdminToast";
import DashboardStatCard from "./DashboardStatCard";
import MessagesPanel from "./MessagesPanel";
import RecentRfqsTable from "./RecentRfqsTable";
import RecentUpdates from "./RecentUpdates";
import SectionCard from "./SectionCard";
import type {
  DashboardMessage,
  DashboardStat,
  RecentRfq,
  RecentUpdate,
  RfqStatus,
} from "./userDashboardData";

type ApiRfq = {
  id: number;
  rfq_id: string;
  product_name: string | null;
  product_type: "DOMESTIC" | "INTERNATIONAL" | null;
  quantity_required: number;
  unit_name: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  created_at: string;
};

type ApiNotification = {
  id: number;
  title: string;
  message: string;
  notification_type: "info" | "alert" | "warning" | "reminder";
  created_at: string;
};

type ApiConversation = {
  id: number;
  title: string;
  last_message_at: string | null;
  last_message_preview: string | null;
  support_unread_count: number;
};

const statConfig = [
  { title: "Total RFQs", status: null, icon: FileText, iconClassName: "bg-[#f4e7f5] text-[#65096c]" },
  { title: "Pending Review", status: "PENDING", icon: Clock3, iconClassName: "bg-[#fff3d6] text-[#e39b4d]" },
  { title: "Approved RFQs", status: "APPROVED", icon: CheckCircle2, iconClassName: "bg-[#dff9ee] text-[#13b981]" },
  { title: "Rejected", status: "REJECTED", icon: XCircle, iconClassName: "bg-[#ffe4e6] text-[#f04444]" },
] as const;

function formatRelativeTime(value: string | null) {
  if (!value) return "";
  const elapsed = Date.now() - new Date(value).getTime();
  const minutes = Math.max(0, Math.floor(elapsed / 60_000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ${days === 1 ? "day" : "days"} ago`;
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatStatus(status: ApiRfq["status"]): RfqStatus {
  return `${status.charAt(0)}${status.slice(1).toLowerCase()}` as RfqStatus;
}

function monthlyChange(rfqs: ApiRfq[], status: ApiRfq["status"] | null) {
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const matches = (rfq: ApiRfq) => status === null || rfq.status === status;
  const current = rfqs.filter((rfq) => matches(rfq) && new Date(rfq.created_at) >= thisMonth).length;
  const previous = rfqs.filter((rfq) => {
    const date = new Date(rfq.created_at);
    return matches(rfq) && date >= previousMonth && date < thisMonth;
  }).length;
  const percentage = previous === 0 ? (current > 0 ? 100 : 0) : Math.round(((current - previous) / previous) * 100);

  return {
    change: `${percentage > 0 ? "+" : ""}${percentage}% from last month`,
    trend: percentage > 0 ? "up" : percentage < 0 ? "down" : "flat",
  } as const;
}

export default function UserDashboard() {
  const [rfqs, setRfqs] = useState<ApiRfq[]>([]);
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [conversations, setConversations] = useState<ApiConversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (loadError) dashboardToast.error("Unable to load dashboard", loadError);
  }, [loadError]);

  useEffect(() => {
    let mounted = true;

    Promise.allSettled([
      api.get<ApiRfq[]>("/rfqs/"),
      api.get<ApiNotification[]>("/notifications/"),
      api.get<ApiConversation[]>("/messages/conversations/"),
    ]).then(([rfqResult, notificationResult, conversationResult]) => {
      if (!mounted) return;

      if (rfqResult.status === "fulfilled") setRfqs(rfqResult.value.data);
      if (notificationResult.status === "fulfilled") setNotifications(notificationResult.value.data);
      if (conversationResult.status === "fulfilled") setConversations(conversationResult.value.data);
      if ([rfqResult, notificationResult, conversationResult].some((result) => result.status === "rejected")) {
        setLoadError("Some dashboard data could not be loaded. Please refresh the page.");
      }
      setIsLoading(false);
    });

    return () => { mounted = false; };
  }, []);

  const stats = useMemo<DashboardStat[]>(() => statConfig.map((config) => ({
    title: config.title,
    value: rfqs.filter((rfq) => config.status === null || rfq.status === config.status).length.toLocaleString(),
    ...monthlyChange(rfqs, config.status),
    icon: config.icon,
    iconClassName: config.iconClassName,
  })), [rfqs]);

  const recentRfqs = useMemo<RecentRfq[]>(() => rfqs.slice(0, 4).map((rfq) => ({
    id: rfq.rfq_id,
    product: rfq.product_name || "Custom RFQ",
    sourcing: rfq.product_type === "INTERNATIONAL" ? "International" : "Domestic",
    quantity: `${rfq.quantity_required.toLocaleString()} ${rfq.unit_name}`,
    status: formatStatus(rfq.status),
    date: new Date(rfq.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  })), [rfqs]);

  const updates = useMemo<RecentUpdate[]>(() => notifications.slice(0, 3).map((notification) => ({
    id: notification.id,
    title: notification.message || notification.title,
    time: formatRelativeTime(notification.created_at),
    tone: notification.notification_type === "warning" || notification.notification_type === "reminder"
      ? "warning"
      : notification.notification_type === "alert" ? "success" : "info",
  })), [notifications]);

  const messages = useMemo<DashboardMessage[]>(() => conversations.slice(0, 2).map((conversation) => ({
    id: conversation.id,
    sender: "Support Team",
    preview: conversation.last_message_preview || "No messages yet.",
    time: formatRelativeTime(conversation.last_message_at),
    avatar: "/favicon.svg",
    unread: conversation.support_unread_count > 0,
  })), [conversations]);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 xl:grid-cols-4">
        {stats.map((stat) => <DashboardStatCard key={stat.title} stat={stat} />)}
      </div>

      <div className="mt-7 grid min-w-0 items-start gap-7 xl:grid-cols-[67%_30%] xl:justify-between">
        <SectionCard actionHref="/user/rfqs" actionLabel="View All ->" title="Recent RFQs">
          {isLoading ? <p className="p-5 text-sm text-[#6b7280]">Loading RFQs...</p> : <RecentRfqsTable rfqs={recentRfqs} />}
        </SectionCard>

        <div className="grid min-w-0 gap-6">
          <RecentUpdates updates={updates} />
          <MessagesPanel messages={messages} />
        </div>
      </div>
    </section>
  );
}
