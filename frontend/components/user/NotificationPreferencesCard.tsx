"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import api from "../../api/axios";
import { dashboardToast } from "../admin/AdminToast";

export type NotificationPreferences = {
  emailNotifications: boolean;
  newRfqResponses: boolean;
  orderStatusUpdates: boolean;
};

const defaultPreferences: NotificationPreferences = {
  emailNotifications: true,
  newRfqResponses: true,
  orderStatusUpdates: true,
};

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      aria-pressed={checked}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-[#760879]" : "bg-[#e2e5ea]"}`}
      onClick={onChange}
      type="button"
    >
      <span
        className={`absolute top-1 size-4 rounded-full bg-white shadow transition ${
          checked ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}

export default function NotificationPreferencesCard({
  initialPreferences = defaultPreferences,
}: {
  initialPreferences?: NotificationPreferences;
}) {
  const [preferences, setPreferences] = useState(initialPreferences);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let active = true;
    api.get<{
      email_notifications: boolean;
      new_rfq_responses: boolean;
      order_status_updates: boolean;
    }>("/user-settings/")
      .then(({ data }) => {
        if (!active) return;
        setPreferences({
          emailNotifications: data.email_notifications,
          newRfqResponses: data.new_rfq_responses,
          orderStatusUpdates: data.order_status_updates,
        });
      })
      .catch(() => {
        if (active) dashboardToast.error("Unable to load preferences", "Please try again.");
      });
    return () => {
      active = false;
    };
  }, []);

  async function savePreferences() {
    setIsSaving(true);
    try {
      await api.patch("/user-settings/", {
        email_notifications: preferences.emailNotifications,
        new_rfq_responses: preferences.newRfqResponses,
        order_status_updates: preferences.orderStatusUpdates,
      });
      dashboardToast.success("Preferences saved", "Your notification preferences are now active.");
    } catch {
      dashboardToast.error("Unable to save preferences", "Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  const rows: Array<{
    key: keyof NotificationPreferences;
    label: string;
    description?: string;
  }> = [
    {
      key: "emailNotifications",
      label: "Email Notifications",
      description: "Receive updates via email",
    },
    { key: "newRfqResponses", label: "New RFQ Responses" },
    { key: "orderStatusUpdates", label: "Order Status Updates" },
  ];

  return (
    <section className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
      <div className="mb-5 flex gap-2.5">
        <Bell className="mt-0.5 size-4 shrink-0 text-[#e39b4d]" />
        <div>
          <h2 className="text-sm font-bold text-[#111827]">Notification Preferences</h2>
          <p className="text-xs text-[#9ca3af]">Manage your alerts</p>
        </div>
      </div>

      <div className="space-y-2.5">
        {rows.map(({ key, label, description }) => (
          <div className="flex min-h-12 items-center gap-3 rounded-xl bg-[#f9fafb] px-4 py-3" key={key}>
            <span className="min-w-0 flex-1">
              <span className="block text-xs text-[#374151]">{label}</span>
              {description ? (
                <span className="mt-0.5 block text-[10px] text-[#9ca3af]">{description}</span>
              ) : null}
            </span>
            <Toggle
              checked={preferences[key]}
              onChange={() =>
                setPreferences((current) => ({ ...current, [key]: !current[key] }))
              }
            />
          </div>
        ))}
      </div>

      <button
        className="mt-5 w-full rounded-xl bg-[#760879] py-3 text-xs font-semibold text-white transition hover:bg-[#620665] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSaving}
        onClick={savePreferences}
        type="button"
      >
        {isSaving ? "Saving..." : "Save Preferences"}
      </button>
    </section>
  );
}
